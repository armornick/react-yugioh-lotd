
import React, { useState } from 'react';
import PackList from './pack-list';
import CardList from './card-list';


const PackViewer = () => {

    const [selectedPack, setSelectedPack] = useState(null);

    return (
        selectedPack
        ? 
            <>
                <button onClick={() => setSelectedPack(null)}>
                    &larr; Return to pack list
                </button>
                <CardList packName={selectedPack} />
            </>
        : <PackList onSelect={(packName) => setSelectedPack(packName)} />
    );

};

export default PackViewer;

