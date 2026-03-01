/// <reference path="shared.ts" />
/**
 * #BROWSE PAGE FEATURES
 */

const updateBrowseResultVisibility = (row: HTMLTableRowElement): void => {
    const hiddenBySnatched: boolean = row.dataset.mpHideSnatched === 'true';
    const hiddenByBookmarked: boolean = row.dataset.mpHideBookmarked === 'true';

    row.style.display = hiddenBySnatched || hiddenByBookmarked ? 'none' : 'table-row';
};

const formatHiddenCountLabel = (
    visibleLabel: string,
    hiddenLabel: string,
    isVisible: boolean,
    hiddenCount: number
): string => {
    if (isVisible || hiddenCount === 0) {
        return visibleLabel;
    }

    return `${hiddenLabel} (${hiddenCount} hidden)`;
};

/**
 * Allows Snatched torrents to be hidden/shown
 */
class ToggleSnatched implements Feature {
    private _settings: CheckboxSetting = {
        scope: SettingGroup.Search,
        type: 'checkbox',
        title: 'toggleSnatched',
        desc: `Add a button to hide/show results that you've snatched`,
    };
    private _tar: string = '#ssr';
    private _isVisible: boolean = true;
    private _searchList: NodeListOf<HTMLTableRowElement> | undefined;
    private _snatchedHook: string = 'td div[class^="browse"]';
    private _rowStateKey: string = 'mpHideSnatched';
    private _share: Shared = new Shared();

    constructor() {
        Util.startFeature(this._settings, this._tar, ['browse']).then((t) => {
            if (t) {
                this._init();
            }
        });
    }

    private async _init(): Promise<void> {
        let toggle: Promise<HTMLElement>;
        let resultList: Promise<NodeListOf<HTMLTableRowElement>>;
        let results: NodeListOf<HTMLTableRowElement>;
        const storedState: string | undefined = GM_getValue(
            `${this._settings.title}State`
        );

        if (storedState === 'false' && GM_getValue('stickySnatchedToggle') === true) {
            this._setVisState(false);
        } else {
            this._setVisState(true);
        }

        const toggleText: string = this._isVisible ? 'Hide Snatched' : 'Show Snatched';

        // Queue building the button and getting the results
        await Promise.all([
            (toggle = Util.createButton(
                'snatchedToggle',
                toggleText,
                'h1',
                '#resetNewIcon',
                'beforebegin',
                'torFormButton'
            )),
            (resultList = this._share.getSearchList()),
        ]);

        toggle
            .then((btn) => {
                // Update based on vis state
                btn.addEventListener(
                    'click',
                    () => {
                        if (this._isVisible === true) {
                            this._setVisState(false);
                        } else {
                            this._setVisState(true);
                        }
                        this._filterResults(results, this._snatchedHook);
                    },
                    false
                );
            })
            .catch((err) => {
                throw new Error(err);
            });

        resultList
            .then(async (res) => {
                results = res;
                this._searchList = res;
                this._filterResults(results, this._snatchedHook);
                MP.log('[M+] Added the Toggle Snatched button!');
            })
            .then(() => {
                // Observe the Search results
                Check.elemObserver('#ssr', () => {
                    resultList = this._share.getSearchList();

                    resultList.then(async (res) => {
                        results = res;
                        this._searchList = res;
                        this._filterResults(results, this._snatchedHook);
                    });
                });
            });
    }

    /**
     * Filters search results
     * @param list a search results list
     * @param subTar the elements that must be contained in our filtered results
     */
    private _filterResults(list: NodeListOf<HTMLTableRowElement>, subTar: string): void {
        let hiddenCount = 0;
        const btn: HTMLHeadingElement = <HTMLHeadingElement>(
            document.querySelector('#mp_snatchedToggle')!
        );

        list.forEach((snatch) => {
            // Select only the items that match our sub element
            const result = snatch.querySelector(subTar);

            if (result !== null) {
                // Hide/show as required
                if (this._isVisible === false) {
                    snatch.dataset[this._rowStateKey] = 'true';
                    hiddenCount += 1;
                } else {
                    snatch.dataset[this._rowStateKey] = 'false';
                }
            } else {
                snatch.dataset[this._rowStateKey] = 'false';
            }

            updateBrowseResultVisibility(snatch);
        });

        btn.innerHTML = formatHiddenCountLabel(
            'Hide Snatched',
            'Show Snatched',
            this._isVisible,
            hiddenCount
        );
    }

    private _setVisState(val: boolean): void {
        if (MP.DEBUG) {
            MP.log('Snatch vis state:', this._isVisible, '\nval:', val);
        }
        GM_setValue(`${this._settings.title}State`, `${val}`);
        this._isVisible = val;
    }

    get settings(): CheckboxSetting {
        return this._settings;
    }

    get searchList(): NodeListOf<HTMLTableRowElement> {
        if (this._searchList === undefined) {
            throw new Error('searchlist is undefined');
        }
        return this._searchList;
    }

    get visible(): boolean {
        return this._isVisible;
    }

    set visible(val: boolean) {
        this._setVisState(val);
    }
}

/**
 * Remembers the state of ToggleSnatched between page loads
 */
class StickySnatchedToggle implements Feature {
    private _settings: CheckboxSetting = {
        scope: SettingGroup.Search,
        type: 'checkbox',
        title: 'stickySnatchedToggle',
        desc: `Make snatched toggle state persist between page loads`,
    };
    private _tar: string = '#ssr';

    constructor() {
        Util.startFeature(this._settings, this._tar, ['browse']).then((t) => {
            if (t) {
                this._init();
            }
        });
    }

    private _init() {
        MP.log('[M+] Remembered snatch visibility state!');
    }

    get settings(): CheckboxSetting {
        return this._settings;
    }
}

/**
 * Allows Bookmarked torrents to be hidden/shown
 */
class ToggleBookmarked implements Feature {
    private _settings: CheckboxSetting = {
        scope: SettingGroup.Search,
        type: 'checkbox',
        title: 'toggleBookmarked',
        desc: `Add a button to hide/show results that you've bookmarked`,
    };
    private _tar: string = '#ssr';
    private _isVisible: boolean = true;
    private _searchList: NodeListOf<HTMLTableRowElement> | undefined;
    private _bookmarkHook: string = 'a[id ^= "torDeBookmark"]';
    private _rowStateKey: string = 'mpHideBookmarked';
    private _share: Shared = new Shared();

    constructor() {
        Util.startFeature(this._settings, this._tar, ['browse']).then((t) => {
            if (t) {
                this._init();
            }
        });
    }

    private async _init(): Promise<void> {
        let toggle: Promise<HTMLElement>;
        let resultList: Promise<NodeListOf<HTMLTableRowElement>>;
        let results: NodeListOf<HTMLTableRowElement>;
        const storedState: string | undefined = GM_getValue(
            `${this._settings.title}State`
        );

        if (storedState === 'false' && GM_getValue('stickyBookmarkedToggle') === true) {
            this._setVisState(false);
        } else {
            this._setVisState(true);
        }

        const toggleText: string = this._isVisible ? 'Hide Bookmarked' : 'Show Bookmarked';

        await Promise.all([
            (toggle = Util.createButton(
                'bookmarkedToggle',
                toggleText,
                'h1',
                '#resetNewIcon',
                'beforebegin',
                'torFormButton'
            )),
            (resultList = this._share.getSearchList()),
        ]);

        toggle
            .then((btn) => {
                btn.addEventListener(
                    'click',
                    () => {
                        if (this._isVisible === true) {
                            this._setVisState(false);
                        } else {
                            this._setVisState(true);
                        }
                        this._filterResults(results, this._bookmarkHook);
                    },
                    false
                );
            })
            .catch((err) => {
                throw new Error(err);
            });

        resultList
            .then(async (res) => {
                results = res;
                this._searchList = res;
                this._filterResults(results, this._bookmarkHook);
                MP.log('[M+] Added the Toggle Bookmarked button!');
            })
            .then(() => {
                Check.elemObserver(
                    '#ssr',
                    () => {
                        resultList = this._share.getSearchList();

                        resultList.then(async (res) => {
                            results = res;
                            this._searchList = res;
                            this._filterResults(results, this._bookmarkHook);
                        });
                    },
                    {
                        childList: true,
                        subtree: true,
                    }
                );
            });
    }

    /**
     * Filters search results
     * @param list a search results list
     * @param subTar the elements that must be contained in our filtered results
     */
    private _filterResults(list: NodeListOf<HTMLTableRowElement>, subTar: string): void {
        let hiddenCount = 0;
        const btn: HTMLHeadingElement = <HTMLHeadingElement>(
            document.querySelector('#mp_bookmarkedToggle')!
        );

        list.forEach((bookmark) => {
            const result = bookmark.querySelector(subTar);

            if (result !== null) {
                if (this._isVisible === false) {
                    bookmark.dataset[this._rowStateKey] = 'true';
                    hiddenCount += 1;
                } else {
                    bookmark.dataset[this._rowStateKey] = 'false';
                }
            } else {
                bookmark.dataset[this._rowStateKey] = 'false';
            }

            updateBrowseResultVisibility(bookmark);
        });

        btn.innerHTML = formatHiddenCountLabel(
            'Hide Bookmarked',
            'Show Bookmarked',
            this._isVisible,
            hiddenCount
        );
    }

    private _setVisState(val: boolean): void {
        if (MP.DEBUG) {
            MP.log('Bookmark vis state:', this._isVisible, '\nval:', val);
        }
        GM_setValue(`${this._settings.title}State`, `${val}`);
        this._isVisible = val;
    }

    get settings(): CheckboxSetting {
        return this._settings;
    }

    get searchList(): NodeListOf<HTMLTableRowElement> {
        if (this._searchList === undefined) {
            throw new Error('searchlist is undefined');
        }
        return this._searchList;
    }

    get visible(): boolean {
        return this._isVisible;
    }

    set visible(val: boolean) {
        this._setVisState(val);
    }
}

/**
 * Remembers the state of ToggleBookmarked between page loads
 */
class StickyBookmarkedToggle implements Feature {
    private _settings: CheckboxSetting = {
        scope: SettingGroup.Search,
        type: 'checkbox',
        title: 'stickyBookmarkedToggle',
        desc: `Make bookmarked toggle state persist between page loads`,
    };
    private _tar: string = '#ssr';

    constructor() {
        Util.startFeature(this._settings, this._tar, ['browse']).then((t) => {
            if (t) {
                this._init();
            }
        });
    }

    private _init() {
        MP.log('[M+] Remembered bookmark visibility state!');
    }

    get settings(): CheckboxSetting {
        return this._settings;
    }
}

/**
 * Generate a plaintext list of search results
 */
class PlaintextSearch implements Feature {
    private _settings: CheckboxSetting = {
        scope: SettingGroup.Search,
        type: 'checkbox',
        title: 'plaintextSearch',
        desc: `Insert plaintext search results at top of page`,
    };
    private _tar: string = '#ssr h1';
    private _isOpen: 'true' | 'false' | undefined = GM_getValue(
        `${this._settings.title}State`
    );
    private _share: Shared = new Shared();
    private _plainText: string = '';

    constructor() {
        Util.startFeature(this._settings, this._tar, ['browse']).then((t) => {
            if (t) {
                this._init();
            }
        });
    }

    private async _init() {
        let toggleBtn: Promise<HTMLElement>;
        let copyBtn: HTMLElement;
        let resultList: Promise<NodeListOf<HTMLTableRowElement>>;

        // Queue building the toggle button and getting the results
        await Promise.all([
            (toggleBtn = Util.createButton(
                'plainToggle',
                'Show Plaintext',
                'div',
                '#ssr',
                'beforebegin',
                'mp_toggle mp_plainBtn'
            )),
            (resultList = this._share.getSearchList()),
        ]);

        // Process the results into plaintext
        resultList
            .then(async (res) => {
                // Build the copy button
                copyBtn = await Util.createButton(
                    'plainCopy',
                    'Copy Plaintext',
                    'div',
                    '#mp_plainToggle',
                    'afterend',
                    'mp_copy mp_plainBtn'
                );
                // Build the plaintext box
                copyBtn.insertAdjacentHTML(
                    'afterend',
                    `<br><textarea class='mp_plaintextSearch' style='display: none'></textarea>`
                );
                // Insert plaintext results
                this._plainText = await this._processResults(res);
                document.querySelector(
                    '.mp_plaintextSearch'
                )!.innerHTML = this._plainText;
                // Set up a click listener
                Util.clipboardifyBtn(copyBtn, this._plainText);
            })
            .then(() => {
                // Observe the Search results
                Check.elemObserver('#ssr', () => {
                    document.querySelector('.mp_plaintextSearch')!.innerHTML = '';
                    resultList = this._share.getSearchList();
                    resultList.then(async (res) => {
                        // Insert plaintext results
                        this._plainText = await this._processResults(res);
                        document.querySelector(
                            '.mp_plaintextSearch'
                        )!.innerHTML = this._plainText;
                    });
                });
            });

        // Init open state
        this._setOpenState(this._isOpen);

        // Set up toggle button functionality
        toggleBtn
            .then((btn) => {
                btn.addEventListener(
                    'click',
                    () => {
                        // Textbox should exist, but just in case...
                        const textbox: HTMLTextAreaElement | null = document.querySelector(
                            '.mp_plaintextSearch'
                        );
                        if (textbox === null) {
                            throw new Error(`textbox doesn't exist!`);
                        } else if (this._isOpen === 'false') {
                            this._setOpenState('true');
                            textbox.style.display = 'block';
                            btn.innerText = 'Hide Plaintext';
                        } else {
                            this._setOpenState('false');
                            textbox.style.display = 'none';
                            btn.innerText = 'Show Plaintext';
                        }
                    },
                    false
                );
            })
            .catch((err) => {
                throw new Error(err);
            });

        MP.log('[M+] Inserted plaintext search results!');
    }

    /**
     * Sets Open State to true/false internally and in script storage
     * @param val stringified boolean
     */
    private _setOpenState(val: 'true' | 'false' | undefined): void {
        if (val === undefined) {
            val = 'false';
        } // Default value
        GM_setValue(`${this._settings.title}State`, val);
        this._isOpen = val;
    }

    private async _processResults(
        results: NodeListOf<HTMLTableRowElement>
    ): Promise<string> {
        let outp: string = '';
        results.forEach((node) => {
            // Reset each text field
            let title: string = '';
            let seriesTitle: string = '';
            let authTitle: string = '';
            let narrTitle: string = '';
            // Break out the important data from each node
            const rawTitle: HTMLAnchorElement | null = node.querySelector('.torTitle');
            const seriesList: NodeListOf<
                HTMLAnchorElement
            > | null = node.querySelectorAll('.series');
            const authList: NodeListOf<HTMLAnchorElement> | null = node.querySelectorAll(
                '.author'
            );
            const narrList: NodeListOf<HTMLAnchorElement> | null = node.querySelectorAll(
                '.narrator'
            );

            if (rawTitle === null) {
                MP.warn('Error Node:', node);
                throw new Error(`Result title should not be null`);
            } else {
                title = rawTitle.textContent!.trim();
            }

            // Process series
            if (seriesList !== null && seriesList.length > 0) {
                seriesList.forEach((series) => {
                    seriesTitle += `${series.textContent} / `;
                });
                // Remove trailing slash from last series, then style
                seriesTitle = seriesTitle.substring(0, seriesTitle.length - 3);
                seriesTitle = ` (${seriesTitle})`;
            }
            // Process authors
            if (authList !== null && authList.length > 0) {
                authTitle = 'BY ';
                authList.forEach((auth) => {
                    authTitle += `${auth.textContent} AND `;
                });
                // Remove trailing AND
                authTitle = authTitle.substring(0, authTitle.length - 5);
            }
            // Process narrators
            if (narrList !== null && narrList.length > 0) {
                narrTitle = 'FT ';
                narrList.forEach((narr) => {
                    narrTitle += `${narr.textContent} AND `;
                });
                // Remove trailing AND
                narrTitle = narrTitle.substring(0, narrTitle.length - 5);
            }
            outp += `${title}${seriesTitle} ${authTitle} ${narrTitle}\n`;
        });
        return outp;
    }

    get settings(): CheckboxSetting {
        return this._settings;
    }

    get isOpen(): 'true' | 'false' | undefined {
        return this._isOpen;
    }

    set isOpen(val: 'true' | 'false' | undefined) {
        this._setOpenState(val);
    }
}

/**
 * Allows the search features to be hidden/shown
 */
class ToggleSearchbox implements Feature {
    private _settings: CheckboxSetting = {
        scope: SettingGroup.Search,
        type: 'checkbox',
        title: 'toggleSearchbox',
        desc: `Collapse the Search box and make it toggleable`,
    };
    private _tar: string = '#torSearchControl';
    private _height: string = '26px';
    private _isOpen: 'true' | 'false' = 'false';

    constructor() {
        Util.startFeature(this._settings, this._tar, ['browse']).then((t) => {
            if (t) {
                this._init();
            }
        });
    }

    private async _init(): Promise<void> {
        const searchbox: HTMLDivElement | null = document.querySelector(this._tar);
        if (searchbox) {
            // Adjust the title to make it clear it is a toggle button
            const title: HTMLDivElement | null = searchbox.querySelector(
                '.blockHeadCon h4'
            );
            if (title) {
                // Adjust text & style
                title.innerHTML = 'Toggle Search';
                title.style.cursor = 'pointer';
                // Set up click listener
                title.addEventListener('click', () => {
                    this._toggle(searchbox!);
                });
            } else {
                MP.error('Could not set up toggle! Target does not exist');
            }
            // Collapse the searchbox
            Util.setAttr(searchbox, {
                style: `height:${this._height};overflow:hidden;`,
            });
            // Hide extra text
            const notification: HTMLHeadingElement | null = document.querySelector(
                '#mainBody > h3'
            );
            const guideLink: HTMLAnchorElement | null = document.querySelector(
                '#mainBody > h3 ~ a'
            );
            if (notification) notification.style.display = 'none';
            if (guideLink) guideLink.style.display = 'none';

            MP.log('[M+] Collapsed the Search box!');
        } else {
            MP.error('Could not collapse Search box! Target does not exist');
        }
    }

    private async _toggle(elem: HTMLDivElement): Promise<void> {
        if (this._isOpen === 'false') {
            elem.style.height = 'unset';
            this._isOpen = 'true';
        } else {
            elem.style.height = this._height;
            this._isOpen = 'false';
        }
        if (MP.DEBUG) MP.log('Toggled Search box!');
    }

    get settings(): CheckboxSetting {
        return this._settings;
    }
}

/**
 * Adds a filetype picker that writes MAM's @filetype filter into search text
 */
class FiletypeSearchFilter implements Feature {
    private _settings: CheckboxSetting = {
        scope: SettingGroup.Search,
        type: 'checkbox',
        title: 'filetypeSearchFilter',
        desc: `Add a filetype picker that inserts @filetype filters into search text`,
    };
    private _tar: string = '#torSearch';
    private _queryTar: string = '#torTitle';
    private _panelTar: string = '#mp_filetypeSearchPanel';
    private _toggleTar: string = '#mp_filetypeSearchToggle';
    private _defaultFiletypes: string[] = [
        'epub',
        'pdf',
        'mobi',
        'azw3',
        'azw',
        'txt',
        'rtf',
        'doc',
        'docx',
        'lit',
        'djvu',
        'cbz',
        'cbr',
        'cb7',
        'm4b',
        'mp3',
        'm4a',
        'flac',
    ];

    constructor() {
        Util.startFeature(this._settings, this._tar, ['browse']).then((t) => {
            if (t) {
                this._init();
            }
        });
    }

    private async _init(): Promise<void> {
        const form: HTMLFormElement | null = document.querySelector(this._tar);
        const queryInput: HTMLInputElement | null = document.querySelector(this._queryTar);
        const anchorTarget: HTMLElement | null = document.querySelector('#resetNewIcon');

        if (form === null || queryInput === null || anchorTarget === null) {
            throw new Error('Could not initialize filetype search filter');
        }

        const allFiletypes: string[] = this._getAllFiletypes(queryInput.value);
        const selectedFiletypes: Set<string> = new Set(this._parseFiletypes(queryInput.value));

        const toggle: HTMLElement = await Util.createButton(
            'filetypeSearchToggle',
            'File Types',
            'h1',
            anchorTarget,
            'afterend',
            'torFormButton'
        );

        toggle.insertAdjacentHTML(
            'afterend',
            `
                <div id="mp_filetypeSearchPanel" class="mp_filetypeSearchPanel" style="display: none;">
                    <div class="mp_filetypeSearchActions">
                        <span id="mp_filetypeSearchAll" class="mp_plainBtn" role="button">All</span>
                        <span id="mp_filetypeSearchNone" class="mp_plainBtn" role="button">None</span>
                    </div>
                    <div class="mp_filetypeSearchGrid">
                        ${allFiletypes
                            .map((type) => {
                                const checked = selectedFiletypes.has(type) ? 'checked' : '';
                                return `<label class="mp_filetypeSearchItem"><input type="checkbox" value="${type}" ${checked}> ${type}</label>`;
                            })
                            .join('')}
                    </div>
                </div>
            `
        );

        toggle.id = 'mp_filetypeSearchToggle';
        toggle.addEventListener('click', () => {
            this._togglePanel();
        });

        this._bindPanelActions(queryInput);
        this._syncSelectionsFromQuery(queryInput);

        queryInput.addEventListener('change', () => {
            this._syncSelectionsFromQuery(queryInput);
        });
        queryInput.addEventListener('blur', () => {
            this._syncSelectionsFromQuery(queryInput);
        });
        form.addEventListener('submit', () => {
            this._applySelectionToQuery(queryInput);
        });

        MP.log('[M+] Added the filetype search filter!');
    }

    private _bindPanelActions(queryInput: HTMLInputElement): void {
        const panel: HTMLDivElement | null = document.querySelector(this._panelTar);
        const selectAll: HTMLSpanElement | null = document.querySelector('#mp_filetypeSearchAll');
        const selectNone: HTMLSpanElement | null = document.querySelector('#mp_filetypeSearchNone');

        if (panel === null || selectAll === null || selectNone === null) {
            throw new Error('Could not bind filetype search controls');
        }

        panel.querySelectorAll('input[type="checkbox"]').forEach((checkbox) => {
            checkbox.addEventListener('change', () => {
                this._applySelectionToQuery(queryInput);
            });
        });

        selectAll.addEventListener('click', () => {
            panel.querySelectorAll<HTMLInputElement>('input[type="checkbox"]').forEach((box) => {
                box.checked = true;
            });
            this._applySelectionToQuery(queryInput);
        });

        selectNone.addEventListener('click', () => {
            panel.querySelectorAll<HTMLInputElement>('input[type="checkbox"]').forEach((box) => {
                box.checked = false;
            });
            this._applySelectionToQuery(queryInput);
        });
    }

    private _togglePanel(): void {
        const panel: HTMLDivElement | null = document.querySelector(this._panelTar);
        const toggle: HTMLElement | null = document.querySelector(this._toggleTar);

        if (panel === null || toggle === null) {
            return;
        }

        const isOpen = panel.style.display === 'block';
        panel.style.display = isOpen ? 'none' : 'block';
        toggle.setAttribute('aria-expanded', isOpen ? 'false' : 'true');
    }

    private _syncSelectionsFromQuery(queryInput: HTMLInputElement): void {
        const selectedFiletypes = new Set(this._parseFiletypes(queryInput.value));
        const panel: HTMLDivElement | null = document.querySelector(this._panelTar);

        if (panel === null) {
            return;
        }

        panel.querySelectorAll<HTMLInputElement>('input[type="checkbox"]').forEach((checkbox) => {
            checkbox.checked = selectedFiletypes.has(checkbox.value);
        });
    }

    private _applySelectionToQuery(queryInput: HTMLInputElement): void {
        const panel: HTMLDivElement | null = document.querySelector(this._panelTar);

        if (panel === null) {
            return;
        }

        const selectedFiletypes: string[] = [];
        panel.querySelectorAll<HTMLInputElement>('input[type="checkbox"]').forEach((checkbox) => {
            if (checkbox.checked) {
                selectedFiletypes.push(checkbox.value);
            }
        });

        const baseQuery = this._stripFiletypeToken(queryInput.value);
        if (selectedFiletypes.length === 0) {
            queryInput.value = baseQuery;
        } else {
            const filterToken = `@filetype{${selectedFiletypes.join('|')}}`;
            queryInput.value = baseQuery === '' ? filterToken : `${baseQuery} ${filterToken}`;
        }
    }

    private _getAllFiletypes(queryText: string): string[] {
        const seen: { [key: string]: boolean } = {};
        const merged: string[] = [];
        const resultFiletypes = Array.from(
            document.querySelectorAll<HTMLAnchorElement>('.torFileTypes a')
        ).map((type) => type.textContent!.trim().toLowerCase());
        const queryFiletypes = this._parseFiletypes(queryText);

        [...this._defaultFiletypes, ...resultFiletypes, ...queryFiletypes].forEach((type) => {
            if (type !== '' && seen[type] !== true) {
                seen[type] = true;
                merged.push(type);
            }
        });

        return merged.sort();
    }

    private _parseFiletypes(queryText: string): string[] {
        const match = queryText.match(/@filetype\{([^}]*)\}/i);
        if (match === null || match[1].trim() === '') {
            return [];
        }

        return match[1]
            .split('|')
            .map((type) => type.trim().toLowerCase())
            .filter((type) => type !== '');
    }

    private _stripFiletypeToken(queryText: string): string {
        return queryText
            .replace(/\s*@filetype\{[^}]*\}\s*/gi, ' ')
            .replace(/\s{2,}/g, ' ')
            .trim();
    }

    get settings(): CheckboxSetting {
        return this._settings;
    }
}

/**
 * * Generates linked tags from the site's plaintext tag field
 */
class BuildTags implements Feature {
    private _settings: CheckboxSetting = {
        scope: SettingGroup.Search,
        type: 'checkbox',
        title: 'buildTags',
        desc: `Generate clickable Tags automatically`,
    };
    private _tar: string = '#ssr';
    private _share: Shared = new Shared();

    constructor() {
        Util.startFeature(this._settings, this._tar, ['browse']).then((t) => {
            if (t) {
                this._init();
            }
        });
    }

    private async _init() {
        let resultsList = this._share.getSearchList();

        // Build the tags
        resultsList
            .then((results) => {
                results.forEach((r) => this._processTagString(r));
                MP.log('[M+] Built tag links!');
            })
            .then(() => {
                // Observe the Search results
                Check.elemObserver('#ssr', () => {
                    resultsList = this._share.getSearchList();
                    resultsList.then((results) => {
                        // Build the tags again
                        results.forEach((r) => this._processTagString(r));
                        MP.log('[M+] Built tag links!');
                    });
                });
            });
    }

    /**
     * * Code to run for every search result
     * @param res A search result row
     */
    private _processTagString = (res: HTMLTableRowElement) => {
        const tagline = <HTMLSpanElement>res.querySelector('.torRowDesc');

        if (MP.DEBUG) MP.group(tagline);

        // Assume brackets contain tags
        let tagString = tagline.innerHTML.replace(/(?:\[|\]|\(|\)|$)/gi, ',');
        // Remove HTML Entities and turn them into breaks
        tagString = tagString.split(/(?:&.{1,5};)/g).join(';');
        // Split tags at ',' and ';' and '>' and '|'
        let tags = tagString.split(/\s*(?:;|,|>|\||$)\s*/);
        // Remove empty or long tags
        tags = tags.filter((tag) => tag.length <= 30 && tag.length > 0);
        // Are tags already added? Only add if null
        const tagBox: HTMLSpanElement | null = res.querySelector('.mp_tags');
        if (tagBox === null) {
            this._injectLinks(tags, tagline);
        }

        if (MP.DEBUG) {
            MP.log(tags);
            MP.groupEnd();
        }
    };

    /**
     * * Injects the generated tags
     * @param tags Array of tags to add
     * @param tar The search result row that the tags will be added to
     */
    private _injectLinks = (tags: string[], tar: HTMLSpanElement) => {
        if (tags.length > 0) {
            // Insert the new tag row
            const tagRow = document.createElement('span');
            tagRow.classList.add('mp_tags');
            tar.insertAdjacentElement('beforebegin', tagRow);
            tar.style.display = 'none';
            // Add the tags to the tag row
            tags.forEach((tag) => {
                tagRow.innerHTML += `<a class='mp_tag' href='/tor/browse.php?tor%5Btext%5D=%22${encodeURIComponent(
                    tag
                )}%22&tor%5BsrchIn%5D%5Btags%5D=true'>${tag}</a>`;
            });
        }
    };

    get settings(): CheckboxSetting {
        return this._settings;
    }
}

/**
 * Adds multi-select checkboxes and bulk actions to browse results
 */
class MultiSelectBrowse implements Feature {
    private _settings: CheckboxSetting = {
        scope: SettingGroup.Search,
        type: 'checkbox',
        title: 'multiSelectBrowse',
        desc: `Add checkboxes and bulk actions to search results`,
    };
    private _tar: string = '#ssr';
    private _share: Shared = new Shared();
    private _toolbarID: string = 'mp_multiSelectToolbar';
    private _checkboxClass: string = 'mp_multiSelectBox';
    private _rowFlag: string = 'mpMultiSelectReady';

    constructor() {
        Util.startFeature(this._settings, this._tar, ['browse']).then((t) => {
            if (t) {
                this._init();
            }
        });
    }

    private async _init(): Promise<void> {
        this._ensureToolbar();
        this._decorateResults(await this._share.getSearchList());

        Check.elemObserver('#ssr', async () => {
            this._ensureToolbar();
            this._decorateResults(await this._share.getSearchList());
        });
        Check.elemObserver(
            'body',
            () => {
                this._ensureToolbar();
            },
            {
                childList: true,
                subtree: true,
            }
        );

        MP.log('[M+] Added multi-select browse actions!');
    }

    private _ensureToolbar(): void {
        const existingToolbar: HTMLElement | null = document.getElementById(this._toolbarID);
        const massActions: HTMLElement | null = this._findMassActionsAnchor();
        if (existingToolbar !== null) {
            if (
                massActions !== null &&
                existingToolbar.parentElement !== massActions
            ) {
                existingToolbar.className =
                    'mp_multiSelectToolbar mp_multiSelectToolbar_massActions';
                massActions.classList.add('mp_multiSelectHost');
                massActions.appendChild(existingToolbar);
            }
            return;
        }

        const toolbar = document.createElement('div');
        toolbar.id = this._toolbarID;
        toolbar.className = massActions
            ? 'mp_multiSelectToolbar mp_multiSelectToolbar_massActions'
            : 'mp_multiSelectToolbar';
        toolbar.innerHTML = `
            <span id="mp_multiSelectAll" class="mp_plainBtn" role="button">Select All</span>
            <span id="mp_multiSelectNone" class="mp_plainBtn" role="button">Select None</span>
            <span id="mp_multiSelectOpen" class="mp_plainBtn" role="button">Open Selected</span>
            <span id="mp_multiSelectDownload" class="mp_plainBtn" role="button">Download Selected</span>
            <span id="mp_multiSelectBookmark" class="mp_plainBtn" role="button">Bookmark Selected</span>
        `;

        if (massActions !== null) {
            massActions.classList.add('mp_multiSelectHost');
            massActions.appendChild(toolbar);
        } else {
            const anchorTarget: HTMLElement | null =
                document.querySelector('#resetNewIcon') || document.querySelector('#ssr');
            if (anchorTarget === null || anchorTarget.parentElement === null) {
                throw new Error('Could not create multi-select browse toolbar');
            }
            anchorTarget.insertAdjacentElement('beforebegin', toolbar);
        }

        (<HTMLElement>document.getElementById('mp_multiSelectAll')).addEventListener(
            'click',
            () => {
                this._setCheckedState(true);
            }
        );
        (<HTMLElement>document.getElementById('mp_multiSelectNone')).addEventListener(
            'click',
            () => {
                this._setCheckedState(false);
            }
        );
        (<HTMLElement>document.getElementById('mp_multiSelectOpen')).addEventListener(
            'click',
            () => {
                this._openSelected();
            }
        );
        (<HTMLElement>document.getElementById('mp_multiSelectDownload')).addEventListener(
            'click',
            () => {
                this._downloadSelected();
            }
        );
        (<HTMLElement>document.getElementById('mp_multiSelectBookmark')).addEventListener(
            'click',
            () => {
                this._bookmarkSelected();
            }
        );
    }

    private _decorateResults(results: NodeListOf<HTMLTableRowElement>): void {
        results.forEach((result) => {
            if (result.dataset[this._rowFlag] === 'true') {
                return;
            }

            const firstCell: HTMLTableCellElement | null = result.querySelector('td');
            if (firstCell === null) {
                return;
            }

            const boxWrap = document.createElement('span');
            boxWrap.className = 'mp_multiSelectWrap';
            boxWrap.innerHTML = `<input type="checkbox" class="${this._checkboxClass}" aria-label="Select search result">`;
            firstCell.insertBefore(boxWrap, firstCell.firstChild);
            result.dataset[this._rowFlag] = 'true';
        });
    }

    private _selectedResults(): HTMLTableRowElement[] {
        return Array.from(document.querySelectorAll('#ssr tr[id ^= "tdr"]')).filter(
            (row) => {
                const box = row.querySelector(`.${this._checkboxClass}`) as HTMLInputElement | null;
                return box !== null && box.checked;
            }
        ) as HTMLTableRowElement[];
    }

    private _setCheckedState(checked: boolean): void {
        document
            .querySelectorAll(`#ssr .${this._checkboxClass}`)
            .forEach((box) => ((<HTMLInputElement>box).checked = checked));
    }

    private _openSelected(): void {
        this._selectedResults().forEach((row) => {
            const rowID = row.id.match(/^tdr-?(\d+)$/);
            const targetURL =
                rowID !== null
                    ? `${window.location.origin}/t/${rowID[1]}`
                    : (row.querySelector('.torTitle') as HTMLAnchorElement | null)?.href;

            if (targetURL) {
                window.open(targetURL, '_blank');
            }
        });
    }

    private _downloadSelected(): void {
        this._selectedResults().forEach((row) => {
            const downloadLink = row.querySelector('.directDownload') as HTMLAnchorElement | null;
            if (downloadLink !== null) {
                downloadLink.click();
            }
        });
    }

    private _bookmarkSelected(): void {
        this._selectedResults().forEach((row) => {
            const bookmarkLink = row.querySelector(
                'a[id^="torBookmark"]'
            ) as HTMLAnchorElement | null;
            if (bookmarkLink !== null) {
                bookmarkLink.click();
            }
        });
    }

    get settings(): CheckboxSetting {
        return this._settings;
    }

    private _findMassActionsAnchor(): HTMLElement | null {
        const massActions = document.querySelector('#massActions') as HTMLElement | null;
        if (massActions !== null) {
            return massActions;
        }

        const bookmarkActions = document.querySelector('#bookmarkActions') as HTMLElement | null;
        if (bookmarkActions !== null) {
            return bookmarkActions;
        }

        const massActionButton = document.querySelector(
            'button[data-bmType]'
        ) as HTMLButtonElement | null;
        if (massActionButton !== null && massActionButton.parentElement !== null) {
            return massActionButton.parentElement;
        }

        const massActionsLabel = Array.from(document.querySelectorAll('h1, h2, h3, h4, strong')).find(
            (elem) => elem.textContent?.trim().toLowerCase() === 'mass actions'
        ) as HTMLElement | undefined;
        if (massActionsLabel) {
            return massActionsLabel.parentElement as HTMLElement | null;
        }

        return null;
    }
}

/**
 * Adds a browse mass-action button to wedge and download all displayed torrents
 */
class WedgeDownloadDisplayed implements Feature {
    private _batchSize: number = 10;
    private _batchPauseMs: number = 10000;
    private _settings: CheckboxSetting = {
        scope: SettingGroup.Search,
        type: 'checkbox',
        title: 'wedgeDownloadDisplayed',
        desc: `Add a mass-action button to wedge and download all displayed torrents`,
    };
    private _tar: string = '#ssr';
    private _buttonID: string = 'mp_wedgeDownloadDisplayed';

    constructor() {
        Util.startFeature(this._settings, this._tar, ['browse']).then((t) => {
            if (t) {
                this._init();
            }
        });
    }

    private _init(): void {
        this._ensureButton();

        Check.elemObserver('#ssr', () => {
            this._ensureButton();
        });
        Check.elemObserver(
            'body',
            () => {
                this._ensureButton();
            },
            {
                childList: true,
                subtree: true,
            }
        );

        MP.log('[M+] Added the wedge/download displayed torrents button!');
    }

    private _ensureButton(): void {
        const existingButton: HTMLElement | null = document.getElementById(this._buttonID);
        const massActions: HTMLElement | null = this._findMassActionsAnchor();
        if (massActions === null) {
            return;
        }

        if (existingButton !== null) {
            if (existingButton.parentElement !== massActions) {
                massActions.appendChild(existingButton);
            }
            return;
        }

        const button = document.createElement('button');
        button.id = this._buttonID;
        button.type = 'button';
        button.textContent = 'Wedge & Download Displayed';
        button.className = 'mp_plainBtn';
        button.addEventListener('click', async () => {
            const originalText = button.textContent || 'Wedge & Download Displayed';
            button.disabled = true;
            button.textContent = 'Processing...';
            try {
                await this._wedgeDownloadDisplayed(button);
            } finally {
                button.disabled = false;
                button.textContent = originalText;
            }
        });
        massActions.appendChild(button);
    }

    private _displayedResults(): HTMLTableRowElement[] {
        return Array.from(document.querySelectorAll('#ssr tr[id^="tdr"]')).filter((row) => {
            const computedStyle = window.getComputedStyle(row);
            return computedStyle.display !== 'none' && computedStyle.visibility !== 'hidden';
        }) as HTMLTableRowElement[];
    }

    private async _wedgeDownloadDisplayed(button: HTMLButtonElement): Promise<void> {
        const displayedRows = this._displayedResults();
        const downloadRows = displayedRows.filter(
            (row) => row.querySelector('.directDownload, .directDownloadFL') !== null
        );

        if (downloadRows.length === 0) {
            window.alert('No displayed torrents were found to download.');
            return;
        }

        const wedgeRows = downloadRows.filter(
            (row) => row.querySelector('.directDownloadFL') !== null
        );

        const confirmMessage =
            wedgeRows.length > 0
                ? `This will spend ${wedgeRows.length} freeleech wedge${
                      wedgeRows.length === 1 ? '' : 's'
                  } and download ${downloadRows.length} displayed torrent${
                      downloadRows.length === 1 ? '' : 's'
                  }. It will run in batches of ${this._batchSize} with a ${
                      this._batchPauseMs / 1000
                  }-second pause between batches. Continue?`
                : `This will download ${downloadRows.length} displayed torrent${
                      downloadRows.length === 1 ? '' : 's'
                  }. It will run in batches of ${this._batchSize} with a ${
                      this._batchPauseMs / 1000
                  }-second pause between batches. Continue?`;

        if (window.confirm(confirmMessage) === false) {
            return;
        }

        let successCount = 0;
        const failedRows: string[] = [];
        const totalBatches = Math.ceil(downloadRows.length / this._batchSize);

        for (let batchIndex = 0; batchIndex < totalBatches; batchIndex += 1) {
            const batch = downloadRows.slice(
                batchIndex * this._batchSize,
                (batchIndex + 1) * this._batchSize
            );

            for (const row of batch) {
                const wedgeLink = row.querySelector('.directDownloadFL') as HTMLAnchorElement | null;
                const downloadLink = row.querySelector('.directDownload') as HTMLAnchorElement | null;
                const link = wedgeLink || downloadLink;
                if (link !== null) {
                    try {
                        await this._downloadTorrent(link.href, row);
                        successCount += 1;
                    } catch (error) {
                        failedRows.push(this._rowLabel(row));
                        MP.error('[M+] Failed to download row:', row.id, error);
                    }
                    await this._wait(250);
                }
            }

            if (batchIndex < totalBatches - 1) {
                const continueBatch = window.confirm(
                    `Processed batch ${batchIndex + 1} of ${totalBatches}. Continue with the next batch after a ${
                        this._batchPauseMs / 1000
                    }-second pause?`
                );
                if (continueBatch === false) {
                    break;
                }
                await this._countdownPause(button, this._batchPauseMs);
            }
        }

        if (failedRows.length > 0) {
            window.alert(
                `Processed ${successCount} torrent${
                    successCount === 1 ? '' : 's'
                }, but ${failedRows.length} failed: ${failedRows.join(', ')}`
            );
        }
    }

    private async _downloadTorrent(
        url: string,
        row: HTMLTableRowElement
    ): Promise<void> {
        const response = await fetch(url, {
            credentials: 'include',
        });

        if (response.ok === false) {
            throw new Error(`Download request failed: ${response.status}`);
        }

        const blob = await response.blob();
        const objectURL = window.URL.createObjectURL(blob);
        const anchor = document.createElement('a');
        const fileName = this._getDownloadFilename(response, row);

        anchor.href = objectURL;
        anchor.download = fileName;
        anchor.style.display = 'none';
        document.body.appendChild(anchor);
        anchor.click();
        anchor.remove();

        window.setTimeout(() => {
            window.URL.revokeObjectURL(objectURL);
        }, 0);
    }

    private _getDownloadFilename(
        response: Response,
        row: HTMLTableRowElement
    ): string {
        const disposition = response.headers.get('content-disposition');
        if (disposition) {
            const utfMatch = disposition.match(/filename\*=UTF-8''([^;]+)/i);
            if (utfMatch && utfMatch[1]) {
                return decodeURIComponent(utfMatch[1]);
            }

            const plainMatch = disposition.match(/filename="?([^";]+)"?/i);
            if (plainMatch && plainMatch[1]) {
                return plainMatch[1];
            }
        }

        const title = row.querySelector('.torTitle')?.textContent?.trim();
        if (title) {
            return `${title}.torrent`;
        }

        return `${row.id || 'download'}.torrent`;
    }

    private _rowLabel(row: HTMLTableRowElement): string {
        return row.querySelector('.torTitle')?.textContent?.trim() || row.id || 'unknown row';
    }

    private async _wait(ms: number): Promise<void> {
        await new Promise((resolve) => window.setTimeout(resolve, ms));
    }

    private async _countdownPause(
        button: HTMLButtonElement,
        pauseMs: number
    ): Promise<void> {
        const seconds = Math.ceil(pauseMs / 1000);
        for (let remaining = seconds; remaining > 0; remaining -= 1) {
            button.textContent = `Next batch in ${remaining}s...`;
            await this._wait(1000);
        }
        button.textContent = 'Processing...';
    }

    private _findMassActionsAnchor(): HTMLElement | null {
        const massActions = document.querySelector('#massActions') as HTMLElement | null;
        if (massActions !== null) {
            return massActions;
        }

        const bookmarkActions = document.querySelector('#bookmarkActions') as HTMLElement | null;
        if (bookmarkActions !== null) {
            return bookmarkActions;
        }

        const massActionButton = document.querySelector(
            'button[data-bmType]'
        ) as HTMLButtonElement | null;
        if (massActionButton !== null && massActionButton.parentElement !== null) {
            return massActionButton.parentElement;
        }

        const massActionsLabel = Array.from(
            document.querySelectorAll('h1, h2, h3, h4, strong')
        ).find(
            (elem) => elem.textContent?.trim().toLowerCase() === 'mass actions'
        ) as HTMLElement | undefined;
        if (massActionsLabel) {
            return massActionsLabel.parentElement as HTMLElement | null;
        }

        return null;
    }

    get settings(): CheckboxSetting {
        return this._settings;
    }
}

/**
 * Random Book feature to open a new tab/window with a random MAM Book
 */
class RandomBook implements Feature {
    private _settings: CheckboxSetting = {
        scope: SettingGroup.Search,
        type: 'checkbox',
        title: 'randomBook',
        desc: `Add a button to open a randomly selected book page. (<em>Uses the currently selected category in the dropdown</em>)`,
    };
    private _tar: string = '#ssr';

    constructor() {
        Util.startFeature(this._settings, this._tar, ['browse']).then((t) => {
            if (t) {
                this._init();
            }
        });
    }

    private async _init(): Promise<void> {
        let rando: Promise<HTMLElement>;
        const randoText: string = 'Random Book';

        // Queue building the button and getting the results
        await Promise.all([
            (rando = Util.createButton(
                'randomBook',
                randoText,
                'h1',
                '#resetNewIcon',
                'beforebegin',
                'torFormButton'
            )),
        ]);

        rando
            .then((btn) => {
                btn.addEventListener(
                    'click',
                    () => {
                        let countResult: Promise<number>;
                        let categories: string = '';
                        //get the Category dropdown element
                        const catSelection: HTMLSelectElement = <HTMLSelectElement>(
                            document.getElementById('categoryPartial')
                        );
                        //get the value currently selected in Category Dropdown
                        const catValue: string = catSelection!.options[
                            catSelection.selectedIndex
                        ].value;
                        //depending on category selected, create a category string for the JSON GET
                        switch (String(catValue)) {
                            case 'ALL':
                                categories = '';
                                break;
                            case 'defaults':
                                categories = '';
                                break;
                            case 'm13':
                                categories = '&tor[main_cat][]=13';
                                break;
                            case 'm14':
                                categories = '&tor[main_cat][]=14';
                                break;
                            case 'm15':
                                categories = '&tor[main_cat][]=15';
                                break;
                            case 'm16':
                                categories = '&tor[main_cat][]=16';
                                break;
                            default:
                                if (catValue.charAt(0) === 'c') {
                                    categories = '&tor[cat][]=' + catValue.substring(1);
                                }
                        }
                        Promise.all([
                            (countResult = this._getRandomBookResults(categories)),
                        ]);
                        countResult
                            .then((getRandomResult) => {
                                //open new tab with the random book
                                window.open(
                                    'https://www.myanonamouse.net/t/' + getRandomResult,
                                    '_blank'
                                );
                            })
                            .catch((err) => {
                                throw new Error(err);
                            });
                    },
                    false
                );
                MP.log('[M+] Added the Random Book button!');
            })
            .catch((err) => {
                throw new Error(err);
            });
    }

    /**
     * Filters search results
     * @param cat a string containing the categories needed for JSON Get
     */
    private async _getRandomBookResults(cat: string): Promise<number> {
        return new Promise((resolve, reject) => {
            let jsonResult: Promise<string>;
            //URL to GET random search results
            const url = `https://www.myanonamouse.net/tor/js/loadSearchJSONbasic.php?tor[searchType]=all&tor[searchIn]=torrents${cat}&tor[perpage]=5&tor[browseFlagsHideVsShow]=0&tor[startDate]=&tor[endDate]=&tor[hash]=&tor[sortType]=random&thumbnail=true?${Util.randomNumber(
                1,
                100000
            )}`;
            Promise.all([(jsonResult = Util.getJSON(url))]).then(() => {
                jsonResult
                    .then((jsonFull) => {
                        //return the first torrent ID of the random JSON text
                        resolve(JSON.parse(jsonFull).data[0].id);
                    })
                    .catch((err) => {
                        throw new Error(err);
                    });
            });
        });
    }

    get settings(): CheckboxSetting {
        return this._settings;
    }
}
