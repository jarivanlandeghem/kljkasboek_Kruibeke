export default function ActionButton({ label, onClick }) {
  return (
    <button
      onClick={onClick}
      className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-md w-64 transition"
    >
      {label}
    </button>
  );
}
