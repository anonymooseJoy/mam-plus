/**
 * ### Adds ability to gift newest 10 members to MAM on Homepage or open their user pages
 */
class GiftNewest implements Feature {
    /* TODO: Refactor code to reduce duplication. */
    private _settings: CheckboxSetting = {
        scope: SettingGroup.Home,
        type: 'checkbox',
        title: 'giftNewest',
        desc: `Add buttons to Gift/Open all newest members`,
    };
    private _tar: string = '#mainTable';
    private _giftedStoreKey: string = 'mp_lastNewGifted';
    private _giftedStoreLimit: number = 500;

    constructor() {
        Util.startFeature(this._settings, this._tar, ['home', 'new users']).then((t) => {
            if (t) {
                this._init();
            }
        });
    }

    /**
     * * Decide which page to run on
     */
    private _init() {
        Check.page().then((page:ValidPage) => {
            if(MP.DEBUG) MP.log('User gifting init on',page);

            if(page === 'home'){
                this._homePageGifting();
            }else if(page === 'new users'){
                this._newUsersPageGifting();
            }
        })
    }

    private _getAvailableBonusPointsText(): string {
        const bonusPointElem =
            document.getElementById('tmBP') || document.getElementById('bonusLink');

        if (!bonusPointElem || !bonusPointElem.textContent) {
            return 'Bonus: unavailable';
        }

        let bonusPointsAvail = bonusPointElem.textContent.trim();

        if (bonusPointsAvail.indexOf('(') >= 0) {
            bonusPointsAvail = bonusPointsAvail.substring(
                0,
                bonusPointsAvail.indexOf('(')
            ).trim();
        }

        return bonusPointsAvail;
    }

    private _getAvailableBonusPointsValue(): number {
        const bonusPointText = this._getAvailableBonusPointsText();
        const match = bonusPointText.match(/[\d,]+/);

        if (match === null) {
            return 0;
        }

        return parseInt(match[0].replace(/,/g, ''));
    }

    /**
     * * Function that runs on the Home page
     */
    private async _homePageGifting() {
        //ensure gifted list is under 500 member names long
        this._trimGiftList();
        Util.getRecentPointGifts();
        //get the FrontPage NewMembers element containing newest 10 members
        const fpNM = <HTMLDivElement>document.querySelector('#fpNM');
        const members: HTMLAnchorElement[] = Array.prototype.slice.call(
            fpNM.getElementsByTagName('a')
        );
        const lastMem = members[members.length - 1];
        members.forEach((member) => {
            //add a class to the existing element for use in reference in creating buttons
            member.classList.add(`mp_refPoint_${Util.endOfHref(member)}`);
            this._markKnownGiftStatus(member);
        });
        //get the default value of gifts set in preferences for user page
        let giftValueSetting: string | undefined = GM_getValue('userGiftDefault_val');
        //make sure the value falls within the acceptable range
        // TODO: Make the gift value check into a Util
        if (!giftValueSetting) {
            giftValueSetting = '100';
        } else if (Number(giftValueSetting) > 100 || isNaN(Number(giftValueSetting))) {
            giftValueSetting = '100';
        } else if (Number(giftValueSetting) < 5) {
            giftValueSetting = '5';
        }
        //create the text input for how many points to give
        const giftAmounts: HTMLInputElement = document.createElement('input');
        Util.setAttr(giftAmounts, {
            type: 'text',
            size: '3',
            id: 'mp_giftAmounts',
            title: 'Value between 5 and 100',
            value: giftValueSetting,
        });
        //insert the text box after the last members name
        lastMem.insertAdjacentElement('afterend', giftAmounts);

        //make the button and insert after the last members name (before the input text)
        const giftAllBtn = await Util.createButton(
            'giftAll',
            'Gift All: ',
            'button',
            `.mp_refPoint_${Util.endOfHref(lastMem)}`,
            'afterend',
            'mp_btn'
        );
        //add a space between button and text
        giftAllBtn.style.marginRight = '5px';
        giftAllBtn.style.marginTop = '5px';

        giftAllBtn.addEventListener(
            'click',
            async () => {
                let firstCall: boolean = true;
                let skippedCount = 0;
                for (const member of members) {
                    //update the text to show processing
                    document.getElementById('mp_giftAllMsg')!.innerText =
                        'Sending Gifts... Please Wait';
                    //if user has not been gifted
                    if (!member.classList.contains('mp_gifted')) {
                        //get the members name for JSON string
                        const userName = member.innerText;
                        //get the points amount from the input box
                        const giftFinalAmount = Number((<HTMLInputElement>(
                            document.getElementById('mp_giftAmounts')
                        ))!.value);
                        const memberID = Util.endOfHref(member)!;
                        const remainingAllowance = Util.getRemainingPointGiftAllowance(
                            memberID
                        );

                        if (remainingAllowance < giftFinalAmount) {
                            skippedCount += 1;
                            MP.warn(
                                `[M+] Skipping ${userName}; ${remainingAllowance} points remaining today.`
                            );
                            if (remainingAllowance === 0) {
                                this._markGiftedMember(
                                    member,
                                    'Maximum daily points already sent today'
                                );
                            }
                            continue;
                        }
                        //URL to GET random search results
                        const url = `https://www.myanonamouse.net/json/bonusBuy.php?spendtype=gift&amount=${giftFinalAmount}&giftTo=${userName}`;
                        //wait 3 seconds between JSON calls
                        if (firstCall) {
                            firstCall = false;
                        } else {
                            await Util.sleep(3000);
                        }
                        //request sending points
                        const jsonResult: string = await Util.getJSON(url);
                        if (MP.DEBUG) MP.log('Gift Result', jsonResult);
                        const json = JSON.parse(jsonResult);
                        //if gift was successfully sent
                        if (json.success) {
                            this._recordSuccessfulGift(member, giftFinalAmount);
                        } else if (!json.success) {
                            MP.warn(json.error);
                        }
                    }
                }

                //disable button after send
                (giftAllBtn as HTMLInputElement).disabled = true;
                document.getElementById('mp_giftAllMsg')!.innerText =
                    skippedCount > 0
                        ? `Gifts completed. Skipped ${skippedCount} over daily limit.`
                        : 'Gifts completed to all Checked Users';
            },
            false
        );

        //newline between elements
        members[members.length - 1].after(document.createElement('br'));
        //listen for changes to the input box and ensure its between 5 and 1000, if not disable button
        document.getElementById('mp_giftAmounts')!.addEventListener('input', () => {
            const valueToNumber: String = (<HTMLInputElement>(
                document.getElementById('mp_giftAmounts')
            ))!.value;
            const giftAll = <HTMLInputElement>document.getElementById('mp_giftAll');

            if (
                Number(valueToNumber) > 1000 ||
                Number(valueToNumber) < 5 ||
                isNaN(Number(valueToNumber))
            ) {
                giftAll.disabled = true;
                giftAll.setAttribute('title', 'Disabled');
            } else {
                giftAll.disabled = false;
                giftAll.setAttribute('title', `Gift All ${valueToNumber}`);
            }
        });
        //add a button to open all ungifted members in new tabs
        const openAllBtn = await Util.createButton(
            'openTabs',
            'Open Ungifted In Tabs',
            'button',
            '[id=mp_giftAmounts]',
            'afterend',
            'mp_btn'
        );

        openAllBtn.setAttribute('title', 'Open new tab for each');
        openAllBtn.addEventListener(
            'click',
            () => {
                for (const member of members) {
                    if (!member.classList.contains('mp_gifted')) {
                        window.open(member.href, '_blank');
                    }
                }
            },
            false
        );
        //get the current amount of bonus points available to spend
        const bonusPointsAvail = this._getAvailableBonusPointsText();
        //recreate the bonus points in new span and insert into fpNM
        const messageSpan: HTMLElement = document.createElement('span');
        messageSpan.setAttribute('id', 'mp_giftAllMsg');
        messageSpan.innerText = 'Available ' + bonusPointsAvail;
        document.getElementById('mp_giftAmounts')!.after(messageSpan);
        document.getElementById('mp_giftAllMsg')!.after(document.createElement('br'));
        document
            .getElementById('mp_giftAllMsg')!
            .insertAdjacentHTML('beforebegin', '<br>');
        MP.log(`[M+] Adding gift new members button to Home page...`);
    }

    /**
     * * Function that runs on the New Users page
     */
    private async _newUsersPageGifting() {
        // Ensure the gifted list is under 500 members
        this._trimGiftList();
        Util.getRecentPointGifts();

        const fpNM = this._getNewUsersContainer();
        const footer = this._getNewUsersFooter(fpNM);

        if (!fpNM || !footer) {
            MP.warn('[M+] Unable to find the New Users gifting container/footer.');
            return;
        }

        const memberLabels = this._getNewUsersMembers(fpNM);

        // Loop through each member and check if they were previously gifted
        memberLabels.forEach(({ member }) => {
            const memberRef = `mp_refPoint_${Util.endOfHref(member)}`;
            member.classList.add(memberRef);
            this._markKnownGiftStatus(member);
        });

        // Retrieve or default the gift value setting
        let giftValueSetting = GM_getValue('userGiftDefault_val') || '100';
        giftValueSetting = Math.min(100, Math.max(5, Number(giftValueSetting))) || 100;

        // Create input box for gift amount
        const giftAmounts = document.createElement('input');
        Util.setAttr(giftAmounts, {
            type: 'text',
            size: '3',
            id: 'mp_giftAmounts',
            title: 'Value between 5 and 100',
            value: String(giftValueSetting),
        });
        let bpText = document.createElement('span');
        bpText.innerText = 'points ';

        // Create "Gift All Checked Users" button
        const giftAllBtn = await Util.createButton(
            'mp_giftAll',
            'Gift All Selected',
            'button',
            footer,
            'afterend',
            'mp_btn'
        );
        giftAllBtn.style.marginRight = '5px';
        giftAllBtn.style.marginTop = '5px';

        // Event listener for gifting action
        giftAllBtn.addEventListener('click', async () => {
            document.getElementById('mp_giftAllMsg')!.innerText = 'Sending Gifts... Please Wait';
            let firstCall = true;
            let skippedCount = 0;
            const giftAmount = Number(
                (document.getElementById('mp_giftAmounts') as HTMLInputElement).value
            );

            for (const { member, checkbox } of memberLabels) {
                if (checkbox.checked && !member.classList.contains('mp_gifted')) {
                    const userName = member.innerText;
                    const memberID = Util.endOfHref(member)!;
                    const remainingAllowance = Util.getRemainingPointGiftAllowance(
                        memberID
                    );

                    if (remainingAllowance < giftAmount) {
                        skippedCount += 1;
                        MP.warn(
                            `[M+] Skipping ${userName}; ${remainingAllowance} points remaining today.`
                        );
                        if (remainingAllowance === 0) {
                            this._markGiftedMember(
                                member,
                                'Maximum daily points already sent today'
                            );
                        }
                        continue;
                    }

                    const url = `https://www.myanonamouse.net/json/bonusBuy.php?spendtype=gift&amount=${giftAmount}&giftTo=${userName}`;

                    if (!firstCall) await Util.sleep(3000);
                    firstCall = false;

                    const jsonResult = await Util.getJSON(url);
                    if (MP.DEBUG) MP.log('Gift Result', jsonResult);
                    const json = JSON.parse(jsonResult);

                    if (json.success) {
                        this._recordSuccessfulGift(member, giftAmount);
                    } else {
                        MP.warn(json.error);
                    }
                }
            }

            (giftAllBtn as HTMLButtonElement).disabled = true;
            document.getElementById('mp_giftAllMsg')!.innerText =
                skippedCount > 0
                    ? `Gifts completed. Skipped ${skippedCount} over daily limit.`
                    : 'Gifts completed to all Checked Users';
        });

        // Input validation for gift amount
        giftAmounts.addEventListener('input', () => {
            const giftAllBtn = document.getElementById('mp_giftAll') as HTMLButtonElement;
            const value = Number(giftAmounts.value);

            if (value < 5 || value > 100 || isNaN(value)) {
                giftAllBtn.disabled = true;
                giftAllBtn.title = 'Disabled';
            } else {
                giftAllBtn.disabled = false;
                giftAllBtn.title = `Gift All ${value}`;
            }
        });

        // Create "Open Ungifted in Tabs" button
        const openAllBtn = await Util.createButton(
            'mp_openTabs',
            'Open Ungifted in Tabs',
            'button',
            footer,
            'afterend',
            'mp_btn'
        );
        openAllBtn.title = 'Open a new tab for each ungifted member';
        openAllBtn.addEventListener('click', () => {
            for (const { member, checkbox } of memberLabels) {
                if (checkbox.checked && !member.classList.contains('mp_gifted')) {
                    window.open(member.href, '_blank');
                }
            }
        });

        // Display available bonus points in the footer
        const bonusPointsAvail = this._getAvailableBonusPointsText().replace(/^Bonus:\s*/i, '');
        const messageSpan = document.createElement('span');
        messageSpan.id = 'mp_giftAllMsg';
        messageSpan.innerText = ` Available Points: ${bonusPointsAvail}`;

        // Add "Deselect All" button
        const deselectBtn = await Util.createButton(
            'mp_deselectAll',
            'Unselect all',
            'button',
            footer,
            'afterend',
            'mp_btn'
        );
        deselectBtn.addEventListener('click', () => {
            const boxList: NodeListOf<HTMLInputElement> | void = document.querySelectorAll('input[type=checkbox]')

            boxList.forEach((box: HTMLInputElement) => {
                box.checked = false;
            });
        });

        // Add "Select 100 Ungifted" button
        const selectUngiftedBtn = await Util.createButton(
            'mp_selectUngifted',
            'Select 100 Ungifted',
            'button',
            footer,
            'afterend',
            'mp_btn'
        );
        selectUngiftedBtn.title = 'Select the first 100 ungifted users';
        selectUngiftedBtn.addEventListener('click', () => {
            let count = 0;
            for (const { member, checkbox } of memberLabels) {
                // Check if the member is not gifted and if the checkbox is not yet selected
                if (!member.classList.contains('mp_gifted') && !checkbox.checked) {
                    checkbox.checked = true;  // Select the checkbox
                    count++;
                    // Stop after selecting 100 users
                    if (count >= 100) break;
                }
            }
            MP.log(`[M+] Selected ${count} ungifted users.`);
        });

        // Add "Select Max Ungifted" button
        const selectMaxUngiftedBtn = await Util.createButton(
            'mp_selectMaxUngifted',
            'Select Max Ungifted',
            'button',
            footer,
            'afterend',
            'mp_btn'
        );
        selectMaxUngiftedBtn.title =
            'Select the maximum number of ungifted users you can afford at the current gift size';
        selectMaxUngiftedBtn.addEventListener('click', () => {
            const giftAmount = Number(giftAmounts.value);
            const availablePoints = this._getAvailableBonusPointsValue();

            if (giftAmount < 5 || giftAmount > 100 || isNaN(giftAmount) || giftAmount === 0) {
                MP.warn('[M+] Cannot select max ungifted users; gift amount is invalid.');
                return;
            }

            const maxSelectable = Math.floor(availablePoints / giftAmount);
            let count = 0;

            for (const { checkbox } of memberLabels) {
                checkbox.checked = false;
            }

            for (const { member, checkbox } of memberLabels) {
                if (!member.classList.contains('mp_gifted') && count < maxSelectable) {
                    checkbox.checked = true;
                    count++;
                }
            }

            MP.log(
                `[M+] Selected ${count} ungifted users using ${availablePoints} available points at ${giftAmount} points each.`
            );
        });

        // Append all elements to the footer
        footer.appendChild(selectMaxUngiftedBtn);
        footer.appendChild(selectUngiftedBtn);
        footer.appendChild(deselectBtn);
        footer.appendChild(giftAmounts);
        footer.appendChild(bpText);
        footer.appendChild(giftAllBtn);
        footer.appendChild(openAllBtn);
        footer.appendChild(messageSpan);

        MP.log('[M+] Added gifting options to the footer of the page.');
    }

    private _getNewUsersContainer(): HTMLDivElement | null {
        const blockContainers = Array.from(
            document.querySelectorAll('.blockCon')
        ) as HTMLDivElement[];

        return (
            blockContainers.find(
                (container) => this._getNewUsersMembers(container).length > 0
            ) || null
        );
    }

    private _getNewUsersFooter(container: HTMLDivElement): HTMLDivElement | null {
        const footerInContainer = container.querySelector('.blockFoot') as HTMLDivElement | null;
        if (footerInContainer) {
            return footerInContainer;
        }

        let sibling = container.nextElementSibling;
        while (sibling) {
            if (sibling instanceof HTMLDivElement && sibling.classList.contains('blockFoot')) {
                return sibling;
            }

            if (sibling instanceof HTMLDivElement && sibling.classList.contains('blockCon')) {
                break;
            }

            sibling = sibling.nextElementSibling;
        }

        return null;
    }

    /**
     * * Trims the gifted list to last 500 names to avoid getting too large over time.
     */
    private _trimGiftList() {
        this._setGiftedUsers(this._getGiftedUsers());
    }

    private _getGiftedUsers(): string[] {
        const storedGiftedUsers: string | undefined = GM_getValue(this._giftedStoreKey);

        if (storedGiftedUsers === undefined || storedGiftedUsers === '') {
            return [];
        }

        return storedGiftedUsers
            .split(',')
            .map((giftedUser) => giftedUser.trim())
            .filter((giftedUser, index, allGiftedUsers) => {
                return giftedUser !== '' && allGiftedUsers.indexOf(giftedUser) === index;
            });
    }

    private _setGiftedUsers(giftedUsers: string[]): void {
        GM_setValue(
            this._giftedStoreKey,
            giftedUsers.slice(0, this._giftedStoreLimit).join(',')
        );
    }

    private _storeGiftedMember(memberID: string): void {
        const giftedUsers = this._getGiftedUsers().filter(
            (giftedUser) => giftedUser !== memberID
        );
        giftedUsers.unshift(memberID);
        this._setGiftedUsers(giftedUsers);
    }

    private _markMemberGifted(member: HTMLAnchorElement): void {
        if (!member.classList.contains('mp_gifted')) {
            member.innerText = `${member.innerText} ✅`;
            member.classList.add('mp_gifted');
        }
    }

    private _getNewUsersMembers(
        container: HTMLDivElement
    ): Array<{ label: HTMLLabelElement; member: HTMLAnchorElement; checkbox: HTMLInputElement }> {
        return Array.from(container.querySelectorAll('label')).reduce(
            (memberRows, label) => {
                const member = label.querySelector('a');
                const checkbox = label.querySelector('input[type="checkbox"]');

                if (
                    member instanceof HTMLAnchorElement &&
                    checkbox instanceof HTMLInputElement
                ) {
                    memberRows.push({ label, member, checkbox });
                }

                return memberRows;
            },
            [] as Array<{
                label: HTMLLabelElement;
                member: HTMLAnchorElement;
                checkbox: HTMLInputElement;
            }>
        );
    }

    /**
     * * Add the gifted styling once without duplicating the checkmark text
     */
    private _markGiftedMember(member: HTMLAnchorElement, title?: string) {
        if (!member.classList.contains('mp_gifted')) {
            member.innerText = `${member.innerText} ✅`;
            member.classList.add('mp_gifted');
        }

        if (title) {
            member.title = title;
        }
    }

    /**
     * * Mark users already known as gifted, either from the legacy list or today's cache
     */
    private _markKnownGiftStatus(member: HTMLAnchorElement) {
        const memberID = Util.endOfHref(member);
        if (!memberID) {
            return;
        }

        if (this._getGiftedUsers().includes(memberID)) {
            this._markGiftedMember(member);
        }

        if (Util.getRemainingPointGiftAllowance(memberID) === 0) {
            this._markGiftedMember(member, 'Maximum daily points already sent today');
        }
    }

    /**
     * * Keep legacy tracking and the new daily cache in sync after a successful gift
     */
    private _recordSuccessfulGift(member: HTMLAnchorElement, amount: number) {
        this._markGiftedMember(member);
        this._storeGiftedMember(Util.endOfHref(member)!);
        Util.recordPointGift(Util.endOfHref(member)!, amount);
    }

    get settings(): CheckboxSetting {
        return this._settings;
    }
}

/**
 * ### Adds ability to hide news items on the page
 */
class HideNews implements Feature {
    private _settings: CheckboxSetting = {
        scope: SettingGroup.Home,
        title: 'hideNews',
        type: 'checkbox',
        desc: 'Tidy the homepage and allow News to be hidden',
    };
    private _tar: string = '.mainPageNewsHead';
    private _valueTitle: string = `mp_${this._settings.title}_val`;
    private _icon = '\u274e';
    constructor() {
        Util.startFeature(this._settings, this._tar, ['home']).then((t) => {
            if (t) {
                this._init();
            }
        });
    }

    private async _init() {
        // NOTE: for development
        // GM_deleteValue(this._valueTitle);MP.warn(`Value of ${this._valueTitle} will be deleted!`);

        this._removeClock();
        this._removeDisclaimer();
        this._adjustHeaderSize(this._tar);
        await this._checkForSeen();
        this._addHiderButton();
        // this._cleanValues(); // FIX: Not working as intended

        MP.log('[M+] Cleaned up the home page!');
    }

    _checkForSeen = async (): Promise<void> => {
        const prevValue: string | undefined = GM_getValue(this._valueTitle);
        const news = this._getNewsItems();
        if (MP.DEBUG) MP.log(this._valueTitle, ':\n', prevValue);

        if (prevValue && news) {
            // Use the icon to split out the known hidden messages
            const hiddenArray = prevValue.split(this._icon);
            /* If any of the hidden messages match a current message
                remove the current message from the DOM */
            hiddenArray.forEach((hidden) => {
                news.forEach((entry) => {
                    if (entry.textContent === hidden) {
                        entry.remove();
                    }
                });
            });
            // If there are no current messages, hide the header
            if (!document.querySelector('.mainPageNewsSub')) {
                this._adjustHeaderSize(this._tar, false);
            }
        } else {
            return;
        }
    };

    _removeClock = () => {
        const clock: HTMLDivElement | null = document.querySelector('#mainBody .fpTime');
        if (clock) clock.remove();
    };

    _removeDisclaimer = () => {
        const disclaimerHeader = Array.from(
            document.querySelectorAll('#mainBody .blockHeadCon h4')
        ).find((header) => header.textContent?.trim() === 'Disclaimer');
        const disclaimerBlock = disclaimerHeader?.closest('.blockCon') as HTMLDivElement | null;

        if (disclaimerBlock) disclaimerBlock.remove();
    };

    _adjustHeaderSize = (selector: string, visible?: boolean) => {
        const newsHeader: HTMLHeadingElement | null = document.querySelector(selector);
        if (newsHeader) {
            if (visible === false) {
                newsHeader.style.display = 'none';
            } else {
                newsHeader.style.fontSize = '2em';
            }
        }
    };

    _addHiderButton = () => {
        const news = this._getNewsItems();
        if (!news) return;

        // Loop over each news entry
        news.forEach((entry) => {
            // Create a button
            const xbutton = document.createElement('div');
            xbutton.textContent = this._icon;
            Util.setAttr(xbutton, {
                style: 'display:inline-block;margin-right:0.7em;cursor:pointer;',
                class: 'mp_clearBtn',
            });
            // Listen for clicks
            xbutton.addEventListener('click', () => {
                // When clicked, append the content of the current news post to the
                // list of remembered news items
                const previousValue: string | undefined = GM_getValue(this._valueTitle)
                    ? GM_getValue(this._valueTitle)
                    : '';
                if (MP.DEBUG)
                    MP.log(`Hiding... ${previousValue}${entry.textContent}`);

                GM_setValue(this._valueTitle, `${previousValue}${entry.textContent}`);
                entry.remove();
                // If there are no more news items, remove the header
                const updatedNews = this._getNewsItems();

                if (updatedNews && updatedNews.length < 1) {
                    this._adjustHeaderSize(this._tar, false);
                }
            });

            // Add the button as the first child of the entry
            if (entry.firstChild) entry.firstChild.before(xbutton);
        });
    };

    _cleanValues = (num = 3) => {
        let value: string | undefined = GM_getValue(this._valueTitle);
        if (MP.DEBUG) MP.log(`GM_getValue(${this._valueTitle})`, value);
        if (value) {
            // Return the last 3 stored items after splitting them at the icon
            value = Util.arrayToString(value.split(this._icon).slice(0 - num));
            // Store the new value
            GM_setValue(this._valueTitle, value);
        }
    };

    _getNewsItems = (): NodeListOf<HTMLDivElement> | null => {
        return document.querySelectorAll('div[class^="mainPageNews"]');
    };

    // This must match the type selected for `this._settings`
    get settings(): CheckboxSetting {
        return this._settings;
    }
}
