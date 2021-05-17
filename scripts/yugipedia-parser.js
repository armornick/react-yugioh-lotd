
const { JSDOM } = require('jsdom');

exports.parseNavboxPage = (page, matcher) => {

    const dom = new JSDOM(page);
    const document = dom.window.document;

    const links = {};
    const navboxes = document.querySelectorAll('.navbox-list');
    for (const navbox of navboxes) {
        const list = navbox.querySelectorAll('a');
        for (const item of list) {
            if (item.href.includes('&redlink=1')) {
                continue;
            }
            if (matcher && matcher(item.href)) {
                // links.push(item.href);
                links[item.href] = true;
            }
            else if (!matcher) {
                // links.push(item.href);
                links[item.href] = true;
            }
        }
    }

    return Object.keys(links);

}

exports.parseRarityPage = (page) => {

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

    return cards;

}

exports.parseCardTablePage = (page) => {

    const dom = new JSDOM(page);
    const document = dom.window.document;
    const table = document.querySelector('table.card-list');
    // console.log(table);

    if (!table) {
        return [];
    }

    const headings = [];
    for (const heading of table.querySelectorAll('th')) {
        headings.push(heading.textContent.trim());
    }

    const data = [];
    const rows = table.querySelectorAll('tr');
    for (const row of rows) {
        if (row.querySelector('th')) {
            continue;
        }
        const record = {}, len = headings.length;
        for (let i = 0; i < len; i++) {
            record[ headings[i] ] = row.cells[i].textContent.trim();
        }
        data.push(record);
    }

    return data;
}

