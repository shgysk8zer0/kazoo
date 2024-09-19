import { createElement } from '../../elements.js';
import { getJSON, getHTML } from '../../http.js';
import { html, attr, each, on } from '../../dom.js';
import { animate } from '../../animate.js';
import { createYouTubeEmbed } from '../../youtube.js';
import { createSVGFile } from '../../svg.js';
import { createGravatar } from '../../gravatar.js';
import * as icons from '../../icons.js';
import { whenIntersecting } from '../../intersect.js';
import { isPrime } from '../../math.js';
import { open } from '../../filesystem.js';
import { alert } from '../../asyncDialog.js';
import { fileToImage } from '../../img-utils.js';
import { btnStyles } from './styles.js';
// import { fillShareTarget } from '../../share-target.js';
import { addStyle } from '@shgysk8zer0/jswaggersheets';
import { fetchMarkdown, registerLanguage } from '../../markdown.js';
import javascript from 'highlight.js/languages/javascript.min.js';
import bash from 'highlight.js/languages/bash.min.js';
import xml from 'highlight.js/languages/bash.min.js';
import '@shgysk8zer0/components/github/user.js';
import '@shgysk8zer0/components/github/repo.js';

registerLanguage('javascript', javascript);
registerLanguage('bash', bash);
registerLanguage('xml', xml);
registerLanguage('html', xml);

on('#grav', 'submit', async event => {
	event.preventDefault();
	const data = new FormData(event.target);
	const img = await createGravatar(data.get('email'), {
		size: 512,
		animation: {
			keyframes: [
				{ opacity: 0, transform: 'scale(0)' },
				{ opacity: 1, transform: 'none' },
			],
			duration: 300,
			easing: 'ease-in-out',
		},
		events:{
			toggle(event) {
				if (event.newState === 'closed') {
					event.target.remove();
				}
			}
		}
	});

	img.popover = 'auto';
	document.body.append(img);
	img.showPopover();
});

fetchMarkdown('../../README.md').then(frag => {
	const readme = document.createElement('div');
	readme.id = 'readme-popover';
	readme.popover = 'auto';
	readme.append(frag);
	document.body.append(readme);
});

addStyle(document, btnStyles);

each('[data-template]', el =>
	whenIntersecting(el)
		.then(() => getHTML(el.dataset.template))
		.then(tmp => el.replaceChildren(tmp))
);

requestIdleCallback(() => {
	const fill = matchMedia('(prefers-color-scheme: dark)').matches ? '#fafafa' : '#242424';
	const svg = icons.createFileCodeIcon({ size: 64, fill });
	const file = createSVGFile(svg, 'icon.svg');
	const href = URL.createObjectURL(file);
	attr('link[rel="icon"]', { href });
});

document.getElementById('footer').append(
	createElement('span', { text: '© ' }),
	createElement('time', { text: new Date().getFullYear().toString() }),
);

getJSON('./api/bacon.json').then(async lines => {
	html('#bacon', trustedTypes.defaultPolicy.createHTML(lines.map(t => `<p onclick="alert(1)">${t}</p>`).join('')));

	document.getElementById('header')
		.append(...Object.entries(icons).map(([ariaLabel, func]) => func({ size: 64, ariaLabel })));

	const list = createElement('ol', {
		children: Iterator.range(0, Infinity)
			.filter(isPrime)
			.map(n => createElement('li', { text: n.toString() }))
			.take(10)
	});

	document.getElementById('main').append(createElement('h3', { text: 'Primes' }), list);
	document.getElementById('nav').append(
		createElement('button', {
			type: 'button',
			classList: ['btn', 'btn-primary'],
			text: 'Show README',
			popovertarget: 'readme-popover',
			popovertargetaction: 'show',
		}),
		createElement('button', {
			type: 'button',
			text: 'YouTube',
			classList: ['btn', 'btn-primary'],
			dataset: { video: 'r-5eu3DpIbc' },
			events: {
				click: ({ target }) => {
					const dialog = createElement('dialog', {
						events: { close: ({ target }) => target.remove() },
					});
					const shadow = dialog.attachShadow({ mode: 'closed' });
					addStyle(shadow, btnStyles);

					shadow.append(
						createYouTubeEmbed(target.dataset.video, { width: 560, height: 315 }),
						document.createElement('br'),
						createElement('button', {
							type: 'button',
							classList: ['btn', 'btn-reject'],
							text: 'Close',
							events: { click: ({ target }) => target.closest('dialog').close() },
						})
					);

					document.body.append(dialog);
					dialog.showModal();
				}
			}
		}),
		createElement('button', {
			type: 'button',
			classList: ['btn', 'btn-primary'],
			accesskey: 'f',
			text: 'Image Test',
			dataset: { accept: 'image/*', description: 'Select an image to preview' },
			events: {
				click: async ({ target }) => {
					const [file] = await open(target.dataset);

					if (file instanceof File && file.type.startsWith('image/')) {
						const dialog = createElement('dialog', {
							events: { click: ({ target }) => target.remove() },
							animation: {
								keyframes: [
									{ opacity: 0, transform: 'scale(0.1)' },
									{ opacity: 1, transform: 'none' },
								],
								duration: 800,
								easing: 'ease-in-out',
								fill: 'both',
								delay: 50,
							},
							children: [
								await fileToImage(file, { width: parseInt(0.5 * innerWidth)}),
								createElement('button', {
									type: 'button',
									classList: ['btn', 'btn-reject'],
									text: 'Close',
									events: {
										click: async ({ target }) => {
											const dialog = target.closest('dialog');

											await animate(dialog, [
												{ opacity: 1, transform: 'none' },
												{ opacity: 0, transform: 'scale(0.1)' },
											], {
												fill: 'both',
												duration: 800,
												easing: 'ease-in-out',
											});
											dialog.close();
										},
									}
								})
							]
						});

						document.body.append(dialog);
						dialog.showModal();
					}
				}
			}
		})
	);

	await whenIntersecting('#footer');
	alert('The End!');
});

