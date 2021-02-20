
import React from 'react';
import { useCardsInPack } from './yugioh-hooks';

const CardList = ({ packName }) => {

    const cards = useCardsInPack(packName, 'Effect Monsters');

    return (
        <>
            <h1>{packName}</h1>
            <ul>
                {
                    cards.map(item => 
                        <li key={item}>{item}</li>)
                }
            </ul>
        </>
    )

};

export default CardList;


