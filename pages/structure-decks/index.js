
import Head from 'next/head';
import Link from 'next/link';
import Layout from '@/components/layout';


export default function StructureDecks({ decks }) {
    
    return (
        <Layout>
            <Head>
                <title>Structure Decks</title>
                <link rel="icon" href="/favicon.ico" />
            </Head>

            <ul>
            {
                decks.map(deck => 
                    <li key={deck.slug}>
                        <code>{ JSON.stringify(deck) }</code>
                    </li>
                )
            }
            </ul>
        </Layout>
    );
}


export async function getStaticProps() {
    const data = await import('../../data/structure-decks.json');
    let decks = Object.keys(data);
    decks = decks.filter(item => data[item] && data[item].slug != null);
    decks = decks.map(deck => ({ title: data[deck].title, slug: data[deck].slug, }));

    return {
        props: { decks }
    };
}

