
import React from 'react';
import { usePacks } from './yugioh-hooks';

const PackItem = ({ packName, onClick }) => {
    return (
        <li>
            <a onClick={onClick}>
                {packName}
            </a>
        </li>
    )
}

const PackList = ({ onSelect }) => {

    const packs = usePacks();

    const onClick = (e) => {
        e.preventDefault();
        // console.log(e.target.textContent);
        onSelect(e.target.textContent);
    };

    return (
        <>
            <h1>Legacy of the Duelist!</h1>
            <ul>
                { packs.map(item =>
                    <PackItem key={item} packName={item} onClick={onClick} />) }
            </ul>
        </>
    );

};

export default PackList;
