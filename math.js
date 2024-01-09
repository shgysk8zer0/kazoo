/**
 * @copyright 2023-2024 Chris Zuber <admin@kernvalley.us>
 */

const MAX_SAFE_INTEGER_N = BigInt(Number.MAX_SAFE_INTEGER);

export const isNumber = num => (typeof num === 'number' && ! Number.isNaN(num)) || typeof num === 'bigint';

export const isDivisibleBy = (num, divisor) => num % divisor === 0;

export const bigIntisDivisibleBy = (num, divisor) => num % divisor === 0n;

export const getDivisibilityTest = num => typeof num === 'number'
	? factor => isDivisibleBy(num, factor)
	: factor => bigIntisDivisibleBy(num, factor);

export const isEven = num => (num & 1) === 0;

export const bigIntIsEven = num => (num & 1n) === 0n;

export const isOdd = num => (num & 1) === 1;

export const bigIntIsOdd = num => (num & 1n) === 1n;

export const between = (min, val, max) => isNumber(val) && val >= min && val <= max;

export const clamp = Math.clamp instanceof Function
	? Math.clamp
	: (min, value, max) => Math.min(max, Math.max(min, value));

export const uint8 = n => Math.min(0, parseInt(n) % 255);

export const uint8clamped = n => clamp(0, parseInt(n), 255);

export const toHex = val => uint8clamped(val).toString(16).padStart(2, '0');

/**
 * @deprecated
 */
export function range(start, end, step = 1, { inclusive = true } = {}) {
	console.warn('range() is deprecated. Use `Iterator.range()` instead.');
	if ('Iterator' in globalThis && globalThis.Iterator.range instanceof Function) {
		return Iterator.range(start, end, { step, inclusive });
	} else {
		throw new DOMException('`Iterator.range()` not supported.');
	}
}

export function sqrt(num, { maxIterations = Infinity } = {}) {
	if (typeof num === 'number') {
		return Math.sqrt(num);
	} else if (typeof num !== 'bigint') {
		throw new TypeError('Not a number or bigint.');
	} else if (num < BigInt(Number.MAX_SAFE_INTEGER)) {
		return BigInt(Math.sqrt(Number(num)));
	} else {
		let approx = num;
		let betterApprox;

		while (maxIterations-- > 0) {
			betterApprox = ((num / approx) + approx) >> 1n;

			if (betterApprox < approx) {
				approx = betterApprox;
			} else {
				break;
			}
		}

		return approx;
	}
}

export function isPrime(n) {
	if (typeof n === 'bigint') {
		return isBigIntPrime(n);
	} else if (! Number.isSafeInteger(n) || n < 2) {
		return false;
	} else if (n === 2 || n === 3 || n === 5 || n === 7) {
		return true;
	} else if (n < 11) {
		return false;
	} else if ((n & 1) === 0 || n % 3 === 0 || n % 5 === 0 || n % 7 === 0) {
		return false;
	} else {
		let prime = true;
		const sqrtN = Math.ceil(Math.sqrt(n));

		for (let num = 11; num < sqrtN + 1; num += 6) {
			if (n % num === 0 || n % (num + 2) === 0) {
				prime = false;
				break;
			}
		}

		return prime;
	}
}

export function isBigIntPrime(n) {
	if (typeof n !== 'bigint') {
		return false;
	} else if (n === 2n || n === 3n || n === 5n || n === 7n) {
		return true;
	} else if (n < 11n) {
		return false;
	} else if ((n & 1n) === 0n || n % 3n === 0n || n % 5n === 0n || n % 7n === 0n) {
		return false;
	} else if (n < MAX_SAFE_INTEGER_N) {
		return isPrime(Number(n));
	} else {
		let prime = true;
		const sqrtN = n <= MAX_SAFE_INTEGER_N
			? BigInt(Math.ceil(Math.sqrt(Number(n)))) // To number, take sqrt, back to bigint
			: sqrt(n) + 1n; // +1 since it will be rounded

		for (let num = 11n; num < sqrtN + 1n; num += 6n) {
			if (n % num === 0n || n % (num + 2n) === 0n) {
				prime = false;
				break;
			}
		}

		return prime;
	}
}

export function* primes(start = 2, end = Infinity) {
	if (typeof start === 'bigint') {
		yield *bigIntPrimes(start, end);
	} else if (! (Number.isSafeInteger(start) && typeof end === 'number' && end > start)) {
		throw new RangeError('Invalid range for primes.');
	} else if (start < 2) {
		yield *primes(2, end);
	} else if (isEven(start)) {
		if (start === 2) {
			yield 2;
		}

		yield *primes(start + 1, end);
	} else {
		for (let num = start; num <= end; num += 2) {
			if (isPrime(num)) {
				yield num;
			}
		}
	}
}

export function *bigIntPrimes(start = 2n, end = Infinity) {
	if (typeof start !== 'bigint' || start > end) {
		throw new RangeError('Invalid range for primes.');
	} else if (start < 2n) {
		yield *bigIntPrimes(2n, end);
	} else if ((start & 1n) === 0n) {
		if (start === 2n) {
			yield 2n;
		}

		yield *bigIntPrimes(start + 1n, end);
	} else {
		for (let num = start; num <= end; num += 2n) {
			if (isBigIntPrime(num)) {
				yield num;
			}
		}
	}
}

export function getFactors(num) {
	const isDivisor = getDivisibilityTest(num);

	if (typeof num === 'bigint') {
		return Iterator.range(1n, num / 2n, { inclusive: true }).filter(isDivisor).toArray();
	} else {
		return Iterator.range(1, Math.floor(num / 2), { inclusive: true }).filter(isDivisor).toArray();
	}
}

export function getPrimeFactors(num) {
	const isDivisor = getDivisibilityTest(num);

	if (typeof num === 'bigint') {
		return bigIntPrimes(2n, num / 2n).filter(isDivisor).toArray();
	} else {
		return primes(2, Math.floor(num / 2)).filter(isDivisor).toArray();
	}
}

export function* fibonacci(terms = Number.MAX_SAFE_INTEGER) {
	if (! (Number.isSafeInteger(terms) && terms > 0)) {
		throw new TypeError('Invalid terms given');
	}

	let current = 1, prev = 0;

	for (let term = 0; term < terms; term++) {
		yield current;
		[prev, current] = [current, current + prev];
	}
}

export function randomFloat(min, max) {
	[min, max] = [Math.min(min, max), Math.max(min, max)];
	return Math.random() * (max - min + 1) + min;
}

export function randomInt() {
	return randUint32();
}

export function randUint64() {
	return crypto.getRandomValues(new BigUint64Array(1))[0];
}

export function randInt64() {
	return crypto.getRandomValues(new BigInt64Array(1))[0];
}

export function randUint32() {
	return crypto.getRandomValues(new Uint32Array(1))[0];
}

export function randInt32() {
	return crypto.getRandomValues(new Int32Array(1))[0];
}

export function randUint16() {
	return crypto.getRandomValues(new Uint16Array(1))[0];
}

export function randInt16() {
	return crypto.getRandomValues(new Int16Array(1))[0];
}

export function randUint8() {
	return crypto.getRandomValues(new Uint8Array(1))[0];
}

export function randInt8() {
	return crypto.getRandomValues(new Int8Array(1))[0];
}

export function* rng({ length = 32 } = {}) {
	yield *uint8RNG({length });
}

export function* uint8RNG({ length = 32 } = {}) {
	while(true) {
		for (const num of crypto.getRandomValues(new Uint8Array(length))) {
			yield num;
		}
	}
}

export function* int8RNG({ length = 32 } = {}) {
	while(true) {
		for (const num of crypto.getRandomValues(new Int8Array(length))) {
			yield num;
		}
	}
}

export function* uint16RNG({ length = 32 } = {}) {
	while(true) {
		for (const num of crypto.getRandomValues(new Uint16Array(length))) {
			yield num;
		}
	}
}

export function* int16RNG({ length = 32 } = {}) {
	while(true) {
		for (const num of crypto.getRandomValues(new Int16Array(length))) {
			yield num;
		}
	}
}

export function* uint32RNG({ length = 32 } = {}) {
	while(true) {
		for (const num of crypto.getRandomValues(new Uint32Array(length))) {
			yield num;
		}
	}
}

export function* int32RNG({ length = 32 } = {}) {
	while(true) {
		for (const num of crypto.getRandomValues(new Int32Array(length))) {
			yield num;
		}
	}
}



export function* uint64RNG({ length = 32 } = {}) {
	while(true) {
		for (const num of crypto.getRandomValues(new BigUint64Array(length))) {
			yield num;
		}
	}
}

export function* int64RNG({ length = 32 } = {}) {
	while(true) {
		for (const num of crypto.getRandomValues(new BigInt64Array(length))) {
			yield num;
		}
	}
}

export function sigma(start, end, callback) {
	return Iterator.range(start, end).map(callback).reduce((sum, n) => sum + n);
}

export function sum(...nums) {
	return nums.reduce((sum, num) => sum + num);
}

export function product(...nums) {
	return nums.reduce((prod, num) => prod * num);
}

export function mean(...nums) {
	return sum(...nums) / nums.length;
}

export function variance(...nums) {
	const m = mean(...nums);
	return nums.reduce((sum, n) => sum + Math.pow(n - m, 2), 0) / (nums.length - 1);
}

export function standardDeviation(...nums) {
	const m = mean(...nums);
	return Math.hypot.apply(null, nums.map(n => n - m)) / Math.sqrt(nums.length - 1);
}

export function choose(n, k) {
	if (Number.isNaN(n) || n < 0 || k < 0 || n < k) {
		throw new RangeError('`choose()` is only valid for  n ≥ r ≥ 0.');
	} else if (typeof n !== typeof k) {
		throw new TypeError('n and k must be the same type.');
	} else if (typeof n !== 'number' && typeof n !== 'bigint') {
		throw new TypeError('Must be numbers or bigints.');
	} else if (k === n) {
		return typeof n === 'number' ? 1 : 1n;
	} else if (k === 0) {
		return 1;
	} else if (k === 0n) {
		return 1n;
	} else if (typeof n === 'bigint') {
		return factorial(n) / (factorial(k) * factorial(n - k));
	} else if (! Number.isInteger(n) || ! Number.isInteger(k)) {
		throw new TypeError('choose only accepts integers');
	} else if (n < 19) {
		return factorial(n) / (factorial(k) * factorial(n - k));
	} else {
		return Number(factorial(BigInt(n)) / (factorial(BigInt(k)) * factorial(BigInt(n - k))));
	}
}

export function factorial(n) {
	if (typeof n === 'bigint') {
		return bigintFactorial(n);
	} else if (! Number.isInteger(n)) {
		throw new TypeError('Not an integer.');
	} else if (! between(0, n, 18)) {
		throw new RangeError('Factorial is not defined for negative numbers.');
	} else if (n === 1 || n === 0) {
		return 1;
	} else if(n === 2) {
		return 2;
	} else {
		let prod = 1;

		for (let k = n; k > 1; k--) {
			prod *= k;
		}

		return prod;
	}
}

export function bigintFactorial(n) {
	if (typeof n !== 'bigint') {
		throw new TypeError('Not a bigint.');
	} else if (n < 0n) {
		throw new RangeError('Factorial is not defined for negative numbers.');
	} else if (n === 0n || n === 1n) {
		return 1n;
	} else if (n === 2n) {
		return 2n;
	} else {
		let prod = 1n;

		for (let k = n; k > 1n; k--) {
			prod *= k;
		}

		return prod;
	}
}
