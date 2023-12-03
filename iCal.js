import { ICAL as ICAL_MIME } from '@shgysk8zer0/consts/mimes.js';
import { ICAL as ICAL_EXT } from '@shgysk8zer0/consts/exts.js';
import { createQRCode } from './qr.js';

export const VERSION = '1.0.0';

export const METHOD = {
	REQUEST: 'REQUEST',
	REPLAY: 'REPLY',
	PUBLISH: 'PUBLISH',
	ADD: 'ADD',
	CANCEL: 'CANCEL',
	REFRESH: 'REFRESH',
	DECLINECOUNTER: 'DECLINECOUNTER',
};

export const STATUS = {
	TENTATIVE: 'TENTATIVE',
	CONFIRMED: 'CONFIRMED',
	CANCELLED: 'CANCELLED',
};

export const TRANSPARENCY = {
	OPAQUE: 'OPAQUE',
	TRANSPARENT: 'TRANSPARENT',
};

export const CLASSIFICATION = {
	PUBLIC: 'PUBLIC',
	PRIVATE: 'PRIVATE',
	CONFIDENTIAL: 'CONFIDENTIAL',
};

export const ATTENDEE_STATUS = {
	NEEDS_ACTION: 'NEEDS-ACTION',
	ACCEPTED: 'ACCEPTED',
	DECLINED: 'DECLINED',
	TENTATIVE: 'TENTATIVE',
	DELEGATED: 'DELEGATED',
	COMPLETED: 'COMPLETED',
	IN_PROCESS: 'IN-PROCESS',
};

export const USER_TYPE = {
	INDIVIDUAL: 'INDIVIDUAL',
	GROUP: 'GROUP',
	RESOURCE: 'RESOURCE',
	ROOM: 'ROOM',
	UNKOWN: 'UNKNOWN',
};

export const ROLE = {
	CHAIR: 'CHAIR',
	REQ_PARTICIPANT: 'REQ-PARTICIPANT',
	OPT_PARTICIPANT: 'OPT-PARTICIPANT',
	NON_PARTICIPANT: 'NON-PARTICIPANT',
};

const ESCAPE_CHARS = {
	'\\': '\\\\',
	'\n': '\\n',
	'\r': '\\r',
	';': '\\;',
	'"': '\\"',
	// ',':'\\,',
};

const CRLF = '\r\n';
const ICAL_VERSION = '2.0';
const BEGIN_CALENDAR = 'BEGIN:VCALENDAR';
const END_CALENDAR = 'END:VCALENDAR';
const BEGIN_EVENT = 'BEGIN:VEVENT';
const END_EVENT = 'END:VEVENT';

const escape = str => str.toString().trim().replaceAll(
	new RegExp(`[${Object.keys(ESCAPE_CHARS).join('')}]`, 'g'),
	char => ESCAPE_CHARS[char]
);

function* lineGenerator(str) {
	if (str.length < 76) {
		yield str;
	} else {
		yield str.substring(0, 75);
		for (let i = 75; i < str.length; i +=74) {
			yield ' ' + str.substring(i, i + 74);
		}
	}
}

const fold = line => [...lineGenerator(line)].join(CRLF);

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

function addressObjectToString({
	name,
	streetAddress,
	addressLocality,
	addressRegion,
	postalCode,
	addressCountry = 'USA',
	address,
}) {
	if (typeof address === 'object' && address !== null) {
		return addressObjectToString(address);
	} else if (typeof addressLocality !== 'string' || typeof addressRegion !== 'string') {
		throw new TypeError('`addressLocality` and `addressRegion` must be strings.');
	} else {
		return [name, streetAddress, addressLocality, [addressRegion, postalCode].join(' ').trim(), addressCountry]
			.filter(comp => (typeof comp === 'string' && comp.length !== 0) || typeof comp === 'number' && !Number.isNaN(comp))
			.join(', ');
	}
}

function getOrganizer({ name, email } = {}) {
	let str = typeof name === 'undefined' ? 'ORGANIZER:' : `ORGANIZER;CN=${escape(name)}:`;

	if (typeof email !== 'undefined') {
		return `${str}mailto:${escape(email)}`;
	} else {
		return str;
	}
}

function getAttendee({
	name,
	email,
	type = USER_TYPE.INDIVIDUAL,
	role = ROLE.REQ_PARTICIPANT,
	status = ATTENDEE_STATUS.NEEDS_ACTION,
	rsvp = true,
	numGuests = 0,
}) {
	if (typeof email !== 'string' || email.length === 0) {
		throw new TypeError('Email must be a non-empty string.');
	} else if (! Number.isSafeInteger(numGuests) || numGuests < 0) {
		throw new TypeError('Num Guests must be a positive integer.');
	} else {
		return `ATTENDEE;CUTYPE=${escape(type.toUpperCase())};ROLE=${escape(role.toUpperCase())};PARTSTAT=${escape(status.toUpperCase())};RSVP=${rsvp ? 'TRUE' : 'FALSE'};CN=${escape(name || email)};X-NUM-GUESTS=${numGuests}:mailto:${escape(email)}`;
	}
}

function formatLines(lines) {
	return lines.filter(line => typeof line === 'string' && line.length !== 0)
		.map(line => fold(line))
		.join(CRLF);
}

function createEvent({
	status = STATUS.CONFIRMED,
	transparency = TRANSPARENCY.OPAQUE,
	classification = CLASSIFICATION.PUBLIC,
	'@id': uid = crypto.randomUUID(),
	sequence = 0,
	name,
	description,
	startDate,
	endDate,
	location,
	url,
	organizer,
	attendees = [],
	modified = new Date(),
}) {
	if (typeof name !== 'string' || name.length === 0) {
		throw new TypeError('Event name must be a non-empty string.');
	} else if (typeof startDate === 'string' || typeof startDate === 'number') {
		return createEvent({
			status, transparency, classification, '@id': uid, sequence,
			name, startDate: new Date(startDate), endDate, description, location,
			url, organizer, attendees, modified,
		});
	} else if (! (startDate instanceof Date)) {
		throw new TypeError('startDate must be a Date object');
	} else if (typeof endDate === 'string' || typeof endDate === 'number') {
		return createEvent({
			status, transparency, classification, '@id': uid, sequence,
			name, startDate, endDate: new Date(endDate), description, location,
			url, organizer, attendees, modified,
		});
	} else if (typeof modified === 'string' || typeof modified === 'number') {
		return createEvent({
			status, transparency, classification, '@id': uid, sequence,
			name, startDate, endDate, description, location,
			url, organizer, attendees, modified: new Date(modified),
		});
	} else if (! (modified instanceof Date)){
		throw new TypeError('Modified must be a date.');
	} else {
		const lines = [
			BEGIN_EVENT,
			`UID:${escape(uid)}`,
			typeof sequence === 'number' && ! Number.isNaN(sequence)
				? `SEQUENCE:${Math.min(0, sequence)}` : undefined,
			typeof status === 'string' ? `STATUS:${escape(status)}` : undefined,
			typeof transparency === 'string' ? `TRANSP:${escape(transparency)}` : undefined,
			typeof classification === 'string' ? `CLASS:${escape(classification)}` : undefined,
			`SUMMARY:${escape(name.trim())}`,
			`LOCATION:${typeof location === 'object' ? escape(addressObjectToString(location)) : escape(location.trim())}`,
			`DTSTAMP:${formatUTCDate(modified)}`,
			`DTSTART:${formatUTCDate(startDate)}`,
		];

		if (endDate instanceof Date) {
			lines.push(`DTEND:${formatUTCDate(endDate)}`);
		}

		if (typeof description === 'string' && description.length !== 0) {
			lines.push(`DESCRIPTION:${escape(description.trim())}`);
		}

		if (typeof organizer === 'object' && organizer !== null) {
			lines.push(getOrganizer(organizer));
		}

		if (Array.isArray(attendees) && attendees.length !== 0) {
			attendees.forEach(attendee => {
				if (typeof attendee === 'object') {
					lines.push(getAttendee(attendee));
				} else if (typeof attendee === 'string') {
					lines.push({ email: attendee });
				} else {
					throw new TypeError(`Invalid attendee type: ${typeof attendee}.`);
				}
			});
		}

		if ((typeof url === 'string' && url.length !== 0) || url instanceof URL) {
			lines.push(`URL:${escape(url)}`);
		}

		lines.push(END_EVENT);

		return lines;
	}
}

export function createICalendar(events, { method = METHOD.PUBLISH } = {}) {
	if (! Array.isArray(events) || events.length === 0) {
		throw new TypeError('Events must be a non-empty array of events.');
	} else {
		return formatLines([
			BEGIN_CALENDAR,
			`VERSION:${ICAL_VERSION}`,
			`METHOD:${method}`,
			`PRODID:-//github.com/shgysk8zer0/kazoo v${VERSION}//EN`,
			...events.flatMap(event => createEvent(event)),
			END_CALENDAR
		]);
	}
}

/**
 * Creates an iCalendar event string.
 *
 * @param {Object} options - Options for creating the iCalendar event.
 * @param {string} options.method - The method for the iCalendar event (e.g., REQUEST, PUBLISH).
 * @param {string} options.status - The status of the event (e.g., CONFIRMED, TENTATIVE).
 * @param {string} options.transparency - The transparency of the event (e.g., OPAQUE, TRANSPARENT).
 * @param {string} options.classification - The classification of the event (e.g., PUBLIC, PRIVATE).
 * @param {string} options['@id'] - The unique identifier for the event.
 * @param {number} options.sequence - The sequence number for the event.
 * @param {string} options.name - The name or summary of the event.
 * @param {Date|string|number} options.startDate - The start date and time of the event.
 * @param {Date|string|number} options.endDate - The end date and time of the event.
 * @param {string} options.description - The description of the event.
 * @param {string|object} options.location - The location of the event.
 * @param {string|URL} options.url - The URL associated with the event.
 * @param {Object} options.organizer - The organizer of the event.
 * @param {Array} options.attendees - An array of attendees for the event.
 * @param {Date|string|number} options.modified - The last modified date of the event.
 * @returns {string} - The iCalendar event string.
 */
export function createICalEvent({
	method = METHOD.REQUEST,
	status = STATUS.CONFIRMED,
	transparency = TRANSPARENCY.OPAQUE,
	classification = CLASSIFICATION.PUBLIC,
	'@id': uid = crypto.randomUUID(),
	sequence = 0,
	name,
	description,
	startDate,
	endDate,
	location,
	url,
	organizer,
	attendees = [],
	modified = new Date(),
}) {
	return createICalendar([{
		method , status, transparency, classification, '@id': uid, sequence, name,
		description, startDate, endDate, location, url, organizer, attendees, modified,
	}], { method });
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

export function createICalEventFile({
	method = METHOD.REQUEST,
	status = STATUS.CONFIRMED,
	transparency = TRANSPARENCY.OPAQUE,
	classification = CLASSIFICATION.PUBLIC,
	'@id': uid = crypto.randomUUID(),
	sequence = 0,
	name,
	startDate,
	endDate,
	description,
	location,
	url,
	modified = new Date(),
	organizer,
	attendees,
	filename,
}) {
	if (typeof startDate === 'string' || typeof startDate === 'number') {
		return createICalEventFile({
			method, status, transparency, classification, '@id': uid, sequence,
			name, startDate: new Date(startDate), endDate, description, location,
			url, organizer, attendees, modified, filename,
		});
	} else if (typeof filename !== 'string' || filename.length === 0) {
		return createICalEventFile({
			method, status, transparency, classification, '@id': uid, sequence,
			name, startDate: new Date(startDate), endDate, description, location,
			url, organizer, attendees, modified, filename: `${startDate.toISOString()} ${name.replaceAll(/[^A-Za-z0-9]+/g, '-')}${ICAL_EXT}`,
		});
	} else if (! filename.endsWith(ICAL_EXT)) {
		return createICalEventFile({
			method, status, transparency, classification, '@id': uid, sequence,
			name, startDate: startDate, endDate, description, location,
			url, organizer, attendees, modified, filename: `${filename}${ICAL_EXT}`,
		});
	} else {
		const iCal = createICalEvent({
			method, status, transparency, classification, '@id': uid, sequence,
			name, startDate, endDate, description, location, url, organizer,
			attendees, modified,
		});

		return new File([iCal], filename, { type: ICAL_MIME });
	}
}
