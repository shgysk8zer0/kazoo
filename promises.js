/**
 * @copyright 2023 Chris Zuber <admin@kernvalley.us>
 */
import { signalAborted } from './abort.js';
export const infinitPromise = new Promise(() => {});

export async function locksSupported() {
	if ('locks' in navigator) {
		try {
			return await navigator.locks.request('lock-test', () => true);
		} catch {
			return false;
		}
	}
}

export function isAsyncFunction(what) {
	return what instanceof Function && what.constructor.name === 'AsyncFunction';
}

export function isAsync(what) {
	return isAsyncFunction(what) || what instanceof  Promise;
}

export function getDeferred({ signal } = {}) {
	const deferred = Promise.withResolvers();

	if (signal instanceof AbortSignal) {
		if (signal.aborted) {
			deferred.reject(signal.reason);
		} else {
			signal.addEventListener('abort', ({ target }) => deferred.reject(target.reason), { once: true });
		}
	}

	return deferred;
}

export async function callAsAsync(callback, args = [], { thisArg = globalThis, signal } = {}) {
	const { promise, resolve, reject } = getDeferred({ signal });

	if (! (callback instanceof Function)) {
		reject(new TypeError('`callAsAsync` expects callback to be a function'));
	} else if (! Array.isArray(args)) {
		reject(new TypeError('`args` must be an array'));
	} else if (signal instanceof AbortSignal && signal.aborted) {
		reject(signal.reason);
	} else if (isAsyncFunction(callback)) {
		callback.call(thisArg, args).then(resolve).catch(reject);
	} else {
		queueMicrotask(() => {
			try {
				resolve(callback.call(thisArg, args));
			} catch(err) {
				reject(err);
			}
		});
	}

	return await promise;
}

export function createDeferredCallback(callback, { signal, thisArg } = {}) {
	const { promise, resolve } = getDeferred({ signal });
	const retPromise = promise.then(() => callAsAsync(callback, [], { signal, thisArg }));

	return async () => {
		resolve();
		return await retPromise;
	};
}

export async function lock(name, callback, {
	thisArg = globalThis,
	args = [],
	mode = 'exclusive',
	ifAvailable = false,
	steal = false,
	allowFallback = true,
	signal,
} = {}) {
	if ((! allowFallback) || await locksSupported()) {
		return await navigator.locks.request(name, { mode, ifAvailable, steal, signal }, async lock => {
			if (lock) {
				return await callAsAsync(callback, [lock, ...args], { thisArg, signal });
			}
		});
	} else {
		return await callAsAsync(callback, [null, ...args], { signal, thisArg });
	}
}

export async function onAnimationFrame(callback, {
	thisArg = globalThis,
	args = [],
	signal,
} = {}) {
	const { promise, resolve, reject } = getDeferred({ signal });
	const id = requestAnimationFrame(hrts => callAsAsync(callback, [hrts, ...args], { signal, thisArg }).then(resolve, reject));

	if (signal instanceof AbortSignal) {
		signalAborted(signal).finally(() => cancelAnimationFrame(id));
	}

	return await promise;
}

export async function onIdle(callback, {
	timeout,
	thisArg = globalThis,
	args = [],
	signal,
} = {}) {
	const { promise, resolve, reject } = getDeferred({ signal });
	const id = requestIdleCallback(hrts => callAsAsync(callback, [hrts, ...args], { thisArg, signal }).then(resolve, reject), { timeout });

	if (signal instanceof AbortSignal) {
		signalAborted(signal).finally(() => cancelIdleCallback(id));
	}

	return await promise;
}

export async function onTimeout(callback, {
	timeout = 0,
	thisArg = globalThis,
	args = [],
	signal,
} = {}) {
	const { resolve, reject, promise } = getDeferred({ signal });

	if (Number.isSafeInteger(timeout) && timeout >= 0) {
		const id = setTimeout(() => {
			callAsAsync(callback, args, { signal, thisArg }).then(resolve).catch(reject);
		}, timeout);

		if (signal instanceof AbortSignal) {
			signalAborted(signal).finally(() => clearTimeout(id));
		}
	} else {
		reject(new TypeError('`timeout` must be a positive intege'));
	}

	return await promise;
}

export async function sleep(timeout, { signal } = {}) {
	const { resolve, promise } = getDeferred({ signal });
	onTimeout(() => resolve(performance.now()), { signal, timeout })
		.catch(() => resolve(performance.now()));
	return await promise;
}

