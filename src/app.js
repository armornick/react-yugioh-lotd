
import React from 'react';
import PackList from './pack-list';
import CardList from './card-list';
import CardSearch from './card-search';


const App = () => {

    return (
        <div className="columns">
            <section>
                <PackList />
            </section>
            <section>
                <CardSearch />
            </section>
        </div>
    )

};

export default App;

