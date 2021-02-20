
const { writeFileSync, existsSync, mkdirSync } = require('fs');
const { JSDOM } = require('jsdom');
const DecklistParser = require('./decklist-parser');
const Downloader = require('./axios-downloader');

const CACHE_DIR = '.cache';
const OUTPUT_DIR = 'data';
const OUTPUT_FNAME = 'lotd-boosters.json';

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

};

main();
