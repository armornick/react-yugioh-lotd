
import Head from 'next/head';
import Layout from '@/components/layout';


export default function PackViewer({ pack }) {
    
    return (
        <Layout>
            <Head>
                <title>{pack.title} Pack - Legacy of the Duelist</title>
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <h1>{pack.title}</h1>
            <p><strong>Cost:</strong> {pack.cost}DP</p>
        </Layout>
    );
}

export async function getStaticPaths() {
    const data = await import('data/lotd-boosters.json');
    let packs = Object.keys(data);

    const paths = packs.map(pack => ({
        params: { id: String(data[pack].id) }
    }));

    return { paths, fallback: false };
};

export async function getStaticProps({ params }) {
    const data = await import('data/lotd-boosters.json');
    const packNames = Object.keys(data);

    for (let packName of packNames) {
        const pack = data[packName];
        if (pack.id == params.id) {
            return { props: { pack } }
        }
    }

    throw new Error(`no card pack with id ${params.id}`);
};
