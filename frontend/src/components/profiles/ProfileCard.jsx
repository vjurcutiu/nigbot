// components/ProfileCard.jsx
export default function ProfileCard({ title, fields }) {
    return (
      <section className="mb-6">
        <h2 className="text-lg font-medium">{title}</h2>
        <ul className="list-none space-y-1">
          {fields.map(({ label, value }) => (
            <li key={label}>
              <strong>{label}:</strong> {value}
            </li>
          ))}
        </ul>
      </section>
    );
  }
  