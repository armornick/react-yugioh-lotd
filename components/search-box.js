
import { useState, useEffect } from 'react';
import styles from '@/styles/Search.module.css';

export default function SearchBox({ onSearch }) {
    const [input, setInput] = useState('');

    const onChange = (e) => {
        setInput(e.target.value);
    };

    const onClick = (e) => {
        e.preventDefault();
        onSearch(input);
    };

    return (
        <div className={styles.search}>
            <input type="text" value={input} onChange={onChange} />
            <button onClick={onClick}>Search</button>
        </div>
    );
};

