import Transaction from './Transaction';

function TransactionsTable({ transacties, onDelete }) {
  if (transacties.length === 0) {
    return (
      <div className='p-4 mb-4 text-sm text-red-600 rounded-lg bg-red-100'>Er zijn nog geen transacties toegevoegd.</div>
    );
  }
  return (
    <table className='table-fixed w-full border-collapse'>
      <thead className='text-black'>
        <tr className="border-b-2 border-gray-300">
          <th className="text-start py-2 w-3/11">Beschrijving</th>
          <th className='text-start py-2 w-80'>Categorie 1</th>
          <th className='text-start py-2 w-85'>Categorie 2</th>
          <th className="text-start py-2 w-45">Datum</th>
          <th className="text-start py-2 w-45">Gebruiker</th>
          <th className='text-start py-2 w-45'>Bedrag</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        {transacties.map((transaction) => (
          <Transaction key={transaction.transactieID} {...transaction} onDelete={onDelete} />
        ))}
      </tbody>
    </table>
  );
}

export default TransactionsTable;

