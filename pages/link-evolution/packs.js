
import Head from 'next/head';
import Link from 'next/link';
import Layout from '@/components/layout';


const PackListItem = ({ pack }) => {
    return (
        <li>
            <Link href={`/link-evolution/packs/${pack.id}`}>
                {pack.name}
            </Link>
        </li>
    );
}

export default function PackList({ packs }) {

    return (
        <Layout>
            <Head>
                <title>Booster Packs - Link Evolution</title>
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
    const data = await import('../../data/link-evolution-boosters.json');
    let packs = Object.keys(data);
    packs = packs.filter(item => item !== 'default');
    packs = packs.map(pack => ({ name: pack, id: data[pack].id }));

    return {
        props: { packs }
    };
}

