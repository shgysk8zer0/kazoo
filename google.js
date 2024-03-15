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

export function getGoogleMapsURL({ latitude, longitude }) {
	return new URL(`https://google.com/maps/place/${latitude}/${longitude}/`);
}

export function openInGoogleMaps(coords, target = '_blank', {
	noreferrer = true,
	noopener = true,
	popup = false,
	height = NaN,
	width = NaN,
	top = NaN,
	left = NaN,
} = {}) {
	const url = getGoogleMapsURL(coords);
	const flags = Object.entries({ popup, noreferrer, noopener, height, width, top, left })
		.filter(([, v]) => v !== false && v !== null && ! Number.isNaN(v))
		.map(([k, v]) => {
			switch (typeof v) {
				case 'boolean':
					return k;

				case 'object':
					return Array.isArray(v) ? v.join(' ') : v.toString();

				default:
					return `${k}=${v}`;
			}
		}).join(',');

	open(url, target, flags);
}
