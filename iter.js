export function nodeIteratorToIterator(nodeIter) {
	return Iterator.from({
		next() {
			const value = nodeIter.nextNode();
			return { done: ! (value instanceof Node), value };
		}
	});
}

export function* iteratorToGenerator(iter) {
	for (const item of iter) {
		yield item;
	}
}

export function toIndexedIterator(iter) {
	let i = 0;
	return iter.map(item => [i++, item]);
}
