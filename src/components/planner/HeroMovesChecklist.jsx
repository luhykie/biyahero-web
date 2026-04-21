import heroMoves from "../../data/heroMoves";

export default function HeroMovesChecklist({ selectedMoves, setSelectedMoves, actionButton }) {
  const toggleMove = (id) => {
    setSelectedMoves((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  return (
    <div style={{ marginTop: 18 }}>
      <h3 className="section-title">Hero Moves</h3>
      <div className="hero-grid">
        {heroMoves.map((move) => (
          <label key={move.id} className="hero-item">
            <input
              type="checkbox"
              checked={selectedMoves.includes(move.id)}
              onChange={() => toggleMove(move.id)}
            />
            <span>{move.label}</span>
          </label>
        ))}
        {actionButton ? <div className="hero-item hero-action-slot">{actionButton}</div> : null}
      </div>
    </div>
  );
}