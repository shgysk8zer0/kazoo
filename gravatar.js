import { md5 } from './hash.js';
import { createImage } from './elements.js';

export async function createGravatarURL(email, { size = 256 } = {}) {
	const hash = await md5(email);
	const url = new URL(hash, 'https://secure.gravatar.com/avatar/');
	url.searchParams.set('s', size);
	url.searchParams.set('d', 'mm');
	return url;
}

export async function createGravatar(email, {
	size = 256,
	alt = '',
	id,
	classList = [],
	part = [],
	loading = 'lazy',
	fetchPriority = 'auto',
	decoding = 'async',
	crossOrigin = 'anonymous',
	referrerPolicy = 'no-referrer',
	itemprop = null,
	animation,
	aria,
	events,
	dataset,
} = {}) {
	const url = await createGravatarURL(email, { size });

	return createImage(url, {
		height: size, width: size, alt, classList, part, loading, fetchPriority, aria,
		crossOrigin, referrerPolicy, decoding, itemprop, animation, events, dataset, id,
	});
}
