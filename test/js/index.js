import { createElement } from '../../elements.js';
import { getJSON } from '../../http.js';
import { html, attr } from '../../dom.js';
import { animate } from '../../animate.js';
import { createPolicy } from '../../trust.js';
import { isTrustedScriptOrigin } from '../../trust-policies.js';
import { createYouTubeEmbed } from '../../youtube.js';
import * as icons from '../../icons.js';
import { whenIntersecting } from '../../intersect.js';
import { isPrime } from '../../math.js';
import { open } from '../../filesystem.js';
import { alert } from '../../asyncDialog.js';
import { fileToImage } from '../../img-utils.js';
import { SVG } from '../../types.js';
import { fillShareTarget } from '../../share-target.js';
import '@shgysk8zer0/components/github/user.js';
import '@shgysk8zer0/components/github/repo.js';

const sanitizer = new Sanitizer();
const policy = createPolicy('default', {
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

fillShareTarget('contact');

requestIdleCallback(() => {
	const fill = matchMedia('(prefers-color-scheme: dark)').matches ? '#fafafa' : '#242424';
	const svg = icons.createFileCodeIcon({ size: 64, fill });
	const file = new File([svg.outerHTML], 'icon.svg', { type: SVG });
	const href = URL.createObjectURL(file);
	attr('link[rel="icon"]', { href });
});

document.getElementById('footer').append(
	createElement('span', { text: '© ' }),
	createElement('time', { text: new Date().getFullYear().toString() }),
);

getJSON('./api/bacon.json').then(async lines => {
	html('#bacon', policy.createHTML(lines.map(t =>  `<p onclick="alert(1)">${t}</p>`).join('')));

	document.getElementById('header').append(...Object.values(icons).map(func => func({ size: 64 })));

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
			text: 'YouTube',
			classList: ['btn', 'btn-primary'],
			dataset: { video: 'r-5eu3DpIbc' },
			events: {
				click: ({ target }) => {
					const dialog = createElement('dialog', {
						events: { close: ({ target }) => target.remove() },
						children: [
							createYouTubeEmbed(target.dataset.video, { width: 560, height: 315 }),
							document.createElement('br'),
							createElement('button', {
								type: 'button',
								classList: ['btn', 'btn-reject'],
								text: 'Close',
								events: { click: ({ target }) => target.closest('dialog').close() },
							})
						]
					});

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
