
import { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from '@/styles/Layout.module.css';

export default function Layout({ children }) {
    
    const [checkedMq, setCheckedMq] = useState(false);
    const [sidebarActive, setSidebarActive] = useState(true);

    useEffect(() => {

        const mediaQuery = window.matchMedia('(max-width: 1280px)');
        const checkBreakpoint = (e) => {
            if (e.matches) {
                if (sidebarActive) {
                    setSidebarActive(false);
                }
            } else {
                if (!sidebarActive) {
                    setSidebarActive(true);
                }
            }
        }

        mediaQuery.addEventListener('change', checkBreakpoint);

        /*
            React reruns useEffect on every change so we have to
            make sure we only run our first check once or the
            sidebar stops working.
        */
        if (!checkedMq) {
            checkBreakpoint(mediaQuery);
            setCheckedMq(true);
        }

        return () => {
            mediaQuery.removeEventListener('change', checkBreakpoint);
        };

    });

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
                                <strong>Yu-Gi-Oh!</strong> Mini-Database
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
                        <header className="major">
                            <h2>Menu</h2>
                        </header>
                        <ul>
                            <li><Link href="/">Index</Link></li>
                            <li><Link href="/world-championship-2008/packs">World Championship 2008</Link></li>
                            <li><Link href="/lotd/packs">Legacy of the Duelist</Link></li>
                            <li><Link href="/link-evolution/packs">Link Evolution</Link></li>
                            <li><Link href="/structure-decks">Structure Decks</Link></li>
                        </ul>
                    </nav>
                    <footer className={styles.footer}>
                        <p className={styles.copyright}>
                            Design: <a href="https://html5up.net/">HTML5 UP</a>
                        </p>
                    </footer>
                </div>
            </div>
        </div>
    );

}
