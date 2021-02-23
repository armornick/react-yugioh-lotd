
const { writeFileSync, existsSync, mkdirSync } = require('fs');
const { JSDOM } = require('jsdom');
const Downloader = require('./axios-downloader');

const CACHE_DIR = '.cache';
const OUTPUT_DIR = 'data';
const OUTPUT_FNAME = 'link-evolution-boosters.json';

const RE_CARD_TITLE = /^"(.+)"$/;

const CARD_TYPES = {
    // main deck monsters
    "Effect Monster": "Effect Monsters", "Flip Effect Monster": "Effect Monsters",
    "Flip Tuner Effect Monster":"Tuner monsters","Normal Tuner Monster":"Tuner monsters",
    "Tuner Monster":"Tuner monsters","Gemini Monster":"Gemini monsters",
    "Normal Monster":"Normal Monsters","Pendulum Effect Monster":"Pendulum Monsters",
    "Pendulum Flip Effect Monster":"Pendulum Monsters","Pendulum Normal Monster":"Pendulum Monsters",
    "Pendulum Tuner Effect Monster":"Pendulum Monsters","Ritual Effect Monster":"Ritual Monsters",
    "Ritual Monster":"Ritual Monsters","Spirit Monster":"Spirit monsters",
    "Toon Monster":"Toon monsters","Union Effect Monster":"Union monsters",
    // extra deck monsters
    "Fusion Monster":"Fusion Monsters","Pendulum Effect Fusion Monster":"Fusion Monsters",
    "Link Monster":"Link Monsters","Synchro Monster":"Synchro Monsters",
    "Synchro Pendulum Effect Monster":"Synchro Monsters","Synchro Tuner Monster":"Synchro Monsters",
    "XYZ Monster":"Xyz Monsters","XYZ Pendulum Effect Monster":"Xyz Monsters",
    // spells and trap cards
    "Spell Card":"Spells","Trap Card":"Traps",
};

const mkdirIfNotExists = (directory) => {
    if (!existsSync(directory)) {
        mkdirSync(directory);
    }
};


const getCardPackLinks = (document) => {
    const result = {};

    const links = document.querySelectorAll('.mw-parser-output a');
    for (let link of links) {
        if (link.href.includes('_pack')) {
            result[link.href] = true;
        }
    }

    return Object.keys(result);
};

const makePackFileName = (href) => {
    return href.replace(/^\/wiki\//, '').replace(/_\(Link_Evolution\)/, '').replace('\/', '-') + '.html';
};

const makeCompleteUrl = href => 'https://yugipedia.com' + href;

const main = async () => {

    mkdirIfNotExists(CACHE_DIR);
    mkdirIfNotExists(OUTPUT_DIR);

    const cardDb = require('./yugioh-cards.json').data;

    const result = {};
    const dl = new Downloader({ outputDir: CACHE_DIR });

    const response = await dl.download('Card_Shop.html', 'https://yugipedia.com/wiki/Yu-Gi-Oh!_Legacy_of_the_Duelist:_Link_Evolution/Card_Shop');
    const dom = new JSDOM(response);
    const document = dom.window.document;

    const links = getCardPackLinks(document);
    for (const link of links) {
        const packPage = await dl.download( makePackFileName(link), makeCompleteUrl(link));
        const dom = new JSDOM(packPage);
        const document = dom.window.document;

        const title = document.getElementById('firstHeading').textContent.trim().replace(/\s\(Link\sEvolution\)$/, '');
        console.log(title);

        const data = {}, archetypes = {};
        const tables = document.querySelectorAll('table.wikitable');
        for (const table of tables) {
            const heading = table.querySelector('th');
            if (heading.textContent.trim() === 'Name'
                && heading.nextElementSibling.textContent.trim() === 'Rarity') {

                    for (let row of table.rows) {
                        const firstChild = row.children[0];
                        if (firstChild && firstChild.tagName !== 'TH') {

                            let cardTitle = RE_CARD_TITLE.exec( firstChild.textContent.trim() )[1];
                            let card = cardDb.find(card => card.name == cardTitle);
                            if (!card) {
                                card = cardDb.find(card => card.name.toUpperCase() == cardTitle.toUpperCase() );
                                if (card) {
                                    cardTitle = card.name;
                                } else {
                                    console.log(`could not find card "${cardTitle}"`);
                                    continue;
                                }
                            }
                            const cardType = CARD_TYPES[ card.type ];
                            if (card.archetype) {
                                archetypes[card.archetype] = archetypes[card.archetype] || 0;
                                archetypes[card.archetype]++;
                            }

                            data[cardType] = data[cardType] || [];
                            data[cardType].push(cardTitle);

                        }
                    }

            }
        }

        // find archetypes that booster pack is dedicated to
        const archetypeList = [];
        const foundArchetypes = Object.keys(archetypes);
        for (let foundArchetype of foundArchetypes) {
            if (archetypes[foundArchetype] > 5) { // arbitrary minimum
                archetypeList.push(foundArchetype);
            }
        }
        if (archetypeList.length > 1) {
            data.archetypes = archetypeList;
        }

        result[ title ] = data;
    }

    console.log(`writing ${OUTPUT_FNAME}`);
    writeFileSync(`${OUTPUT_DIR}/${OUTPUT_FNAME}`, JSON.stringify(result, null, 2));

};

main();

