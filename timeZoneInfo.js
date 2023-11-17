import { TIMEZONES }  from '@shgysk8zer0/consts/timezones.js';

export function getTimeZoneOffset(timeZone, { date = new Date(), lang = navigator.language } = {}) {
	const formatted = new Intl.DateTimeFormat(lang, { timeZone, timeZoneName: 'longOffset' }).format(date);
	return formatted.length === 15 ? '+00:00' : formatted.substring(formatted.indexOf('GMT') + 3);
}

export function getTimeZoneInfo({ date = new Date(), lang = navigator.language } = {}) {
	return Object.groupBy(
		TIMEZONES,
		timeZone => getTimeZoneOffset(timeZone, { date,  lang }),
	);
}
