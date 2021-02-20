
const { writeFileSync, existsSync, mkdirSync } = require('fs');
const { JSDOM } = require('jsdom');
const Downloader = require('./axios-downloader');

const CACHE_DIR = '.cache';
const OUTPUT_DIR = 'data';
const OUTPUT_FNAME = 'link-evolution-boosters.json';

const RE_CARD_TITLE = /^"(.+)"$/;

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

        let temp = [];
        const tables = document.querySelectorAll('table.wikitable');
        for (const table of tables) {
            const heading = table.querySelector('th');
            if (heading.textContent.trim() === 'Name'
                && heading.nextElementSibling.textContent.trim() === 'Rarity') {

                    for (let row of table.rows) {
                        const firstChild = row.children[0];
                        if (firstChild && firstChild.tagName !== 'TH') {

                            const cardTitle = RE_CARD_TITLE.exec( firstChild.textContent.trim() )[1];
                            temp.push(cardTitle);

                        }
                    }

            }
        }

        result[ title ] = temp;
    }

    console.log(`writing ${OUTPUT_FNAME}`);
    writeFileSync(`${OUTPUT_DIR}/${OUTPUT_FNAME}`, JSON.stringify(result, null, 2));

};

main();

