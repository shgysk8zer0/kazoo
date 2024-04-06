import { registerCustomElement } from '../custom-elements.js';
import { createElement } from '../elements.js';
import { getJSON } from '../http.js';

registerCustomElement('bacon-ipsum', class BaconIpsumElement extends HTMLElement {
	constructor() {
		super();
		this.attachShadow({ mode: 'open' });
	}

	async connectedCallback() {
		this.shadowRoot.append(...Array.from(
			await getJSON('https://baconipsum.com/api/?type=all-meat&paras=5&start-with-lorem=1'),
			text => createElement('p', { text }),
		));
	}
});
