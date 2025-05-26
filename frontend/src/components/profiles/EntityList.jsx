// components/EntityList.jsx
export function EntityList({ title, items, renderItem }) {
    return (
      <section className="mb-6">
        <h2 className="text-lg font-medium">{title}</h2>
        {items.length
          ? <ul className="list-disc pl-5">{items.map(renderItem)}</ul>
          : <div>No {title.toLowerCase()}.</div>}
      </section>
    );
  }
  