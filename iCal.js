import { ICAL as ICAL_MIME } from '@shgysk8zer0/consts/mimes.js';
import { ICAL as ICAL_EXT } from '@shgysk8zer0/consts/exts.js';
import { createQRCode } from './qr.js';

const CRLF = '\r\n';
const BEGIN_EVENT = 'BEGIN:VEVENT';
const END_EVENT = 'END:VEVENT';
const ESCAPE_CHARS = {
	'\\': '\\\\',
	'\n': '\\n',
	'\r': '\\r',
	';': '\\;',
	'"': '\\"',
	',':'\\,',
};

const escape = str => str.replaceAll(new RegExp(`[${Object.keys(ESCAPE_CHARS).join('')}]`, 'g'), char => ESCAPE_CHARS[char]);

function formatUTCDate(date) {
	return [
		date.getUTCFullYear().toString().padStart(4, '0'),
		(date.getUTCMonth() + 1).toString().padStart(2, '0'),
		date.getUTCDate().toString().padStart(2, '0'),
		'T',
		date.getUTCHours().toString().padStart(2, '0'),
		date.getUTCMinutes().toString().padStart(2, '0'),
		date.getUTCSeconds().toString().padStart(2, '0'),
		'Z',
	].join('');
}

function formatDate(date) {
	return [
		date.getFullYear().toString().padStart(4, '0'),
		(date.getMonth() + 1).toString().padStart(2, '0'),
		date.getDate().toString().padStart(2, '0'),
		'T',
		date.getHours().toString().padStart(2, '0'),
		date.getMinutes().toString().padStart(2, '0'),
		date.getSeconds().toString().padStart(2, '0'),
	].join('');
}

export function createICalEvent({
	name,
	startDate,
	endDate,
	description,
	method = 'REQUEST',
	location,
	url,
	modified = new Date(),
	uid = crypto.randomUUID(),
}) {
	if (typeof name !== 'string' || name.length === 0) {
		throw new TypeError('Event name must be a non-empty string.');
	} else if (typeof startDate === 'string' || typeof startDate === 'number') {
		return createICalEvent({ name,  startDate: new Date(startDate), endDate, description, location, modified, uid });
	} else if (! (startDate instanceof Date)) {
		throw new TypeError('startDate must be a Date object');
	} else if (typeof endDate === 'string' || typeof endDate === 'number')  {
		return createICalEvent({ name,  startDate, endDate: new Date(endDate), description, location, modified, uid });
	} else if (typeof modified === 'string' || typeof modified === 'number') {
		return createICalEvent({ name,  startDate, endDate, description, location, modified: new Date(modified), uid });
	} else if (! (modified instanceof Date)){
		throw new TypeError('Modified must be a date.');
	} else {
		const lines = [
			'BEGIN:VCALENDAR',
			'VERSION:2.0',
			`METHOD:${method}`,
			'PRODID:-//github.com/shgysk8zer0/kazoo v1.0//EN',
			BEGIN_EVENT,
			`UID:${escape(uid)}`,
			`SUMMARY:${escape(name.trim())}`,
			`LOCATION:${escape(location.trim())}`,
			`DTSTAMP:${formatUTCDate(modified)}`,
			`DTSTART:${formatUTCDate(startDate)}`,
		];

		if (endDate instanceof Date) {
			lines.push(`DTEND:${formatUTCDate(endDate)}`);
		}

		if (typeof description === 'string' && description.length !== 0) {
			lines.push(`DESCRIPTION:${escape(description.trim())}`);
		}

		if ((typeof url === 'string' &&  url.length !== 0) || url instanceof URL) {
			lines.push(`URL:${escape(url)}`);
		}

		lines.push(END_EVENT, 'END:VCALENDAR');

		return lines.join(CRLF);
	}
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
	const str = createICalEvent({ name, startDate, endDate, description, location });

	// QR Events only get the event info, not whole calendar
	const data = str.substring(str.indexOf(BEGIN_EVENT), str.indexOf(END_EVENT) + END_EVENT.length)
		// Fix Google Calendar not respecting UTC via "Z"
		.replace(/^DTSTART:\d+T\d+Z$/m, 'DTSTART:' + formatDate(new Date(startDate)))
		.replace(/^DTEND:\d+T\d+Z$/m, 'DTEND:' + formatDate(new Date(endDate)))
		// Fix escaping backslashes showing in locations/descriptions
		.replaceAll('\\,', ',');

	return createQRCode(data, { size, margin, format, color, bgColor, ecc });
}

export function createICalEventFile({
	name,
	startDate,
	endDate,
	description,
	method = 'REQUEST',
	location,
	url,
	modified = new Date(),
	uid = crypto.randomUUID(),
}) {
	if (typeof startDate === 'string' || typeof startDate === 'number') {
		return createICalEventFile({ name, startDate: new Date(startDate), endDate, description, method, location, url, modified, uid });
	} else {
		const iCal = createICalEvent({ name, startDate, endDate, description, method, location, url, modified, uid });
		return new File([iCal], `${startDate.toISOString()} ${name.replaceAll(/[^A-Za-z0-9]+/g, '-')}${ICAL_EXT}`, { type: ICAL_MIME });
	}
}
