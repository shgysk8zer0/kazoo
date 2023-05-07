# kazoo
A JavaScript monorepo for all the things!

[![CodeQL](https://github.com/shgysk8zer0/kazoo/actions/workflows/codeql-analysis.yml/badge.svg)](https://github.com/shgysk8zer0/kazoo/actions/workflows/codeql-analysis.yml)
![Node CI](https://github.com/shgysk8zer0/kazoo/workflows/Node%20CI/badge.svg)
![Lint Code Base](https://github.com/shgysk8zer0/kazoo/workflows/Lint%20Code%20Base/badge.svg)

[![GitHub license](https://img.shields.io/github/license/shgysk8zer0/kazoo.svg)](https://github.com/shgysk8zer0/kazoo/blob/master/LICENSE)
[![GitHub last commit](https://img.shields.io/github/last-commit/shgysk8zer0/kazoo.svg)](https://github.com/shgysk8zer0/kazoo/commits/master)
[![GitHub release](https://img.shields.io/github/release/shgysk8zer0/kazoo?logo=github)](https://github.com/shgysk8zer0/kazoo/releases)
[![GitHub Sponsors](https://img.shields.io/github/sponsors/shgysk8zer0?logo=github)](https://github.com/sponsors/shgysk8zer0)

[![npm](https://img.shields.io/npm/v/@shgysk8zer0/kazoo)](https://www.npmjs.com/package/@shgysk8zer0/kazoo)
![node-current](https://img.shields.io/node/v/@shgysk8zer0/kazoo)
![npm bundle size gzipped](https://img.shields.io/bundlephobia/minzip/@shgysk8zer0/kazoo)
[![npm](https://img.shields.io/npm/dw/@shgysk8zer0/kazoo?logo=npm)](https://www.npmjs.com/package/@shgysk8zer0/kazoo)

[![GitHub followers](https://img.shields.io/github/followers/shgysk8zer0.svg?style=social)](https://github.com/shgysk8zer0)
![GitHub forks](https://img.shields.io/github/forks/shgysk8zer0/kazoo.svg?style=social)
![GitHub stars](https://img.shields.io/github/stars/shgysk8zer0/kazoo.svg?style=social)
[![Twitter Follow](https://img.shields.io/twitter/follow/shgysk8zer0.svg?style=social)](https://twitter.com/shgysk8zer0)

[![Donate using Liberapay](https://img.shields.io/liberapay/receives/shgysk8zer0.svg?logo=liberapay)](https://liberapay.com/shgysk8zer0/donate "Donate using Liberapay")
- - -

- [Code of Conduct](./.github/CODE_OF_CONDUCT.md)
- [Contributing](./.github/CONTRIBUTING.md)
<!-- - [Security Policy](./.github/SECURITY.md) -->

## Example

```js
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
```
