import { ICAL as ICAL_MIME } from '@shgysk8zer0/consts/mimes.js';
import { ICAL as ICAL_EXT } from '@shgysk8zer0/consts/exts.js';
import { separateString } from './utility.js';

export const VERSION = '1.0.0';

export const METHOD = {
	'REQUEST': 'REQUEST',
	'REPLAY': 'REPLY',
	'PUBLISH': 'PUBLISH',
	'ADD': 'ADD',
	'CANCEL': 'CANCEL',
	'REFRESH': 'REFRESH',
	'DECLINECOUNTER': 'DECLINECOUNTER',
};

export const STATUS = {
	'TENTATIVE': 'TENTATIVE',
	'CONFIRMED': 'CONFIRMED',
	'CANCELLED': 'CANCELLED',
};

export const EVENT_STATUS_TYPE = {
	'CANCELLED': 'EventCancelled',
	'MOVED_ONLINE': 'EventMovedOnline',
	'POSTPONED': 'EventPostponed',
	'RESCHEDULED': 'EventRescheduled',
	'SCHEDULED': 'EventScheduled',
};

export const TRANSPARENCY = {
	'OPAQUE': 'OPAQUE',
	'TRANSPARENT': 'TRANSPARENT',
};

export const CLASSIFICATION = {
	'PUBLIC': 'PUBLIC',
	'PRIVATE': 'PRIVATE',
	'CONFIDENTIAL': 'CONFIDENTIAL',
};

export const ATTENDEE_STATUS = {
	'NEEDS_ACTION': 'NEEDS-ACTION',
	'ACCEPTED': 'ACCEPTED',
	'DECLINED': 'DECLINED',
	'TENTATIVE': 'TENTATIVE',
	'DELEGATED': 'DELEGATED',
	'COMPLETED': 'COMPLETED',
	'IN_PROCESS': 'IN-PROCESS',
};

export const USER_TYPE = {
	'INDIVIDUAL': 'INDIVIDUAL',
	'GROUP': 'GROUP',
	'RESOURCE': 'RESOURCE',
	'ROOM': 'ROOM',
	'UNKOWN': 'UNKNOWN',
};

export const ROLE = {
	'CHAIR': 'CHAIR',
	'REQ_PARTICIPANT': 'REQ-PARTICIPANT',
	'OPT_PARTICIPANT': 'OPT-PARTICIPANT',
	'NON_PARTICIPANT': 'NON-PARTICIPANT',
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
const CR = '\r';
const LF = '\n';
const ICAL_VERSION = '2.0';
const BEGIN_CALENDAR = 'BEGIN:VCALENDAR';
const END_CALENDAR = 'END:VCALENDAR';
const BEGIN_EVENT = 'BEGIN:VEVENT';
const END_EVENT = 'END:VEVENT';
const ESCAPE_REGEXP = new RegExp(`[${Object.keys(ESCAPE_CHARS).join('')}]`, 'g');

const escape = str => str.toString().trim().replaceAll(ESCAPE_REGEXP, char => ESCAPE_CHARS[char]);

const parseDate = date => typeof date === 'string' ?
	new Date(date.replace(/(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})/, '$1-$2-$3T$4:$5:$6')).toISOString()
	: null;

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

export function formatUTCDate(date) {
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

export function formatDate(date) {
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

function isStatusType(str) {
	return Object.values(EVENT_STATUS_TYPE).includes(str);
}

function isStatus(str) {
	return Object.values(STATUS).includes(str);
}

function statusTypeToStatus(eventStatusType) {
	switch (eventStatusType) {
		case EVENT_STATUS_TYPE.SCHEDULED:
		case EVENT_STATUS_TYPE.MOVED_ONLINE:
			return STATUS.CONFIRMED;

		case EVENT_STATUS_TYPE.CANCELLED:
		case EVENT_STATUS_TYPE.POSTPONED:
			return STATUS.CANCELLED;
	}
}

function statusToStatusType(status) {
	switch (status) {
		case STATUS.CONFIRMED:
			return EVENT_STATUS_TYPE.SCHEDULED;

		case STATUS.CANCELLED:
			return EVENT_STATUS_TYPE.CANCELLED;

		case STATUS.TENTATIVE:
			return EVENT_STATUS_TYPE.SCHEDULED;
	}
}

function getStatus(str) {
	if (str in STATUS) {
		return STATUS[str];
	} else if (str in EVENT_STATUS_TYPE) {
		return statusTypeToStatus(EVENT_STATUS_TYPE[str]);
	} else if (isStatus(str)) {
		return str;
	} else {
		return STATUS.CONFIRMED;
	}
}

function getStatusType(str) {
	if (str in STATUS) {
		return statusToStatusType(STATUS[str]);
	} else if (str in EVENT_STATUS_TYPE) {
		return EVENT_STATUS_TYPE[str];
	} else if (isStatusType(str)) {
		return str;
	} else {
		return EVENT_STATUS_TYPE.SCHEDULED;
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

function getDescription(description, { isHTML = false, fallback } = {}) {
	if (typeof description === 'string' && description.length !== 0) {
		return isHTML
			? `DESCRIPTION;ALTREP="data:text/html,${escape(encodeURIComponent(description))}":${escape(fallback ?? description)}`
			: `DESCRIPTION:${escape(description)}`;
	} else if (description instanceof HTMLTemplateElement) {
		return getDescription(description.content);
	} else if (description instanceof HTMLElement) {
		return getDescription(description.outerHTML, { isHTML: true, fallback: description.textContent });
	} else if (description instanceof DocumentFragment) {
		const el = document.createElement('div');
		el.append(description);
		return getDescription(el.innerHTML, { isHTML: true, fallback: el.textContent });
	}
}
export function formatLines(lines) {
	return lines.filter(line => typeof line === 'string' && line.length !== 0)
		.map(line => fold(line))
		.join(CRLF);
}

/**
 * Creates an iCalendar event string.
 *
 * @param {Object} options - Options for creating the iCalendar event.
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
 * @param {Date|string|number} options.created - The creation date of the event.
 * @param {Date|string|number} options.lastModified - The last modified date of the event.
 * @returns {string} - The iCalendar event string.
 */
export function createEvent({
	status = EVENT_STATUS_TYPE.SCHEDULED,
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
	created,
	lastModified = new Date(),
}) {
	if (typeof name !== 'string' || name.length === 0) {
		throw new TypeError('Event name must be a non-empty string.');
	} else if (typeof startDate === 'string' || typeof startDate === 'number') {
		return createEvent({
			status, transparency, classification, '@id': uid, sequence,
			name, startDate: new Date(startDate), endDate, description, location,
			url, organizer, attendees, created, lastModified,
		});
	} else if (! (startDate instanceof Date)) {
		throw new TypeError('startDate must be a Date object');
	} else if (typeof endDate === 'string' || typeof endDate === 'number') {
		return createEvent({
			status, transparency, classification, '@id': uid, sequence,
			name, startDate, endDate: new Date(endDate), description, location,
			url, organizer, attendees, created, lastModified,
		});
	} else if (endDate instanceof Date && ! (endDate.getTime() > startDate.getTime())) {
		throw new Error('End Date must be after Start Date.');
	} else if (typeof lastModified === 'string' || typeof lastModified === 'number') {
		return createEvent({
			status, transparency, classification, '@id': uid, sequence,
			name, startDate, endDate, description, location,
			url, organizer, attendees, created, lastModified: new Date(lastModified),
		});
	} else if (! (lastModified instanceof Date)){
		throw new TypeError('Last Modified must be a date.');
	} else if (typeof created === 'string' || typeof created === 'number') {
		return createEvent({
			status, transparency, classification, '@id': uid, sequence,
			name, startDate, endDate, description, location,
			url, organizer, attendees, created: new Date(created), lastModified,
		});
	} else {
		const lines = [
			BEGIN_EVENT,
			`UID:${escape(uid)}`,
			typeof sequence === 'number' && ! Number.isNaN(sequence)
				? `SEQUENCE:${Math.min(0, sequence)}` : undefined,
			typeof status === 'string' ? `STATUS:${getStatus(escape(status))}` : undefined,
			typeof transparency === 'string' ? `TRANSP:${escape(transparency)}` : undefined,
			typeof classification === 'string' ? `CLASS:${escape(classification)}` : undefined,
			`SUMMARY:${escape(name.trim())}`,
			`LOCATION:${typeof location === 'object' ? escape(addressObjectToString(location)) : escape(location.trim())}`,
			getDescription(description),
			`DTSTAMP:${formatUTCDate(lastModified)}`,
			`LAST-MODIFIED:${formatUTCDate(lastModified)}`,
			created instanceof Date ? `CREATED:${formatUTCDate(created)}` : undefined,
			`DTSTART:${formatUTCDate(startDate)}`,
		];

		if (endDate instanceof Date) {
			lines.push(`DTEND:${formatUTCDate(endDate)}`);
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

export function createICalEvent({
	method = METHOD.REQUEST,
	...event
}) {
	return createICalendar([event], { method });
}

export function createICalFile(events, {
	filename = 'events.ics',
	method = METHOD.PUBLISH,
	type = ICAL_MIME,
} = {}) {
	if (typeof filename !== 'string' || filename.length === 0) {
		throw new TypeError('Filename must be a non-empty string.');
	} else if (! Array.isArray(events) || events.length === 0) {
		throw new TypeError('Events must be a non-empty array of event objects.');
	} else if (typeof method !== 'string' || method.length === 0) {
		throw new TypeError('Method must be a non-empty string.');
	} else if (! filename.endsWith(ICAL_EXT)) {
		return createICalFile(events, { filename: `filename${ICAL_EXT}`, method, type });
	} else {
		const iCal = createICalendar(events, { method });
		return new File([iCal], filename, { type });
	}
}

export function createICalEventFile({
	filename,
	method = METHOD.PUBLISH,
	type = ICAL_MIME,
	startDate,
	...event
}) {
	if (typeof startDate === 'string' || typeof startDate === 'number') {
		return createICalEventFile({ filename, method, type, startDate: new Date(startDate), ...event });
	} else if (typeof filename !== 'string' || filename.length === 0) {
		return createICalEventFile({ filename: `${startDate.toISOString()} ${name.replaceAll(/[^A-Za-z0-9]+/g, '-')}${ICAL_EXT}`, method, type, startDate, ...event,});
	} else if (! filename.endsWith(ICAL_EXT)) {
		return createICalEventFile({ filename: `${filename}${ICAL_EXT}`, method, type, startDate, ...event });
	} else {
		return createICalFile([{ startDate, ...event }], { filename, method, type });
	}
}

export function parseICSEvent(str, { context = 'https://schema.org', type = 'Event' } = {}) {
	try {
		const entries = str.replaceAll(CR, '').replaceAll(LF + ' ', '')
			.split(LF)
			.map(line => {
				const [field, value] = separateString(line, ':');

				if (field.includes(';')) {
					const [fieldName, ...props] = field.split(';');
					const values = Object.fromEntries(props.map(prop => separateString(prop, '=')));

					switch (fieldName) {
						case 'DTSTART':
						case 'DTEND':
						case 'DTSTAMP':
						case 'CREATED':
						case 'LAST-MODIFIED':
							return [fieldName, value];

						case 'ORGANIZER':
							return [
								fieldName, {
									'@type': 'Organization',
									email: value.toString().replace('mailto:', ''),
									name: values.CN,
								}
							];

						case 'ATTENDEE':
							return [
								fieldName, {
									'@type': typeof values.CUTYPE === 'string' &&  values.CUTYPE === 'GROUP'
										? 'Organization'
										: 'Person',
									email: value.toString().replace('mailto:', ''),
									name: values.CN,
								}
							];

						default:
							return [fieldName, {...values, value }];
					}
				} else {
					return [field, value];
				}
			});

		const fields = Object.fromEntries(entries.filter(([k, v]) => k.length !==0 && !(typeof v === 'string' && v.length === 0)));
		const { SUMMARY, DESCRIPTION, LOCATION, DTSTART, DTEND, UID, STATUS, URL, ORGANIZER, ...rest } = fields;
		return {
			'@context': context,
			'@type': type,
			'@id': UID,
			name: SUMMARY,
			eventStatus: getStatusType(STATUS),
			description: DESCRIPTION,
			url: URL,
			location: typeof LOCATION === 'string' && LOCATION.length !== 0 ? {
				'@type': 'Place',
				address: LOCATION,
			} : undefined,
			organizer: ORGANIZER,
			// `Object.fromEntries()` will remove duplicate `ATTENDEE` fields
			attendee: entries.reduce((list, [name, val]) => {
				if (name === 'ATTENDEE') {
					list.push(val);
				}

				return list;
			}, []),
			startDate: parseDate(DTSTART),
			endDate: parseDate(DTEND),
			rest,
		};
	} catch(err) {
		console.error(err);
	}
}

export function parseICS(str) {
	const [, ...events] = str.split(BEGIN_EVENT)
		.filter(event => typeof event === 'string')
		.map(parseICSEvent)
		.filter(event => typeof event !== 'undefined');
	return events;
}

export async function parseICSFile(file) {
	if (! (file instanceof File)) {
		throw new TypeError('Not a file.');
	} else if (! (file.name.endsWith(ICAL_EXT) || file.type === ICAL_MIME)) {
		throw new TypeError(`${file.name} is not an iCal file.`);
	} else {
		return parseICS(await file.text());
	}
}
