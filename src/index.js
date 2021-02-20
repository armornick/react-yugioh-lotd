
import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';


const PackList = () => {

    const [packs, setPacks] = useState([]);

    useEffect(() => {
        import('../data/lotd-boosters.json')
            .then((data) => {
                const packs = Object.keys(data);
                setPacks(packs);
            });
    });

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


ReactDOM.render(<PackList />, document.getElementById('app'));
