import { Queue } from './Queue.js';

/**
 * Creates an asynchronous generator with the ability to resolve promises externally.
 *
 * @param {Object} [options] - Options for the generator.
 * @param {AbortSignal} [options.signal] - An optional AbortSignal to handle abortion.
 * @returns {Object} - An object containing the resolve function and the asynchronous generator.
 * @property {Function} resolve - The function to resolve promises and advance the generator.
 * @property {Function} reject - The function to reject promises.
 * @property {AsyncGenerator} generator - The asynchronous generator.
 */
export function getGeneratorWithResolvers({ signal: givenSignal } = {}) {
	const queue = new Queue();
	const controller = new AbortController();
	const createDeferred = () => ({ ...Promise.withResolvers(), resolved: false });
	const signal = givenSignal instanceof AbortSignal
		? AbortSignal.any([givenSignal, controller.signal])
		: controller.signal;

	let current = createDeferred();

	const getNext = () => {
		if (queue.isEmpty()) {
			return createDeferred();
		} else {
			queue.enqueue(createDeferred());
			return queue.dequeue();
		}
	};

	/**
	 * Resolves a promise, advancing the asynchronous generator with the provided result.
	 *
	 * @param {*} result - The result to resolve the promise with.
	 * @returns {void}
	 */
	const resolve = result => {
		if (! current.resolved) {
			current.resolve(result);
			current.resolved = true;
		} else if (queue.isEmpty() || queue.rear.resolved) {
			queue.enqueue({ promise: Promise.resolve(result), resolved: true });
		} else {
			queue.rear.resolve(result);
			queue.rear.resolved = true;
		}
	};

	const reject = error => {
		if (! current.resolved) {
			current.reject(error);
			current.resolved = true;
		} else if (queue.isEmpty() || queue.rear.resolved) {
			queue.enqueue({ promise: Promise.reject(error), resolved: true });
		} else {
			queue.rear.resolve(error);
			queue.rear.resolved = true;
		}
	};

	/**
	 * Asynchronous generator function that yields resolved promises and handles an optional AbortSignal.
	 *
	 * @generator
	 * @yields {*} The result of each resolved promise.
	 */
	const generator = (async function *generator() {
		const ABORTED = Symbol('aborted');
		const { resolve, promise: aborted } = Promise.withResolvers();

		if (signal.aborted) {
			resolve(ABORTED);
			return aborted;
		} else {
			signal.addEventListener('abort', () => resolve(ABORTED), { once: true });
		}

		while (! signal.aborted) {
			const result = await Promise.race([current.promise, aborted]);

			if (result === ABORTED) {
				return undefined;
			} else {
				yield result;
				current = getNext();
			}
		}
	})();

	return Object.freeze({ resolve, reject, generator, controller: Object.freeze({
		abort(reason) {
			controller.abort(reason);
		},
		get signal() {
			return signal;
		},
	})});
}

export async function* eventGenerator(target, event, { signal, passive, capture } = {}) {
	const { resolve, generator } = getGeneratorWithResolvers({ signal });
	target.addEventListener(event, resolve, { signal, passive, capture });
	yield* generator;
}

export async function* clickGenerator(target, { signal, passive, capture } = {}) {
	yield* eventGenerator(target, 'click', { signal, passive, capture });
}
