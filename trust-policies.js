/**
 * @copyright 2023-2024 Chris Zuber <admin@kernvalley.us>
 */
import { createPolicy } from './trust.js';
import { callOnce } from './utility.js';
import { attributes, elements, comments } from '@aegisjsproject/sanitizer/config/base.js';
export { getYouTubePolicy } from'./google/policies.js';

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

export function sanitizeHTML(input, { elements, attributes, comments } = {}) {
	if (Element.prototype.setHTML instanceof Function) {
		const el = document.createElement('div');
		el.setHTML(input, { sanitizer: { elements, attributes, comments }});
		return el.innerHTML;
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
	comments,
	elements: [
		...elements, 'krv-ad', 'krv-events', 'leaflet-map', 'leaflet-marker',
		'youtube-player', 'spotify-player', 'weather-current', 'weather-forecast',
		'github-user', 'github-repo', 'github-gist', 'wfd-events', 'codepen-embed',
		'bacon-ipsum', 'facebook-post',
	],
	attributes: [
		...attributes,
		'theme',
		'loading',
		'source',
		'medium',
		'content',
		'campaign',
		'term',
		'count',
		'layout',
		'center',
		'zoom',
		'tilesrc',
		'allowlocate',
		'allowfullscreen',
		'zoomcontrol',
		'minzoom',
		'maxzoom',
		'longitude',
		'latitude',
		'open',
		'appid',
		'postalcode',
		'large',
		'uri',
		'user',
		'bio',
		'gist',
		'file',
		'repo',
		'pen',
		'tab',
		'editable',
		'clicktoload',
		'lines',
		'paras',
		'start-with-lorem',
		'filler',
		'post',
		'showtext',
	],
};

export const getDefaultPolicy = callOnce(() => {
	return createPolicy('default', {
		createHTML: input => sanitizeHTML(input,{ elements, attributes, comments }),
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

export const getBlobScriptURLPolicy = callOnce(() => createPolicy('blob#script-url', {
	createScriptURL: input => {
		if (input.startsWith('blob:')) {
			return input;
		} else {
			throw new TypeError(`${input} is not a blob: URI.`);
		}
	}
}));

export const getDataScriptURLPolicy = callOnce(() => createPolicy('data#script-url', {
	createScriptURL: input => {
		if (input.startsWith('data:')) {
			return input;
		} else {
			throw new TypeError(`${input} is not a data: URI.`);
		}
	}
}));

// Disqus embeds are created via their script & must use default policy :(
export const getDefaultPolicyWithDisqus = callOnce(() => {
	return createPolicy('default', {
		createHTML: input => sanitizeHTML(input, { elements, attributes,  comments }),
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
		createHTML: input => sanitizeHTML(input, { elements, attributes, comments }),
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

export const getDefaultNoOpPolicy = callOnce(() => createPolicy('default', {}));
