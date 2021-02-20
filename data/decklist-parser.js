
class DecklistParser {

    constructor({ onTitle, shouldAdd }) {
        this.onTitle = onTitle;
        this.shouldAdd = shouldAdd;
    }

    parseCardList(result, cardsEl) {
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
                            temp.push(item.textContent.trim());
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

        const monsters = decklist.querySelector('#monsters');
        this.parseCardList(result, monsters);

        const extraDeck = decklist.querySelector('#extra-deck');
        this.parseCardList(result, extraDeck);

        const backrows = decklist.querySelector('#spells-traps');
        this.parseCardList(result, backrows);

        return result;
    }

    parseAll(deckLists) {
        const result = {};

        for (let decklist of deckLists) {
            const data = this.parse(decklist);
            if (!this.shouldAdd || this.shouldAdd(data)) {
                result[ data.title ] = data;
            }
        }

        return result;
    }
    
}


module.exports = DecklistParser;

