import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { JSDOM } from 'jsdom';

interface HarnessOptions {
    beforeEval?: (
        window: Window & typeof globalThis,
        gmStore: Map<string, unknown>
    ) => void;
    gmValues?: Record<string, unknown>;
    html: string;
    url: string;
}

const userscriptPath = resolve(process.cwd(), 'build/mam-plus_dev.user.js');

export async function loadUserscriptInJsdom(options: HarnessOptions) {
    const dom = new JSDOM(options.html, {
        pretendToBeVisual: true,
        runScripts: 'dangerously',
        url: options.url,
    });
    const { window } = dom;
    const gmStore = new Map<string, unknown>(Object.entries(options.gmValues || {}));
    const userscriptSource = readFileSync(userscriptPath, 'utf8');

    Object.defineProperty(window.HTMLElement.prototype, 'innerText', {
        configurable: true,
        get() {
            return this.textContent || '';
        },
        set(value: string) {
            this.textContent = value;
        },
    });

    Object.assign(window, {
        GM_addStyle: () => undefined,
        GM_deleteValue: (key: string) => {
            gmStore.delete(key);
        },
        GM_getValue: (key: string, defaultValue?: unknown) =>
            gmStore.has(key) ? gmStore.get(key) : defaultValue,
        GM_getResourceText: () => '',
        GM_info: {
            script: {
                version: '4.4.2-test',
            },
        },
        GM_listValues: () => Array.from(gmStore.keys()),
        GM_setValue: (key: string, value: unknown) => {
            gmStore.set(key, value);
            return value;
        },
        alert: () => undefined,
        open: () => null,
    });

    options.beforeEval?.(window, gmStore);
    window.eval(userscriptSource);
    await waitFor(25);

    return {
        document: window.document,
        gmStore,
        window,
    };
}

export async function waitFor(ms: number) {
    await new Promise((resolve) => setTimeout(resolve, ms));
}
