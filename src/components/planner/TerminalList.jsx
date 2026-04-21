export default function TerminalList({ terminals }) {
  if (!terminals || terminals.length === 0) {
    return <p className="muted">No nearby terminal data available yet.</p>;
  }

  return (
    <ul className="terminal-list">
      {terminals.map((terminal) => (
        <li key={terminal.id}>
          <strong>{terminal.name}</strong>
          <span>{terminal.area}</span>
        </li>
      ))}
    </ul>
  );
}