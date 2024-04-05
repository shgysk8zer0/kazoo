/**
 * @copyright 2023-2024 Chris Zuber <admin@kernvalley.us>
 */
import { HTML } from '@shgysk8zer0/consts/mimes.js';
import { registerComponent as reg } from '@aegisjsproject/core/componentRegistry.js';

export const supported = globalThis.customElements instanceof Object;

export function isDefined(...tags) {
	return supported && tags.every(tag => typeof customElements.get(tag) !== 'undefined');
}

export function defineComponent(tag, cls, allow = false) {
	return allow ? registerAllowedCustomElement(tag, cls) : registerCustomElement(tag, cls);
}

export function registerAllowedCustomElement(tag, cls, ...rest) {
	try {
		reg(tag, cls, ...rest);
		return true;
	} catch(err) {
		console.error(err);
		return false;
	}
}

export function registerCustomElement(tag, cls, ...rest) {
	try {
		customElements.define(tag, cls, ...rest);
		return true;
	} catch(err) {
		console.error(err);
		return false;
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
