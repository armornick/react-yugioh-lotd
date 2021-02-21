
import React from 'react';
import PackList from './pack-list';
import CardList from './card-list';
import CardSearch from './card-search';


const App = () => {

    return (
        <div className="row">
            <section className="column">
                <PackList />
            </section>
            <section className="column">
                <CardSearch />
            </section>
        </div>
    )

};

export default App;

