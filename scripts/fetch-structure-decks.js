
const { writeFileSync } = require('fs');
const { JSDOM } = require('jsdom');
const Downloader = require('./axios-downloader');
const TableParser = require('./table-parser');

const CACHE_DIR = '.cache';
const OUTPUT_DIR = 'data';
const OUTPUT_FNAME = 'structure-decks.json';
const TEMP_FNAME = 'temp.html';

const KNOWN_FIELDS = {
    'Card number': 'code', 'Set number': 'code',
    'English name': 'Name',
};

const URLS = [
    // structure decks
    { slug: 'saga-of-blue-eyes-white-dragon', url: 'https://yugioh.fandom.com/wiki/Saga_of_Blue-Eyes_White_Dragon_Structure_Deck' },
    { slug: 'cyber-dragon-revolution', url: 'https://yugioh.fandom.com/wiki/Cyber_Dragon_Revolution_Structure_Deck' },
    { slug: 'realm-of-light', url: 'https://yugioh.fandom.com/wiki/Realm_of_Light_Structure_Deck' },
    { slug: 'hero-strike', url: 'https://yugioh.fandom.com/wiki/HERO_Strike_Structure_Deck' },
    { slug: 'master-of-pendulum', url: 'https://yugioh.fandom.com/wiki/Master_of_Pendulum_Structure_Deck' },
    { slug: 'emperor-of-darkness', url: 'https://yugioh.fandom.com/wiki/Emperor_of_Darkness_Structure_Deck' },
    { slug: 'pendulum-domination', url: 'https://yugioh.fandom.com/wiki/Pendulum_Domination_Structure_Deck' },
    { slug: 'cyberse-link', url: 'https://yugioh.fandom.com/wiki/Structure_Deck:_Cyberse_Link' },
    { slug: 'wave-of-light', url: 'https://yugioh.fandom.com/wiki/Structure_Deck:_Wave_of_Light' },
    { slug: 'powercode-link', url: 'https://yugioh.fandom.com/wiki/Structure_Deck:_Powercode_Link' },
    { slug: 'zombie-horde', url: 'https://yugioh.fandom.com/wiki/Structure_Deck:_Zombie_Horde' },
    { slug: 'shaddoll-showdown', url: 'https://yugioh.fandom.com/wiki/Structure_Deck:_Shaddoll_Showdown' },
];


// const buildSlug = (title) => {
    // return title.toLowerCase().replace(/[:\s]/g, '-');
// };

const getTitle = (document) => {
    return document.querySelector('#firstHeading').textContent.trim();
};

const getDescription = (document) => {
    const paragraphs = document.querySelectorAll('.mw-parser-output p');
    for (const paragraph of paragraphs) {
        if (paragraph.textContent.trim() !== '') {
            return paragraph.textContent.trim();
        }
    }
};

const getPortableInfoBoxData = (infobox, propName) => {
    return infobox.querySelector(`[data-source="${propName}"] .pi-data-value`);
};

const getPortableInfoBoxDataValue = (infobox, propName) => {
    const section = infobox.querySelector(`[data-source="${propName}"] .pi-data-value`);
    if (section) {
        return section.textContent.trim();
    } else {
        return undefined;
    }
};

const parsePortableInfoBox = (result, document) => {
    const infobox = document.querySelector('.portable-infobox');
    if (infobox) {
        // const jaName = infobox.querySelector('[data-source="ja_name"]');
        // result['Japanese Name'] = jaName.textContent.trim();
        result['Japanese Name'] = getPortableInfoBoxDataValue(infobox, 'ja_name');

        // const coverCard = infobox.querySelector('[data-source="cover_card"] .pi-data-value');
        // result['Cover card'] = coverCard.textContent.trim();
        let coverCard = getPortableInfoBoxData(infobox, 'cover_card');
        if (coverCard.innerHTML.includes('<ul>')) {
            const content = [];
            const children = coverCard.querySelectorAll('li');
            for (let child of children) {
                content.push(child.textContent.trim());
            }
            coverCard = content;
        } else {
            coverCard = coverCard.textContent.trim();
        }
        result['Cover card'] = coverCard;

        result['Type'] = getPortableInfoBoxDataValue(infobox, 'type');

        const releaseDates = {};
        releaseDates['Japan'] = getPortableInfoBoxDataValue(infobox, 'jp_release_date');
        releaseDates['North America'] = getPortableInfoBoxDataValue(infobox, 'na_release_date');
        releaseDates['Europe'] = getPortableInfoBoxDataValue(infobox, 'eu_release_date');
        const worldwideRelease = getPortableInfoBoxDataValue(infobox, 'en_release_date');
        if (!releaseDates['North America']) {
            releaseDates['North America'] = worldwideRelease;
        }
        if (!releaseDates['Europe']) {
            releaseDates['Europe'] = worldwideRelease;
        }
        result['Release dates'] = releaseDates;
    }
};

const RE_RD_AMERICA = /^English\s(na)$/;
const RE_RD_EUROPE = /^English\s(eu)$/;

const parseInfoBox = (result, document) => {
    const infobox = document.querySelector('table.infobox');
    if (infobox) {
        let state = 'base', releaseDates;
        const rows = infobox.querySelectorAll('tr');
        for (const row of rows) {
            if (row.children.length === 2 && state === 'base') {

                const label = row.children[0].textContent.trim();
                if (label === 'Type') {
                    result['Type'] = row.children[1].textContent.trim();
                }
                else if (label === 'Cover card') {
                    result['Cover card'] = row.children[1].textContent.trim();
                }

            }
            else if (row.children.length === 2 && state === 'release-dates') {
                const label = row.children[0].textContent.trim();
                if (label == 'Japanese') {
                    releaseDates['Japan'] = row.children[1].textContent.trim();
                }
                if (RE_RD_AMERICA.test(label)) {
                    releaseDates['North America'] = row.children[1].textContent.trim();
                }
                if (RE_RD_EUROPE.test(label)) {
                    releaseDates['Europe'] = row.children[1].textContent.trim();
                }
                
            }
            else if (row.children.length === 1) {
                const title = row.children[0].textContent.trim();
                // console.log(`infobox title: '${title}'`);
                if (title === 'Release dates') {
                    state = 'release-dates';
                    releaseDates = {};
                    result['Release dates'] = releaseDates;
                } else {
                    state = 'base';
                }
            }
        }
    }
}

const main = async () => {

    const result = {};
    const parser = new TableParser({ knownFields: KNOWN_FIELDS });
    const dl = new Downloader({ outputDir: CACHE_DIR });
    dl.caching = false; // turn off caching because we will use the same name every time

    for (const obj of URLS) {
        const { slug, url } = obj;

        const src = await dl.download(TEMP_FNAME, url);
        const dom = new JSDOM(src);
        const document = dom.window.document;

        const title = getTitle(document);
        // const slug = buildSlug(title);
        const description = getDescription(document);
        const data = { title, slug, url, description };
        parsePortableInfoBox(data, document);
        parseInfoBox(data, document);

        const table = document.querySelector('.wikitable');
        if (table) {
            const output = parser.parse(table);
            data.cards = output;
            result[title] = data;
        }
    }

    console.log(`writing ${OUTPUT_FNAME}`);
    writeFileSync(`${OUTPUT_DIR}/${OUTPUT_FNAME}`, JSON.stringify(result, null, 2));
};

main();



