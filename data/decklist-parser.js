
const cardDb = require('./yugioh-cards.json').data;

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
};

class DecklistParser {

    constructor({ onTitle, shouldAdd }) {
        this.onTitle = onTitle;
        this.shouldAdd = shouldAdd;
    }

    parseCardList(result, cardsEl, archetypes) {
        if (cardsEl) {
            let cardsList = cardsEl.querySelector('dl');
            let cardType;
            if (cardsList) {
                do {
                    if (cardsList.tagName === 'DL') {
                        cardType = cardsList.textContent.trim();
                    }
                    else if (cardsList.tagName === 'UL') {
                        let temp = [];
                        const items = cardsList.querySelectorAll('li');
                        for (let item of items) {
                            const cardName = item.textContent.trim();
                            let trueName = cardName;
                            if (cardName in CHANGED_CARD_NAMES) {
                                trueName = CHANGED_CARD_NAMES[cardName];
                            }
                            const card = cardDb.find(card => card.name.toUpperCase() == trueName.toUpperCase());
                            if (card) {
                                if (card.archetype) {
                                    archetypes[card.archetype] = archetypes[card.archetype] || 0;
                                    archetypes[card.archetype]++;
                                }
                            } else {
                                console.log(`could not find card "${cardName}"`);
                            }
                            temp.push(cardName);
                        }
                        result[cardType] = temp;
                    }
                } while ((cardsList = cardsList.nextSibling));
            }
        }
    }

    parse(decklist) {
        const result = {};

        const title = decklist.firstChild.textContent;
        result.title = title;
        console.log(title);
        if (this.onTitle) {
            this.onTitle(result, title);
        }

        const archetypes = {};

        const monsters = decklist.querySelector('#monsters');
        this.parseCardList(result, monsters, archetypes);

        const extraDeck = decklist.querySelector('#extra-deck');
        this.parseCardList(result, extraDeck, archetypes);

        const backrows = decklist.querySelector('#spells-traps');
        this.parseCardList(result, backrows, archetypes);

        const archetypeList = Object.keys(archetypes);
        result.archetypes = archetypeList.filter(archetype => archetypeList[archetype] > 5);

        return result;
    }

    parseAll(deckLists) {
        const result = {};

        let i = 0;
        for (let decklist of deckLists) {
            const data = this.parse(decklist);
            if (!this.shouldAdd || this.shouldAdd(data)) {
                data.id = i++;
                result[ data.title ] = data;
            }
        }

        return result;
    }
    
}


module.exports = DecklistParser;

