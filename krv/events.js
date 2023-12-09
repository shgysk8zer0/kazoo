/**
 * @copyright 2023 Chris Zuber <admin@kernvalley.us>
 */
import { getJSON } from '../http.js';
import { createICalFile, METHOD } from '../iCal.js';
import { ICAL as ICAL_MIME } from '@shgysk8zer0/consts/mimes.js';

export const events = new URL('https://events.kernvalley.us/events.json');

export const getEvents = async ({ signal } = {}) => getJSON(events, { signal });

export async function getKRVEventsICalFile({
	filename = 'krv-events.ics',
	method = METHOD.PUBLISH,
	type = ICAL_MIME,
	signal,
} = {}) {
	return createICalFile(await getEvents({ signal }), { filename, method, type  });
}
