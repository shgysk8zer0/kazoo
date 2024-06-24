/**
 * @copyright 2023-2024 Chris Zuber <admin@kernvalley.us>
 */

import { createIframe } from '../elements.js';
import { createPolicy, isTrustPolicy } from '../trust.js';
import { callOnce } from '../utility.js';

const sandbox = ['allow-scripts', 'allow-same-origin', 'allow-popups', 'allow-popups-to-escape-sandbox'];
const policyName = 'goog-maps#script-url';

export const GMAPS_EMBED = 'https://www.google.com/maps/embed';
export const trustPolicies = [policyName];

export const getPolicy = callOnce(() => createPolicy(policyName, {
	createScriptURL: input => {
		if (input.startsWith(GMAPS_EMBED + '?')) {
			return input;
		} else {
			throw new TypeError(`Invalid Google Maps embed URL: "${input}".`);
		}
	}
}));

export function getGoogleMapsAddressURL({
	name,
	streetAddress,
	addressLocality,
	addressRegion,
	postalCode,
	addressCounty,
}) {
	return getGoogleMapsURL(
		[name, streetAddress, addressLocality, addressRegion, postalCode, addressCounty]
			.filter(part => typeof part === 'string')
			.join(' ')
	);
}

export function getGoogleMapsURL(addressQuery) {
	const url = new URL('https://www.google.com/maps/search/?api=1');
	url.searchParams.set('query', addressQuery);

	return url;
}

export function createGoogleMapsURL(id, { policy } = {}) {
	const url = new URL(GMAPS_EMBED);
	url.searchParams.set('pb', id);

	if (isTrustPolicy(policy)) {
		return policy.createScriptURL(url.href);
	} else {
		return url.href;
	}
}

export function createGoogleMaps(place, {
	width = 800,
	height = 600,
	frameBorder = 0,
	loading = 'lazy',
	fetchPriority = 'auto',
	referrerPolicy = 'no-referrer',
	title = 'Google Maps Embed',
	credentialless = false,
	part = [],
	classList = [],
	id,
	slot,
	dataset,
	styles,
	animation,
	policy = getPolicy(),
	events: { capture, passive, once, signal, ...events } = {},
	...attrs
} = {}) {
	const url = createGoogleMapsURL(place, { policy });

	return createIframe(url, {
		width, height, sandbox, part, slot, loading, animation, dataset, frameBorder,
		classList, id, title, credentialless, styles, fetchPriority, referrerPolicy,
		events: { capture, passive, once, signal, ...events }, ...attrs,
	});
}
//<iframe src="https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d12951.152196740677!2d-118.42799294999999!3d35.756013949999996!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e0!3m2!1sen!2sus!4v1703701916703!5m2!1sen!2sus" width="400" height="300" style="border:0;" allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>

// <iframe src="https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d12951.152196740677!2d-118.42799294999999!3d35.756013949999996!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e0!3m2!1sen!2sus!4v1703701916703!5m2!1sen!2sus" width="600" height="450" style="border:0;" allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>

// <iframe src="https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d12951.152196740677!2d-118.42799294999999!3d35.756013949999996!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e0!3m2!1sen!2sus!4v1703701916703!5m2!1sen!2sus" width="800" height="600" style="border:0;" allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>
