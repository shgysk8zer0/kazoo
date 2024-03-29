/**
 * @copyright 2023 Chris Zuber <admin@kernvalley.us>
 */
import { getDeferred } from './promises.js';
import { createElement } from './elements.js';
import { JPEG, PNG, GIF, WEBP, SVG } from '@shgysk8zer0/consts/mimes.js';
import { getType } from './utility.js';

export const EXTENSIONS = {
	[JPEG]: '.jpg',
	[PNG]: '.png',
	[WEBP]: '.webp',
};

export const SUPPORTED_TYPES = [JPEG, PNG, GIF, WEBP, SVG];

const DEFAULT_TYPE = JPEG;
const DEFAULT_QUALITY = 0.8;
const DEFAULT_HEIGHT = 480;

export const supportsType = type => type.toLowerCase() in EXTENSIONS;
export const getExtensionForType = type => EXTENSIONS[type.toLowerCase()];

/**
 * Need to pass file in case it's an SVG with no given width/height
 */
async function getDimensions(img, file) {
	if (! (img instanceof HTMLImageElement)) {
		throw new TypeError(`Expected an <img> but got a ${getType(img)}.`);
	} else if (! (file instanceof File)) {
		throw new TypeError(`Expected a file but got a ${getType(file)}.`);
	} else {
		const { naturalWidth, naturalHeight } = img;
		if (naturalWidth !== 0 && naturalHeight !== 0) {
			return { naturalWidth, naturalHeight };
		} else if (file.type === SVG) {
			const { width, height } = await getSVGFileInfo(file);
			return { naturalWidth: parseInt(width), naturalHeight: parseInt(height) };
		} else {
			throw new Error('Unable to determine width and height');
		}
	}
}

export async function getSVGFileInfo(file) {
	const svg = await fileToSVG(file);
	const { name, type, size, lastModified } = file;
	const width = svg.width.baseVal.value;
	const height = svg.height.baseVal.value;
	const modified = new Date(lastModified);
	return { width, height, name, type, size, modified };
}

export async function fileToSVG(file) {
	if (! (file instanceof File)) {
		throw new TypeError(`Expected a file but got a ${getType(file)}.`);
	} else if (file.type !== SVG) {
		throw new TypeError(`Expected an SVG file but got ${file.type}`);
	} else {
		const parser = new DOMParser();
		const svg = parser.parseFromString(await file.text(), SVG);
		return svg.documentElement;
	}
}

export async function getImageFileInfo(file) {
	const img = await fileToImage(file);
	const { naturalWidth: width, naturalHeight: height } = await getDimensions(img, file);
	const { name, type, size, lastModified } = file;
	const modified = new Date(lastModified);
	URL.revokeObjectURL(img.src);
	return { width, height, name, type, size, modified };
}

export const resizeImageFiles = async (files, {
	type    = DEFAULT_TYPE,
	quality = DEFAULT_QUALITY,
	height  = DEFAULT_HEIGHT,
	priority = 'background',
	x = 0,
	y = 0,
	signal,
} = {}) => await Promise.all(files.map(file => resizeImageFile(file, { type, quality, height, x, y, priority, signal })));

export async function resizeImageFile(file, {
	type    = DEFAULT_TYPE,
	quality = DEFAULT_QUALITY,
	height  = DEFAULT_HEIGHT,
	priority = 'background',
	x = 0,
	y = 0,
	signal,
} = {}) {
	const img = await fileToImage(file);
	const { naturalWidth, naturalHeight } = img;
	const width = naturalWidth * (height / naturalHeight);

	if (signal instanceof AbortSignal && signal.aborted) {
		throw signal.reason;
	} else if (typeof height !== 'number' || height < 1 || Number.isNaN(height)) {
		throw new TypeError('Height must be a positive integer');
	} else if (! supportsType(type)) {
		throw new TypeError(`Unsupported type: ${type}`);
	} else if ('OffscreenCanvas' in globalThis) {
		return await scheduler.postTask(async () => {
			const canvas = new globalThis.OffscreenCanvas(width, height);
			const ctx = canvas.getContext('2d');

			ctx.imageSmoothingEnabled = false;
			ctx.drawImage(img, x, y, width, height);

			const blob = await canvas.convertToBlob({ type, quality });
			const basename = file.name.split('.')[0];
			const ext = getExtensionForType(blob.type);
			const f = new File([blob], `${basename}${ext}`, { type: blob.type });
			URL.revokeObjectURL(img.src);
			return f;
		}, { priority, signal });
	} else {
		return await scheduler.postTask(async () => {
			const canvas = document.createElement('canvas');
			canvas.width = width;
			canvas.height = height;
			const ctx = canvas.getContext('2d');

			ctx.imageSmoothingEnabled = false;
			ctx.drawImage(img, x, y, width, height);

			const f = await canvasToFile(canvas, { type, quality, name: file.name });
			URL.revokeObjectURL(img.src);
			return f;
		}, { priority, signal });
	}
}

export function previewImgOnChange(input, container, {
	classList,
	height,
	width,
	base = document.body,
	priority = 'background',
	signal,
} = {}) {
	if (signal instanceof AbortSignal && signal.aborted) {
		throw signal.reason;
	} else if (typeof input == 'string') {
		previewImgOnChange(base.querySelector(input), container, {
			classList, height, width, signal, base,
		});
	} else if (typeof container === 'string') {
		previewImgOnChange(input, base.querySelector(container), {
			classList, height, width, signal, base,
		});
	} else if (! (input instanceof HTMLInputElement && input.type === 'file')) {
		throw new TypeError('Expected input to be an `<input type="file">`');
	} else if(! (container instanceof HTMLElement)) {
		throw new TypeError('Expected container to be an HTMLElement');
	} else {
		const getPreviews = () => [...container.querySelectorAll('img[src^="blob:"]')];
		const revokePreviews = () => getPreviews().forEach(({ src }) => URL.revokeObjectURL(src));
		const removePreviews = () => getPreviews().forEach(img => img.remove());
		const clear = () => {
			revokePreviews();
			removePreviews();
		};

		input.accept = SUPPORTED_TYPES.join(',');

		input.addEventListener('change', async ({ target }) => {
			if (target.files.length === 0) {
				revokePreviews();
				removePreviews();
			} else {
				const files = [...target.files];

				if (files.length === 0 && input.required) {
					input.setCustomValidity('No valid images selected');
				} else if (files.length > 1 && ! input.multiple) {
					input.setCustomValidity('Please select only one image');
				} else if(files.some(({ type }) => ! SUPPORTED_TYPES.includes(type.toLowerCase()))) {
					input.setCustomValidity('Please select only supported image files');
				} else if (files.length !== 0) {
					try {
						await scheduler.postTask(async () => {
							const imgs = await Promise.all(
								files.map(file => fileToImage(file, { width, height }))
							);

							if (Array.isArray(classList) && classList.length !== 0) {
								imgs.forEach(img => img.classList.add(...classList));
							}

							revokePreviews();
							container.replaceChildren(...imgs);
							input.setCustomValidity('');

						}, { signal, priority });
					} catch(err) {
						console.error(err);
						input.setCustomValidity('Error processing image');
					}
				}
			}
		}, { signal });

		if (signal instanceof AbortSignal) {
			signal.addEventListener('abort', clear, { once: true });
		}
	}
}

export async function canvasToFile(canvas, {
	type    = DEFAULT_TYPE,
	quality = DEFAULT_QUALITY,
	name    = 'canvas-img',
} = {}) {
	const { resolve, reject, promise } = getDeferred();

	if (! (canvas instanceof HTMLCanvasElement)) {
		reject(new DOMException('Expected a <canvas> element'));
	} else if (! supportsType(type)) {
		throw new TypeError(`Unsupported type: ${type}`);
	} else {
		canvas.toBlob(blob => {
			const basename = name.split('.')[0];
			const ext = getExtensionForType(blob.type);
			const file = new File([blob], `${basename}${ext}`, { type: blob.type });
			resolve(file);
		}, type, quality);
	}
	return promise;
}

export async function fileToImage(file, { width, height } = {}) {
	if (! (file instanceof File)) {
		throw new TypeError(`Expected a file but got a ${getType(file)}.`);
	} else if (! file.type.startsWith('image/')) {
		throw new TypeError(`Expected an image file but got ${file.type}.`);
	} else {
		const img = new Image(width, height);
		img.src = URL.createObjectURL(file);
		await img.decode();
		return img;
	}
}

export async function fileToCanvas(file, { height = DEFAULT_HEIGHT, x = 0, y = 0 } = {}) {
	const img = await fileToImage(file);
	const { naturalWidth, naturalHeight } = await getDimensions(img, file);
	const width = parseInt(naturalWidth * (height / naturalHeight));
	const canvas = createElement('canvas', { width, height });
	const ctx = canvas.getContext('2d');

	img.width = width;
	img.height = height;
	ctx.imageSmoothingEnabled = false;
	ctx.drawImage(img, x, y, width, height);
	URL.revokeObjectURL(img.src);
	return canvas;
}
