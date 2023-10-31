/**
 * @copyright 2023 Chris Zuber <admin@kernvalley.us>
 */
import { createIframe } from './elements.js';
import { getYouTubePolicy } from './trust-policies.js';

export const allow = ['accelerometer', 'encrypted-media', 'gyroscope', 'picture-in-picture', 'fullscreen'];
export const sandbox = ['allow-scripts', 'allow-popups', 'allow-same-origin', 'allow-presentation'];
export const cookie = 'https://www.youtube.com/embed/';
export const noCookie = 'https://www.youtube-nocookie.com/embed/';

export const policy = getYouTubePolicy();

export function createYouTubeEmbed(video, {
	height, width, fetchPriority = 'low', referrerPolicy = 'origin',
	title = 'YouTube Embedded Video', loading = 'lazy', credentialless = true,
	controls = true, start,
} = {}) {
	const src = credentialless
		? new URL(`./${encodeURIComponent(video)}`, noCookie) : new URL(`./${encodeURIComponent(video)}`, cookie);

	if (! controls) {
		src.searchParams.set('controls', '0');
	}

	if (Number.isSafeInteger(start) && start > 0) {
		src.searchParams.set('start', start);
	}

	return createIframe(src.href, {
		width, height, loading, title, fetchPriority, referrerPolicy, allow,
		sandbox, policy, credentialless,
	});
}

export const trustPolicies = [policy.name];
