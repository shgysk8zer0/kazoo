/**
 * @copyright 2023 Chris Zuber <admin@kernvalley.us>
 */
import { getJSON } from '../http.js';

export const events = new URL('https://events.kernvalley.us/events.json');

export const getEvents = async ({ signal } = {}) => getJSON(events, { signal });
