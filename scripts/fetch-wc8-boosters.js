const { writeFileSync, existsSync, mkdirSync } = require('fs');
const { JSDOM } = require('jsdom');
const { parseRarityPage } = require('./yugipedia-parser');
const Downloader = require('./axios-downloader');

const CACHE_DIR = '.cache';
const OUTPUT_DIR = 'data';
const OUTPUT_FNAME = 'wc08-boosters.json';

const BOOSTER_PACK_UNLOCKS = {
    "White Light Ruler": "Always available for purchase",
    "Fiery Rage": "Always available for purchase",
    "Chaos Knight": "Always available for purchase",
    "Dark Legend": "Always available for purchase",
    "Dark Flare Battle": "Always available for purchase",
    "Ultimate Power": "Always available for purchase",
    "My Hero": "Defeat 3 Opponents in Free Duel",
    "Inhuman Creation": "Defeat 6 Opponents in Free Duel",
    "Inherited Magic": "Defeat 10 Opponents in Free Duel",
    "Pitch-Dark Virtue": "Defeat 15 Opponents in Free Duel",
    "King of the Ark": "Defeat 20 Opponents in Free Duel",
    "Rumbling Thunder": "Defeat 30 Opponents in Free Duel",
    "Dark Meets Light": "Defeat 40 Opponents in Free Duel",
    "Mysterious Galaxy": "Defeat 50 Opponents in Free Duel",
    "Shocking Energy": "Have a total of 50 Duels",
    "Extreme Wisdom": "Have a total of 100 Duels",
    "Bringer of Light": "Have a total of 200 Duels",
    "Ultimate Light": "World of Grace - All Spirits",
    "Rousing Chaos": "World of Sunlight",
    "Absolute Nothing": "World of Sunlight",
    "Out of the Abyss": "World of Sunlight (Sea) - All Spirits",
    "Dragon Destroyer": "World of Sunlight (Desert) - All Spirits",
    "Never Setting Sun": "World of Civilization",
    "Thirst to Destroy": "World of Civilization",
    "Beyond Ultimate": "World of Civilization - All Spirits",
    "Sleeping Tomb": "World of Darkness",
    "Ultimate Darkness": "World of Darkness",
    "Venomous Dilemma": "World of Darkness - All Spirits",
    "Darkness Removed": "World of Order",
    "Bloodline Destiny": "World of Order",
    "The 7 Crystals": "World of Order (Sky) - All Spirits",
    "Ancient Gadgetry": "World of Order (Clouds) - All Spirits",
    "Mother Earth": "World of Chaos",
    "Magma Eruption": "World of Chaos",
    "Chaos of Nothing": "World of Chaos (Neo Space) - All Spirits",
    "Bearer of Demise": "World of Chaos (Dark Realm Map) - All Spirits",
    "Menacing Ruler": "Clear Tournament Level 1 (5 times)",
    "World in Between": "Clear Tournament Level 2 (5 times)",
    "Light from Clouds": "Clear Tournament Level 3 (5 times)",
};

// some cards had their names changed
const CHANGED_CARD_NAMES = {
    "Blue-Eyes White Dragon (2nd Art)": "Blue-Eyes White Dragon",
    "Bright Castle": "Shine Palace",
    "Alkana Knight Joker": "Arcana Knight Joker",
    "Dark Magician (1st Art)": "Dark Magician",
    "Red-Eyes B. Dragon": "Red-Eyes Black Dragon",
    "B. Skull Dragon": "Black Skull Dragon",
    "Red-Eyes B. Chick": "Black Dragon's Chick",
    "Meteor B. Dragon": "Meteor Black Dragon",
    "Hand Collapse": "Hand Destruction",
    "Enchanted Arrow": "Spell Shattering Arrow",
    "Makiu": "Makiu, the Magical Mist",
    "Dark Magician (Arkana)": "Dark Magician",
    "Kinetic Soldier": "Cipher Soldier",
    "Judgment of Pharaoh": "Judgment of the Pharaoh",
    "Vortex Kong": "Voltic Kong",
    "Oscillo Hero #2": "Wattkid",
    "Arcana Force Extra - The Light Ruler": "Arcana Force EX - The Light Ruler",
    "Curse of Vampire": "Vampire's Curse",
    "The Splendid Venus": "Splendid Venus",
    "Cyberdark Impact": "Cyberdark Impact!",
    "Helios Tris Megistus": "Helios Trice Megistus",
    "Eternal Draught": "Eternal Drought",
    "De-Spell Germ Weapon": "Virus Cannon",
    "F.G.D.": "Five-Headed Dragon",
    "Skull Zoma": "Zoma the Spirit",
    "Mystical Beast Serket": "Mystical Beast of Serket",
    "Cliff the Trap Remover": "Dark Scorpion - Cliff the Trap Remover",
    "Earthbound Spirit's Invitation": "Call of the Earthbound",
    "Marie the Fallen One": "Darklord Marie",
    "Amazon Archer": "Amazoness Archer",
    "Rigras Leever": "Rigorous Reaver",
    "Triage": "The Selection",
    "A Rival Appears": "A Rival Appears!",
    "Summon Priest": "Summoner Monk",
    "Ancient City Rainbow Ruins": "Ancient City - Rainbow Ruins",
    "Crystal Counter": "Counter Gem",
    "Exodius the Ultimate Forbidden One": "Exodius the Ultimate Forbidden Lord",
    "Terra Gravity": "Terra Firma Gravity",
    "Elemental Hero The Heat": "Elemental HERO Heat",
    "Null and Void": "Muko",
    "Armityle the Chaos Phantom": "Armityle the Chaos Phantasm",
    "Fusion Scrap": "Revoke Fusion",
    "Tricky's Magic 4": "Tricky Spell 4",
    "Dark Ruler Vandalgyon": "Van'Dalgyon the Dark Dragon Lord",
};

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
        const rawData = parseRarityPage(page);

        const cards = [];
        if (rawData.Commons) { // to filter "structure decks" and "all at random"

            const rarities = Object.keys(rawData);
            for (const rarity of rarities) {
                
                const cardNames = rawData[rarity];
                for (const cardName of cardNames) {

                    let trueName = cardName;
                    if (trueName in CHANGED_CARD_NAMES) {
                        trueName = CHANGED_CARD_NAMES[cardName];
                    }

                    const cardData = cardDb.find(card => card.name.toUpperCase() == trueName.toUpperCase() );
                    if (!cardData) {
                        console.log(`unknown card: ${ cardName }`);
                        continue;
                    }

                    cards.push({
                        cardName, rarity,
                        alias: trueName != cardName ? trueName : undefined,
                        type: cardData.type,
                        archetype: cardData.archetype,
                    });

                }

            }

            result[link.name] = {
                title: link.name,
                requirement: BOOSTER_PACK_UNLOCKS[ link.name ],
                cards
            };
        }
        else {
            console.log(`no data for page: ${link.url}`);
        }
    }

    console.log(`writing ${OUTPUT_FNAME}`);
    writeFileSync(`${OUTPUT_DIR}/${OUTPUT_FNAME}`, JSON.stringify(result, null, 2));
}

main();

