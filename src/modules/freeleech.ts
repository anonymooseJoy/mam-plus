/**
 * FREELEECH FEATURES
 */

class CollapseFreeleechSections implements Feature {
    private _settings: CheckboxSetting = {
        scope: SettingGroup.Other,
        type: 'checkbox',
        title: 'collapseFreeleechSections',
        desc: 'Collapse Freeleech category sections and add quick-jump links',
    };
    private _tar: string = '#mainBody div[id^="fl_cat_"]';
    private _sectionContents: { [key: string]: HTMLElement[] } = {};

    constructor() {
        Util.startFeature(this._settings, this._tar, ['freeleech']).then((t) => {
            if (t) {
                this._init();
            }
        });
    }

    private _init() {
        const sections = Array.from(
            document.querySelectorAll(this._tar)
        ) as HTMLDivElement[];

        if (sections.length === 0) {
            console.warn('[M+] Could not find freeleech sections to collapse.');
            return;
        }

        const listBlock = sections[0].closest('.blockCon');
        if (listBlock !== null) {
            this._normalizeLayout(listBlock);
            this._buildToolbar(listBlock, sections);
        }

        sections.forEach((section) => this._collapseSection(section));
        console.log('[M+] Collapsed freeleech sections!');
    }

    private _normalizeLayout(listBlock: Element) {
        const blockBody = listBlock.querySelector('.blockBodyCon') as HTMLDivElement | null;
        const mainBody = document.querySelector('#mainBody') as HTMLDivElement | null;

        if (mainBody !== null) {
            mainBody.style.textAlign = 'left';
        }

        if (blockBody !== null) {
            blockBody.style.textAlign = 'left';
            blockBody.style.width = '100%';
            blockBody.style.maxWidth = '100%';
            blockBody.style.boxSizing = 'border-box';
        }

        (listBlock as HTMLDivElement).style.width = '100%';
        (listBlock as HTMLDivElement).style.maxWidth = '98%';
        (listBlock as HTMLDivElement).style.boxSizing = 'border-box';
    }

    private _buildToolbar(listBlock: Element, sections: HTMLDivElement[]) {
        const toolbar = document.createElement('div');
        toolbar.className = 'mp_fl_toolbar';
        toolbar.style.marginBottom = '15px';

        const toggleAll = document.createElement('div');
        toggleAll.className = 'mp_plainBtn mp_fl_toggle_all';
        toggleAll.role = 'button';
        toggleAll.textContent = 'Expand All';

        const toc = document.createElement('div');
        toc.className = 'mp_fl_toc';
        toc.style.display = 'flex';
        toc.style.flexWrap = 'wrap';
        toc.style.gap = '6px';
        toc.style.marginTop = '8px';

        sections.forEach((section) => {
            const header = section.querySelector('a.biglink');
            if (header === null || header.textContent === null) {
                return;
            }

            const item = document.createElement('a');
            item.className = 'mp_plainBtn mp_fl_toc_item';
            item.href = `#${section.id}`;
            item.textContent = header.textContent.trim();
            item.style.marginRight = '6px';
            item.style.marginBottom = '6px';
            item.style.whiteSpace = 'nowrap';
            toc.appendChild(item);
        });

        toggleAll.addEventListener('click', () => {
            const shouldOpen = toggleAll.textContent === 'Expand All';
            sections.forEach((section) => this._setOpenState(section, shouldOpen));
            toggleAll.textContent = shouldOpen ? 'Collapse All' : 'Expand All';
        });

        toolbar.appendChild(toggleAll);
        toolbar.appendChild(toc);
        listBlock.insertAdjacentElement('beforebegin', toolbar);
    }

    private _collapseSection(section: HTMLDivElement) {
        const header = section.querySelector('a.biglink') as HTMLAnchorElement | null;

        if (header === null) {
            return;
        }

        section.classList.add('mp_fl_section');
        section.style.scrollMarginTop = '80px';
        section.style.display = 'block';
        section.style.width = '100%';
        section.style.boxSizing = 'border-box';

        const content = Array.from(section.children).filter(
            (child) => child !== header
        ) as HTMLElement[];

        this._sectionContents[section.id] = content;

        const toggle = document.createElement('div');
        toggle.className = 'mp_plainBtn mp_fl_toggle';
        toggle.role = 'button';
        toggle.style.display = 'inline-block';
        toggle.style.marginLeft = '8px';

        toggle.addEventListener('click', (event) => {
            event.preventDefault();
            this._setOpenState(section, !section.classList.contains('mp_fl_open'));
        });

        header.insertAdjacentElement('afterend', toggle);
        this._setOpenState(section, false);
    }

    private _setOpenState(section: HTMLDivElement, open: boolean) {
        const toggle = section.querySelector('.mp_fl_toggle') as HTMLDivElement | null;
        const content = this._sectionContents[section.id];

        if (toggle === null || content === undefined) {
            return;
        }

        if (open) {
            section.classList.add('mp_fl_open');
            content.forEach((elem) => {
                elem.style.display = '';
            });
            toggle.textContent = 'Hide';
        } else {
            section.classList.remove('mp_fl_open');
            content.forEach((elem) => {
                elem.style.display = 'none';
            });
            toggle.textContent = 'Show';
        }
    }

    get settings(): CheckboxSetting {
        return this._settings;
    }
}
