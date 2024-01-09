/**
 * @copyright 2023 Chris Zuber <admin@kernvalley.us>
 */

import { createIframe } from '../elements.js';
import { isTrustPolicy } from '../trust.js';
import { GOOGLE_CALENDAR } from './urls.js';
import { createGoogleCalendarPolicy, GOOGLE_CALENDAR_POLICY } from './policies.js';

// Hate that this requires `allow-same-origin`, but it does...
const sandbox = ['allow-scripts', 'allow-same-origin', 'allow-popups', 'allow-popups-to-escape-sandbox'];
const formatDate = date => date.toISOString().replaceAll(/[^\dZT]/g, '');

export const trustPolicies = [GOOGLE_CALENDAR_POLICY];

export function createGoogleCalendarEventLink({ title, description, start, end, location }) {
	if (typeof title !== 'string') {
		throw new TypeError('Title must be a string.');
	} else if (typeof description !== 'string') {
		throw new TypeError('Description must be a string.');
	} else if (typeof start === 'string') {
		return createGoogleCalendarEventLink({
			title, description, start: new Date(start), end, location,
		});
	} else if (typeof end === 'string') {
		return createGoogleCalendarEventLink({
			title, description, start, end: new Date(end), location,
		});
	} else if (! (start instanceof Date)) {
		throw new TypeError('Start must be a Date.');
	} else if (! (end instanceof Date)) {
		throw new TypeError('End must be a Date.');
	} else {
		const url = new URL('https://calendar.google.com/calendar/render');
		url.searchParams.set('action', 'TEMPLATE');
		url.searchParams.set('text', title);
		url.searchParams.set('details', description);
		url.searchParams.set('dates', `${formatDate(start)}/${formatDate(end)}`);

		if (typeof location === 'string') {
			url.searchParams.set('location', location);
		}

		return url.toString();
	}
}

export function createGoogleCalendarURL(calendarId, {
	height = 600,
	mode = 'AGENDA',
	showTabs = false,
	showPrint = false,
	showCalendars = false,
	showTimezone = false,
	timeZone = 'America/Los_Angeles',
	policy,
} = {}) {
	const url = new URL(GOOGLE_CALENDAR);

	url.searchParams.set('ctz', timeZone);
	url.searchParams.set('src', Array.isArray(calendarId) ? calendarId.join(',') : calendarId.toString());
	url.searchParams.set('height', height);
	url.searchParams.set('mode', mode);

	if (! showCalendars)  {
		url.searchParams.set('showCalendars', '0');
	}

	if (! showTabs)  {
		url.searchParams.set('showTabs', '0');
	}

	if (! showPrint)  {
		url.searchParams.set('showPrint', '0');
	}

	if (! showTimezone)  {
		url.searchParams.set('showTz', '0');
	}

	if (isTrustPolicy(policy)) {
		return policy.createScriptURL(url.href);
	} else {
		return url.href;
	}
}

export function createGoogleCalendar(calendarId, {
	width = 800,
	height = 600,
	frameBorder = 0,
	loading = 'lazy',
	fetchPriority = 'auto',
	referrerPolicy = 'no-referrer',
	mode = 'AGENDA',
	showTabs = false,
	showPrint = false,
	showCalendars = false,
	showTimezone = false,
	credentialless = false,
	timeZone = 'America/Los_Angeles',
	title = 'Google Calendar Embed',
	part = [],
	classList = [],
	id,
	slot,
	dataset,
	styles,
	animation,
	policy = createGoogleCalendarPolicy(),
	events: { capture, passive, once, signal, ...events } = {},
	...attrs
} = {}) {
	const url = createGoogleCalendarURL(calendarId, {
		height, mode, timeZone, showTabs, showCalendars, showTimezone,
		showPrint, policy,
	});

	return createIframe(url, {
		width, height, sandbox, part, slot, loading, animation, dataset, frameBorder,
		classList, id, title, credentialless, styles, fetchPriority, referrerPolicy,
		events: { capture, passive, once, signal, ...events }, ...attrs,
	});
}
