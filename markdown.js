import { use, parse } from 'marked';
import { markedHighlight } from 'marked-highlight';
import hljs from 'highlight.js';
import { MARKDOWN } from './types.js';

export const STYLESHEETS = {
	github: {
		dark: {
			href: `https://unpkg.com/highlight.js@${hljs.versionString}/styles/github-dark.css`,
			media: 'screen and (prefers-color-scheme: dark)',
		},
		light: {
			href: `https://unpkg.com/highlight.js@${hljs.versionString}/styles/github.css`,
			media: 'print, not (prefers-color-scheme: dark)',
		},
	},
};

export const ALLOW_ELEMENTS = [
	'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'blockquote', 'pre', 'code',
	'table', 'thead', 'tbody', 'tr', 'th', 'td', 'a', 'img', 'ol', 'ul', 'li',
	'i', 'b', 'u', 'strong', 'em', 'span', 'div', 'hr', 'br', 'sub', 'sup',
];

export const ALLOW_ATTRIBUTES = {
	'href': ['a'],
	'src': ['img'],
	'alt': ['img'],
	'id': ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'],
	'class': ['*'],
};

use(markedHighlight({
	langPrefix: 'hljs language-',
	highlight(code, lang) {
		const language = hljs.getLanguage(lang) ? lang : 'plaintext';
		return hljs.highlight(code, { language }).value;
	}
}));

export async function parseMarkdown(str, {
	base = document.baseURI,
	allowElements = ALLOW_ELEMENTS,
	allowAttributes = ALLOW_ATTRIBUTES,
} = {}) {
	const { resolve, reject, promise } = Promise.withResolvers();

	requestIdleCallback(() => {
		try {
			const parsed = parse(str);
			const doc = Document.parseHTML(parsed, { allowElements, allowAttributes });
			const frag = document.createDocumentFragment();

			doc.querySelectorAll('img').forEach(img => {
				img.loading = 'lazy';
				img.crossOrigin = 'anonymous';
				img.referrerPolicy = 'no-referrer';
			});

			doc.querySelectorAll('a').forEach(a => {
				a.relList.add('external', 'noopener', 'noreferrer');
				a.href = new URL(a.getAttribute('href'), base);
			});

			frag.append(...doc.body.children);
			resolve(frag);
		} catch(e) {
			reject(e);
		}
	});

	return promise;
}

export async function parseMarkdownFile(file, {
	base = document.baseURI,
	allowElements = ALLOW_ELEMENTS,
	allowAttributes = ALLOW_ATTRIBUTES,
} = {}) {
	if (! (file instanceof File)) {
		throw new TypeError('Not a file.');
	} else if (file.type !== MARKDOWN) {
		throw new TypeError(`${file.name} is not a markdown file.`);
	} else {
		const text = await file.text();
		return await parseMarkdown(text, { base, allowElements, allowAttributes });
	}
}

export async function fetchMarkdown(url, {
	base = document.baseURI,
	allowElements = ALLOW_ELEMENTS,
	allowAttributes = ALLOW_ATTRIBUTES,
	headers = {},
	mode = 'cors',
	cache = 'default',
	credentials = 'omit',
	redirect = 'follow',
	priority = 'auto',
	referrerPolicy = 'no-referrer',
	signal,
} = {}) {
	const resp = await fetch(url, {
		headers: new Headers({ Accept: MARKDOWN, ...headers }),
		mode, cache, credentials, redirect,  priority, referrerPolicy, signal,
	});

	if (! resp.ok) {
		throw new Error(`${resp.url} [${resp.status} ${resp.statusText}]`);
	} else if (! resp.headers.get('Content-Type').startsWith(MARKDOWN)) {
		throw new TypeError(`Expected "Content-Type: ${MARKDOWN}" but got ${resp.headers.get('Content-Type')}.`);
	} else {
		const text = await resp.text();
		return await parseMarkdown(text, { base, allowElements, allowAttributes });
	}
}
