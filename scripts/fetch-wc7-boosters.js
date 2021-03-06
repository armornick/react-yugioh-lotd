const { writeFileSync, existsSync, mkdirSync } = require('fs');
const { JSDOM } = require('jsdom');
const { parseRarityPage } = require('./yugipedia-parser');
const Downloader = require('./axios-downloader');

const CACHE_DIR = '.cache';
const OUTPUT_DIR = 'data';
const OUTPUT_FNAME = 'wc07-boosters.json';

const mkdirIfNotExists = (directory) => {
    if (!existsSync(directory)) {
        mkdirSync(directory);
    }
};

const getCardPackLinks = (document) => {
    const pages = [];
    const links = document.querySelectorAll('a');
    for (const link of links) {
        if (link.href.includes("(WC07-BP)")) {
            const name = link.href.replace('_(WC07-BP)','').replace(/^\/wiki\//, '');
            const page = {
                name: name.replace(/_/g, ' '),
                fname: 'WC07_' + name + '.html',
                url: 'https://yugipedia.com' + link.href,
            }
            pages.push(page);
        }
    }
    return pages;
}

const main = async () => {
    
    mkdirIfNotExists(CACHE_DIR);
    mkdirIfNotExists(OUTPUT_DIR);

    // const cardDb = require('./yugioh-cards.json').data;

    const result = {};
    const dl = new Downloader({ outputDir: CACHE_DIR });

    const response = await dl.download('WC07-Boosters.html', 'https://yugipedia.com/wiki/Yu-Gi-Oh!_World_Championship_2007_Card_Pack_List');
    const dom = new JSDOM(response);
    const document = dom.window.document;

    const links = getCardPackLinks(document);
    for (const link of links) {
        const page = await dl.download(link.fname, link.url);
        const cards = parseRarityPage(page);

        if (cards.Common) { // to filter "structure decks" and "all at random"
            result[link.name] = cards;
        }
    }

    console.log(`writing ${OUTPUT_FNAME}`);
    writeFileSync(`${OUTPUT_DIR}/${OUTPUT_FNAME}`, JSON.stringify(result, null, 2));
}

main();

