import { readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

import { loadUserscriptInJsdom, waitFor } from '../helpers/userscriptHarness';

describe('GiftButton', () => {
    it('retries a shoutbox gift with a lower amount parsed from the error', async () => {
        const requestedAmounts: string[] = [];
        const { document, window } = await loadUserscriptInJsdom({
            gmValues: {
                giftButton: true,
                mp_recentPointGifts: '[]',
                mp_version: '4.4.2',
                userGiftDefault_val: '500',
            },
            html: readFileSync('tests/fixtures/shoutbox.html', 'utf8'),
            url: 'https://www.myanonamouse.net/shoutbox.php',
        });

        class MockXMLHttpRequest {
            public onreadystatechange: (() => void) | null = null;
            public readyState = 0;
            public responseText = '';
            public status = 200;
            private _url = '';

            open(_method: string, url: string) {
                this._url = url;
            }

            setRequestHeader() {
                return undefined;
            }

            send() {
                const parsed = new URL(this._url);
                const amount = parsed.searchParams.get('amount') || '';
                requestedAmounts.push(amount);

                this.responseText =
                    amount === '500'
                        ? JSON.stringify({
                              success: false,
                              error: 'User can only receive 125 points today',
                          })
                        : JSON.stringify({
                              success: true,
                          });

                this.readyState = 4;
                if (this.onreadystatechange) {
                    this.onreadystatechange();
                }
            }
        }

        const originalXMLHttpRequest = window.XMLHttpRequest;
        Object.defineProperty(window, 'XMLHttpRequest', {
            configurable: true,
            value: MockXMLHttpRequest,
        });

        const clickEvent = new window.MouseEvent('click', {
            bubbles: true,
        });
        const menu = document.querySelector('.sb_menu') as HTMLElement;
        menu.dispatchEvent(clickEvent);

        await waitFor(25);

        const giftButton = document.querySelector('#giftButton button') as HTMLButtonElement;
        expect(giftButton).not.toBeNull();
        giftButton.click();

        await waitFor(25);

        const status = document.querySelector('#mp_giftStatusElem');
        expect(status?.textContent).toContain(
            'Points Gift Successful: Value: 125 (adjusted from 500)'
        );
        expect(requestedAmounts).toEqual(['500', '125']);

        Object.defineProperty(window, 'XMLHttpRequest', {
            configurable: true,
            value: originalXMLHttpRequest,
        });
    });
});
