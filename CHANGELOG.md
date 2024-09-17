# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [v1.0.8] - 2024-09-17

### Added
- Add `exports` to package
- Add `.test.js` / `node --test` testing

### Changed
- Update hashing output to use `Uint8Array.prototype.(toHex|toBase64)`
- Update `md5()` to use `ArrayBuffer`-based techniquess and be consistent with `crypto.subtle.digest`
- The `hash()` function now supports a wider variety if inputs/data

## [v1.0.7] - 2024-07-16

### Added
- Base64 module for eg retrieving a `Blob` from a base64 encoded data URI
- Add support for saving files from `Blob` objects in `filesystem.js`

### Fixed
- Fix treating `blob:` & `data:` and `file:` URLs as "bare specifiers"

### Changed
- Update `@shgysk8zer0/polyfills`
- Update handling of creating data URIs in `filesystem.js`

## [v1.0.6]  - 2024-06-23

### Added
- Add function to get Google Maps link from `schema.org/PostalAddress` JSON-LD data

## [v1.0.5] - 2024-04-25

### Added
- Add support for `tags` in `createKRVEvents()`

### Changed
- Update params set by `createKRVEvents()` to be full names

## [v1.0.4] - 2024-04-11

### Added
- Add basic key/value cache
- Add `renderComponentShadow` function to `custom-elements.js` module

## [v1.0.3] - 2024-04-05

### Added
- Add functions to list & add languages for syntax highlighting in markdown

### Fixed
- Fix no default (`'plaintext'`) language for syntax highlighting in markdown

## [v1.0.2] - 2024-04-05

### Added
- Add `defineComponent` & `registerAllowedCustomElement` to allow tags in Aegis Sanitizer Config

## [v1.0.1] - 2024-04-03

### Fixed
- Do not check if `trustedTypes instanceof EventTarget` when checking for support

## [v1.0.0] - 2024-04-02

### Changed
- Updated to more recent polyfills for Sanitizer API & Trusted Types API
- Massive breaking changes in multiple places

## [v0.3.4] - 2024-03-15

### Added
- Add `keys()` & `entries()` to `KeyValueStore`

## [v0.3.3] - 2024-03-15

### Added
- Add `KeyValueStore` wrapper class over `IndexDB`

## [v0.3.2] - 2024-01-22

### Added
- `createWFDMayorEvents()` to embed `https://whsikeyflatdays.com/mayors/embed/`
- `getWFDMayorEventsICalFile()` to create iCalendar files from WF Mayor Candidate Events
- `resize()` as a wrapper around `ResizeObserver`

### Changed
- Update/improve `toSpinalCase()` & `toCamelCase()`
- Allow WF Mayor Events embed URL in `krv#embed` policy
- Update CSP and TrustedTypes Policies & importmap

## [v0.3.1]  2024-01-12

### Fixed
- Fix name of Google Calendar Policy function on import & usage

## [v0.3.0] - 2024-01-08

### Added
- Lazy DOM operations using `Iterator.from(document.createNodeIterator()))`
- Iterator helper module
- Wider variety of RNG in math module (8, 16, 32, & 64-bit - signed & unsigned)
- Support for `BigInt` in math module
- Google Calendar & Maps `TrustedTypePolicy`
- Embed/`<iframe>` for Google Calendar
- Add `immutable.js`, with `deepFreeze()` & Record/Tuple via `getImmutable()`

### Changed
- Improve various functions in `math.js`
- Add support for `BigInt`s in `factorial()` & `choose()` in math module
- Factorial can now work with numbers > 18
- Update ESLint rules

## [v0.2.10] - 2023-12-09

### Added
- Add HTML iCal description support
- Add iCal support for multiple events
- Add functions to get WFD & KRV events as iCal files

### Changed
- Move `createICalEventQR()` to `qr.js` (for compatibility with server environments)

## [v0.2.9] - 2023-12-3

### Added
- Various iCal consts, effectively enums
- ICal support for attendees and organizer

### Changed
- Numerous updates to iCal generating (beyond additions)
- Begin using `Promise.withResolvers()`

## [v0.2.8] - 2023-11-26

### Added
- Create async generator helper module with `getGeneratorWithResolvers`
- Add basic implementations of `Stack` and `Queue`

### Changed
- Add Organizer and Sequence support for iCal events
- Update signal logic in `when()`

## [v0.2.7] - 2023-11-20

### Added
- `blob#script-url` & `data#script-url` trust policies

### Fixed
- Append links to document when saving files for supposedly better compatibility

### Deprecated
- Deprecate `open()` and `save()` from `filesystem.js` (use `openFile()` & `saveFile()`)

## [v0.2.6] - 2023-11-17

### Added
- Add `qr.js` module using `https://api.qrserver.com/`
- Add `iCal.js` module to create iCalendar files & QR codes
- Add `timeZoneInfo.js` module for getting time zone info/offsets

### Changed
- Update to use `@shgysk8zer0/consts`

### Deprecated
- Mark own version of constants (`namespaces.js`, `states.js`, & `types.js`) as deprecated

## [v0.2.5] - 2023-10-31

### Fixed
- Spotify embed module now supports `credentialless` in all functions

## [v0.2.4] - 2023-10-31

### Added
- Add utility function for Simple UIDs
- Add support for `credentialless` iframes [#44](https://github.com/shgysk8zer0/kazoo/issues/44)

## [v0.2.3] - 2023-07-19

### Added
- Add module with Google Calendar Link Generator

## [v0.2.2] - 2023-07-09

### Added
- Add funding

## [v0.2.1] - 2023-07-07

### Added
- Add `imgur` module with method to upload to Imgur

### Fixed
- Fix range when testing primes

## [v0.2.0] - 2023-007-03

### Changed
- Update to node 20
- Update GH Action for npm publish
- Update npm scripts for versioning and locks

## [v0.1.1] - 2023-07-01

### Changed
- Allow `"text/plain"` for `markdown` module

## [v0.1.0] - 2023-07-01

### Added
- Add `markdown` module
- Add `()` to `trust-policies` module (checks for unsafe elements & attributes)
- Add `getCSSStyleSheet()` to `http` module
- Add Markdown to `types` module
- Add `gravatar` module

### Changed
- Rename `loadStylesheet()` -> `loadStyleSheet()` in `loader` module (with alias to old)
- Update importmap and trusted policies

### Deprecated
- `loadStylesheet()` is deprecated

## [v0.0.17] - 2023-06-23

### Added
- Add `@shgysk8zer0/js-utils`

### Removed
- Uninstall `eslint`

### Fixed
- Update GitHub Release Action with correct permissions

### Changed
- All sanitizer-related functions now accept config as well as sanitizer dict
- Switch to using `el.setHTML()` & `Document.parseHTML()`

### Deprecated
- Sanitizer is deprecated and has been effectively removed from the spec

## [v0.0.16] - 2023-05-28

### Fixed
- `<svg>` child elements no longer have default `role` attribute
- Package no longer has a `main`

## [v0.0.15] - 2023-05-28

### Added
- Add Trust Policy for creating JSON `<script>`s
- Add `strip#html`, `escape#html`, and `json#script` trust policies
- `createCalendarIcon()` & `createClockIcon()` in `icons.js` module

### Changed
- Prefer `el.setHTML()` instead of `sanitizer.sanitizeFor()` in sanitizer trust policies

### Removed
- Delete `viewport.js`

## [v0.0.14] - 2023-05-17

### Fixed
- `isBare()` returns true for `URL`s

## [v0.0.13] - 2023-05-16

### Added
- Re-add `md5.js` and `export md5`
- `module.js` for resolving module specifiers (e.g. `'@shgysk8zero/kazoo/module.js'`)
- Implement resolving of module specifiers in loading related things (e.g. `resolveURL`, `createScript`)

### Changed
- Update README

## [v0.0.12] - 2023-05-15

### Added
- Yet more needed modules

## [v0.0.11] - 2023-05-14

### Added
- Import missing `viewport.js` module

## [v.0.0.10] - 2023-05-14

### Added
- Import `media-queries.js` module

## [v0.0.9] - 2023-05-14

## Added
- Import `popup.js` module
- Import `share-target.js` module

## [v0.0.8] - 2023-05-14

### Added
- KRV modules
- Add Google Analytics module

## [v0.0.7] - 2023-05-13

### Added
- GitHub workflow for automating releases

### Fixes
- Order of releases in CHANGELOG

## [v0.0.6] - 2023-05-08

### Added
- Module for animations
- Async function that `yield`s events dispatched on a target
- Function to tell if a thing is iterable
- More testing/example code

### Changed
- Handle `Iterator`/`Generator` children in `createElement()`

### Removed
- A bunch of bad old code in promises module

## [v0.0.5] - 2023-05-07

### Fixed
- Use `createElement` instead of `create` in filesystem module

## [v0.0.4] - 2023-05-07

### Fixed
- Re-add `lock()` in `promises.js` module

## [v0.0.3] - 2023-05-17

### Fixed
- Added missing `icons.js` module

## [v0.0.2] - 2023-05-07

### Changed
- Updated README

## [v0.0.1] - 2023-05-07

### Initial Release
