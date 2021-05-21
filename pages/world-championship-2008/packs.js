
import Head from 'next/head';
import Link from 'next/link';
import Layout from '@/components/layout';


const PackListItem = ({ pack }) => {
    return (
        <tr>
            <td>
                <Link href={`/world-championship-2008/packs/${pack.id}`}>
                    {pack.name}
                </Link>
            </td>
            <td>
                {pack.requirement}
            </td>
        </tr>
    );
}

export default function PackList({ packs }) {

    return (
        <Layout>
            <Head>
                <title>Booster Packs - World Championship 2008</title>
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <h1>Booster Packs</h1>
            <table className="alt">
                <thead>
                    <tr><th>Pack</th><th>How to Unlock</th></tr>
                </thead>
                <tbody>
                {
                    packs.map(pack => 
                        <PackListItem key={pack.id} pack={pack} />
                    )
                }
                </tbody>
            </table>
        </Layout>
    );
}


export async function getStaticProps() {
    const data = await import('../../data/wc08-boosters.json');
    let packs = Object.keys(data);
    packs = packs.filter(item => item !== 'default');
    packs = packs.map(pack => ({ name: pack, id: data[pack].id, requirement: data[pack].requirement }));

    return {
        props: { packs }
    };
}

