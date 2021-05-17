const { writeFileSync, existsSync, mkdirSync } = require('fs');
const { parseNavboxPage, parseRarityPage } = require('./yugipedia-parser');
const Downloader = require('./axios-downloader');

const CACHE_DIR = '.cache';
const OUTPUT_DIR = 'data';
const OUTPUT_FNAME = 'gx1-boosters.json';

const mkdirIfNotExists = (directory) => {
    if (!existsSync(directory)) {
        mkdirSync(directory);
    }
};

const RE_GX1_LINK = /_\(GX1-BP\)$/;

const linkMatcher = (link) => {
    return RE_GX1_LINK.test(link);
}

const parseLinks = (links) => {
    const results = [];
    for (const link of links) {
        const name = link.replace(RE_GX1_LINK,'').replace(/^\/wiki\//, '');
        results.push({
            name: name.replace(/_/g, ' ').replace('%27', '\''),
            fname: 'GX1_' + name + '.html',
            url: 'https://yugipedia.com' + link,
        });
    }
    return results;
};

const main = async () => {

    mkdirIfNotExists(CACHE_DIR);
    mkdirIfNotExists(OUTPUT_DIR);

    const dl = new Downloader({ outputDir: CACHE_DIR });
    const response = await dl.download('GX1-Boosters.html', 'https://yugipedia.com/wiki/Template:Yu-Gi-Oh!_GX_Duel_Academy_sets');
    
    const linksRaw = parseNavboxPage(response, linkMatcher);
    const links = parseLinks(linksRaw);

    const result = {};
    for (const link of links) {

        const page = await dl.download(link.fname, link.url);
        const data = parseRarityPage(page);

        if (data.Common) {
            result[link.name] = data;
        }

    }

    console.log(`writing ${OUTPUT_FNAME}`);
    writeFileSync(`${OUTPUT_DIR}/${OUTPUT_FNAME}`, JSON.stringify(result, null, 2));

};

main();
