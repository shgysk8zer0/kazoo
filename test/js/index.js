import { createElement } from '/elements.js';
import { getJSON } from '/http.js';
import { html } from '/dom.js';
import { createPolicy } from '/trust.js';
import { isTrustedScriptOrigin } from '/trust-policies.js';
import { createYouTubeEmbed } from '/youtube.js';

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

document.getElementById('footer').append(
	createElement('span', { text: '© ' }),
	createElement('time', { text: new Date().getFullYear().toString() }),
);

document.getElementById('header').append(createYouTubeEmbed('r-5eu3DpIbc', { width: 560, height: 315 }));

getJSON('./api/bacon.json').then(lines => {
	html('#main', policy.createHTML(lines.map(t => `<p>${t}</p>`).join('')));
});
