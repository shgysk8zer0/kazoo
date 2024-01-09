/**
 * @copyright 2023 Chris Zuber <admin@kernvalley.us>
 */

import { createPolicy } from '../trust.js';
import { callOnce } from '../utility.js';
import { GOOGLE_CALENDAR, GOOGLE_MAPS, YOUTUBE, YOUTUBE_NO_COOKIE } from './urls.js';

export const GOOGLE_CALENDAR_POLICY = 'goog-cal#script-url';
export const GOOGLE_MAPS_POLICY = 'goog-maps#script-url';
export const YOUTUBE_POLICY = 'youtube#script-url';

export const getGoogleCalendarPolicy = callOnce(() => createPolicy(GOOGLE_CALENDAR_POLICY, {
	createScriptURL: input => {
		if (input.startsWith(GOOGLE_CALENDAR + '?')) {
			return input;
		} else {
			throw new TypeError(`Invalid Google Calendar embed URL: "${input}".`);
		}
	}
}));

export const getGoogleMapsPolicy = callOnce(() => createPolicy(GOOGLE_MAPS_POLICY, {
	createScriptURL: input => {
		if (input.startsWith(GOOGLE_MAPS + '?')) {
			return input;
		} else {
			throw new TypeError(`Invalid Google Maps embed URL: "${input}".`);
		}
	}
}));

export const getYouTubePolicy = callOnce(() => createPolicy(YOUTUBE_POLICY, {
	createScriptURL: input => {
		if (input.startsWith(YOUTUBE) || input.startsWith(YOUTUBE_NO_COOKIE)) {
			return input;
		} else {
			throw new TypeError(`Invalid YouTube embed URL: "${input}".`);
		}
	}
}));
