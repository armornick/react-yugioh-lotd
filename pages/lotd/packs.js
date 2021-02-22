
import { useEffect, useState } from 'react';
import Head from 'next/head';
import Layout from '../../components/layout';


export default function PackList() {

    const [packs, setPacks] = useState([]);

    useEffect(() => {
        import('../../data/lotd-boosters.json')
            .then(data => {
                let packNames = Object.keys(data);
                packNames = packNames.filter(item => item !== 'default');
                setPacks(packNames);
            });
    });

    return (
        <Layout>
            <Head>
                <title>Booster Packs - Legacy of the Duelist</title>
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <h1>Booster Packs</h1>
            <ul>
                {
                    packs.map(pack => 
                        <li key={pack}>{pack}</li>
                    )
                }
            </ul>
        </Layout>
    );
}
