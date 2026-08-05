export default function RequestToast({ message, type }) {
  return (
    <div className={`request-toast request-toast-${type}`}>
      <span>
        {type === "success" ? "✓" : "✕"}
      </span>

      <p>{message}</p>

      <button>
        ×
      </button>
    </div>
  );
}