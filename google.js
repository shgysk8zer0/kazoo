const formatDate = date => date.toISOString().replaceAll(/[^\dZT]/g, '');

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
