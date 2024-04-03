import { isTrustedScriptOrigin } from '../../trust-policies.js';
// import { createPolicy } from '../../trust.js';

trustedTypes.createPolicy('default', {
	createHTML: input => {
		const el = document.createElement('div');
		el.setHTML(input);
		return el.innerHTML;
	},
	createScript: () => trustedTypes.emptyScript,
	createScriptURL: input => {
		if (isTrustedScriptOrigin(input)) {
			return input;
		} else {
			throw new DOMException(`Untrusted Script URL: ${input}`);
		}
	}
});
