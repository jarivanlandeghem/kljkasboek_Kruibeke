export default function WelcomeMessage({ username }) {
  return (
    <h1 className="text-3xl text-black font-semibold text-center mb-6">
      Welkom, {username}
    </h1>
  );
}
