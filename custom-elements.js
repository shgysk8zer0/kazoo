/**
 * @copyright 2023 Chris Zuber <admin@kernvalley.us>
 */
import { HTML } from '@shgysk8zer0/consts/mimes.js';

export const supported = globalThis.customElements instanceof Object;

export function isDefined(...tags) {
	return supported && tags.every(tag => typeof customElements.get(tag) !== 'undefined');
}

export function registerCustomElement(tag, cls, ...rest) {
	if (! supported) {
		console.error(new Error('`customElements` not supported'));
		return false;
	} else if (isDefined(tag)) {
		console.warn(new Error(`<${tag}> is already defined`));
		// Returns true/false if element being registered matches given class
		return customElements.get(tag) === cls;
	} else {
		customElements.define(tag, cls, ...rest);
		return true;
	}
}

export async function getCustomElement(tag) {
	console.warn('`getCustomElement()` is deprecated. Use `customElements.whenDefined() instead.');

	if (supported) {
		return customElements.whenDefined(tag);
	} else {
		throw new Error('`customElements` not supported');
	}
}

export async function createCustomElement(tag, ...args) {
	const Pro = await customElements.whenDefined(tag);
	return new Pro(...args);
}

export async function whenDefined(...els) {
	if (supported) {
		await Promise.all(els.map(el => customElements.whenDefined(el)));
	} else {
		throw new Error('`customElements` not supported');
	}
}

export async function defined(...els) {
	console.error('`defined()` is deprecated. Please use `whenDefined()` instead');
	await whenDefined(...els);
}

export async function getTemplate(src, opts, {
	mode = 'cors',
	cache = 'default',
	credentials = 'omit',
	redirect = 'follow',
	priority = 'auto',
	referrerPolicy = 'no-referrer',
	headers = new Headers({ Accept: HTML }),
	integrity = undefined,
	keepalive = undefined,
	signal = undefined,
} = {}) {
	const resp = await fetch(src, {
		mode, cache, credentials, redirect, priority, referrerPolicy, headers,
		integrity, keepalive, signal,
	});

	if (resp.ok) {
		const doc = Document.parseHTML(await resp.text(), opts);
		const frag = document.createDocumentFragment();
		frag.append(...doc.head.children, ...doc.body.children);
		return frag;
	} else {
		throw new Error(`${resp.url} [${resp.status} ${resp.statusText}]`);
	}
}
