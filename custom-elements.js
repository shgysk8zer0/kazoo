/**
 * @copyright 2023-2024 Chris Zuber <admin@kernvalley.us>
 */
import { HTML } from '@shgysk8zer0/consts/mimes.js';
import { registerComponent as reg } from '@aegisjsproject/core/componentRegistry.js';
import { whenIntersecting } from './intersect.js';
import { Cache } from './Cache.js';

const componentCache = new Cache();

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

export async function renderComponentShadow(shadow, {
	template,
	styles,
	content,
	loading = 'eager',
	cache = componentCache,
	key,
	expires,
	sanitizer: {
		elements,
		attributes,
		comments = false,
		dataAttributes = true,
		...sanitizer
	}
}) {
	if (! (shadow instanceof ShadowRoot)) {
		throw new TypeError('Shadow expected to be a `ShadowRoot`.');
	}

	if (typeof content === 'string') {
		shadow.host.setHTML(content, { elements, attributes, comments, dataAttributes, ...sanitizer });
	} else if (content instanceof HTMLTemplateElement) {
		shadow.host.append(content.content.cloneNode(true));
	} else if (content instanceof Node) {
		shadow.host.append(content);
	} else if (Array.isArray(content)) {
		shadow.host.append(...content);
	}

	const cacheKey = typeof key === 'undefined' ? shadow.host.constructor : key;

	if (loading === 'lazy') {
		await whenIntersecting(shadow.host);
	}

	if (cache.has(cacheKey, expires !== undefined)) {
		const { frag, sheets } = await cache.get(cacheKey);
		shadow.adoptedStyleSheets = sheets;
		shadow.append(frag.cloneNode(true));
	} else {
		cache.set(key, new Promise(async (resolve, reject) => {
			const frag = document.createDocumentFragment();

			if (typeof template === 'string') {
				frag.setHTML(template, { elements, attributes, comments, dataAttributes, ...sanitizer });
			} else if (template instanceof HTMLTemplateElement) {
				frag.append(template.content.cloneNode(true));
			} else if (template instanceof Node) {
				frag.append(template.cloneNode(true));
			} else {
				reject(new TypeError('Template must be a string or a Node.'));
			}

			if (Array.isArray(styles)) {
				const sheets = await Array.fromAsync(
					styles,
					async sheet => sheet instanceof CSSStyleSheet ? sheet : new CSSStyleSheet().replace(sheet)
				);

				resolve({ frag, sheets });
				shadow.adoptedStyleSheets = sheets;
				shadow.append(frag.cloneNode(true));
			} else if (styles instanceof CSSStyleSheet) {
				resolve({ frag, sheets: [styles] });
				shadow.adoptedStyleSheets = [styles];
				shadow.append(frag.cloneNode(true));
			} else if (typeof styles === 'string') {
				const sheet = await new CSSStyleSheet().replace(styles);
				resolve({ frag, sheets: [sheet] });
				shadow.adoptedStyleSheets = [sheet];
				shadow.append(frag.cloneNode(true));
			}
		}).catch(err => {
			console.error(err);
			cache.delete(cacheKey);
		}), expires);
	}
}
