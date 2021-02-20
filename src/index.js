
import React, { useState } from 'react';
import ReactDOM from 'react-dom';


const PackList = () => {

    const [packs, setPacks] = useState([]);

    return (
        <>
            <h1>Legacy of the Duelist!</h1>
            <ul>
                { packs.map(item =>
                    <li>{ item }</li>) }
            </ul>
        </>
    );

};


ReactDOM.render(<PackList />, document.getElementById('app'));
