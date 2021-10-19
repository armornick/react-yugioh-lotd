const { writeFileSync, existsSync, mkdirSync } = require('fs');
const { parseNavboxPage, parseRarityPage } = require('./yugipedia-parser');
const Downloader = require('./axios-downloader');

const CACHE_DIR = '.cache';
const OUTPUT_DIR = 'data';
const OUTPUT_FNAME = 'ntr-boosters.json';

const mkdirIfNotExists = (directory) => {
    if (!existsSync(directory)) {
        mkdirSync(directory);
    }
};

const RE_NTR_LINK = /_\(NTR-BP\)$/;

const linkMatcher = (link) => {
    return RE_NTR_LINK.test(link);
}

const parseLinks = (links) => {
    const results = [];
    for (const link of links) {
        const name = link.replace(RE_NTR_LINK,'').replace(/^\/wiki\//, '');
        results.push({
            name: name.replace(/_/g, ' ').replace('%27', '\''),
            fname: 'NTR_' + name.replace(/\//g, '_') + '.html',
            url: 'https://yugipedia.com' + link,
        });
    }
    return results;
};

const RE_RARITY = /^(Ultra Rare|Super Rare|Rare|Common)s\s/;

const convertRarities = (data) => {
    const output = {};
    const keys = Object.keys(data);

    for (const key of keys) {
        const rarity = RE_RARITY.exec(key)[1];
        output[rarity] = data[key];
    }

    return output;
};

const main = async () => {

    mkdirIfNotExists(CACHE_DIR);
    // mkdirIfNotExists(OUTPUT_DIR);

    const dl = new Downloader({ outputDir: CACHE_DIR });
    const response = await dl.download('NTR-Boosters.html', 'https://yugipedia.com/wiki/Template:Yu-Gi-Oh!_Nightmare_Troubadour_sets');
    
    const linksRaw = parseNavboxPage(response, linkMatcher);
    const links = parseLinks(linksRaw);

    const result = {};
    for (const link of links) {

        const page = await dl.download(link.fname, link.url);
        const data = parseRarityPage(page);
        const converted = convertRarities(data);

        if (converted.Common) {
            result[link.name] = converted;
        }

    }

    console.log(`writing ${OUTPUT_FNAME}`);
    writeFileSync(`${OUTPUT_DIR}/${OUTPUT_FNAME}`, JSON.stringify(result, null, 2));

};

main();
