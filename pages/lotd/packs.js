
import Head from 'next/head';
import Layout from '../../components/layout';


export default function PackList({ packs }) {

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
                        <li key={pack.id}>{pack.name}</li>
                    )
                }
            </ul>
        </Layout>
    );
}


export async function getStaticProps() {
    const data = await import('../../data/lotd-boosters.json');
    let packs = Object.keys(data);
    packs = packs.filter(item => item !== 'default');
    packs = packs.map(pack => ({ name: pack, id: data[pack].id }));

    return {
        props: { packs }
    };
}

