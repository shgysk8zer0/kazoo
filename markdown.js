import { MARKDOWN, TEXT } from '@shgysk8zer0/consts/mimes.js';
import { Marked } from 'marked';
import { markedHighlight } from 'marked-highlight';
import hljs from 'highlight.js/core.min.js';
import plaintext from 'highlight.js/languages/plaintext.min.js';

export const hljsURL = new URL(`https://unpkg.com/@highlightjs/cdn-assets@${hljs.versionString}/`);

export const registerLanguage =  (name, def) => hljs.registerLanguage(name, def);

export const registerLanguages = langsObj => Object.entries(langsObj)
	.forEach(([name, lang]) => registerLanguage(name, lang));

export const listLanguages = () => hljs.listLanguages();

export const getLanguage = lang => hljs.getLanguage(lang);

export const getLanguagesObject = () => Object.fromEntries(listLanguages().map(lang => [lang, getLanguage(lang)]));

registerLanguage('plaintext', plaintext);

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
	'i', 'b', 'u', 'strong', 'em' , 'del', 'span', 'div', 'hr', 'br', 'sub', 'sup',
	'strike','center', 'abbr', 'figure', 'figcaption', 'col', 'colgroup', 'hgroup',
	'youtube-video', 'spotify-player',
];

export const ALLOW_ATTRIBUTES = {
	'href': ['a'],
	'src': ['img'],
	'alt': ['img'],
	'width': ['img'],
	'height': ['img'],
	'srcset': ['img'],
	'sizes': ['img'],
	'id': ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'],
	'class': ['*'],
	'title': ['*'],
	'loading': ['*'],
};

export const ALLOW_COMMENTS = false;

export const ALLOW_DATA_ATTRIBUTES = false;

export function createStyleSheet(path, { media, base = hljsURL } = {}) {
	const link = document.createElement('link');
	link.relList.add('stylesheet');
	link.crossOrigin = 'anonymous';
	link.referrerPolicy = 'no-referrer';

	if (typeof media === 'string') {
		link.media = media;
	} else if (media instanceof MediaQueryList) {
		link.media = media.media;
	}

	link.href = new URL(`./styles/${path}.min.css`, base);
	return link;
}

export async function parseMarkdown(str, {
	base = document.baseURI,
	elements = ALLOW_ELEMENTS,
	attributes = ALLOW_ATTRIBUTES,
	comments = ALLOW_COMMENTS,
	dataAttributes = ALLOW_DATA_ATTRIBUTES,
	langPrefix = 'hljs language-',
	fallbackLang = 'plaintext',
	...rest
} = {}) {
	const { resolve, reject, promise } = Promise.withResolvers();

	requestIdleCallback(() => {
		try {
			const marked = new Marked(
				markedHighlight({
					langPrefix,
					highlight(code, lang) {
						const language = hljs.getLanguage(lang) ? lang : fallbackLang;
						return hljs.highlight(code, { language }).value;
					}
				})
			);

			const frag = document.createDocumentFragment();
			const parsed = marked.parse(str);
			const doc = Document.parseHTML(parsed, { sanitizer: {
				elements: ['html', 'head', 'body',  ...elements],
				attributes, dataAttributes, comments, ...rest
			}});


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
	elements = ALLOW_ELEMENTS,
	attributes = ALLOW_ATTRIBUTES,
	comments = ALLOW_COMMENTS,
	dataAttributes = ALLOW_DATA_ATTRIBUTES,
	...rest
} = {}) {
	if (! (file instanceof File)) {
		throw new TypeError('Not a file.');
	} else if (file.type !== MARKDOWN) {
		throw new TypeError(`${file.name} is not a markdown file.`);
	} else {
		const text = await file.text();
		return await parseMarkdown(text, { base, elements, attributes, comments, dataAttributes, ...rest });
	}
}

export async function fetchMarkdown(url, {
	base = document.baseURI,
	elements = ALLOW_ELEMENTS,
	attributes = ALLOW_ATTRIBUTES,
	comments = ALLOW_COMMENTS,
	dataAttributes = ALLOW_DATA_ATTRIBUTES,
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
	} else if (! [MARKDOWN, TEXT].some(mime => resp.headers.get('Content-Type').startsWith(mime))) {
		throw new TypeError(`Expected "Content-Type: ${MARKDOWN}" but got ${resp.headers.get('Content-Type')}.`);
	} else {
		const text = await resp.text();
		return await parseMarkdown(text, { base, elements, attributes, comments, dataAttributes });
	}
}
