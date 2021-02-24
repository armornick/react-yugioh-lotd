
const { writeFileSync, existsSync, mkdirSync } = require('fs');
const { JSDOM } = require('jsdom');
const lunr = require('lunr');
const DecklistParser = require('./decklist-parser');
const Downloader = require('./axios-downloader');

const CACHE_DIR = '.cache';
const OUTPUT_DIR = 'data';
const OUTPUT_FNAME = 'lotd-boosters.json';
const OUTPUT_FNAME2 = 'lotd-cards.json';
const OUTPUT_FNAME3 = 'lotd-search-index.json';

const CARD_TYPES = {
    "Normal Monsters":"Normal Monster", "Effect Monsters":"Effect Monster",
    "Spirit monsters":"Spirit monster","Union monsters":"Union monster",
    "Tuner monsters":"Tuner monster","Gemini monsters":"Gemini monster",
    "Toon monsters":"Toon monster","Pendulum Monsters":"Pendulum Monster",
    "Ritual Monsters":"Ritual Monster","Fusion Monsters":"Fusion Monster",
    "Synchro Monsters":"Synchro Monster","Xyz Monsters":"Xyz Monster",
    "Spells":"Spell","Traps":"Trap",
};

const mkdirIfNotExists = (directory) => {
    if (!existsSync(directory)) {
        mkdirSync(directory);
    }
};

const RE_PACK_TITLE = /(.*?)\s\((\d+)(DP)?\)/;

const parseTitle = (result, title) => {
    let m = RE_PACK_TITLE.exec(title);
    result.title = m[1];
    result.cost = m[2];
}

const main = async () => {

    mkdirIfNotExists(CACHE_DIR);
    mkdirIfNotExists(OUTPUT_DIR);

    const dl = new Downloader({ outputDir: CACHE_DIR });
    const response = await dl.download('lotd-card-shop.html', 'https://yugioh.fandom.com/wiki/Yu-Gi-Oh!_Legacy_of_the_Duelist/Card_Shop');

    const dom = new JSDOM(response);
    const document = dom.window.document;

    const deckLists = document.querySelectorAll('.decklist');
    const parser = new DecklistParser({ onTitle: parseTitle })
    const result = parser.parseAll(deckLists);

    console.log(`writing ${OUTPUT_FNAME}`);
    writeFileSync(`${OUTPUT_DIR}/${OUTPUT_FNAME}`, JSON.stringify(result, null, 2));

    const cardMap = {};
    const packNames = Object.keys(result);
    for (const packName of packNames) {
        const pack = result[packName];
        const cardTypes = Object.keys(pack);
        for (const cardType of cardTypes) {
            if (cardType == 'title' || cardType == 'cost' || cardType == 'id' || cardType == 'archetypes') {
                continue;
            }
            if (cardType in CARD_TYPES) {
                const cards = pack[cardType];
                for (const card of cards) {
                    cardMap[card] = {
                        name: card,
                        cardType: CARD_TYPES[cardType], pack: packName,
                    };
                }
            }
            else {
                console.log(`unknown card type: ${cardType}`);
            }
        }
    }

    console.log(`writing ${OUTPUT_FNAME2}`);
    writeFileSync(`${OUTPUT_DIR}/${OUTPUT_FNAME2}`, JSON.stringify(cardMap, null, 2));

    const lunrIndex = lunr(function () {
        this.ref('name');
        this.field('name');

        const cardNames = Object.keys(cardMap);
        cardNames.map(card => this.add(cardMap[card]));
    });

    console.log(`writing ${OUTPUT_FNAME3}`);
    writeFileSync(`${OUTPUT_DIR}/${OUTPUT_FNAME3}`, JSON.stringify(lunrIndex));

};

main();
