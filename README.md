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

## Installation

### npm

```bash
npm i @shgysk8zer0/kazoo
```

### As a git submodule

```bash
git submodule add https://github.com/shgysk8zer0/kazoo.git [:path/to/dest]
```

### Using an [import map](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/script/type/importmap)

**Tip**: To use in Rollup and load from unpkg, check out [`@shgysk8zer0/rollup-import`](https://npmjs.org/package/@shgysk8zer0/rollup-import).

#### From unpkg

```html
<script type="importmap">
  {
    "imports": {
      "@shgysk8zer0/kazoo/": "https://unpkg.com/@shgysk8zer0/kazoo[@:version]/"
    }
  }
</script>
```

### From `node_modules/`

**Note**: This requires a correctly set `<base href="/">` to the parent folder.

```html
<script type="importmap">
  {
    "imports": {
      "@shgysk8zer0/kazoo/": "./node_modules/@shgysk8zer0/kazoo/"
    }
  }
</script>
```

## Example

```js
import { createElement } from '@shgysk8zer0/kazoo/elements.js';
import { getJSON } from '@shgysk8zer0/kazoo/http.js';
import { html } from '@shgysk8zer0/kazoo/dom.js';
import { createPolicy } from '@shgysk8zer0/kazoo/trust.js';
import { isTrustedScriptOrigin, createSanitizerCallback } from '@shgysk8zer0/kazoo/trust-policies.js';
import { createYouTubeEmbed } from '@shgysk8zer0/kazoo/youtube.js';

const sanitizer = new Sanitizer();
const policy = createPolicy('default', {
	createHTML: createSanitizerCallback(),
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

document.getElementById('header')
  .append(createYouTubeEmbed('r-5eu3DpIbc', { width: 560, height: 315 }));

getJSON('./api/bacon.json').then(lines => {
	html('#main', policy.createHTML(lines.map(t => `<p>${t}</p>`).join('')));
});
```
