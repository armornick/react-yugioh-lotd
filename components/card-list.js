

export default function CardList({ category, cards }) {
    return (
        <details className="accordion">
            <summary>{category}</summary>
            <ul className="colums-3">
            {
                cards.map(card => <li key={card}>{card}</li>)
            }
            </ul>
        </details>
    );
}
