
import Head from 'next/head';
import Layout from '@/components/layout';

export default function PackViewer({ pack }) {

    return (
        <Layout>
            <Head>
                <title>{pack.title} - World Championship 2008</title>
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <h1>{pack.title}</h1>

            <p>
                <strong>How to Unlock:</strong> &nbsp;
                {pack.requirement}
            </p>

            <p>
                This pack has { pack.cards.length } cards.
            </p>
            
            <table>
                <thead>
                    <tr>
                        <th>Card Name</th>
                        <th>Card Type</th>
                        <th>Rarity</th>
                        <th>Password</th>
                    </tr>
                </thead>
                <tbody>
                {
                    pack.cards.map(card => 
                        <tr key={card.password}>
                            <td>{card.cardName}</td>
                            <td>{card.type}</td>
                            <td>{card.rarity}</td>
                            <td>{card.password}</td>
                        </tr>
                    )
                }
                </tbody>
            </table>
        </Layout>
    );
}

export async function getStaticPaths() {
    const data = await import('data/wc08-boosters.json');
    let packs = Object.keys(data);
    packs = packs.filter(pack => data[pack] != null && data[pack].id != null );

    const paths = packs.map(pack => ({
        params: { id: String(data[pack].id) }
    }));

    return { paths, fallback: false };
};

export async function getStaticProps({ params }) {
    const data = await import('data/wc08-boosters.json');
    const packNames = Object.keys(data);

    for (let packName of packNames) {
        const pack = data[packName];
        if (pack.id == params.id) {
            return { props: { pack } }
        }
    }

    throw new Error(`no card pack with id ${params.id}`);
};
