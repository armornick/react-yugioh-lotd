
const { writeFileSync, existsSync, mkdirSync } = require('fs');
const { JSDOM } = require('jsdom');
const Downloader = require('./axios-downloader');

const CACHE_DIR = '.cache';
const OUTPUT_DIR = 'data';
const OUTPUT_FNAME = 'link-evolution-boosters.json';

const RE_CARD_TITLE = /^"(.+)"$/;

const CARD_TYPES = {
    // main deck monsters
    "Effect Monster": "Effect Monsters", "Flip Effect Monster": "Effect Monsters",
    "Flip Tuner Effect Monster":"Tuner monsters","Normal Tuner Monster":"Tuner monsters",
    "Tuner Monster":"Tuner monsters","Gemini Monster":"Gemini monsters",
    "Normal Monster":"Normal Monsters","Pendulum Effect Monster":"Pendulum Monsters",
    "Pendulum Flip Effect Monster":"Pendulum Monsters","Pendulum Normal Monster":"Pendulum Monsters",
    "Pendulum Tuner Effect Monster":"Pendulum Monsters","Ritual Effect Monster":"Ritual Monsters",
    "Ritual Monster":"Ritual Monsters","Spirit Monster":"Spirit monsters",
    "Toon Monster":"Toon monsters","Union Effect Monster":"Union monsters",
    // extra deck monsters
    "Fusion Monster":"Fusion Monsters","Pendulum Effect Fusion Monster":"Fusion Monsters",
    "Link Monster":"Link Monsters","Synchro Monster":"Synchro Monsters",
    "Synchro Pendulum Effect Monster":"Synchro Monsters","Synchro Tuner Monster":"Synchro Monsters",
    "XYZ Monster":"Xyz Monsters","XYZ Pendulum Effect Monster":"Xyz Monsters",
    // spells and trap cards
    "Spell Card":"Spells","Trap Card":"Traps",
};

// some cards had their names changed
const CHANGED_CARD_NAMES = {
    "Goblin Marauding Force": "Goblin Marauding Squad",
    "Nurse Reficule the Fallen One": "Darklord Nurse Reficule",
    "Red-Eyes B. Chick": "Black Dragon's Chick",
    "Judgement of Anubis": "Judgment of Anubis",
    "Winged Dragon, Guardian of the Fortress": "Winged Dragon, Guardian of the Fortress #1",
    "Attack the Moon": "Attack the Moon!",
    "Judgment of Pharaoh": "Judgment of the Pharaoh",
    "Marie the Fallen One": "Darklord Marie",
    "Frog the Jam": "Slime Toad",
    "Null and Void": "Muko",
    "Twin Long Rods #1": "Twin Long Rods 1",
    "Red-Eyes B. Dragon": "Red-Eyes Black Dragon",
    "Malefic Red-Eyes B. Dragon": "Malefic Red-Eyes Black Dragon",
    "Cú Chulainn the Awakened": "Cu Chulainn the Awakened",
    "B. Skull Dragon": "Black Skull Dragon",
    "Meteor B. Dragon": "Meteor Black Dragon",
    "Angel 07": "Angel O7",
    "Beast Machine King Barbaros Ür": "Beast Machine King Barbaros Ur",
    "Big Core": "B.E.S. Big Core",
    "Falchionβ": "Falchion Beta",
    "Fiendish Engine Ω": "Fiendish Engine Omega",
    "Shredder": "Shreddder",
    "Crystal Counter": "Counter Gem",
    "Armityle the Chaos Phantom": "Armityle the Chaos Phantasm",
    "Temple of the Six Samurai": "Temple of the Six",
    "Dryad": "Doriado",
    "Machine Lord Ür": "Machine Lord Ur",
    "Necrolancer the Timelord": "Necrolancer the Time-lord",
    "Chirubimé, Princess of Autumn Leaves": "Chirubime, Princess of Autumn Leaves",
    "Mariña, Princess of Sunflowers": "Marina, Princess of Sunflowers",
    "Metaphysical Regeneration": "Supernatural Regeneration",
    "Infernity Bishop": "Infernity Patriarch",
    "Spell Reactor・RE": "Spell Reactor RE",
    "Summon Reactor・SK": "Summon Reactor SK",
    "Trap Reactor・Y FI": "Trap Reactor Y FI",
    "Earthbound Revival": "Earthbound Immortal Revival",
    "Roar of the Earthbound": "Roar of the Earthbound Immortal",
    "Damage Vaccine Ω MAX": "Damage Vaccine Omega MAX",
    "Full Force Strike": "Full-Force Strike",
    "Mystical Sheep 1": "Mystical Sheep #1",
    "Mystical Sheep 2": "Mystical Sheep #2",
    "Gigarays Gandora the Dragon of Destruction": "Gandora Giga Rays the Dragon of Destruction",
    "Fire Opal Head": "Fire Opalhead",
    "Number F0: Utopic Future Slash": "Number F0: Utopic Future - Future Slash",
    "Seraphim Papillion": "Seraphim Papillon",
};

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

    const cardDb = require('./yugioh-cards.json').data;

    const result = {};
    const dl = new Downloader({ outputDir: CACHE_DIR });

    const response = await dl.download('Card_Shop.html', 'https://yugipedia.com/wiki/Yu-Gi-Oh!_Legacy_of_the_Duelist:_Link_Evolution/Card_Shop');
    const dom = new JSDOM(response);
    const document = dom.window.document;

    let id = 0;
    const links = getCardPackLinks(document);
    for (const link of links) {
        const packPage = await dl.download( makePackFileName(link), makeCompleteUrl(link));
        const dom = new JSDOM(packPage);
        const document = dom.window.document;

        const title = document.getElementById('firstHeading').textContent.trim().replace(/\s\(Link\sEvolution\)$/, '');
        console.log(title);

        const data = {}, archetypes = {};
        const tables = document.querySelectorAll('table.wikitable');
        for (const table of tables) {
            const heading = table.querySelector('th');
            if (heading.textContent.trim() === 'Name'
                && heading.nextElementSibling.textContent.trim() === 'Rarity') {

                    for (let row of table.rows) {
                        const firstChild = row.children[0];
                        if (firstChild && firstChild.tagName !== 'TH') {

                            let cardTitle = RE_CARD_TITLE.exec( firstChild.textContent.trim() )[1];
                            let trueName = cardTitle;
                            if (trueName in CHANGED_CARD_NAMES) {
                                trueName = CHANGED_CARD_NAMES[cardTitle];
                            }
                            let card = cardDb.find(card => card.name.toUpperCase() == trueName.toUpperCase() );
                            if (!card) {
                                console.log(`could not find card "${cardTitle}"`);
                                continue;
                            }
                            const cardType = CARD_TYPES[ card.type ];
                            if (card.archetype) {
                                archetypes[card.archetype] = archetypes[card.archetype] || 0;
                                archetypes[card.archetype]++;
                            }

                            data[cardType] = data[cardType] || [];
                            data[cardType].push(cardTitle);

                        }
                    }

            }
        }

        // find archetypes that booster pack is dedicated to
        const foundArchetypes = Object.keys(archetypes);
        data.archetypes = foundArchetypes.filter(archetype => archetypes[archetype] > 5);
        
        data.id = id++;
        data.title = title.replace(/ pack$/, '');
        result[ title ] = data;
    }

    console.log(`writing ${OUTPUT_FNAME}`);
    writeFileSync(`${OUTPUT_DIR}/${OUTPUT_FNAME}`, JSON.stringify(result, null, 2));

};

main();

