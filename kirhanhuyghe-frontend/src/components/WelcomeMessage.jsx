export default function WelcomeMessage({ username }) {
  return (
    <h1 className="text-3xl font-semibold text-center mb-6">
      Welkom, {username}
    </h1>
  );
}
