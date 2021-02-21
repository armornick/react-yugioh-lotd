
import React from 'react';
import PackViewer from './pack-viewer';
import CardSearch from './card-search';


const App = () => {

    return (
        <div className="row">
            <section className="column">
                <PackViewer />
            </section>
            <section className="column">
                <CardSearch />
            </section>
        </div>
    )

};

export default App;

