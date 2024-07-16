export const BASE64_DATA_URI_PATTERN = /^data:(?<mime>[a-zA-Z]+\/[\w/\-.+]+);base64,(?<data>[-A-Za-z0-9+/=]+)$/;

export async function base64Encode(thing) {
	switch (typeof thing) {
		case 'string':
		case 'number':
			return btoa(thing);

		case 'object':
			if (thing === null) {
				throw new TypeError('Cannot base64 encode null.');
			} else if (thing instanceof Blob || thing instanceof Request || thing instanceof Response) {
				return await thing.bytes().then(bytes => bytes.toBase64());
			} else if (thing instanceof URL) {
				return await btoa(thing.href);
			} else if (thing instanceof Uint8Array) {
				return thing.toBase64();
			} else {
				return await btoa(thing.toString());
			}

		case 'undefined':
			throw new TypeError('Cannot base64 encode undefined.');

		default:
			throw new TypeError(`Cannot base64 encode something of type ${typeof thing}.`);
	}
}

export const base64Decode = atob;

export function base64URIToBlob(uri) {
	if (uri instanceof URL) {
		return base64URIToBlob(uri.href);
	} else if (typeof uri !== 'string') {
		throw new TypeError('Cannot decode from a non-string.');
	} else {
		const { mime, data } = uri.match(BASE64_DATA_URI_PATTERN)?.groups ?? {};

		if (typeof mime === 'string' && typeof data === 'string') {
			return new Blob([Uint8Array.fromBase64(data)], { type: mime });
		} else {
			throw new DOMException('Error parsing data URI.', 'InvalidCharacterError');
		}
	}
}

export async function getBase64DataURI(thing) {
	if (thing instanceof Request || thing instanceof Response) {
		return await getBase64DataURI(await thing.blob());
	} else if (!(thing instanceof Blob)) {
		throw new TypeError('Cannot create base64 URI from a non-Blob.');
	} else if (thing.type === '') {
		throw new TypeError('Blob is missing required type.');
	} else {
		return new URL(`data:${thing.type};base64,${await base64Encode(thing)}`);
	}
}
