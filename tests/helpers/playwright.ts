import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import type { Page } from '@playwright/test';

export async function installGMStubs(
    page: Page,
    values: Record<string, unknown> = {},
    protectedKeys: string[] = []
) {
    await page.addInitScript(({ gmValues, stickyKeys }) => {
        const store = new Map(Object.entries(gmValues));
        const protectedStoreKeys = new Set(stickyKeys);

        Object.assign(window, {
            GM_addStyle: () => undefined,
            GM_deleteValue: (key: string) => {
                if (protectedStoreKeys.has(key)) {
                    return;
                }
                store.delete(key);
            },
            GM_getValue: (key: string, defaultValue?: unknown) =>
                store.has(key) ? store.get(key) : defaultValue,
            GM_getResourceText: () => '',
            GM_info: {
                script: {
                    version: '4.4.2-test',
                },
            },
            GM_listValues: () => Array.from(store.keys()),
            GM_setValue: (key: string, value: unknown) => {
                store.set(key, value);
                return value;
            },
        });
    }, { gmValues: values, stickyKeys: protectedKeys });
}

export async function loadUserscript(page: Page) {
    await page.addScriptTag({
        path: resolve(process.cwd(), 'build/mam-plus_dev.user.js'),
    });
}

export async function loadFixturePage(
    page: Page,
    pathName: string,
    fixturePath: string
) {
    const html = readFileSync(resolve(process.cwd(), fixturePath), 'utf8');

    await page.route(`https://www.myanonamouse.net${pathName}`, async (route) => {
        await route.fulfill({
            body: html,
            contentType: 'text/html; charset=utf-8',
        });
    });

    await page.route('https://www.myanonamouse.net/site-ICGstation.css', async (route) => {
        await route.fulfill({
            body: 'body { font-family: sans-serif; }',
            contentType: 'text/css; charset=utf-8',
        });
    });

    await page.goto(`https://www.myanonamouse.net${pathName}`);
}
