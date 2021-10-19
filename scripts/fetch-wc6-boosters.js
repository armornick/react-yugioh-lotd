const { writeFileSync, existsSync, mkdirSync } = require('fs');
const { parseNavboxPage, parseCardTablePage } = require('./yugipedia-parser');
const Downloader = require('./axios-downloader');

const CACHE_DIR = '.cache';
const OUTPUT_DIR = 'data';
const OUTPUT_FNAME = 'wc06-boosters.json';

const mkdirIfNotExists = (directory) => {
    if (!existsSync(directory)) {
        mkdirSync(directory);
    }
};

const RE_WC6_LINK = /_\(World_Championship_2006\)$/;

const linkMatcher = (link) => {
    // return RE_WC6_LINK.test(link);
    return true;
}

const parseLinks = (links) => {
    const results = [];
    for (const link of links) {
        const name = link.replace(RE_WC6_LINK,'').replace(/^\/wiki\//, '');
        results.push({
            name: name.replace(/_/g, ' ').replace('%27', '\''),
            fname: 'WC06_' + name.replace(/\//g, '_') + '.html',
            url: 'https://yugipedia.com' + link,
        });
    }
    return results;
};

const main = async () => {

    mkdirIfNotExists(CACHE_DIR);
    // mkdirIfNotExists(OUTPUT_DIR);

    const dl = new Downloader({ outputDir: CACHE_DIR });
    const response = await dl.download('WC6-Boosters.html', 'https://yugipedia.com/wiki/Template:Yu-Gi-Oh!_Ultimate_Masters:_World_Championship_Tournament_2006_sets');
    
    const linksRaw = parseNavboxPage(response, linkMatcher);
    const links = parseLinks(linksRaw);

    const result = {};
    for (const link of links) {

        const page = await dl.download(link.fname, link.url);
        const data = parseCardTablePage(page);

        if (data.length > 0) {
            result[link.name] = data;
        }

    }

    console.log(`writing ${OUTPUT_FNAME}`);
    writeFileSync(`${OUTPUT_DIR}/${OUTPUT_FNAME}`, JSON.stringify(result, null, 2));

};

main();