
import Head from 'next/head';
import Link from 'next/link';
import Layout from '../../components/layout';


const PackListItem = ({ pack }) => {
    return (
        <li>
            <Link href={`/lotd/packs/${pack.id}`}>
                {pack.name}
            </Link>
        </li>
    );
}

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
                        <PackListItem key={pack.id} pack={pack} />
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

