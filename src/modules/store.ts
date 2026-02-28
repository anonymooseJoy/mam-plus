/**
 * STORE FEATURES
 */

class GrayOutStorePurchases implements Feature {
    private _settings: CheckboxSetting = {
        scope: SettingGroup.Store,
        type: 'checkbox',
        title: 'grayOutStorePurchases',
        desc: "Gray out store purchases you can't afford, and disable those buttons",
    };
    private _tar: string = '#currentBonusPoints';
    private _maxVipDays: number = 90;
    private _pointsPerGbUpload: number = 500;
    private _pointsPerVipBlock: number = 5000;
    private _vipBlockWeeks: number = 4;

    constructor() {
        Util.startFeature(this._settings, this._tar, ['store']).then((t) => {
            if (t) {
                this._init();
            }
        });
    }

    private _init() {
        const points = this._getCurrency('#currentBonusPoints');
        const cheese = this._getCurrency('#currentCheese');
        const vipRemainingDays = this._getVipRemainingDays();
        const buttons = document.querySelectorAll(
            '#mainBody .bonusRow button'
        ) as NodeListOf<HTMLButtonElement>;

        buttons.forEach((button) => {
            const reason = this._getDisableReason(
                button,
                points,
                cheese,
                vipRemainingDays
            );

            if (reason !== null) {
                this._disablePurchase(button, reason);
            }
        });

        this._markDisabledSections();
        console.log("[M+] Disabled store purchases you can't afford!");
    }

    private _getCurrency(selector: string): number {
        const elem = document.querySelector(selector);
        if (elem === null || elem.textContent === null) {
            return 0;
        }

        return parseInt(elem.textContent.replace(/[^\d]/g, ''), 10) || 0;
    }

    private _getVipRemainingDays(): number | null {
        const userMenu = document.querySelector('#userMenu + ul');
        const menuText = userMenu && userMenu.textContent ? userMenu.textContent : '';

        if (/E-VIP|VIP not set to expire|eternal/i.test(menuText)) {
            return Number.POSITIVE_INFINITY;
        }

        const dateMatch = menuText.match(
            /VIP expires(?:\s+on)?\s+([A-Za-z]{3,9}\s+\d{1,2},?\s+\d{4}|\d{4}-\d{2}-\d{2})/i
        );

        if (dateMatch === null) {
            return null;
        }

        const expiry = new Date(dateMatch[1]);
        if (isNaN(expiry.getTime())) {
            return null;
        }

        return Math.max(
            0,
            Math.ceil((expiry.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
        );
    }

    private _getDisableReason(
        button: HTMLButtonElement,
        points: number,
        cheese: number,
        vipRemainingDays: number | null
    ): string | null {
        const section = this._getStoreSection(button);
        const fixedCost = this._getFixedCost(button);

        if (fixedCost !== null) {
            if (fixedCost.kind === 'points' && fixedCost.amount > points) {
                return 'Not enough bonus points';
            }

            if (fixedCost.kind === 'cheese' && fixedCost.amount > cheese) {
                return 'Not enough cheese';
            }
        }

        if (section === 'uploadCreditContent' && this._isUploadMaxButton(button)) {
            if (points < this._pointsPerGbUpload) {
                return 'Need at least 500 bonus points';
            }
        }

        if (section === 'vipStatusContent') {
            if (vipRemainingDays === Number.POSITIVE_INFINITY) {
                return 'Eternal VIP cannot buy more VIP';
            }

            if (
                this._wouldExceedVipLimit(button, vipRemainingDays) &&
                vipRemainingDays !== null
            ) {
                return 'Would exceed the 90 day VIP limit';
            }

            if (this._isVipMaxButton(button) && points < this._pointsPerVipBlock) {
                return 'Need at least 5000 bonus points';
            }
        }

        return null;
    }

    private _getStoreSection(button: HTMLButtonElement): string {
        const section = button.closest('div.bonusRow');

        if (section === null) {
            return '';
        }

        const classes = Array.from(section.classList);
        const contentClass = classes.find((item) => item.endsWith('Content'));

        return contentClass !== undefined ? contentClass : '';
    }

    private _getFixedCost(
        button: HTMLButtonElement
    ): { kind: 'points' | 'cheese'; amount: number } | null {
        const title = button.getAttribute('title');

        if (title === null) {
            return null;
        }

        const points = title.match(/([\d,]+)\s+points/i);
        if (points !== null) {
            return {
                kind: 'points',
                amount: parseInt(points[1].replace(/,/g, ''), 10),
            };
        }

        const cheese = title.match(/([\d,]+)\s+cheese/i);
        if (cheese !== null) {
            return {
                kind: 'cheese',
                amount: parseInt(cheese[1].replace(/,/g, ''), 10),
            };
        }

        return null;
    }

    private _isUploadMaxButton(button: HTMLButtonElement): boolean {
        return button.textContent !== null && button.textContent.indexOf('Max') > -1;
    }

    private _isVipMaxButton(button: HTMLButtonElement): boolean {
        return button.value === 'max';
    }

    private _wouldExceedVipLimit(
        button: HTMLButtonElement,
        vipRemainingDays: number | null
    ): boolean {
        if (vipRemainingDays === null) {
            return false;
        }

        if (this._isVipMaxButton(button)) {
            return vipRemainingDays >= this._maxVipDays;
        }

        const weeksToBuy = parseInt(button.value, 10);
        if (isNaN(weeksToBuy)) {
            return false;
        }

        const daysToBuy = weeksToBuy * 7;
        return vipRemainingDays + daysToBuy > this._maxVipDays;
    }

    private _disablePurchase(button: HTMLButtonElement, reason: string) {
        button.disabled = true;
        button.classList.add('mp_store_disabled');
        button.setAttribute('aria-disabled', 'true');
        button.style.pointerEvents = 'none';

        const currentTitle = button.getAttribute('title');
        if (currentTitle !== null && currentTitle.indexOf(reason) === -1) {
            button.setAttribute('title', `${currentTitle} | ${reason}`);
        } else if (currentTitle === null) {
            button.setAttribute('title', reason);
        }
    }

    private _markDisabledSections() {
        const sections = document.querySelectorAll(
            '#mainBody div.bonusRow[class*="Content"]'
        ) as NodeListOf<HTMLDivElement>;

        sections.forEach((section) => {
            const buttons = section.querySelectorAll('button');
            if (buttons.length === 0) {
                return;
            }

            const enabled = Array.from(buttons).some((button) => !button.disabled);
            if (!enabled) {
                section.classList.add('mp_store_disabled_section');
            }
        });
    }

    get settings(): CheckboxSetting {
        return this._settings;
    }
}
