export class KeyValueStore {
	#name;
	#db;
	#whenConnected;

	constructor(name = 'KeyValueStore') {
		const { promise, resolve, reject } = Promise.withResolvers();
		this.#whenConnected = promise;
		this.#db = null;

		if (typeof name !== 'string' || name.length === 0) {
			reject(new TypeError('Name must be a non-empty string.'));
		} else {
			this.#name = name;
			const request = indexedDB.open(this.#name, KeyValueStore.version);

			const controller = new AbortController();

			request.addEventListener('error', event => {
				const err = new Error(event.message);
				reject(err);
				controller.abort(err);
			}, { once: true, signal: controller.signal });

			request.addEventListener('success', event => {
				this.#db = event.target.result;
				resolve();
				controller.abort();
			}, { once: true, signal: controller.signal });

			request.addEventListener('upgradeneeded', event => {
				const objectStore = event.target.result.createObjectStore(
					this.#name,
					{ keyPath: 'key', autoIncrement: false }
				);

				objectStore.createIndex('modified', 'modified', { unique: false });
			}, { once: true, signal: controller.signal });
		}
	}

	[Symbol.asyncIterator]() {
		const controller = new AbortController();
		const queue = [Promise.withResolvers()];

		this.#whenConnected.then(() => {
			const transaction = this.#db.transaction([this.#name], 'readonly');
			const store = transaction.objectStore(this.#name);

			store.openCursor().addEventListener('success', event => {
				if (queue.length === 0) {
					queue.push(Promise.withResolvers());
				}

				if (
					event.target.result instanceof IDBCursorWithValue
					&& typeof event.target.result.value === 'object'
				) {
					queue[0].resolve([
						event.target.result.value.key,
						event.target.result.value.value
					]);

					event.target.result.continue();
				} else {
					controller.abort('done');
				}
			}, { signal: controller.signal });

			controller.signal.addEventListener('abort', ({ target }) => {
				if (queue.length !== 0) {
					queue[0].reject(target.reason);
				}
			}, { once: true });
		});


		return globalThis.Iterator.from({
			async next() {
				if (controller.signal.aborted) {
					return { done: true };
				} else {
					if (queue.length === 0) {
						queue.push(Promise.withResolvers());
					}

					try {
						const result = await queue[0].promise;
						queue.shift();
						return { value: result, done: false };
					} catch(err) {
						if (! controller.signal.aborted) {
							controller.abort(err);
						}

						return { done: true };
					}
				}
			}
		});
	}

	get [Symbol.toStringTag]() {
		return 'KeyValueStore';
	}

	get ready() {
		return this.#whenConnected;
	}

	get name() {
		return this.#name;
	}

	async get(key, { signal } = {}) {
		const { resolve, reject, promise } =  Promise.withResolvers();
		const controller = new AbortController();

		controller.signal.addEventListener('abort', ({ target }) => reject(target.reason), { once: true });

		if (typeof key !== 'string' || key.length === 0) {
			controller.abort(new TypeError('Key is not a string.'));
		}

		if (signal instanceof AbortSignal && signal.aborted) {
			controller.abort(signal.reason);
		} else if (signal instanceof AbortSignal) {
			signal.addEventListener('abort', ({ target}) => {
				controller.abort(target.reason);
			}, { once: true, signal: controller.signal });
		}

		if (! controller.signal.aborted) {
			await this.ready;
			const transaction = this.#db.transaction([this.#name], 'readonly');
			const store = transaction.objectStore(this.#name);
			const request = store.get(key);

			request.addEventListener('success', ({ target }) => {
				resolve(typeof target.result === 'object'? target.result.value : undefined);
				controller.abort();
			}, { once: true, signal: controller.signal });

			request.addEventListener('error', ({ target }) => {
				controller.abort(new Error(target.error));
			}, { once: true, signal: controller.signal });
		}

		return await promise;
	}

	async getAll(count, { signal} = {}) {
		const { resolve, reject, promise } =  Promise.withResolvers();
		const controller = new AbortController();

		controller.signal.addEventListener('abort', ({ target }) => reject(target.reason), { once: true });

		if (signal instanceof AbortSignal && signal.aborted) {
			controller.abort(signal.reason);
		} else if (signal instanceof AbortSignal) {
			signal.addEventListener('abort', ({ target}) => {
				controller.abort(target.reason);
			}, { once: true, signal: controller.signal });
		}

		if (! controller.signal.aborted) {
			await this.ready;
			const transaction = this.#db.transaction([this.#name], 'readonly');
			const store = transaction.objectStore(this.#name);
			const request = store.getAll(undefined, count);

			request.addEventListener('success', ({ target }) => {
				if (Array.isArray(target.result)) {
					resolve(Object.fromEntries(target.result.map(({ key,  value }) => [key, value])));
				} else {
					resolve({});
				}
				controller.abort();
			}, { once: true, signal: controller.signal });

			request.addEventListener('error', ({ target }) => {
				controller.abort(new Error(target.error));
			}, { once: true, signal: controller.signal });
		}

		return await promise;
	}

	async set(key, value, { signal } = {}) {
		const { resolve, reject, promise } = Promise.withResolvers();
		const controller = new AbortController();

		controller.signal.addEventListener('abort', ({ target }) => reject(target.reason), { once: true });

		if (typeof key !== 'string' || key.length === 0) {
			controller.abort(new TypeError('Key is not a string.'));
		}

		if (signal instanceof AbortSignal && signal.aborted) {
			controller.abort(signal.reason);
		} else if (signal instanceof AbortSignal) {
			signal.addEventListener('abort', ({ target }) => {
				controller.abort(target.reason);
			}, { once: true, signal: controller.signal });
		}

		if (! controller.signal.aborted) {
			await this.ready;
			const transaction = this.#db.transaction([this.#name], 'readwrite');
			const store = transaction.objectStore(this.#name);
			const request = store.put({ key, value, modified: Date.now() });

			request.addEventListener('success', () => {
				resolve();
				controller.abort();
			}, { once: true, signal: controller.signal });

			request.addEventListener('error', ({ target }) => {
				controller.abort(new Error(target.error));
			}, { once: true, signal: controller.signal });
		}

		return promise;
	}

	async setAll(data, { signal } = {}) {
		const controller = new AbortController();

		if (typeof data !== 'object' || data === null) {
			controller.abort(new TypeError('Data is not an object.'));
		} else if (signal instanceof AbortSignal && signal.aborted) {
			controller.abort(signal.reason);
		} else if (signal instanceof AbortSignal) {
			signal.addEventListener('abort', ({ target }) => {
				controller.abort(target.reason);
			}, { once: true, signal: controller.signal });
		}

		if (controller.signal.aborted) {
			throw controller.signal.reason;
		} else {
			await this.ready;
			const transaction = this.#db.transaction([this.#name], 'readwrite');
			const store = transaction.objectStore(this.#name);

			await Promise.all(Object.entries(data).map(([key, value]) => {
				const { resolve, reject, promise } = Promise.withResolvers();

				if (controller.signal.aborted) {
					reject(controller.signal.reason);
				} else {
					try {
						const request = store.put({ key, value, modified: Date.now() });

						request.addEventListener('success', () => {
							resolve();
						}, { once: true, signal: controller.signal });

						request.addEventListener('error', ({ target }) => {
							controller.abort(new Error(target.error));
							reject(controller.signal.reason);
						}, { once: true, signal: controller.signal });
					} catch(err) {
						controller.abort(err);
						transaction.abort();
						reject(controller.signal.reason);
					}
				}

				return promise;
			}));
		}
	}

	async has(key, { signal}= {}) {
		const { resolve, reject, promise } =  Promise.withResolvers();
		const controller = new AbortController();

		controller.signal.addEventListener('abort', ({ target }) => reject(target.reason), { once: true });

		if (typeof key !== 'string' || key.length === 0) {
			controller.abort(new TypeError('Key is not a string.'));
		}

		if (signal instanceof AbortSignal && signal.aborted) {
			controller.abort(signal.reason);
		} else if (signal instanceof AbortSignal) {
			signal.addEventListener('abort', ({ target}) => {
				controller.abort(target.reason);
			}, { once: true, signal: controller.signal });
		}

		if (! controller.signal.aborted) {
			await this.ready;
			const keyRangeValue = IDBKeyRange.only(key);
			const transaction = this.#db.transaction([this.#name], 'readonly');
			const objectStore = transaction.objectStore(this.#name);

			objectStore.openCursor(keyRangeValue).addEventListener('success', event => {
				resolve(event.target.result !== null);
				controller.abort();
			}, { once: true, signal: controller.signal });
		}

		return await promise;
	}

	async delete(key, { signal } = {}) {
		const { resolve, reject, promise } =  Promise.withResolvers();
		const controller = new AbortController();

		controller.signal.addEventListener('abort', ({ target }) => reject(target.reason), { once: true });

		if (typeof key !== 'string' || key.length === 0) {
			controller.abort(new TypeError('Key is not a string.'));
		}

		if (signal instanceof AbortSignal && signal.aborted) {
			controller.abort(signal.reason);
		} else if (signal instanceof AbortSignal) {
			signal.addEventListener('abort', ({ target}) => {
				controller.abort(target.reason);
			}, { once: true, signal: controller.signal });
		}

		if (! controller.signal.aborted) {
			await this.ready;
			const transaction = this.#db.transaction([this.#name], 'readwrite');
			const store = transaction.objectStore(this.#name);
			const request = store.delete(key);

			request.addEventListener('success', () => {
				resolve();
				controller.abort();
			}, { once: true, signal: controller.signal });

			request.addEventListener('error', ({ target }) => {
				controller.abort(new Error(target.error));
			}, { once: true, signal: controller.signal });
		}

		return await promise;
	}

	async clear({ signal } = {}) {
		const { resolve, reject, promise } =  Promise.withResolvers();
		const controller = new AbortController();

		controller.signal.addEventListener('abort', ({ target }) => reject(target.reason), { once: true });

		if (signal instanceof AbortSignal && signal.aborted) {
			controller.abort(signal.reason);
		} else if (signal instanceof AbortSignal) {
			signal.addEventListener('abort', ({ target}) => {
				controller.abort(target.reason);
			}, { once: true, signal: controller.signal });
		}

		if (! controller.signal.aborted) {
			await this.ready;
			const transaction = this.#db.transaction([this.#name], 'readwrite');
			const store = transaction.objectStore(this.#name);
			const request = store.clear();

			request.addEventListener('success', () => {
				resolve();
				controller.abort();
			}, { once: true, signal: controller.signal });

			request.addEventListener('error', ({ target }) => {
				controller.abort(new Error(target.error));
			}, { once: true, signal: controller.signal });
		}

		return await promise;
	}

	static get version() {
		return 1;
	}
}
