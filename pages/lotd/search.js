
import { useState, useEffect } from 'react';
import lunr from 'lunr';
import Head from 'next/head';
import { useCardSearch } from '../../hooks/use-card-search';
import Layout from '../../components/layout';

const SearchResultList = ({ results }) => {
    return (
        <ul>
            {
                results.map(result => 
                    <li key={result.id}>{result.name}</li>
                )
            }
        </ul>
    );
}

export default function CardSearch({ searchIndexRaw, cardMap }) {
    
    const [input, setInput] = useState('');
    const [query, setQuery] = useState('');

    const searchIndex = lunr.Index.load(JSON.parse(searchIndexRaw));
    const searchResults = useCardSearch(query, searchIndex, cardMap);

    const onChange = (e) => {
        setInput(e.target.value);
    };

    const onClick = (e) => {
        e.preventDefault();
        setQuery(input);
    };

    return (
        <Layout>
            <Head>
                <title>Card Search - Legacy of the Duelist</title>
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <h1>LotD Card Search</h1>
            <div>
                <input type="text" value={input} onChange={onChange} />
                <button onClick={onClick}>Search</button>
            </div>
            {
                searchResults.length > 0
                ? <SearchResultList results={searchResults} />
                : <p>No results (yet).</p>
            }
        </Layout>
    );
}


export async function getStaticProps() {
    const searchIndex = await import('../../data/lotd-search-index.json');
    const searchIndexRaw = JSON.stringify(searchIndex);
    const cardMap = (await import('../../data/lotd-cards.json')).default;
    return {
        props: { searchIndexRaw, cardMap }
    };
}

