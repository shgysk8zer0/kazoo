# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

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
- Add `isSafeHTML()` to `trust-policies` module (checks for unsafe elements & attributes)
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
