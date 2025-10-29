export default function Transaction({ user, amount, desc }) { // 👈2
return (
  <div className="bg-amber-800 text-amber-100 border rounded-lg text-center">
    {user.name} gaf €{amount} uit bij {desc.name}
  </div>);
}