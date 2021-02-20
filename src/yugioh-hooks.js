
import { useState, useEffect } from 'react';


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

