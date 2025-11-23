export default function ActionButton({ label, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{ backgroundColor: 'red' }} // bg-red-600 ging niet in className dus ik force da hier gewoon
      className="text-white px-6 py-2 rounded-md w-full sm:w-64 transition"
    >
      {label}
    </button>
  );
}
