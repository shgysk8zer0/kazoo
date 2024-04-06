import { css } from '@aegisjsproject/parsers/css.js';
import { data } from '../attrs.js';
// import { createElement } from '../elements.js';

const styles = css`:host {
	position: fixed;
	right: unset;
	bottom: unset;
	margin: unset;
	padding: 0.8em 6px;
	border: 1px solid #dadada;
	border-radius: 6px;
	color-scheme: light dark;
	background-color: #fafafa;
	color: #232323;
	min-width: 250px;
	overflow: auto;
}

@media (prefers-color-scheme: dark) {
	:host {
		background-color: #1e1e1e;
		color: #fefefe;
	}
}

.menuitem {
	display: block;
	cursor: pointer;
	padding: 0.3em 0.8em;
	width: 100%;
	margin-top: 0.4em;
	border: none;
	font-family: system-ui;
	text-align: left;
	background-color: transparent;
}

.menuitem:hover, .menuitem:focus {
	background-color: #204e8a;
	color: #fefefe;
	outline: none;
}

.icon {
	height: 1em;
	width: auto;
	margin-inline-end: 1.3em;
}`;

export function createContextMenu(items, {
	target = document.body,
	capture = false,
	once = false,
	signal: passedSignal,
} = {}) {
	if (typeof target === 'string') {
		createContextMenu(items, {
			target: document.getElementById(target),
			capture, once, signal: passedSignal
		});
	} else if (! (target instanceof Element)) {
		throw new TypeError('Target for contextmenu must be an element or id.');
	} else if (passedSignal instanceof AbortSignal && passedSignal.aborted) {
		throw passedSignal.reason;
	} else {

		target.addEventListener('contextmenu', event => {
			event.preventDefault();
			const controller = new AbortController();
			const signal = passedSignal instanceof AbortSignal
				? AbortSignal.any([passedSignal, controller.signal])
				: controller.signal;


			event.currentTarget.addEventListener('pointerup', event => {
				const menu = document.createElement('div');
				const shadow = menu.attachShadow({ mode: 'open', delegatesFocus: true });

				shadow.adoptedStyleSheets = [styles];
				document.addEventListener('scroll', event => event.preventDefault(), { signal, passive: false });
				menu.popover = 'auto';
				menu.role = 'menu';
				menu.ariaLabel = 'Context Menu';
				menu.id = 'menu-' + crypto.randomUUID();
				menu.classList.add('context-popover');
				menu.style.setProperty('left', `${event.clientX}px`);
				menu.style.setProperty('top', `${event.clientY}px`);

				menu.addEventListener('toggle', ({ target, newState }) => {
					if (newState === 'closed') {
						target.remove();
						controller.abort();
					}
				});

				shadow.append(...items.map(({ label, icon, callback, data: dataset, disabled = false }, i) => {
					const btn = document.createElement('button');
					const labelEl = document.createElement('span');
					labelEl.id = `label-${i}`;
					labelEl.part.add('label');
					labelEl.classList.add('label');
					labelEl.textContent = label.trim();
					btn.type = 'button';
					btn.part.add('menuitem');
					btn.role = 'menuitem';
					btn.ariaLabel = label;
					btn.classList.add('menuitem');

					if (disabled) {
						btn.disabled = true;
						btn.ariaDisabled = 'true';
					}

					if (icon instanceof Element) {
						const clone = icon.cloneNode(true);
						clone.part.add('icon');
						clone.classList.add('icon');
						btn.append(clone);
					}

					if (typeof dataset === 'object') {
						data(btn, dataset);
					}

					btn.append(labelEl);

					if (callback instanceof Function) {
						btn.addEventListener('click', async ({ currentTarget}) => {
							try {
								await callback.call(target, { target, data: currentTarget.dataset });
							} catch(err) {
								console.error(err);
							} finally {
								currentTarget.getRootNode().host.hidePopover();
							}
						}, { signal });
					}

					return btn;
				}));

				menu.addEventListener('keydown', event => {
					switch(event.key) {
						case 'Tab':
							event.preventDefault();
							break;

						case 'ArrowRight':
						case 'PageDown':
							event.preventDefault();
							if (shadow.activeElement instanceof Element) {
								let next = shadow.activeElement.nextElementSibling;

								while (next instanceof Element && next.disabled) {
									next = next.nextElementSibling;
								}

								if (next instanceof Element) {
									next.focus();
								} else {
									shadow.querySelector('.menuitem:not(:disabled)').focus();
								}
							}
							break;

						case 'ArrowLeft':
						case 'PageUp':
							event.preventDefault();
							if (shadow.activeElement instanceof Element) {
								let prev = shadow.activeElement.previousElementSibling;

								while (prev instanceof Element && prev.disabled) {
									prev = prev.nextElementSibling;
								}

								if (prev instanceof Element) {
									prev.focus();
								} else {
									const btns = shadow.querySelectorAll('.menuitem:not(:disabled)');
									btns.item(btns.length - 1).focus();
								}
							}
							break;

						case 'Home':
							event.preventDefault();
							shadow.querySelector('.menuitem:not(:disabled)').focus();
							break;

						case 'End': {
							event.preventDefault();
							const btns = shadow.querySelectorAll('.menuitem:not(:disabled)');
							btns.item(btns.length - 1).focus();
							break;
						}

						default: {
							const btns = [...shadow.querySelectorAll('.menuitem:not(:disabled) > .label')];
							const active = shadow.activeElement;
							const match = btns.find(btn =>
								! btn.parentElement.isSameNode(active)
								&& btn.textContent.trim().charAt(0).toLowerCase() === event.key
							);

							if (match instanceof Element) {
								match.parentElement.focus();
							}
						}
					}
				}, { signal });

				document.body.append(menu);
				menu.showPopover();
				shadow.firstElementChild.focus();
			}, { once: true, signal });
		}, { capture, once, signal: passedSignal });
	}
}
