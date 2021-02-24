
import { useState } from 'react';
import lunr from 'lunr';
import Head from 'next/head';
import { useCardSearch } from '@/hooks/use-card-search';
import Layout from '@/components/layout';
import SearchBox from '@/components/search-box';

const SearchResultList = ({ results }) => {
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
                results.map(result => 
                    <tr key={result.name}>
                        <td>{result.name}</td>
                        <td>{result.pack}</td>
                        <td>{result.cardType}</td>
                    </tr>
                )
            }
            </tbody>
        </table>
    );
}

export default function CardSearch({ searchIndexRaw, cardMap }) {
    
    const [query, setQuery] = useState('');

    const searchIndex = lunr.Index.load(JSON.parse(searchIndexRaw));
    const searchResults = useCardSearch(query, searchIndex, cardMap);

    const onClick = (input) => {
        setQuery(input);
    };

    return (
        <Layout>
            <Head>
                <title>Card Search - Link Evolution</title>
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <h1>Link Evolution Card Search</h1>
            <SearchBox onSearch={onClick} />
            {
                searchResults.length > 0
                ? <SearchResultList results={searchResults} />
                : <p>No results (yet).</p>
            }
        </Layout>
    );
}


export async function getStaticProps() {
    const searchIndex = await import('../../data/link-evolution-search-index.json');
    const searchIndexRaw = JSON.stringify(searchIndex);
    const cardMap = (await import('../../data/link-evolution-cards.json')).default;
    return {
        props: { searchIndexRaw, cardMap }
    };
}

