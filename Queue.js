export class Queue {
	#items = [];

	constructor(items) {
		if (typeof items !== 'undefined' && (typeof items === 'object' && Symbol.iterator in items)) {
			this.#items.push(...items);
		}
	}

	get empty() {
		return this.#items.length === 0;
	}

	get front() {
		return this.#items[0];
	}

	get rear() {
		return this.#items.lastItem;
	}

	get size() {
		return this.#items.length;
	}

	toJSON() {
		return [...this.#items];
	}

	*[Symbol.iterator](){
		while (! this.isEmpty()) {
			yield this.dequeue();
		}
	}

	clear() {
		this.#items = [];
	}

	isEmpty() {
		return this.#items.length === 0;
	}

	dequeue() {
		return this.#items.shift();
	}

	enqueue(item) {
		this.#items.push(item);
	}

	peek() {
		return this.#items[0];
	}
}
