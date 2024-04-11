const keyMap = {};

let supportsSymbolKeys = true;

try {
	new WeakMap([[Symbol('test'), null]]);
} catch {
	supportsSymbolKeys = false;
}

const convertKey = supportsSymbolKeys ? key => key : (key) => {
	if (supportsSymbolKeys || typeof key === 'object') {
		return key;
	} else if (typeof key !== 'symbol' || typeof Symbol.keyFor(key) !== 'undefined') {
		throw new TypeError(`Cache key "${key.toString()}" must be an object or an unregistered symbol.`);
	} else if (keyMap.hasOwnProperty(key)) {
		return keyMap[key];
	} else {
		const mapped = Object.freeze({ key });
		keyMap[key] = mapped;
		return mapped;
	}
};

export class Cache {
	#cache;

	constructor() {
		this.#cache = new WeakMap();
	}

	has(key, requireFresh = false) {
		if (requireFresh) {
			const result = this.#cache.get(convertKey(key));
			return typeof result === 'object' && (
				typeof result.expires !== 'number'
				|| Date.now() < result.expires
			);
		} else {
			return this.#cache.has(convertKey(key));
		}
	}

	delete(key) {
		return this.#cache.delete(convertKey(key));
	}

	set(key, value, { expires = undefined } = {}) {
		if (value === undefined) {
			throw new TypeError('Cannot cache undefined values.');
		} else if (expires instanceof Date) {
			this.set(key, value, { expires: expires.getTime() });
		} else if (typeof expires === 'string') {
			this.set(key, value, { expires: new Date(expires).getTime() });
		} else if (typeof expires === 'number' && Date.now() > expires) {
			throw new TypeError('Attempting to set already expired value.');
		} else if (Number.isNaN(expires)) {
			throw new TypeError('Expires is NaN.');
		} else if (expires !== undefined && typeof expires !== 'number') {
			throw new TypeError(`${typeof expires} is not a valid type for cache expires.`);
		} else {
			this.#cache.set(convertKey(key), Object.freeze({ value, expires, updated: Date.now() }));
		}
	}

	get(key, fallback = undefined) {
		const result = this.#cache.get(convertKey(key));

		if (result === undefined) {
			return fallback;
		} else if (typeof result.expires === 'number' && result.expires < Date.now()) {
			this.delete(key);
			console.info(`${key.toString()} is expired and has been deleted.`);
			return fallback;
		} else {
			return result.value;
		}
	}
}
