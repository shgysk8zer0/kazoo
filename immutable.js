/* global Record Tuple */
export function deepFreeze(thing) {
	switch(typeof thing) {
		case 'function':
			throw new TypeError('Functions cannot be made immutable.');

		case 'object':
			if (thing === null) {
				return null;
			} else if (Array.isArray(thing)) {
				return Object.freeze(thing.map(deepFreeze));
			} else {
				return Object.freeze(
					Object.fromEntries(
						Object.entries(thing)
							.map(([key, val]) => [key, deepFreeze(val)])
					)
				);
			}

		default:
			return thing;
	}
}

export function getImmutable(thing) {
	switch(typeof thing) {
		case 'function':
			throw new TypeError('Functions cannot be made immutable.');

		case 'object':
			if (thing === null) {
				return null;
			} else if (thing instanceof Record || thing instanceof Tuple) {
				return thing;
			} else if (Array.isArray(thing)) {
				return Tuple.from(thing.map(getImmutable));
			} else {

				return Record.fromEntries(
					Object.entries(thing)
						.map(([key, val]) => [key, getImmutable(val)])
				);
			}

		default:
			return thing;
	}
}
