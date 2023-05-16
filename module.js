const maps = new Map();
const cache = new Map();

export const URL_PREFIXES = ['http:', 'https:'];
export const PATH_PREFIXES = ['/', './', '../'];
export const isString = str => typeof str === 'string';
export const isURL = str => isString(str) && URL_PREFIXES.some(pre => str.startsWith(pre));
export const isPath = str => isString(str) && PATH_PREFIXES.some(pre => str.startsWith(pre));
export const isBare = str => ! (isURL(str) || isPath(str));

export function getImportmap() {
	if (maps.has(document)) {
		return maps.get(document);
	} else {
		const script = document.head.querySelector('script[type="importmap"]');

		if (script instanceof HTMLScriptElement) {
			const { imports = {}, scope = {} } = JSON.parse(script.textContent);
			return { imports, scope };
		} else {
			return { imports: {}, scope: {} };
		}
	}
}

export function resolveModule(specifier, { imports } = getImportmap()) {

	if (cache.has(specifier)) {
		return cache.get(specifier);
	} else if (imports.hasOwnProperty(specifier)) {
		return imports[specifier];
	} else if (specifier.includes('/')) {
		let found = false;

		const longest = Object.keys(imports)
			.filter(spec => spec.endsWith('/'))
			.reduce((match, spec) => {
				if (! found && specifier.startsWith(spec)) {
					found = true;
					return spec;
				} else if (found && spec.length > match && specifier.startsWith(spec)) {
					return spec;
				} else {
					return match;
				}
			}, null);
		if (! found) {
			throw new TypeError(`Resolution of specifier “${specifier}” was blocked by a null entry.`);
		} else if (found) {
			const resolved = new URL(specifier.replace(longest, imports[longest]), document.baseURI).href;
			cache.set(specifier, resolved);
			return resolved;
		}
	}
}
