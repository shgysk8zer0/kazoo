import '@shgysk8zer0/polyfills';
import { describe, test } from 'node:test';
import assert from 'node:assert';
import { md5, HEX } from '@shgysk8zer0/kazoo/hash.js';

describe('Test MD5 implementation', async () => {
	test('Verify hash matches expected', async () => {
		const input = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent consectetur orci sed sem rutrum, eget vestibulum magna commodo. Pellentesque enim lorem, fermentum vel neque a, commodo tristique nisi.';
		const expected = 'ed7c60e83f444692b2dc82ee4fe68515';
		const hash = await md5(input, { output: HEX });

		assert.equal(hash, expected, `MD5 hash should be ${expected}`);
	});
});
