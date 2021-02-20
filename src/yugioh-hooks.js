
import { useState, useEffect } from 'react';
import lunr from 'lunr';


export function usePacks() {
    const [packs, setPacks] = useState([]);

    useEffect(() => {
        import('../data/lotd-boosters.json')
            .then((data) => {
                const packs = Object.keys(data);
                setPacks(packs);
            });
    });

    return packs;
}

export function useCardsInPack(packName, cardType) {
    const [cards, setCards] = useState([]);

    useEffect(() => {
        import('../data/lotd-boosters.json')
            .then((data) => {
                const allCards = data[packName];
                if (cardType in allCards) {
                    setCards(allCards[cardType]);
                }
            });
    });

    return cards;
}

let cardIndex, cardList = [];
const searchCache = {};

const fetchResults = (indexes) => {
    return new Promise((resolve, reject) => {
        const result = [];
        for (const index of indexes) {
            result.push(cardList[index.ref]);
        }
        resolve(result);
    });
}

const cardIndexPromise = new Promise((resolve, reject) => {
    import('../data/lotd-cards.json')
        .then((data) => {
            const cards = Object.keys(data);
            cardIndex = lunr(function () {
                this.field('name');

                for (let card of cards) {
                    const rawData = data[card];
                    const cardData = { id: cardList.length, name: card, cardType: rawData.cardType, pack: rawData.pack };
                    cardList.push(cardData);
                    this.add(cardData);
                }
            });
            resolve(cardIndex);
        });
});

export function useCardSearch(query) {
    const [results, setResults] = useState(searchCache[query] || []);

    useEffect(() => {

        if (!query) {
            return;
        }

        if (query in searchCache) {
            return;
        }

        cardIndexPromise.then((cardIndex) => {
            const resultIndexes = cardIndex.search(query);
            fetchResults(resultIndexes)
                .then((searchResults) => {
                    // console.log(searchResults);
                    searchCache[query] = searchResults;
                    setResults( searchResults );
                });
        });
    });

    return results;
}

