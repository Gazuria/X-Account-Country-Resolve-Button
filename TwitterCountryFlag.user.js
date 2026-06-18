// ==UserScript==
// @name         X Country Flag Button
// @namespace    http://tampermonkey.net/
// @version      1.1
// @description  Adds a country flag to Twitter/X users based on their "Account based in" location.
// @author       Gazu and Codex
// @homepage     https://github.com/Gazuria/X-Account-Country-Resolve-Button
// @supportURL   https://github.com/Gazuria/X-Account-Country-Resolve-Button/issues
// @updateURL    https://raw.githubusercontent.com/Gazuria/X-Account-Country-Resolve-Button/main/TwitterCountryFlag.user.js
// @downloadURL  https://raw.githubusercontent.com/Gazuria/X-Account-Country-Resolve-Button/main/TwitterCountryFlag.user.js
// @match        https://twitter.com/*
// @match        https://x.com/*
// @grant        GM_xmlhttpRequest
// @grant        GM_setValue
// @grant        GM_getValue
// @connect      api.twitter.com
// @connect      api.x.com
// ==/UserScript==

(function () {
    'use strict';

    const QUERY_ID = 'zs_jFPFT78rBpXv9Z3U2YQ'; // From Data.txt
    const CACHE_duration = 24 * 60 * 60 * 1000; // 24 hours
    const NOTE_PREFIX = 'user-note:';
    const MAX_VISIBLE_NOTE_LENGTH = 48;

    // Comprehensive Country to Flag Mapping
    const countryFlags = {
        "Afghanistan": "🇦🇫", "Albania": "🇦🇱", "Algeria": "🇩🇿", "Andorra": "🇦🇩", "Angola": "🇦🇴",
        "Antigua and Barbuda": "🇦🇬", "Argentina": "🇦🇷", "Armenia": "🇦🇲", "Australia": "🇦🇺", "Austria": "🇦🇹",
        "Azerbaijan": "🇦🇿", "Bahamas": "🇧🇸", "Bahrain": "🇧🇭", "Bangladesh": "🇧🇩", "Barbados": "🇧🇧",
        "Belarus": "🇧🇾", "Belgium": "🇧🇪", "Belize": "🇧🇿", "Benin": "🇧🇯", "Bhutan": "🇧🇹",
        "Bolivia": "🇧🇴", "Bosnia and Herzegovina": "🇧🇦", "Botswana": "🇧🇼", "Brazil": "🇧🇷", "Brunei": "🇧🇳",
        "Bulgaria": "🇧🇬", "Burkina Faso": "🇧🇫", "Burundi": "🇧🇮", "Cabo Verde": "🇨🇻", "Cambodia": "🇰🇭",
        "Cameroon": "🇨🇲", "Canada": "🇨🇦", "Central African Republic": "🇨4", "Chad": "🇹🇩", "Chile": "🇨🇱",
        "China": "🇨🇳", "Colombia": "🇨🇴", "Comoros": "🇰🇲", "Congo": "🇨🇬", "Costa Rica": "🇨🇷",
        "Croatia": "🇭🇷", "Cuba": "🇨🇺", "Cyprus": "🇨🇾", "Czechia": "🇨🇿", "Denmark": "🇩🇰",
        "Djibouti": "🇩🇯", "Dominica": "🇩🇲", "Dominican Republic": "🇩🇴", "Ecuador": "🇪🇨", "Egypt": "🇪🇬",
        "El Salvador": "🇸🇻", "Equatorial Guinea": "🇬🇶", "Eritrea": "🇪🇷", "Estonia": "🇪🇪", "Eswatini": "🇸🇿",
        "Ethiopia": "🇪🇹", "Fiji": "🇫🇯", "Finland": "🇫🇮", "France": "🇫🇷", "Gabon": "🇬🇦",
        "Gambia": "🇬🇲", "Georgia": "🇬🇪", "Germany": "🇩🇪", "Ghana": "🇬🇭", "Greece": "🇬🇷",
        "Grenada": "🇬🇩", "Guatemala": "🇬🇹", "Guinea": "🇬🇳", "Guinea-Bissau": "🇬🇼", "Guyana": "🇬🇾",
        "Haiti": "🇭🇹", "Honduras": "🇭🇳", "Hungary": "🇭🇺", "Iceland": "🇮🇸", "India": "🇮🇳",
        "Indonesia": "🇮🇩", "Iran": "🇮🇷", "Iraq": "🇮🇶", "Ireland": "🇮🇪", "Israel": "🇮🇱",
        "Italy": "🇮🇹", "Jamaica": "🇯🇲", "Japan": "🇯🇵", "Jordan": "🇯🇴", "Kazakhstan": "🇰🇿",
        "Kenya": "🇰🇪", "Kiribati": "🇰🇮", "Korea, North": "🇰🇵", "Korea, South": "🇰🇷", "Kosovo": "🇽🇰",
        "Kuwait": "🇰🇼", "Kyrgyzstan": "🇰🇬", "Laos": "🇱🇦", "Latvia": "🇱🇻", "Lebanon": "🇱🇧",
        "Lesotho": "🇱🇸", "Liberia": "🇱🇷", "Libya": "🇱🇾", "Liechtenstein": "🇱🇮", "Lithuania": "🇱🇹",
        "Luxembourg": "🇱🇺", "Madagascar": "🇲🇬", "Malawi": "🇲🇼", "Malaysia": "🇲🇾", "Maldives": "🇲🇻",
        "Mali": "🇲🇱", "Malta": "🇲🇹", "Marshall Islands": "🇲🇭", "Mauritania": "🇲🇷", "Mauritius": "🇲🇺",
        "Mexico": "🇲🇽", "Micronesia": "🇫🇲", "Moldova": "🇲🇩", "Monaco": "🇲🇨", "Mongolia": "🇲🇳",
        "Montenegro": "🇲🇪", "Morocco": "🇲🇦", "Mozambique": "🇲🇿", "Myanmar": "🇲🇲", "Namibia": "🇳🇦",
        "Nauru": "🇳🇷", "Nepal": "🇳🇵", "Netherlands": "🇳🇱", "New Zealand": "🇳🇿", "Nicaragua": "🇳🇮",
        "Niger": "🇳🇪", "Nigeria": "🇳🇬", "North Macedonia": "🇲🇰", "Norway": "🇳🇴", "Oman": "🇴🇲",
        "Pakistan": "🇵🇰", "Palau": "🇵🇼", "Palestine": "🇵🇸", "Panama": "🇵🇦", "Papua New Guinea": "🇵🇬",
        "Paraguay": "🇵🇾", "Peru": "🇵🇪", "Philippines": "🇵🇭", "Poland": "🇵🇱", "Portugal": "🇵🇹",
        "Qatar": "🇶🇦", "Romania": "🇷🇴", "Russia": "🇷🇺", "Rwanda": "🇷🇼", "Saint Kitts and Nevis": "🇰🇳",
        "Saint Lucia": "🇱🇨", "Saint Vincent and the Grenadines": "🇻🇨", "Samoa": "🇼🇸", "San Marino": "🇸🇲",
        "Sao Tome and Principe": "🇸🇹", "Saudi Arabia": "🇸🇦", "Senegal": "🇸🇳", "Serbia": "🇷🇸",
        "Seychelles": "🇸🇨", "Sierra Leone": "🇸🇱", "Singapore": "🇸🇬", "Slovakia": "🇸🇰", "Slovenia": "🇸🇮",
        "Solomon Islands": "🇸🇧", "Somalia": "🇸🇴", "South Africa": "🇿🇦", "South Sudan": "🇸🇸", "Spain": "🇪🇸",
        "Sri Lanka": "🇱🇰", "Sudan": "🇸🇩", "Suriname": "🇸🇷", "Sweden": "🇸🇪", "Switzerland": "🇨🇭",
        "Syria": "🇸🇾", "Taiwan": "🇹🇼", "Tajikistan": "🇹🇯", "Tanzania": "🇹🇿", "Thailand": "🇹🇭",
        "Timor-Leste": "🇹🇱", "Togo": "🇹🇬", "Tonga": "🇹🇴", "Trinidad and Tobago": "🇹🇹", "Tunisia": "🇹🇳",
        "Turkey": "🇹🇷", "Turkmenistan": "🇹🇲", "Tuvalu": "🇹🇻", "Uganda": "🇺🇬", "Ukraine": "🇺🇦",
        "United Arab Emirates": "🇦🇪", "United Kingdom": "🇬🇧", "United States": "🇺🇸", "Uruguay": "🇺🇾",
        "Uzbekistan": "🇺🇿", "Vanuatu": "🇻🇺", "Vatican City": "🇻🇦", "Venezuela": "🇻🇪", "Vietnam": "🇻🇳",
        "Yemen": "🇾🇪", "Zambia": "🇿🇲", "Zimbabwe": "🇿🇼"
    };

    // Helper: Get Cookies for Auth
    function getCookie(name) {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop().split(';').shift();
        return null;
    }

    // Helper: Get Headers
    function getHeaders() {
        const ct0 = getCookie('ct0');
        const gt = getCookie('gt');
        // Bearer token is generally static for the web client
        const bearer = 'AAAAAAAAAAAAAAAAAAAAANRILgAAAAAAnNwIzUejRCOuH5E6I8xnZz4puTs%3D1Zv7ttfk8LF81IUq16cHjhLTvJu4FA33AGWWjCpTnA';

        const headers = {
            'authorization': `Bearer ${bearer}`,
            'x-twitter-active-user': 'yes',
            'x-csrf-token': ct0,
            'x-twitter-client-language': 'en',
            'content-type': 'application/json'
        };

        if (ct0 && ct0.length === 32 && gt) {
            headers['x-guest-token'] = gt;
        }

        return headers;
    }

    // Cache management
    const cache = {
        get: (screenName) => {
            const cached = GM_getValue(screenName);
            if (!cached) return null;
            const data = JSON.parse(cached);
            if (Date.now() - data.timestamp > CACHE_duration) {
                return null;
            }
            return data.country;
        },
        set: (screenName, country) => {
            GM_setValue(screenName, JSON.stringify({
                country: country,
                timestamp: Date.now()
            }));
        }
    };

    const userNotes = {
        get: (screenName) => {
            return GM_getValue(`${NOTE_PREFIX}${screenName.toLowerCase()}`, '');
        },
        set: (screenName, note) => {
            const key = `${NOTE_PREFIX}${screenName.toLowerCase()}`;
            const trimmedNote = note.trim();

            if (trimmedNote) {
                GM_setValue(key, trimmedNote);
            } else {
                GM_setValue(key, '');
            }
        }
    };

    function getVisibleNoteText(note) {
        if (note.length <= MAX_VISIBLE_NOTE_LENGTH) return note;
        return `${note.slice(0, MAX_VISIBLE_NOTE_LENGTH - 1)}…`;
    }

    function updateNoteDisplay(noteSpan, screenName) {
        const note = userNotes.get(screenName);

        if (note) {
            noteSpan.textContent = `# ${getVisibleNoteText(note)}`;
            noteSpan.title = note;
            noteSpan.style.display = 'inline-flex';
        } else {
            noteSpan.textContent = '';
            noteSpan.title = '';
            noteSpan.style.display = 'none';
        }
    }

    function refreshVisibleNotes(screenName) {
        document.querySelectorAll('[data-twitter-user-note-screen-name]').forEach((noteSpan) => {
            if (noteSpan.dataset.twitterUserNoteScreenName.toLowerCase() === screenName.toLowerCase()) {
                updateNoteDisplay(noteSpan, screenName);
            }
        });
    }

    // API Call
    async function fetchUserLocation(screenName) {
        // Check cache first
        const cachedCountry = cache.get(screenName);
        if (cachedCountry !== null) { // allow caching "undefined" for users with no location
            return cachedCountry;
        }

        const variables = {
            "screenName": screenName
        };

        const url = `https://x.com/i/api/graphql/${QUERY_ID}/AboutAccountQuery?variables=${encodeURIComponent(JSON.stringify(variables))}`;

        return new Promise((resolve) => {
            GM_xmlhttpRequest({
                method: "GET",
                url: url,
                headers: getHeaders(),
                onload: function (response) {
                    try {
                        const json = JSON.parse(response.responseText);
                        const result = json.data?.user_result_by_screen_name?.result;
                        // Path from Data.txt: data.user_result_by_screen_name.result.about_profile.account_based_in
                        const location = result?.about_profile?.account_based_in;

                        console.log(`[TwitterCountryFlag] Handled ${screenName}: ${location}`);

                        cache.set(screenName, location || ""); // Cache empty string if no location
                        resolve(location);
                    } catch (e) {
                        console.error("[TwitterCountryFlag] Parse error", e);
                        resolve(null);
                    }
                },
                onerror: function (err) {
                    console.error("[TwitterCountryFlag] Network error", err);
                    resolve(null);
                }
            });
        });
    }

    // Process a single user element
    function processUserElement(element) {
        if (element.dataset.countryFlagProcessed) return;

        // Find screen name
        const link = element.closest('a') || element.querySelector('a');
        if (!link) return;

        const href = link.getAttribute('href');
        if (!href || !href.startsWith('/')) return;

        const screenName = href.replace(/^\//, '').split(/[/?#]/)[0];
        if (['home', 'explore', 'notifications', 'messages', 'i'].includes(screenName)) return;

        // Mark as processing
        element.dataset.countryFlagProcessed = 'done';

        // Check cache
        const cachedCountry = cache.get(screenName);

        const flagSpan = document.createElement('span');
        flagSpan.style.marginLeft = '4px';
        flagSpan.style.fontSize = '1.1em';
        flagSpan.style.cursor = 'pointer';

        const noteSpan = document.createElement('span');
        noteSpan.dataset.twitterUserNoteScreenName = screenName;
        noteSpan.style.marginLeft = '6px';
        noteSpan.style.padding = '1px 7px';
        noteSpan.style.border = '1px solid rgba(29, 155, 240, 0.35)';
        noteSpan.style.borderRadius = '9999px';
        noteSpan.style.background = 'rgba(29, 155, 240, 0.12)';
        noteSpan.style.color = 'rgb(29, 155, 240)';
        noteSpan.style.fontSize = '0.86em';
        noteSpan.style.fontWeight = '600';
        noteSpan.style.lineHeight = '1.35';
        noteSpan.style.alignItems = 'center';
        noteSpan.style.maxWidth = '190px';
        noteSpan.style.overflow = 'hidden';
        noteSpan.style.textOverflow = 'ellipsis';
        noteSpan.style.whiteSpace = 'nowrap';
        noteSpan.style.verticalAlign = 'middle';
        updateNoteDisplay(noteSpan, screenName);

        const noteButton = document.createElement('button');
        noteButton.type = 'button';
        noteButton.textContent = '✎';
        noteButton.title = 'Agregar o editar comentario privado';
        noteButton.style.marginLeft = '4px';
        noteButton.style.padding = '1px 5px';
        noteButton.style.border = '0';
        noteButton.style.borderRadius = '9999px';
        noteButton.style.background = 'transparent';
        noteButton.style.color = 'rgb(113, 118, 123)';
        noteButton.style.cursor = 'pointer';
        noteButton.style.font = 'inherit';
        noteButton.style.lineHeight = '1';
        noteButton.style.verticalAlign = 'middle';

        noteButton.onmouseenter = () => {
            noteButton.style.background = 'rgba(29, 155, 240, 0.12)';
            noteButton.style.color = 'rgb(29, 155, 240)';
        };

        noteButton.onmouseleave = () => {
            noteButton.style.background = 'transparent';
            noteButton.style.color = 'rgb(113, 118, 123)';
        };

        noteButton.onclick = (e) => {
            e.preventDefault();
            e.stopPropagation();

            const currentNote = userNotes.get(screenName);
            const nextNote = prompt(`Comentario privado para @${screenName}. Dejalo vacio para borrar:`, currentNote);
            if (nextNote === null) return;

            userNotes.set(screenName, nextNote);
            refreshVisibleNotes(screenName);
        };

        const injectFlag = (countryName) => {
            if (countryName && countryFlags[countryName]) {
                flagSpan.textContent = ` ${countryFlags[countryName]}`;
                flagSpan.title = countryName;
                flagSpan.style.cursor = 'default'; // No longer clickable
                flagSpan.onclick = null;
            } else {
                // No valid country found or empty
                flagSpan.textContent = '';
                // Optional: We could leave a "X" or something, but usually better to just hide it if no data
            }
        };

        if (cachedCountry !== null) {
            // WE HAVE DATA (could be empty string if user has no location)
            injectFlag(cachedCountry);
        } else {
            // NO DATA -> Show World Emoji
            flagSpan.textContent = ' 🌐';
            flagSpan.title = 'Click to potential fetch country location';

            flagSpan.onclick = async (e) => {
                e.preventDefault();
                e.stopPropagation();

                flagSpan.textContent = ' ⏳'; // Loading
                const countryName = await fetchUserLocation(screenName);
                injectFlag(countryName);
            };
        }

        // Inject
        const handleSpan = element.querySelector('div[dir="ltr"] > span');
        if (handleSpan) {
            handleSpan.appendChild(flagSpan);
            handleSpan.appendChild(noteSpan);
            handleSpan.appendChild(noteButton);
        } else {
            element.appendChild(flagSpan);
            element.appendChild(noteSpan);
            element.appendChild(noteButton);
        }
    }

    // Main Observer
    function init() {
        console.log("[TwitterCountryFlag] Initializing...");

        const observer = new MutationObserver((mutations) => {
            for (const mutation of mutations) {
                for (const node of mutation.addedNodes) {
                    if (node.nodeType === 1) {
                        // Look for user names.
                        // The selector `div[data-testid="User-Name"]` contains name and handle.
                        // Inside, we usually want the handle part or the name part.
                        // Let's target the User-Name container.

                        // Check the node itself
                        if (node.matches && node.matches('div[data-testid="User-Name"]')) {
                            processUserElement(node);
                        }

                        // Check children
                        const userNames = node.querySelectorAll('div[data-testid="User-Name"]');
                        userNames.forEach(processUserElement);
                    }
                }
            }
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });

        // Initial pass
        document.querySelectorAll('div[data-testid="User-Name"]').forEach(processUserElement);
    }

    // Wait for body
    if (document.body) {
        init();
    } else {
        document.addEventListener('DOMContentLoaded', init);
    }

})();
