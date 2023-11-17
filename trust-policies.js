/**
 * @copyright 2023 Chris Zuber <admin@kernvalley.us>
 */
import { createPolicy } from './trust.js';
import { callOnce } from './utility.js';
import { HTML } from '@shgysk8zer0/consts/mimes.js';
// @todo Remove use of `Sanitizer.getDefaultConfiguration()`
const {
	allowElements, allowAttributes, allowComments, blockElements, dropAttributes,
	dropElements,
} = Sanitizer.getDefaultConfiguration();

const unsafeElements = [
	'script', 'title', 'noscript', 'object', 'embed', 'style', 'param', 'iframe',
	'base', 'frame', 'frameset',
];

const unsafeAttrs = [
	'ping', 'action', 'formaction', 'http-equiv', 'background', 'style', 'bgcolor',
	'fgcolor', 'linkcolor', 'lowsrc', ...Object.keys(
		Object.getOwnPropertyDescriptors(HTMLElement.prototype)
	).filter(desc => desc.startsWith('on')),
];

const urlAttrs = ['href', 'src', 'cite'];
const allowedProtocols = location.protocol === 'http:' ? ['http:', 'https:'] : ['https:'];

function isUnsafeURL(attr, node) {
	const val = node.getAttribute(attr);
	return (
		typeof val === 'string'
		&& val.length !== 0
		&& urlAttrs.includes(attr)
		&& URL.canParse(val, document.baseURI)
		&& ! allowedProtocols.includes(new URL(val, document.baseURI).protocol)
	);
}

/*
 * Do NOT export this! It is dangerous and MUST only be used internally.
 * But it still needs to be added to `trusted-types` in CSP if used.
 */
const getRawHTMLPolicy = callOnce(() => {
	return createPolicy('trust-raw#html', { createHTML: input => input });
});

export const trustedOrigins = [
	location.origin,
	'https://cdn.kernvalley.us',
	'https://unpkg.com',
];

export const googleOrigins = [
	'https://www.googletagmanager.com',
	'https://www.google-analytics.com',
];

export const youtubeEmbedOrigins = [
	'https://www.youtube.com',
	'https://www.youtube-nocookie.com',
];

export const youtubeEmbeds = youtubeEmbedOrigins.map(origin => `${origin}/embed/`);

export function isTrustedScriptOrigin(input) {
	const { origin } = new URL(input, document.baseURI);
	return trustedOrigins.includes(origin);
}

export function isGoogleOrigin(input) {
	const { origin } = new URL(input, document.baseURI);
	return googleOrigins.includes(origin);
}

export function isYouTubeEmbed(input) {
	const { origin, pathname } = new URL(input, document.baseURI);
	return youtubeEmbedOrigins.includes(origin) && pathname.startsWith('/embed/');
}

export function escapeHTML(input) {
	const el = document.createElement('div');
	el.textContent = input;
	return el.innerHTML;
}

export function stripHTML(input) {
	const tmp = document.createElement('template');
	const policy = getRawHTMLPolicy();
	tmp.innerHTML = policy.createHTML(`<div>${input}</div>`);
	return tmp.content.firstElementChild.textContent;
}

export function sanitizeHTML(input, {
	allowElements, allowComments, allowAttributes, allowCustomElements,
	blockElements, dropAttributes, dropElements, allowUnknownMarkup, sanitizer,
} = {}) {
	if (Element.prototype.setHTML instanceof Function) {
		const el = document.createElement('div');
		el.setHTML(input, {
			allowElements, allowComments, allowAttributes, allowCustomElements,
			blockElements, dropAttributes, dropElements, allowUnknownMarkup, sanitizer,
		});
		return el.innerHTML;
	} else if (
		'Sanitizer' in globalThis
		&& Sanitizer.prototype.sanitizeFor instanceof Function
		&& typeof sanitizer === 'object' && sanitizer instanceof Sanitizer
	) {
		return sanitizer.sanitizeFor('div', input).innerHTML;
	} else {
		console.warn('Sanitizer not supported. Returning escaped HTML');
		return escapeHTML(input);
	}
}

export function isDisqusEmbedScript(input) {
	return /^https:\/\/[\w-]+\.disqus\.com\/embed\.js$/.test(input);
}

export function isDisqusEmbed(input) {
	return input.startsWith('https://disqus.com/embed/comments/');
}

export const createEmptyHTML = () => trustedTypes.emptyHTML;
export const createEmptyScript = () => trustedTypes.emptyScript;

/**
 * @TODO: Add support for SVG
 */
export const sanitizerConfig = {
	allowComments,
	allowCustomElements: true,
	allowElements: [
		...allowElements, 'krv-ad', 'krv-events', 'leaflet-map', 'leaflet-marker',
		'youtube-player', 'spotify-player', 'weather-current', 'weather-forecast',
		'github-user', 'github-repo', 'github-gist', 'wfd-events', 'codepen-embed',
		'bacon-ipsum', 'facebook-post',
	],
	allowAttributes: {
		...allowAttributes,
		'theme': [
			'krv-ad', 'weather-current', 'weather-forecast', 'wfd-events',
			'codepen-embed',
		],
		'loading': [
			...allowAttributes.loading, 'krv-ad', 'weather-current',
			'weather-forecast', 'youtube-player', 'spotify-player',
			'github-user', 'github-repo', 'wfd-events', 'codepen-embed',
		],
		'crossorigin': [...allowAttributes.crossorigin, 'leaflet-map'],
		'source': ['krv-ad', 'krv-events', 'wfd-events'],
		'medium': ['krv-ad', 'krv-events', 'wfd-events'],
		'content': ['krv-ad', 'krv-events', 'wfd-events'],
		'campaign': ['krv-ad', 'krv-events', 'wfd-events'],
		'term': ['krv-ad', 'krv-events', 'wfd-events'],
		'count': ['krv-events'],
		'layout': ['krv-ad'],
		'center': ['leaflet-map'],
		'zoom': ['leaflet-map'],
		'tilesrc': ['leflet-map'],
		'allowlocate': ['leaflet-map'],
		'allowfullscreen': ['leaflet-map'],
		'zoomcontrol': ['leaflet-map'],
		'minzoom': ['leaflet-map', 'leaflet-marker'],
		'maxzoom': ['leaflet-map', 'leaflet-marker'],
		'longitude': ['leaflet-marker'],
		'latitude': ['leaflet-marker'],
		'open': [...allowAttributes.open, 'krv-ad'],
		'appid': ['weather-current', 'weather-forecast'],
		'postalcode': ['weather-current', 'weather-forecast'],
		'height': [
			...allowAttributes.height, 'youtube-player', 'github-gist',
			'codepen-embed', 'facebook-post',
		],
		'width': [
			...allowAttributes.width, 'youtube-player', 'github-gist',
			'codepen-embed', 'facebook-post',
		],
		'large': ['spotify-player'],
		'uri': ['spotify-player'],
		'user': [
			'github-repo', 'github-user', 'github-gist', 'codepen-embed',
			'facebook-post',
		],
		'bio': ['github-user'],
		'gist': ['github-gist'],
		'file': ['github-gist'],
		'repo': ['github-repo'],
		'pen': ['codepen-embed'],
		'tab': ['codepen-embed'],
		'editable': ['codepen-embed'],
		'clicktoload': ['codepen-embed'],
		'lines': ['bacon-ipsum'],
		'paras': ['bacon-ipsum'],
		'start-with-lorem': ['bacon-ipsum'],
		'filler': ['bacon-ipsum'],
		'post': ['facebook-post'],
		'showtext': ['facebook-post'],
	},
	dropAttributes,
	blockElements,
	dropElements,
};

export const getDefaultPolicy = callOnce(() => {
	return createPolicy('default', {
		createHTML: input => sanitizeHTML(input, {
			allowElements, allowAttributes, allowComments, blockElements,
			dropAttributes, dropElements,
		}),
		createScript: createEmptyScript,
		createScriptURL: input => {
			if (isTrustedScriptOrigin(input)) {
				return input;
			} else {
				throw new TypeError(`Disallowed script origin: ${input}`);
			}
		}
	});
});

/**
 * Instead of using this policy and setting `innerHTML`, you would do better
 * to set `textContent` instead.
 */
export const getEscapeHTMLPolicy = callOnce(() => {
	return createPolicy('escape#html', { createHTML: escapeHTML });
});

export const getStripHTMLPolicy = callOnce(() => {
	return createPolicy('strip#html', { createHTML: stripHTML });
});

export const getJSONScriptPolicy = callOnce(() => {
	return createPolicy('json#script', {
		createScript: input => JSON.stringify(JSON.parse(input)),
	});
});

export const getDefaultPolicyWithDisqus = callOnce(() => {
	return createPolicy('default', {
		createHTML: input => sanitizeHTML(input, {
			allowElements, allowAttributes, allowComments, blockElements, dropAttributes,
			dropElements,
		}),
		createScript: createEmptyScript,
		createScriptURL: input => {
			if (isTrustedScriptOrigin(input) || isDisqusEmbed(input)) {
				return input;
			} else {
				throw new TypeError(`Disallowed script origin: ${input}`);
			}
		}
	});
});

export const getKRVPolicy = callOnce(() => {
	return createPolicy('krv', {
		createHTML: input => sanitizeHTML(input, {
			allowElements, allowAttributes, allowComments, blockElements, dropAttributes,
			dropElements,
		}),
		createScript: createEmptyScript,
		createScriptURL: input => {
			if (isTrustedScriptOrigin(input)) {
				return input;
			} else {
				throw new TypeError(`Disallowed script origin: ${input}`);
			}
		}
	});
});

export const getYouTubePolicy = callOnce(() => createPolicy('youtube#embed', {
	createScriptURL: input => {
		if (isYouTubeEmbed(input)) {
			return input;
		} else {
			throw new TypeError(`Invalid YouTube URL: ${input}`);
		}
	}
}));

export const getGooglePolicy = callOnce(() => createPolicy('ga#script-url', {
	createHTML: createEmptyHTML,
	createScript: createEmptyScript,
	createScriptURL: input => {
		if (isGoogleOrigin(input)) {
			return input;
		} else {
			throw new TypeError(`${input} is not a known Google origin.`);
		}
	}
}));

export const getDisqusPolicy = callOnce(() => createPolicy('disqus#script-url', {
	createScriptURL: input => {
		if (isDisqusEmbedScript(input)) {
			return input;
		} else {
			throw new TypeError(`Invalid Disqus URL: ${input}`);
		}
	}
}));

export function isSafeHTML(content) {
	try {
		const policy = getRawHTMLPolicy();
		const parsed = content instanceof Node
			? content
			: new DOMParser().parseFromString(policy.createHTML(content), HTML);

		const iter = document.createNodeIterator(parsed, NodeFilter.SHOW_ELEMENT);

		let safe = true;
		let node = iter.nextNode();

		while (node instanceof Node) {
			if (node.nodeType === Node.ELEMENT_NODE) {
				if (unsafeElements.includes(node.localName.toLowerCase())) {
					safe = false;
					break;
				} else if (node.getAttributeNames().some(attr => {
					return unsafeAttrs.includes(attr.toLowerCase()) || isUnsafeURL(attr, node);
				})) {
					safe = false;
					break;
				} else if (node.tagName === 'TEMPLATE' && ! isSafeHTML(node.content)) {
					safe = false;
					break;
				} else {
					node = iter.nextNode();
				}
			} else {
				safe = false;
				break;
			}
		}

		return safe;
	} catch {
		return false;
	}
}

export const getDefaultNoOpPolicy = callOnce(() => createPolicy('default', {}));
