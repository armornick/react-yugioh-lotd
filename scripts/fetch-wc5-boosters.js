const { writeFileSync, existsSync, mkdirSync } = require('fs');
const { parseNavboxPage, parseCardTablePage } = require('./yugipedia-parser');
const Downloader = require('./axios-downloader');

const CACHE_DIR = '.cache';
const OUTPUT_DIR = 'data';
const OUTPUT_FNAME = 'wc05-boosters.json';

const mkdirIfNotExists = (directory) => {
    if (!existsSync(directory)) {
        mkdirSync(directory);
    }
};

const linkMatcher = (link) => {
    return link !== '/wiki/Kame_Game' && link !== '/wiki/Mystic_Stall';
}

const parseLinks = (links) => {
    const results = [];
    for (const link of links) {
        const name = link.replace(/_\(World_Championship_2005\)$/,'').replace(/^\/wiki\//, '');
        results.push({
            name: name.replace(/_/g, ' '),
            fname: 'WC07_' + name + '.html',
            url: 'https://yugipedia.com' + link,
        });
    }
    return results;
};

const main = async () => {

    mkdirIfNotExists(CACHE_DIR);
    mkdirIfNotExists(OUTPUT_DIR);

    const dl = new Downloader({ outputDir: CACHE_DIR });
    const response = await dl.download('WC05-Boosters.html', 'https://yugipedia.com/wiki/Template:Yu-Gi-Oh!_7_Trials_to_Glory:_World_Championship_Tournament_2005_sets');
    
    const linksRaw = parseNavboxPage(response, linkMatcher);
    const links = parseLinks(linksRaw);

    // console.log(links[0]);
    // const page = await dl.downloadString('https://yugipedia.com' + links[0]);
    // writeFileSync('test.html', page);
    // console.log( parseCardTablePage(page) );

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
