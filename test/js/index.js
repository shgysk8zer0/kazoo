import { createElement } from '/elements.js';
import { getJSON } from '/http.js';
import { html, attr } from '/dom.js';
import { createPolicy } from '/trust.js';
import { isTrustedScriptOrigin } from '/trust-policies.js';
import { createYouTubeEmbed } from '/youtube.js';
import { createFileCodeIcon } from '/icons.js';
import { SVG } from '/types.js';

const sanitizer = new Sanitizer();
const policy = createPolicy('custom#html', {
	createHTML: input => sanitizer.sanitizeFor('div', input).innerHTML,
	createScript: () => trustedTypes.emptyScript,
	createScriptURL: input => {
		if (isTrustedScriptOrigin(input)) {
			return input;
		} else {
			throw new DOMException(`Untrusted Script URL: ${input}`);
		}
	}
});

requestIdleCallback(() => {
	const fill = matchMedia('(prefers-color-scheme: dark)').matches ? '#fafafa' : '#242424';
	const svg = createFileCodeIcon({ size: 64, fill });
	const file = new File([svg.outerHTML], 'icon.svg', { type: SVG });
	const href = URL.createObjectURL(file);
	attr('link[rel="icon"]', { href });
});

document.getElementById('footer').append(
	createElement('span', { text: '© ' }),
	createElement('time', { text: new Date().getFullYear().toString() }),
);

document.getElementById('header').append(createYouTubeEmbed('r-5eu3DpIbc', { width: 560, height: 315 }));

getJSON('./api/bacon.json').then(lines => {
	html('#main', policy.createHTML(lines.map(t => `<p>${t}</p>`).join('')));
});
