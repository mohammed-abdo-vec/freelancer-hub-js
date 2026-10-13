export function Spinner({ label = 'Loading…', full = false }) {
  return (
    <div className={full ? 'spinner spinner--full' : 'spinner'} role="status">
      <span className="spinner__dot" />
      <span>{label}</span>
    </div>
  );
}
