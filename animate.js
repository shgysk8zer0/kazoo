import { getDeferred } from './promises.js';

/**
 * Helper methods so there's less working with strings
 */
export const rotate = n => `rotate(${n})`;
export const scale = n => `scale(${n})`;
export const translate = (x, y) => `translate(${x}, ${y})`;

export async function animate(target, keyframes, {
	composite = 'replace',
	delay = 0,
	direction = 'normal',
	duration = 400,
	easing = 'linear',
	endDelay = 0,
	fill = 'none',
	iterationComposite = 'replace',
	iterationStart = 0,
	iterations = 1,
	pseudoElement,
	signal,
} = {}) {
	const { resolve, reject, promise } = getDeferred();

	if (signal instanceof AbortSignal && signal.aborted) {
		reject(signal.reason);
	} else {
		const controller = new AbortController();
		const anim = target.animate(keyframes, {
			composite, delay, direction, duration, easing, endDelay, fill,
			iterationComposite, iterationStart, iterations, pseudoElement,
		});

		anim.addEventListener('finish', ({ target }) => {
			resolve(target);
			controller.abort();
		}, { signal: controller.signal });

		if (signal instanceof AbortSignal) {
			signal.addEventListener('abort', ({ target }) => {
				reject(target.reason);
				anim.cancel();
				controller.abort(target.reason);
			}, { signal: controller.signal });
		}
	}

	return await promise;
}
