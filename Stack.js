export class Stack {
	#items = [];

	constructor(items) {
		if (typeof items !== 'undefined' && (typeof items === 'object' && Symbol.iterator in items)) {
			this.#items.push(...items);
		}
	}

	get empty() {
		return this.#items.length === 0;
	}

	get size() {
		return this.#items.length;
	}

	toJSON() {
		return [...this.#items];
	}

	*[Symbol.iterator](){
		while (! this.isEmpty()) {
			yield this.pop();
		}
	}

	clear() {
		this.#items = [];
	}

	isEmpty() {
		return this.#items.length === 0;
	}

	peek() {
		return this.#items[0];
	}

	pop() {
		return this.#items.pop();
	}

	push(item) {
		this.#items.push(item);
	}
}
