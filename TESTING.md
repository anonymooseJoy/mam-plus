# Testing

This repo has two automated test layers that are safe to commit:

- `vitest` + `jsdom` unit tests for fast DOM and logic checks
- Playwright smoke tests for browser-level checks in Chromium, Firefox, and WebKit

All fixtures under `tests/fixtures/` are synthetic. They are hand-written HTML pages that model only the DOM each feature needs. No captured MAM HTML, account data, or credentials are required.

## Why this approach

MAM+ is a userscript, not a normal web app:

- it boots from a userscript bundle
- it mutates an existing site DOM
- it depends on page URLs and Greasemonkey/Tampermonkey APIs
- the live site is private

Because of that, the practical testing strategy is:

- use synthetic fixtures for repeatable automation
- stub the `GM_*` APIs locally
- run real browser smoke tests against fake MAM URLs
- keep live-site manual testing only for account-state-specific behavior

## Tooling

### Unit tests

Unit tests use:

- `vitest`
- `jsdom`
- `tests/helpers/userscriptHarness.ts`

The harness:

- loads `build/mam-plus_dev.user.js`
- creates a synthetic `window` and `document`
- stubs `GM_getValue`, `GM_setValue`, `GM_deleteValue`, `GM_listValues`, `GM_info`, `GM_getResourceText`, and `GM_addStyle`
- allows pre-bootstrap stubs like `fetch` where a feature needs them

These tests are fast and are the right place to verify:

- URL/page detection
- DOM mutation
- local storage behavior
- parsing and retry logic

### Smoke tests

Smoke tests use:

- `@playwright/test`
- `tests/helpers/playwright.ts`

The Playwright helper:

- routes synthetic HTML to real-looking MAM URLs like `https://www.myanonamouse.net/freeleech.php`
- stubs the `GM_*` APIs in each browser context
- injects the built userscript bundle

These tests verify that the script still initializes and behaves correctly in:

- Chromium
- Firefox
- WebKit

## Commands

From the repo root:

```bash
npm run build
npm run test:unit
npm run test:unit:watch
npm run test:install-browsers
npm run test:smoke
npm run test:smoke:headed
```

What they do:

- `npm run build`: rebuilds `build/mam-plus_dev.user.js`
- `npm run test:unit`: rebuilds, then runs the `vitest` suite
- `npm run test:unit:watch`: interactive watch mode for unit tests
- `npm run test:install-browsers`: downloads Playwright browser binaries
- `npm run test:smoke`: rebuilds, then runs the cross-browser smoke suite
- `npm run test:smoke:headed`: same smoke suite, but with visible browser windows

## Linux setup

Playwright needs host browser libraries on Linux. On Linux Mint 22.x / Ubuntu 24.04-class systems, this is the package set that has worked for this repo:

```bash
sudo npx playwright install-deps

sudo apt-get update
sudo apt-get install -y \
  libavif16 \
  libasound2t64 \
  libatk-bridge2.0-0t64 \
  libatk1.0-0t64 \
  libatspi2.0-0t64 \
  libcups2t64 \
  libdbus-1-3 \
  libdrm2 \
  libegl1 \
  libgbm1 \
  libglib2.0-0t64 \
  libgtk-3-0t64 \
  libgtk-4-1 \
  libnspr4 \
  libnss3 \
  libpango-1.0-0 \
  libsoup-3.0-0 \
  libx11-6 \
  libx11-xcb1 \
  libxcb1 \
  libxcomposite1 \
  libxdamage1 \
  libxext6 \
  libxfixes3 \
  libxrandr2 \
  libxshmfence1 \
  libenchant-2-2 \
  libnotify4 \
  libgudev-1.0-0 \
  libevdev2 \
  libgles2 \
  libopengl0 \
  gstreamer1.0-libav \
  gstreamer1.0-plugins-bad \
  gstreamer1.0-plugins-base \
  gstreamer1.0-plugins-good
```

Then install the Playwright browsers:

```bash
npm run test:install-browsers
```

If Playwright still reports a missing shared library, install that exact package and rerun the smoke suite.

## Directory layout

```text
tests/
  fixtures/   synthetic HTML and CSS fixtures
  helpers/    shared harness code for jsdom and Playwright
  smoke/      browser-level smoke tests
  unit/       fast vitest/jsdom tests
```

What is intentionally not included:

- captured HTML from the live private site
- real user data
- credentials

If you need to experiment with private local captures, keep them under `tests/private/`. That path is ignored by git.

## What each current test proves

### Unit tests

`tests/unit/check.page.test.ts`

- verifies `Check.page()` recognizes `store.php` as `store`
- verifies `Check.page()` recognizes `freeleech.php` as `freeleech`

This protects the routing added for those new pages.

`tests/unit/home.giftNewest.test.ts`

- verifies `Select Max Ungifted` appears on the synthetic new-users page
- verifies it selects exactly the number of ungifted users affordable from current bonus points and gift size
- verifies previously gifted users remain marked

This protects issue `#257`.

`tests/unit/home.recentGiftLimits.test.ts`

- verifies a user who has already received the full daily point allowance is marked as effectively gifted
- verifies the expected tooltip text is applied

This protects the recent-gift limit behavior from issue `#198`.

`tests/unit/home.giftStoreSanitization.test.ts`

- verifies malformed recent-gift data is dropped
- verifies stale entries from previous UTC days are dropped
- verifies valid current-day entries are preserved

This protects the recent-gift store cleanup logic from issue `#198`.

`tests/unit/browse.features.test.ts`

- verifies bookmark icon override adds the `mp_bookmarkOverride` body class when enabled
- verifies the override does not apply when disabled
- verifies the filetype picker writes `@filetype{...}` into the search field
- verifies an existing `@filetype{...}` token is parsed back into checked boxes
- verifies `Hide Bookmarked` hides bookmarked rows while leaving other rows visible
- verifies clickable tags are generated from plaintext tag text
- verifies the original plaintext tag row is hidden
- verifies the clickable-tag feature no longer inserts an extra `<br>`
- verifies the multi-select toolbar relocates into the `Mass actions` block
- verifies result checkboxes are injected for browse rows
- verifies `Open Selected` uses canonical `/t/<id>` URLs
- verifies bulk download and bookmark actions only act on selected rows

This protects issues `#195`, `#232`, `#250`, `#251`, and `#252`.

`tests/unit/store.grayOut.test.ts`

- verifies E-VIP blocks VIP purchases
- verifies insufficient cheese disables cheese purchases
- verifies unaffordable point purchases are disabled
- verifies affordable point purchases stay enabled
- verifies the store target-ratio helper displays the upload credit and BP needed to reach a configured ratio

This protects issues `#5` and `#192`.

`tests/unit/shout.giftRetry.test.ts`

- verifies shoutbox gifting retries when the server says the requested amount is too high
- verifies the retry uses the lower parsed value
- verifies the success message shows the adjusted amount

This protects issue `#165`.

`tests/unit/tor.currentlyReading.test.ts`

- verifies the `Currently Reading` feature creates a plain textarea
- verifies the textarea includes `mceNoEditor`
- verifies the generated snippet contains the torrent link and the expected author formatting

This protects issue `#255`.

`tests/unit/vault.potHistory.test.ts`

- verifies donation history is refreshed from `/millionaires/pot.php`
- verifies stale in-page history is replaced
- verifies this still works when the donate form is absent and the page says "Come back tomorrow!"

This protects issue `#238`.

### Smoke tests

`tests/smoke/userscript.smoke.spec.ts`

This file runs the same scenarios in Chromium, Firefox, and WebKit. It proves that the built userscript can bootstrap and behave correctly in real browsers, not just `jsdom`.

Current smoke scenarios:

- new users page: `Select Max Ungifted` appears and selects the expected rows
- freeleech page: sections collapse by default and expand on toggle
- browse page: bookmark override, filetype picker, bookmarked-row hiding, clickable tags, and browse multi-select all initialize together
- store page: unaffordable purchases are disabled while affordable ones remain enabled, and target-ratio upload credit guidance is displayed
- shoutbox page: the gift button appears and retries a gift with a lower allowed amount
- torrent page: `Currently Reading` stays a plain textarea with `mceNoEditor`
- vault page: stale donation history is replaced even without a donate form

Because each smoke case runs in all three engines, the full suite currently proves these scenarios across:

- Chromium
- Firefox
- WebKit

## Reading failures

Useful rule of thumb:

- if `test:unit` fails, the problem is usually feature logic, selectors, or the synthetic fixture
- if only one browser fails in `test:smoke`, the problem may be browser-specific DOM/event behavior
- if all smoke browsers fail for the same test, the problem is usually either a real regression or a bad fixture/harness assumption

## Limitations

This test setup is intentionally pragmatic, not exhaustive.

It does not prove:

- that MAM's live markup has not changed
- that Tampermonkey itself behaves identically in every browser
- account-state-specific flows that require real live data

Those still need targeted manual checks on the live site.
