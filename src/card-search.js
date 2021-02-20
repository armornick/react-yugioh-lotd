
import React, { useState } from 'react';
import { useCardSearch } from './yugioh-hooks';


const SearchResults = ({ data }) => {
    return (
        <table>
            <thead>
                <tr>
                    <th>Name</th>
                    <th>Pack</th>
                    <th>Type</th>
                </tr>
            </thead>
            <tbody>
                {
                    data.map(item => 
                        <tr key={item.id}>
                            <td>{item.name}</td>
                            <td>{item.pack}</td>
                            <td>{item.cardType}</td>
                        </tr>
                    )
                }
            </tbody>
        </table>
    );
};

const CardSearch = () => {

    const [input, setInput] = useState('');
    const [query, setQuery] = useState(null);
    const searchResults = useCardSearch(query);

    const onChange = (e) => {
        setInput(e.target.value);
    };

    const onClick = (e) => {
        e.preventDefault();
        // console.log(`searching: ${input}`);
        setQuery(input);
    };

    return (
        <>
            <div className="search-bar">
                <input type="text" value={input} onChange={onChange} />
                <button onClick={onClick}>Search</button>
            </div>
            {
                searchResults.length > 0 
                    ? <SearchResults data={searchResults} />
                    : <p>No Results Found</p>
            }
        </>
    );

}

export default CardSearch;

