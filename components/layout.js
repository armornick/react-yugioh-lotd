
import { useState } from 'react';
import Link from 'next/link';
import styles from '../styles/Layout.module.css';

export default function Layout({ children }) {
    
    const [sidebarActive, setSidebarActive] = useState(true);

    const onToggleClick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setSidebarActive(!sidebarActive);
    };

    return (
        <div className={styles.wrapper}>
            <div className={styles.main}>
                <div className={styles.inner}>
                    <header className={styles.header}>
                        <Link href="/">
                            <a className={styles.logo}>
                                <strong>Editorial</strong> by HTML5 UP
                            </a>
                        </Link>
                    </header>
                    <section>
                        {children}
                    </section>
                </div>
            </div>
            <div className={`${styles.sidebar} ${!sidebarActive ? styles.inactive : ''}`}>
                <a href="#sidebar" className={styles.toggle} onClick={onToggleClick}>
                    Toggle
                </a>
                <div className={styles.inner}>
                    <nav className={styles.menu}>
                        <header className={styles.major}>
                            <h2>Menu</h2>
                        </header>
                        <ul>
                            <li><Link href="/">Homepage</Link></li>
                            <li><Link href="/">Generic</Link></li>
                            <li><Link href="/">Elements</Link></li>
                        </ul>
                    </nav>
                </div>
            </div>
        </div>
    );

}
