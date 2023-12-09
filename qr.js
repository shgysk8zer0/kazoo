import { createImage } from './elements.js';
import { setUTMParams } from './utility.js';
import { clamp } from './math.js';
import { formatDate, formatLines, createEvent } from './iCal.js';

export const QRSERVER = 'https://api.qrserver.com/';

export function createQRCode(data, {
	size,
	margin,
	format,
	color,
	bgColor,
	ecc,
	...rest
} = {}) {
	const url = new URL('/v1/create-qr-code/',  QRSERVER);
	url.searchParams.set('data', data);

	if (typeof size === 'number' && ! Number.isNaN(size)) {
		url.searchParams.set('size', `${clamp(10, size, 1000)}x${clamp(10, size, 1000)}`);
	}

	if (typeof margin === 'number' && ! Number.isNaN(margin)) {
		url.searchParams.set('margin', clamp(0, margin, 50));
	}

	if (typeof color === 'string') {
		url.searchParams.set('color', color.replace('#', ''));
	}

	if (typeof bgColor === 'string') {
		url.searchParams.set('bgcolor', bgColor.replace('#', ''));
	}

	if (typeof format === 'string') {
		url.searchParams.set('format', format.toLowerCase());
	}

	if (typeof ecc === 'string') {
		url.searchParams.set('ecc', ecc);
	}

	return createImage(url, {
		width: size || 250,
		height: size || 250,
		crossOrigin: 'anonymous',
		referrerPolicy: 'no-referrer',
		...rest
	});
}

export function createURLQRCode(url, {
	source,
	medium = 'qr',
	content,
	campaign,
	term,
	...rest
} = {}) {
	const utmURL = setUTMParams(url, { source, medium, content, campaign, term });
	return createQRCode(utmURL, rest);
}

export function createICalEventQR({
	name,
	startDate,
	endDate,
	description,
	location,
	size,
	margin,
	format,
	color,
	bgColor,
	ecc,
}) {
	const str = formatLines(createEvent({
		name, startDate, endDate, description, location, sequence: null,
		classification: null, transparency: null, status: null,
	}));

	// QR Events only get the event info, not whole calendar
	const data = str
		// Fix Google Calendar not respecting UTC via "Z"
		.replace(/^DTSTART:\d+T\d+Z$/m, 'DTSTART:' + formatDate(new Date(startDate)))
		.replace(/^DTEND:\d+T\d+Z$/m, 'DTEND:' + formatDate(new Date(endDate)));

	return createQRCode(data, { size, margin, format, color, bgColor, ecc });
}
