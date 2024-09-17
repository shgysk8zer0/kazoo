/**
 * @copyright 2021-2024 Chris Zuber <admin@kernvalley.us>
 */
export const MD5            = 'md5';
export const SHA_1          = 'SHA-1';
export const SHA_256        = 'SHA-256';
export const SHA_384        = 'SHA-384';
export const SHA_512        = 'SHA-512';
export const SHA            = SHA_1; // Alias of SHA_1
export const HEX            = 'hex';
export const BASE_64        = 'base64';
export const BASE_64_URL    = 'base64url';
export const ARRAY_BUFFER   = 'arraybuffer';
export const UINT8_ARRAY    = 'uint8array';
export const SRI            = 'sri';
import { md5 as md5Hash } from './md5.js';
export const DEFAULT_OUTPUT = HEX;

export function bufferToHex(buffer) {
	if (! (buffer instanceof ArrayBuffer)) {
		throw new TypeError('`bufferToHex()` requires an ArrayBuffer');
	} else {
		return new Uint8Array(buffer).toHex();
	}
}

export function hexToBuffer(hex) {
	if (typeof hex !== 'string') {
		throw new TypeError('`hexToBuffer()` only accepts strings');
	} else if (hex.length === 0) {
		throw new TypeError('Empty string');
	} else if (hex.length % 2 !== 0) {
		throw new TypeError('Strings must be an even length');
	} else {
		return Uint8Array.fromHex(hex).buffer;
	}
}

export async function sha1(data, { output = DEFAULT_OUTPUT, signal } = {}) {
	return hash(data, { algorithm: SHA_1, output, signal });
}

export async function sha256(data, { output = DEFAULT_OUTPUT, signal } = {}) {
	return hash(data, { algorithm: SHA_256, output, signal });
}

export async function sha384(data, { output = DEFAULT_OUTPUT, signal } = {}) {
	return hash(data, { algorithm: SHA_384, output, signal });
}

export async function sha512(data, { output = DEFAULT_OUTPUT, signal } = {}) {
	return hash(data, { algorithm: SHA_512, output, signal });
}

export async function md5(data, { output = DEFAULT_OUTPUT, signal } = {}) {
	return hash(data, { algorithm: MD5, output, signal });
}

/**
 * Calculates the hash of the provided data using the specified algorithm.
 *
 * @param {string|Blob|Response|Request|ArrayBuffer|ArrayBufferView|Promise<string|ArrayBuffer|Blob|ArrayBufferView|Response>} data The data to hash.
 * @param {object} options (optional)
 * @param {string} [options.algorithm='SHA-256'] The hashing algorithm (defaults to `SHA_256`).
 * @param {string} [options.output='hex'] The desired output format (defaults to `DEFAULT_OUTPUT`).
 * @param {AbortSignal} [options.signal] An optional `AbortSignal` to cancel the operation.
 * @returns {Promise<string|ArrayBuffer|Uint8Array>} The hash in the specified format.
 * @throws {TypeError} If the data type is not supported, the output format is invalid, or the algorithm is not supported.
 * @throws {Error} If the request fails (for `Request` type).
 */
export async function hash(data, { algorithm = SHA_256, output = DEFAULT_OUTPUT, signal } = {}) {
	if (signal instanceof AbortSignal && signal.aborted) {
		throw signal.reason;
	} else if (data instanceof ArrayBuffer || ArrayBuffer.isView(data)) {
		const buffer = algorithm.toLowerCase() === MD5 ? await md5Hash(data) : await crypto.subtle.digest(algorithm.toUpperCase(), data);

		switch (output.toLowerCase()) {
			case HEX:
				return new Uint8Array(buffer).toHex();

			case BASE_64:
			case BASE_64_URL:
				return new Uint8Array(buffer).toBase64({ alphabet: output });

			case SRI:
				return `${algorithm.replace('-', '').toLowerCase()}-${new Uint8Array(buffer).toBase64({ alphabet: BASE_64 })}`;

			case ARRAY_BUFFER:
				return buffer;

			case UINT8_ARRAY:
				return new Uint8Array(buffer);

			default:
				throw new TypeError(`Unsupported output format: '${output}'`);
		}
	} else if (data instanceof Blob) {
		return hash(await data.arrayBuffer(), { algorithm, output, signal });
	} else if (typeof data === 'string') {
		return hash(new TextEncoder().encode(data), { algorithm, output, signal });
	} else if (data instanceof Response) {
		return hash(await data.clone().arrayBuffer(), { algorithm, output, signal });
	} else if (data instanceof Request) {
		const resp = await fetch(data);

		if (resp.ok) {
			return await hash(await resp.arrayBuffer(), { algorithm, output, signal: signal ?? data.signal });
		} else {
			throw new DOMException(`${resp.url} [${resp.status} ${resp.statusText}]`, 'NetworkError');
		}
	} else if (data instanceof Promise) {
		return await hash(await data, { algorithm, output, signal });
	} else {
		throw new TypeError('Invalid data to hash.');
	}
}

export async function getIntegrity(data, { algorithm = SHA_256, signal } = {}) {
	return await hash(data, { algorithm, output: SRI, signal });
}
