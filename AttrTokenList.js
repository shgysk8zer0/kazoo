const _isValidToken = token => typeof token === 'string' && token.length !== 0 && ! token.includes(' ');

export class AttrTokenList {
	#node;

	static #elMap = new WeakMap();

	constructor(el, attr) {
		if (! (el instanceof HTMLElement)) {
			throw new TypeError('Not an HTML Element.');
		} else if (typeof attr !== 'string' || attr.length === 0) {
			throw new TypeError('Attribbute must be a non-empty string.');
		} else if (! el.hasAttribute(attr)) {
			this.#node = document.createAttribute(attr);
			el.setAttributeNode(this.#node);
		} else {
			this.#node = el.getAttributeNode(attr);
		}
	}

	[Symbol.iterator]() {
		return this.#tokens.values();
	}

	toString() {
		return this.value;
	}

	get length() {
		return this.#tokens.size;
	}

	get value() {
		return Array.from(this.#tokens).join(' ');
	}

	add(...values) {
		if (values.every(_isValidToken)) {
			const tokens = this.#tokens;
			const updated = tokens.union(new Set(values));

			if (updated.size > tokens.size) {
				this.#tokens = updated;
			}
		} else {
			throw new DOMException('AttributeTokenList.add: The token can not contain whitespace or be an empty string.');
		}
	}

	contains(val) {
		return _isValidToken(val) && this.#tokens.has(val);
	}

	item(index) {
		return Array.from(this.#tokens)[parseInt(index)] ?? null;
	}

	forEach(callback, thisArg = this) {
		this.#tokens.forEach(callback, thisArg);
	}

	remove(...values) {
		if (values.every(_isValidToken)) {
			const tokens = this.#tokens;
			const updated = tokens.difference(new Set(values));

			if (updated.size < tokens.size) {
				this.#tokens = updated;
			}
		} else {
			throw new DOMException('AttributeTokenList.remove: The token can not contain whitespace or be an empty string.');
		}
	}

	replace(oldToken, newToken) {
		if (_isValidToken(oldToken) && _isValidToken(newToken)) {
			const tokens = this.#tokens;

			if (! tokens.has(oldToken)) {
				return false;
			} else if (oldToken === newToken) {
				return true;
			} else {
				tokens.delete(oldToken);
				tokens.add(newToken);
				this.#tokens = tokens;
				return true;
			}
		} else {
			throw new DOMException('AttributeTokenList.replace: The token can not contain whitespace or be an empty string.');
		}
	}

	supports(token) {
		return _isValidToken(token);
	}

	toggle(val, force) {
		const tokens = this.#tokens;
		const size = tokens.size;

		if (! _isValidToken(val)) {
			throw new DOMException('AttributeTokenList.toggle: The token can not contain whitespace or be an empty string.');
		} else if (force === true) {
			tokens.add(val);
		} else if (force === false) {
			tokens.delete(val);
		} else if (tokens.has(val)) {
			tokens.delete(val);
		} else {
			tokens.add(val);
		}

		if (tokens.size !== size) {
			this.#tokens = tokens;
		}

		return tokens.has(val);
	}

	entries() {
		return this.#tokens.values().map((val, i) => [i, val]);
	}

	keys() {
		return Iterator.range(0, this.length);;
	}

	values() {
		return this.#tokens.values();
	}

	get #arr() {
		return this.#node.value.length === 0 ? [] : this.#node.value.split(' ');
	}

	get #tokens() {
		return new Set(this.#arr);
	}

	set #tokens(val) {
		this.#node.value = [...val].join(' ');
	}

	static bindTo(el, attr) {
		if (! AttrTokenList.#elMap.has(el)) {
			const list = new AttrTokenList(el, attr);
			AttrTokenList.#elMap.set(el, new Map([[attr, list]]));
			return list;
		} else {
			const attrs = AttrTokenList.#elMap.get(el);

			if (attrs.has(attr)) {
				return attrs.get(attr);
			} else {
				const list = new AttrTokenList(el, attr);
				attrs.set(attr, list);
				return list;
			}
		}
	}
}
