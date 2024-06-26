/**
 * @copyright 2021-2024 Chris Zuber <admin@kernvalley.us>
 */
import { parse } from './dom.js';
import { signalAborted } from './abort.js';
import { setURLParams, setUTMParams, isObject, isNullish, callOnce } from './utility.js';
import { isTrustPolicy } from './trust.js';
import { HTTPException } from './HTTPException.js';
import * as TYPES from '@shgysk8zer0/consts/mimes.js';

function filename(src) {
	if (typeof src === 'string') {
		return new URL(src, location.origin).pathname.split('/').at(-1);
	} else {
		return '';
	}
}

function getType({ headers }) {
	if (headers instanceof Headers && headers.has('Content-Type')) {
		return headers.get('Content-Type').split(';')[0];
	} else {
		return null;
	}
}

function handleResponse(resp, { cause, message } = {}) {
	if (! (resp instanceof Response)) {
		throw new TypeError('Expected a Response object');
	} else if (! resp.ok) {
		throw new HTTPException(resp, { cause, message });
	} else {
		return resp;
	}
}

function handleError(err) {
	if (err instanceof HTTPException) {
		throw err;
	} else if (err instanceof Error) {
		throw new HTTPException(Response.error(), { cause: err, message: err.message });
	} else if (typeof err === 'string') {
		throw new HTTPException(Response.error(), {
			cause: new DOMException('Unknown network error'),
			message: err,
		});
	} else {
		throw new HTTPException(Response.error(), {
			cause: new DOMException('Unknown network error'),
			message: 'Unknown network error',
		});
	}
}

export async function fetch(url, opts = {}) {
	if (opts.signal instanceof AbortSignal && opts.signal.aborted) {
		throw new HTTPException(Response.error(), {
			cause: opts.signal.reason,
			message: opts.signal.reason instanceof Error ? opts.signal.reason.message : opts.signal.reason,
		});
	} else if (opts.signal instanceof AbortSignal && ! ('signal' in Request.prototype)) {
		return await Promise.race([
			globalThis.fetch(url, opts),
			signalAborted(opts.signal),
		]).then(resp => handleResponse(resp, { message: opts.errorMessage }), handleError);
	} else {
		return await globalThis.fetch(url, opts).then(resp => handleResponse(resp, { message: opts.errorMessage }), handleError);
	}
}

export const getHTTPCSP = callOnce(async function getHTTPCSP() {
	const { ok, headers } = await fetch(location.href, { method: 'HEAD' });

	if (ok && headers.has('Content-Security-Policy')) {
		const directives = headers.get('Content-Security-Policy').trim().split(';').filter(str => str.length !== 0);

		return Object.fromEntries(directives.map(directive => {
			const [key, ...rest] = directive.trim().split(' ').filter(part => part.length !== 0);
			return [key, rest];
		}));
	}
});

export const getCSP = callOnce(async function getCSP() {
	try {
		const csp = await getHTTPCSP();

		if (typeof csp === 'object' && ! Object.is(csp, null)) {
			return csp;
		} else {
			return getMetaCSP();
		}
	} catch(err) {
		console.error(err);
		return getMetaCSP();
	}
});

export function getMetaCSP() {
	const meta = document.head.querySelector('meta[http-equiv="Content-Security-Policy"][content]');

	if (meta instanceof HTMLMetaElement) {
		const directives = meta.content.trim().split(';').filter(str => str.length !== 0);

		return Object.fromEntries(directives.map(directive => {
			const [key, ...rest] = directive.trim().split(' ').filter(part => part.length !== 0);
			return [key, rest];
		}));
	} else {
		return {};
	}
}

export async function GET(url, {
	body = undefined,
	mode = 'cors',
	cache = 'default',
	credentials = 'omit',
	redirect = 'follow',
	priority  ='auto',
	referrerPolicy = 'no-referrer',
	headers = new Headers(),
	integrity = undefined,
	keepalive = undefined,
	signal = undefined,
	timeout = null,
	errorMessage,
} = {}) {
	if (typeof body !== 'undefined') {
		url = setURLParams(url, body);
	} else if (typeof url === 'string') {
		url = new URL(url, document.baseURI);
	}

	if (typeof signal === 'undefined' && Number.isInteger(timeout)) {
		signal = AbortSignal.timeout(timeout);
	} else if (signal instanceof AbortController) {
		signal = signal.signal;
	}

	return await fetch(url, { method: 'GET', mode, credentials, referrerPolicy,
		headers, cache, redirect, priority, integrity, keepalive, signal, errorMessage });
}

export async function POST(url, {
	body = undefined,
	mode = 'cors',
	cache = 'default',
	credentials = 'omit',
	priority = 'auto',
	redirect = 'follow',
	referrerPolicy = 'no-referrer',
	headers = new Headers(),
	integrity = undefined,
	keepalive = undefined,
	signal = undefined,
	timeout = null,
	errorMessage,
} = {}) {
	if (typeof body === 'object' && ! (body instanceof FormData)) {
		if (body instanceof HTMLFormElement) {
			body = new FormData(body);
		} else if (body instanceof File) {
			let file;
			[body, file] = [new FormData(), body];
			// @TODO figure out a default param name for the file
			// @TODO handle multiple files and arrays containing files
			body.set(file.name, file, file.name);
		} else {
			body = JSON.stringify(body);

			if (headers instanceof Headers && ! headers.has('Content-Type')) {
				headers.set('Content-Type', TYPES.JSON);
			}
		}
	}

	if (typeof signal === 'undefined' && Number.isInteger(timeout)) {
		signal = AbortSignal.timeout(timeout);
	} else if (signal instanceof AbortController) {
		signal = signal.signal;
	}

	return await fetch(url, { method: 'POST', body, mode, credentials, referrerPolicy,
		headers, cache, redirect, priority, integrity, keepalive, signal, errorMessage });
}

export async function DELETE(url, {
	body = undefined,
	mode = 'cors',
	cache = 'default',
	credentials = 'omit',
	redirect = 'follow',
	priority = 'auto',
	referrerPolicy = 'no-referrer',
	headers = new Headers(),
	integrity = undefined,
	keepalive = undefined,
	signal = undefined,
	timeout = null,
	errorMessage,
} = {}) {
	if (typeof body !== 'undefined') {
		url = setURLParams(url, body);
	} else if (typeof url === 'string') {
		url = new URL(url, document.baseURI);
	}

	if (typeof signal === 'undefined' && Number.isInteger(timeout)) {
		signal = AbortSignal.timeout(timeout);
	} else if (signal instanceof AbortController) {
		signal = signal.signal;
	}

	return await fetch(url, { method: 'DELETE', mode, credentials, referrerPolicy,
		headers, cache, redirect, priority, integrity, keepalive, signal, errorMessage });
}

export async function getHTML(url, {
	body = undefined,
	mode = 'cors',
	cache = 'default',
	credentials = 'omit',
	redirect = 'follow',
	priority = 'auto',
	referrerPolicy = 'no-referrer',
	headers = new Headers({ Accept: TYPES.HTML }),
	integrity = undefined,
	keepalive = undefined,
	signal = undefined,
	timeout = null,
	sanitizer: {
		elements,
		attributes,
		comments,
	} = {},
	policy,
	errorMessage,
} = {}) {
	const html = await getText(url, { body, mode, credentials, referrerPolicy, headers,
		cache, redirect, priority, integrity, keepalive, signal, timeout, errorMessage });

	if (isTrustPolicy(policy)) {
		const doc = new DOMParser().parseFromString(policy.createHTML(html), TYPES.HTML);
		const frag = document.createDocumentFragment();
		frag.append(...doc.head.children, ...doc.body.children);
		return frag;
	} else {
		const frag = document.createDocumentFragment();
		const doc = Document.parseHTML(html, { sanitizer: { elements, attributes, comments }});
		frag.append(...doc.head.children, ...doc.body.children);
		return frag;
	}
}

export const createTemplateGetter = (...args) => callOnce(() => getHTML(...args));

export async function getText(url, {
	body = undefined,
	mode = 'cors',
	cache = 'default',
	credentials = 'omit',
	redirect = 'follow',
	priority = 'auto',
	referrerPolicy = 'no-referrer',
	headers = new Headers({ Accept: TYPES.TEXT }),
	integrity = undefined,
	keepalive = undefined,
	signal = undefined,
	timeout = null,
	errorMessage,
} = {}) {
	const resp = await GET(url, { body, mode, credentials, referrerPolicy, headers,
		cache, redirect, priority, integrity, keepalive, signal, timeout, errorMessage });

	return await resp.text();
}

export async function getJSON(url, {
	body = undefined,
	mode = 'cors',
	cache = 'default',
	credentials = 'omit',
	redirect = 'follow',
	referrerPolicy = 'no-referrer',
	priority = 'auto',
	headers = new Headers({ Accept: TYPES.JSON }),
	integrity = undefined,
	keepalive = undefined,
	signal = undefined,
	timeout = null,
	errorMessage,
} = {}) {
	const resp = await GET(url, { body, mode, credentials, referrerPolicy, headers,
		cache, redirect, priority, integrity, keepalive, signal, timeout, errorMessage });

	return await resp.json();
}

export async function getFile(url, {
	name = null,
	body = undefined,
	mode = 'cors',
	cache = 'default',
	credentials = 'omit',
	redirect = 'follow',
	referrerPolicy = 'no-referrer',
	priority = 'auto',
	headers = new Headers(),
	integrity = undefined,
	keepalive = undefined,
	signal = undefined,
	timeout = null,
	errorMessage,
} = {}) {
	if (typeof name !== 'string') {
		name = filename(url);
	}

	const resp = await GET(url, { body, mode, credentials, referrerPolicy, headers,
		cache, redirect, priority, integrity, keepalive, signal, timeout, errorMessage });

	const type = getType(resp);
	return new File([await resp.blob()], name, { type });
}

export async function submitForm(form) {
	if (typeof form === 'string') {
		return await submitForm(document.forms[form]);
	} else if (form instanceof Event) {
		form.preventDefault();
		return await submitForm(form.target);
	} else if (form instanceof HTMLFormElement) {
		switch (form.method.toLowerCase()) {
			case 'get':
				return GET(form.action, { body: new FormData(form) });

			case 'post':
				return POST(form.action, { body: new FormData(form) });

			case 'delete':
				return DELETE(form.action, { body: new FormData(form) });

			default:
				throw new Error(`Unsupported method: ${form.method}`);
		}
	}
}

export const getManifest = callOnce(async function getManifest({ timeout, signal } = {}) {
	const resp = await getLink('link[rel="manifest"][href]', { timeout, signal });
	return await resp.json();
});

export async function getLink(link, { timeout, signal } = {}) {
	if (typeof link === 'string') {
		return await getLink(document.querySelector(link, { timeout, signal }));
	} else if (! (link instanceof HTMLLinkElement)) {
		throw new DOMException('Expected a <link>');
	} else if (link.href.length === 0) {
		throw new DOMException('Missing `href` on <link>');
	} else {
		const { href, integrity, type, referrerPolicy, crossOrigin } = link;

		let credentials;
		const mode = typeof crossOrigin === 'string' ? 'cors' : 'no-cors';
		const headers = new Headers();

		if (mode === 'cors') {
			credentials = crossOrigin === 'use-credentials' ? 'include' : 'omit';
		}

		if (typeof type === 'string') {
			headers.set('Accept', type);
		}

		return await GET(href, { mode, credentials, headers, integrity, referrerPolicy, timeout, signal });
	}
}

export async function postHTML(url, {
	body = undefined,
	mode = 'cors',
	cache = 'default',
	credentials = 'omit',
	redirect = 'follow',
	referrerPolicy = 'no-referrer',
	priority = 'auto',
	headers = new Headers({ Accept: TYPES.HTML }),
	integrity = undefined,
	keepalive = undefined,
	signal = undefined,
	timeout = null,
	head = true,
	asFrag = true,
	sanitizer = undefined,
	policy,
	errorMessage,
} = {}) {
	const html = await postText(url, { body, mode, credentials, referrerPolicy, headers,
		cache, redirect, priority, integrity, keepalive, signal, timeout, errorMessage });

	return parse(html, { head, asFrag, sanitizer, policy });
}

export async function postJSON(url, {
	body = undefined,
	mode = 'cors',
	cache = 'default',
	credentials = 'omit',
	redirect = 'follow',
	referrerPolicy = 'no-referrer',
	priority = 'auto',
	headers = new Headers({ Accept: TYPES.JSON }),
	integrity = undefined,
	keepalive = undefined,
	signal = undefined,
	timeout = null,
	errorMessage,
} = {}) {
	const resp = await POST(url, { body, mode, credentials, referrerPolicy, headers,
		cache, redirect, priority, integrity, keepalive, signal, timeout, errorMessage });

	return await resp.json();
}

export async function postText(url, {
	body = undefined,
	mode = 'cors',
	cache = 'default',
	credentials = 'omit',
	redirect = 'follow',
	referrerPolicy = 'no-referrer',
	priority = 'auto',
	headers = new Headers({ Accept: TYPES.TEXT }),
	integrity = undefined,
	keepalive = undefined,
	signal = undefined,
	timeout = null,
	errorMessage,
} = {}) {
	const resp = await POST(url, { body, mode, credentials, referrerPolicy, headers,
		cache, redirect, priority, integrity, keepalive, signal, timeout, errorMessage });

	return await resp.text();
}

export function navigateTo(to, {
	params = {},
	utm: {
		source: utm_source,
		medium: utm_medium = 'referral',
		content: utm_content,
		campaign: utm_campaign,
		term: utm_term,
	} = {},
	allowedOrigins = [],
	requirePath = false,
	origin = location.origin,
} = {}) {
	const url = new URL(to, origin);

	if (! Array.isArray(allowedOrigins)) {
		throw new TypeError('`allowedOrigins` must be an array');
	} else if (! (url.origin === location.origin || allowedOrigins.includes(url.origin))) {
		throw new TypeError(`${url.origin} is not an allowed origin`);
	} else if (requirePath && url.pathname.length === 1) {
		throw new TypeError('`pathname` is required');
	} else if (! isObject(params)) {
		throw new TypeError('Expected `params` to be an object');
	} else {
		if (typeof utm_source === 'string') {
			Object.entries({...params, utm_source, utm_medium, utm_content, utm_campaign, utm_term })
				.filter(([,v]) => ! isNullish(v))
				.forEach(([k, v]) => url.searchParams.set(k, v));
		} else {
			Object.entries(params)
				.filter(([,v]) => ! isNullish(v))
				.forEach(([k, v]) => url.searchParams.set(k, v));
		}

		location.href = url.href;
	}
}

export async function getCSSStyleSheet(url, {
	mode = 'cors',
	cache = 'default',
	credentials = 'omit',
	redirect = 'follow',
	priority = 'auto',
	referrerPolicy = 'no-referrer',
	media,
	disabled = false,
	baseURL = document.baseURI,
	signal,
} = {}) {
	const resp = await fetch(url, {
		headers: new Headers({ Accept: TYPES.CSS }),
		mode, cache, credentials, redirect,  priority, referrerPolicy, signal,
	});

	if (! resp.ok) {
		throw new Error(`${resp.url} [${resp.status} ${resp.statusText}]`);
	} else if (! resp.headers.get('Content-Type').startsWith(TYPES.CSS)) {
		throw new TypeError(`Expected "Content-Type: ${TYPES.CSS}" but got ${resp.headers.get('Content-Type')}.`);
	} else {
		const css = await resp.text();
		return new CSSStyleSheet({ media, disabled, baseURL }).replace(css);
	}
}

export function postNav(url, data = {}, {
	target = '_self' ,
	enctype = TYPES.FORM_URL_ENCODED,
	signal,
} = {}) {
	if (! (signal instanceof AbortSignal && signal.aborted)) {
		const form = document.createElement('form');
		const inputs = Object.entries(data).map(([name, value]) => {
			const input = document.createElement('input');
			input.name = name;
			input.type = 'hidden';
			input.readOnly = true;
			input.value = value;
			return input;
		});

		form.action = url;
		form.method = 'POST';
		form.target = target;
		form.enctype = enctype;
		form.hidden = true;
		form.append(...inputs);
		form.addEventListener('submit', ({ target }) => setTimeout(() => target.remove(), 100), { signal });

		requestAnimationFrame(() => {
			document.body.append(form);
			form.submit();
		});
	}
}

export { setURLParams, setUTMParams };
