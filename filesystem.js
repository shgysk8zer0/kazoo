/**
 * @copyright 2023 Chris Zuber <admin@kernvalley.us>
 */
import { getDeferred, lock } from './promises.js';
import { createElement, createInput } from './elements.js';

export async function save(file, { signal } = {}) {
	if (signal instanceof EventTarget && signal.aborted) {
		throw signal.reason;
	} else if (file instanceof File) {
		const link = document.createElement('a');
		const url = URL.createObjectURL(file);

		link.href = url;
		link.download = file.name;
		link.hidden = true;

		link.addEventListener('click', ({ target }) => {
			requestIdleCallback(() => {
				URL.revokeObjectURL(target.href);
				target.remove();
			});
		}, { passive: true, capture: true, once: true, signal });

		link.click();
	} else {
		throw new TypeError('Not a file');
	}
}

export async function open({
	accept = null,
	multiple = false,
	directory = false,
	description = 'Select file(s)',
	signal,
} = {}) {
	if (signal instanceof AbortSignal && signal.aborted) {
		throw signal.reason || new DOMException('Operation aborted.');
	} else {
		return await lock('file-picker', async () => {
			const { resolve, reject, promise } = getDeferred({ signal });

			if (! (signal instanceof AbortSignal && signal.aborted)) {
				const uuid = crypto.randomUUID();
				const dialog = createElement('dialog', {
					'children': [
						createElement('form', {
							'name': 'file-picker',
							'events': {
								'submit': event => {
									event.preventDefault();
									const dialog = event.target.closest('dialog');
									resolve(Array.from(new FormData(event.target).getAll('files')));

									if (dialog.animate instanceof Function) {
										dialog.animate([{
											'opacity': 1,
										}, {
											'opacity': 0,
										}], {
											'duration': 400,
											'easing': 'ease-in-out',
											'fill': 'both',
										}).finished.then(() => dialog.close());
									} else {
										dialog.close();
									}
								},
								'reset': ({ target }) => target.closest('dialog').close(),
							},
							'children': [
								createElement('div', {
									'classList': ['form-group'],
									'children': [
										createElement('label', {
											'text': description,
											'for': uuid,
											'classList': ['input-label', 'block', 'required', 'cursor-pointer'],
										}),
										createInput('files', {
											'id': uuid,
											'classList': ['input'],
											'type': 'file',
											'accept': Array.isArray(accept) ? accept.join(', ') : accept,
											'webkitdirectory': directory,
											'required': true,
											'multiple': multiple,
										})
									]
								}),
								createElement('div', {
									'classList': ['flex', 'row', 'no-wrap'],
									'styles': {
										'margin-top': '18px',
										'gap': '2em',
									},
									'children': [
										createElement('button', {
											'type': 'submit',
											'text': 'Ok',
											'classList': ['btn', 'btn-accept', 'grow-1'],
										}),
										createElement('button', {
											'text': 'Cancel',
											'type': 'reset',
											'classList': ['btn', 'btn-reject', 'grow-1'],
										}),
									],
								}),
							],
						}),
					],
					'events': {
						'close': ({ target }) => {
							reject(new DOMException('User cancelled the file select'));
							target.remove();
						},
					},
				});

				document.body.append(dialog);

				if (dialog.animate instanceof Function) {
					const anim = dialog.animate([{
						'opacity': 0.1,
						'transform': 'scale(0.3)',
					}, {
						'opacity': 1,
						'transform': 'none',
					}], {
						'duration': 400,
						'easing': 'ease-in-out',
						'fill': 'both',
						'delay': 100,
					});

					dialog.showModal();

					anim.finished.then(() => {
						const input = dialog.querySelector('input[type="file"]');

						if (input.showPicker instanceof Function) {
							try {
								input.showPicker({ signal });
							} catch(err) {
								setTimeout(() => input.click(), 200);
							}
						} else {
							input.click();
						}
					});
				} else {
					const input = dialog.querySelector('input[type="file"]');
					setTimeout(() => input.click(), 200);
					dialog.showModal();
				}

				if (signal instanceof AbortSignal) {
					signal.addEventListener('abort', () => dialog.close(), { once: true });
				}
			}

			return await promise;
		}, { signal, mode: 'exclusive' });
	}
}
