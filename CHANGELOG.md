# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
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
