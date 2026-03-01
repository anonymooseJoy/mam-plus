# MAM+

![GitHub tag (latest SemVer)](https://img.shields.io/github/v/tag/gardenshade/mam-plus?label=version)

No it's not some elite club. It's just a simple set of features, tweaks, and occasional bug fixes that modifies (and hopefully enhances) your MAM experience. Very occasionally it might break your MAM experience, but we try to keep those incidents to a minimum... Nearly every feature can be enabled or disabled separately, and only one is enabled by default, meaning you can stick with a near-Vanilla experience if you so desire.

Don't know what MAM is? This script won't be very useful to you then.

## Installation

[![Install Button](https://img.shields.io/badge/Install-Click%20Here-green?style=for-the-badge&logo=DocuSign)](https://github.com/gardenshade/mam-plus/raw/master/release/mam-plus.user.js)

You need a userscript browser extension installed in order to use MAM+.

Recommended setup:

- Chrome: [Tampermonkey](https://www.tampermonkey.net/)
- Firefox: [Tampermonkey](https://addons.mozilla.org/en-US/firefox/addon/tampermonkey/) or [Violentmonkey](https://addons.mozilla.org/en-US/firefox/addon/violentmonkey/)

Greasemonkey is not recommended for this project.

MAM+ only officially supports current Chrome and Firefox. Other modern browsers with userscript support may work, but they are not a primary target.

## Modification & Contribution

If you want to modify the script or contribute changes, follow the steps below. Additional documentation lives in the [wiki](https://github.com/gardenshade/mam-plus/wiki), and automated test workflow documentation lives in [TESTING.md](./TESTING.md).

### Prerequisites

- [Node.js](https://nodejs.org/en/download/)
- A supported browser + userscript extension
- `npm`

### Instructions

#### First-time setup

- Install the prerequisites on your system
- Clone this project to your computer
- Open a terminal in the project folder and run `npm install`
- In your browser extension settings, allow the userscript extension to access local files

#### Workflow

This is a TypeScript project, but plain JavaScript is valid TypeScript, so you do not need deep TS knowledge to contribute.

Useful commands:

```bash
npm run build
npm run watch
npm run test:unit
npm run test:smoke
```

What they do:

- `npm run build`: builds the development userscript in `build/mam-plus_dev.user.js`
- `npm run watch`: rebuilds automatically when TypeScript or Sass files change
- `npm run test:unit`: runs the fast `vitest` + `jsdom` suite
- `npm run test:smoke`: runs the Playwright smoke suite across Chromium, Firefox, and WebKit

Install the development build into your userscript manager and test against the live site. The development build uses the `_dev` suffix so it can coexist with the release script, but you should still disable the release version while testing.

For active development:

1. Run `npm run watch`
2. Refresh or reinstall `build/mam-plus_dev.user.js` in your userscript manager
3. Reload the relevant MAM page
4. Run unit and smoke tests for non-trivial changes

### Testing

Automated testing is documented in [TESTING.md](./TESTING.md). The short version:

- unit tests use `vitest` + `jsdom`
- smoke tests use Playwright with synthetic MAM fixtures
- no private MAM HTML is committed to the repo

### Releases

When you are ready to produce a release build, use:

```bash
npm version <patch|minor|major>
```

This will generate the minified release userscript in `release/` and update the versioned artifacts.

### Branching

Use a dedicated feature or fix branch for each issue instead of working directly on `master`.
