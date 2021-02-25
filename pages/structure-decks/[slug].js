
import Head from 'next/head';
import Layout from '@/components/layout';


const CardItem = ({ card }) => {
    return (
        <tr>
            <td>{card.code}</td>
            <td>{card.Name}</td>
            <td>{card.Qty}</td>
            <td>{card.Category}</td>
        </tr>
    );
};

export default function StructureDeck({ deck }) {
    
    return (
        <Layout>
            <Head>
                <title>{deck.title}</title>
                <link rel="icon" href="/favicon.ico" />
            </Head>

            <div className="row">
                <div className="col-6 col-12-medium">
                    <h2>{deck.title}</h2>
                    { deck['Japanese Name'] ? <p>{deck['Japanese Name']}</p> : null }
                    <p>{deck.description}</p>
                    <p><strong>Cover cards:</strong> {deck['Cover card'].join(', ')}</p>
                    
                    <p><a href={deck.url}>Read More</a></p>
                </div>
                <div className="col-6 col-12-medium">
                    <span className="image right">
                        <img src={`/images/${deck.slug}.png`} alt="Structure Deck image" />
                    </span>
                </div>
            </div>
            <hr />

            <table>
                <thead>
                    <tr>
                        <th>Code</th>
                        <th>Name</th>
                        <th>Quantity</th>
                        <th>Category</th>
                    </tr>
                </thead>
                <tbody>
                {
                    deck.cards.map(card => 
                        <CardItem key={card.code} card={card} />
                    )
                }
                </tbody>
            </table>
        </Layout>
    );
}


export async function getStaticPaths() {
    const data = await import('data/structure-decks.json');
    let decks = Object.keys(data);
    decks = decks.filter(item => data[item] && data[item].slug != null);

    const paths = decks.map(deck => ({
        params: { slug: String(data[deck].slug) }
    }));

    return { paths, fallback: false };
}


export async function getStaticProps({ params }) {
    const data = await import('data/structure-decks.json');
    const deckNames = Object.keys(data);

    for (let deckName of deckNames) {
        const deck = data[deckName];
        if (deck.slug == params.slug) {
            return { props: { deck } }
        }
    }

    throw new Error(`no card pack with slug ${params.slug}`);
};

