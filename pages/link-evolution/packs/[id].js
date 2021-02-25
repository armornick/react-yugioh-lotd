
import Head from 'next/head';
import Layout from '@/components/layout';
import CardList from '@/components/card-list';

const getImageSlug = (packName) => {
    return `lotd-${packName.toLowerCase().replace(/\s/g, '-')}.png`;
};

export default function PackViewer({ pack }) {

    return (
        <Layout>
            <Head>
                <title>{pack.title} - Link Evolution</title>
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <dvi className="row">
                <div className="col-6 col-12-medium">
                    <h1>{pack.title}</h1>
                    {
                        pack.archetypes && pack.archetypes.length > 0
                        ? <p><strong>Archetypes:</strong> { pack.archetypes.join(', ') }</p>
                        : null
                    }
                </div>
                <div className="col-6 col-12-medium">
                    <span className="image right">
                        <img src={`/images/${getImageSlug(pack.title)}`} alt={`image of ${pack.title}`} />
                    </span>
                </div>
            </dvi>
            
            { "Normal Monsters" in pack ? <CardList category="Normal Monsters" cards={pack["Normal Monsters"]} /> : null }
            { "Effect Monsters" in pack ? <CardList category="Effect Monsters" cards={pack["Effect Monsters"]} /> : null }
            { "Gemini monsters" in pack ? <CardList category="Gemini monsters" cards={pack["Gemini monsters"]} /> : null }
            { "Spirit monsters" in pack ? <CardList category="Spirit monsters" cards={pack["Spirit monsters"]} /> : null }
            { "Toon monsters" in pack ? <CardList category="Toon monsters" cards={pack["Toon monsters"]} /> : null }
            { "Union monsters" in pack ? <CardList category="Union monsters" cards={pack["Union monsters"]} /> : null }
            { "Tuner monsters" in pack ? <CardList category="Tuner monsters" cards={pack["Tuner monsters"]} /> : null }
            { "Pendulum Monsters" in pack ? <CardList category="Pendulum Monsters" cards={pack["Pendulum Monsters"]} /> : null }
            { "Ritual Monsters" in pack ? <CardList category="Ritual Monsters" cards={pack["Ritual Monsters"]} /> : null }
            { "Fusion Monsters" in pack ? <CardList category="Fusion Monsters" cards={pack["Fusion Monsters"]} /> : null }
            { "Synchro Monsters" in pack ? <CardList category="Synchro Monsters" cards={pack["Synchro Monsters"]} /> : null }
            { "Xyz Monsters" in pack ? <CardList category="Xyz Monsters" cards={pack["Xyz Monsters"]} /> : null }
            { "Link Monsters" in pack ? <CardList category="Link Monsters" cards={pack["Link Monsters"]} /> : null }
            { "Spells" in pack ? <CardList category="Spells" cards={pack["Spells"]} /> : null }
            { "Traps" in pack ? <CardList category="Traps" cards={pack["Traps"]} /> : null }
        </Layout>
    );
}

export async function getStaticPaths() {
    const data = await import('data/link-evolution-boosters.json');
    let packs = Object.keys(data);
    packs = packs.filter(pack => packs[pack] != null && packs[pack].id != null );

    const paths = packs.map(pack => ({
        params: { id: String(data[pack].id) }
    }));

    return { paths, fallback: false };
};

export async function getStaticProps({ params }) {
    const data = await import('data/link-evolution-boosters.json');
    const packNames = Object.keys(data);

    for (let packName of packNames) {
        const pack = data[packName];
        if (pack.id == params.id) {
            return { props: { pack } }
        }
    }

    throw new Error(`no card pack with id ${params.id}`);
};
