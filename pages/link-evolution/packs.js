
import Head from 'next/head';
import Link from 'next/link';
import Layout from '@/components/layout';


const PackListItem = ({ pack }) => {
    return (
        <tr>
            <td>
                <Link href={`/link-evolution/packs/${pack.id}`}>
                    {pack.name}
                </Link>
            </td>
            <td>
            {
                pack.archetypes && pack.archetypes.length > 0
                ? pack.archetypes.join(', ') 
                : null
            }
            </td>
        </tr>
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
            <table className="alt">
                <thead>
                    <tr><th>Pack</th><th>Archetypes</th></tr>
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
    const data = await import('../../data/link-evolution-boosters.json');
    let packs = Object.keys(data);
    packs = packs.filter(item => item !== 'default');
    packs = packs.map(pack => ({ name: pack, id: data[pack].id, archetypes: data[pack].archetypes }));

    return {
        props: { packs }
    };
}

