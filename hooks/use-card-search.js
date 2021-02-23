
import { useState, useEffect } from 'react';

const searchCache = {};

export function useCardSearch(query, searchIndex, cardMap) {
    
    const [results, setResults] = useState([]);

    useEffect(() => {
        if (!query || query == '') {
            return;
        }

        searchCache[cardMap] = searchCache[cardMap] || {};
        const cache = searchCache[cardMap];

        if (query in cache) {
            return setResults(cache[query]);
        }

        const queryResults = searchIndex.search(query);
        const searchResults = [];
        for (let queryResult of queryResults) {
            searchResults.push(cardMap[queryResult.ref]);
        }
        cache[query] = searchResults;
        return setResults(searchResults);
    });

    return results;
}
