const { writeFileSync, existsSync, mkdirSync } = require('fs');
const { JSDOM } = require('jsdom');
const Downloader = require('./axios-downloader');

const CACHE_DIR = '.cache';
const OUTPUT_DIR = 'data';
const OUTPUT_FNAME = 'wc08-boosters.json';

const mkdirIfNotExists = (directory) => {
    if (!existsSync(directory)) {
        mkdirSync(directory);
    }
};

const getCardPackLinks = (document) => {
    const pages = [];
    const links = document.querySelectorAll('a');
    for (const link of links) {
        if (link.href.includes("Yu-Gi-Oh!_World_Championship_2008:")) {
            const name = link.href.replace('Yu-Gi-Oh!_World_Championship_2008:_','').replace(/^\/wiki\//, '');
            const page = {
                name: name.replace(/_/g, ' '),
                fname: 'WC08_' + name + '.html',
                url: 'https://yugipedia.com' + link.href,
            }
            pages.push(page);
        }
        else if (link.href.includes("(WC08-BP)")) {
            const name = link.href.replace('_(WC08-BP)','').replace(/^\/wiki\//, '');
            const page = {
                name: name.replace(/_/g, ' '),
                fname: 'WC08_' + name + '.html',
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

    const cardDb = require('./yugioh-cards.json').data;

    const result = {};
    const dl = new Downloader({ outputDir: CACHE_DIR });

    const response = await dl.download('WC08-Boosters.html', 'https://yugipedia.com/wiki/Booster_Pack_List_(WC08-VG)');
    const dom = new JSDOM(response);
    const document = dom.window.document;

    const links = getCardPackLinks(document);
    for (const link of links) {
        const page = await dl.download(link.fname, link.url);
        const dom = new JSDOM(page);
        const document = dom.window.document;

        const cards = {};
        const firstHeading = document.querySelector('.mw-parser-output > h2');
        let element = firstHeading;
        while (element) {
            let rarity = element.textContent.replace('[edit]','');
            
            element = element.nextElementSibling;
            if (element && element.tagName === 'UL') {
                const cards2 = [];
                const items = element.querySelectorAll('li');
                for (const item of items) {
                    cards2.push(item.textContent);
                }

                cards[rarity] = cards2;
                element = element.nextElementSibling;
            }

            if (element && element.tagName !== 'H2') {
                element = null;
            }
        }

        if (cards.Commons) { // to filter "structure decks" and "all at random"
            result[link.name] = cards;
        }
    }

    console.log(`writing ${OUTPUT_FNAME}`);
    writeFileSync(`${OUTPUT_DIR}/${OUTPUT_FNAME}`, JSON.stringify(result, null, 2));
}

main();

