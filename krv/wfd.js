/**
 * @copyright 2023-2024 Chris Zuber <admin@kernvalley.us>
 */
import { getJSON } from '../http.js';
import { createICalFile, METHOD } from '../iCal.js';
import { ICAL as ICAL_MIME } from '@shgysk8zer0/consts/mimes.js';

export const events = new URL('https://whiskeyflatdays.com/events.json');
export const mayorEvents = new URL('https://whiskeyflatdays.com/mayors/events.json');

export const getEvents = async ({ signal } = {}) => getJSON(events, { signal });
export const getMayorEvents = async ({ signal } = {}) => getJSON(mayorEvents, { signal });

export async function getWFDEventsICalFile({
	filename = 'wfd-events.ics',
	method = METHOD.PUBLISH,
	type = ICAL_MIME,
	signal,
} = {}) {
	const events = await getEvents({ signal })
		.then(events => events.map(({ description, ...event }) => {
			if (typeof description !== 'string' || description.length === 0) {
				return event;
			} else {
				const tmp = document.createElement('div');
				tmp.setHTML(description);
				return { ...event, description: tmp };
			}
		}));

	return createICalFile(events, { filename, method, type  });
}

export async function getWFDMayorEventsICalFile({
	filename = 'wfd-mayor-events.ics',
	method = METHOD.PUBLISH,
	type = ICAL_MIME,
	signal,
} = {}) {
	const events = await getMayorEvents({ signal })
		.then(events => events.map(
			({ performer, name, ...rest }) => ({ name: `${performer.name} - ${name}`, ...rest })
		));

	return createICalFile(events, { filename, method, type });
}
