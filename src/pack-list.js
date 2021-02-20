
import React from 'react';
import { usePacks } from './yugioh-hooks';

const PackList = () => {

    const packs = usePacks();

    return (
        <>
            <h1>Legacy of the Duelist!</h1>
            <ul>
                { packs.map(item =>
                    <li key={item}>{ item }</li>) }
            </ul>
        </>
    );

};

export default PackList;
