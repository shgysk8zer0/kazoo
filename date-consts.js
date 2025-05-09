/**
 * @copyright 2023 Chris Zuber <admin@kernvalley.us>
 */

export const ISO_8601_DURATION_PATTERN = /^P(?:(?<years>\d+)Y)?(?:(?<months>\d+(\.\d+)?)M)?(?:(?<weeks>\d+(\.\d+)?)W)?(?:(?<days>\d+(\.\d+)?)D)?(?:T(?:(?<hours>\d+(\.\d+)?)H)?(?:(?<minutes>\d+(\.\d+)?)M)?(?:(?<seconds>\d+(\.\d+)?)S)?)?$/;

export const SECONDS = 1000;

export const MINUTES = 60 * SECONDS;

export const HOURS   = 60 * MINUTES;

export const DAYS    = 24 * HOURS;

export const WEEKS   = 7 * DAYS;

export const YEARS   = 365 * DAYS;

export const days = [{
	name: 'Sunday',
	short: 'Sun',
}, {
	name: 'Monday',
	short: 'Mon',
}, {
	name: 'Tuesday',
	short: 'Tue',
}, {
	name: 'Wednesday',
	short: 'Wed',
}, {
	name: 'Thursday',
	short: 'Thu',
}, {
	name: 'Friday',
	short: 'Fri',
}, {
	name: 'Saturday',
	short: 'Sat',
}];

export const months = [{
	name: 'January',
	short: 'Jan',
}, {
	name: 'February',
	short: 'Feb',
}, {
	name: 'March',
	short: 'Mar',
}, {
	name: 'April',
	short: 'April',
}, {
	name: 'May',
	short: 'May',
}, {
	name: 'June',
	short: 'June',
}, {
	name: 'July',
	short: 'July',
}, {
	name: 'August',
	short: 'Aug',
}, {
	name: 'September',
	short: 'Sep',
}, {
	name: 'October',
	short: 'Oct',
}, {
	name: 'November',
	short: 'Nov',
}, {
	name: 'December',
	short: 'Dec',
}];
