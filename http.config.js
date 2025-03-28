import { useCSP } from '@shgysk8zer0/http-server/csp.js';
import { checkCacheItem, setCacheItem } from '@shgysk8zer0/http-server/cache.js';
import { useCompression } from '@shgysk8zer0/http-server/compression.js';

export default {
	pathname: '/test/',
	open: true,
	routes: {
		'/api/:endpoint(*)': '@shgysk8zer0/http-server-echo',
	},
	requestPreprocessors: [checkCacheItem],
	responsePostprocessors: [
		setCacheItem,
		useCompression('deflate'),
		useCSP({
			'default-src': ['\'self\''],
			'base-uri': ['\'self\''],
			'manifest-src': ['\'self\''],
			'prefetch-src': ['\'self\''],
			'script-src': ['\'self\'', 'https://unpkg.com', '\'nonce-3b58877b-25c3-4af2-975f-76607bd7c78e\'', 'blob:'],
			'style-src': ['\'self\'', 'https://unpkg.com', 'blob:'],
			'font-src': ['https://cdn.kernvalley.us/fonts/'],
			'form-action': ['\'none\''],
			'frame-src': ['data:', 'https://www.youtube-nocookie.com/embed/', 'https://calendar.google.com/calendar/embed', 'https://www.google.com/maps/embed', 'https://whiskeyflatdays.com/embed/', 'https://events.kernvalley.us/embed/', 'https://whiskeyflatdays.com/mayors/embed/'],
			'object-src': ['\'none\''],
			'media-src': ['\'none\''],
			'child-src': ['\'self\''],
			'worker-src': ['\'self\''],
			'frame-ancestors': ['\'none\''],
			'connect-src': ['\'self\'', 'https://unpkg.com/', 'https://api.github.com/users/', 'https://api.github.com/repos/', 'https://api.pwnedpasswords.com/range/', 'https://maps.kernvalley.us/places/', 'https://events.kernvalley.us/events.json', 'https://events.kernvalley.us/cal/krv-events.ics', 'https://whiskeyflatdays.com/events.json', 'https://whiskeyflatdays.com/mayors/events.json'],
			'img-src': ['\'self\'', 'https://avatars.githubusercontent.com/', 'data:', 'blob:'],
			'require-reusted-types-for': ['\'script\''],
			'trusted-types': ['default', 'aegis-sanitizer#html', 'youtube#script-url', 'github-user#html', 'github-repo#html', 'blob#script-url', 'goog-cal#script-url', 'goog-maps#script-url', 'krv#embed'],
		}),
	]
};
