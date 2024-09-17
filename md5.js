import '@shgysk8zer0/polyfills';

const K = new Uint32Array([
	0xd76aa478, 0xe8c7b756, 0x242070db, 0xc1bdceee,
	0xf57c0faf, 0x4787c62a, 0xa8304613, 0xfd469501,
	0x698098d8, 0x8b44f7af, 0xffff5bb1, 0x895cd7be,
	0x6b901122, 0xfd987193, 0xa679438e, 0x49b40821,
	0xf61e2562, 0xc040b340, 0x265e5a51, 0xe9b6c7aa,
	0xd62f105d, 0x02441453, 0xd8a1e681, 0xe7d3fbc8,
	0x21e1cde6, 0xc33707d6, 0xf4d50d87, 0x455a14ed,
	0xa9e3e905, 0xfcefa3f8, 0x676f02d9, 0x8d2a4c8a,
	0xfffa3942, 0x8771f681, 0x6d9d6122, 0xfde5380c,
	0xa4beea44, 0x4bdecfa9, 0xf6bb4b60, 0xbebfbc70,
	0x289b7ec6, 0xeaa127fa, 0xd4ef3085, 0x04881d05,
	0xd9d4d039, 0xe6db99e5, 0x1fa27cf8, 0xc4ac5665,
	0xf4292244, 0x432aff97, 0xab9423a7, 0xfc93a039,
	0x655b59c3, 0x8f0ccc92, 0xffeff47d, 0x85845dd1,
	0x6fa87e4f, 0xfe2ce6e0, 0xa3014314, 0x4e0811a1,
	0xf7537e82, 0xbd3af235, 0x2ad7d2bb, 0xeb86d391
]);

const s = [
	7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22,
	5, 9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20,
	4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23,
	6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21
];
const a0 = 0x67452301;
const b0 = 0xefcdab89;
const c0 = 0x98badcfe;
const d0 = 0x10325476;

function rotateLeft(x, c) {
	return (x << c) | (x >>> (32 - c));
}

function md5Cycle(ablock, a, b, c, d) {
	let f, g;
	for (let i = 0; i < 64; i++) {
		if (i < 16) {
			f = (b & c) | (~b & d);
			g = i;
		} else if (i < 32) {
			f = (d & b) | (~d & c);
			g = (5 * i + 1) % 16;
		} else if (i < 48) {
			f = b ^ c ^ d;
			g = (3 * i + 5) % 16;
		} else {
			f = c ^ (b | ~d);
			g = (7 * i) % 16;
		}
		const tmp = d;
		d = c;
		c = b;
		b = b + rotateLeft((a + f + K[i] + ablock[g]) >>> 0, s[i]);
		a = tmp;
	}
	return [a, b, c, d];
}

function appendPadding(buffer) {
	const byteLen = buffer.byteLength;
	const bitLen = byteLen * 8;
	const padding = new Uint8Array(((byteLen + 9) & ~63) + 64);
	padding.set(new Uint8Array(buffer), 0);
	padding[byteLen] = 0x80;
	// Append 64-bit length (lower and higher 32 bits)
	const view = new DataView(padding.buffer);
	view.setUint32(padding.byteLength - 8, bitLen >>> 0, true);   // Low 32 bits
	view.setUint32(padding.byteLength - 4, Math.floor(bitLen / 0x100000000), true); // High 32 bits
	return padding;
}

export async function md5(data) {
	if (data instanceof ArrayBuffer) {
		const input = new DataView(appendPadding(data).buffer);
		let words = new Uint32Array(input.byteLength / 4);

		// Convert the buffer to a Uint32Array with little-endian format
		for (let i = 0; i < words.length; i++) {
			words[i] = input.getUint32(i * 4, true);  // Little-endian
		}

		let a = a0, b = b0, c = c0, d = d0;

		for (let i = 0; i < words.length; i += 16) {
			await scheduler.postTask(() =>{
				const oldA = a, oldB = b, oldC = c, oldD = d;
				[a, b, c, d] = md5Cycle(words.subarray(i, i + 16), a, b, c, d);
				a = (a + oldA) >>> 0;
				b = (b + oldB) >>> 0;
				c = (c + oldC) >>> 0;
				d = (d + oldD) >>> 0;
			}, { priority: 'user-blocking' });
		}

		const result = new Uint8Array(16); // MD5 result is always 128 bits (16 bytes)
		const view = new DataView(result.buffer);
		view.setUint32(0, a, true);  // Little-endian
		view.setUint32(4, b, true);
		view.setUint32(8, c, true);
		view.setUint32(12, d, true);

		return result.buffer;
	} else if (data?.buffer instanceof ArrayBuffer) {
		return await md5(data.buffer);
	} else {
		throw new TypeError('md5 expects data to a TypedArray, DataView, or ArrayBuffer.');
	}
}
