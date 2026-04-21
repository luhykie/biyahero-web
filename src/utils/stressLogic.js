export function getStressLevel({ durationMinutes, selectedMoves }) {
  let score = 0;

  if (durationMinutes >= 60) score += 3;
  else if (durationMinutes >= 40) score += 2;
  else if (durationMinutes >= 20) score += 1;

  if (selectedMoves.includes("avoid_peak")) score -= 1;
  if (selectedMoves.includes("less_crowded")) score -= 1;
  if (selectedMoves.includes("minimize_transfers")) score -= 1;

  if (score >= 3) return "High";
  if (score >= 1) return "Medium";
  return "Low";
}