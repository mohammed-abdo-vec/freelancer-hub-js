// src/Button.jsx — JSX is not JavaScript at all.
// No browser understands it; @babel/preset-react turns it into function calls.

export function Button({ label, onClick }) {
  return (
    <button className="btn" onClick={onClick}>
      {label} <span>→</span>
    </button>
  );
}
