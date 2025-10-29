
export default function TransactionTable( /**hier een var met transactie */) {

  return (
    <table className='table-auto w-full justify-center border-collapse'>
      <thead>
        <tr className="border-b-2 border-gray-300">
          <th className="text-start py-2">Datum</th>
          <th className="text-start py-2">Gebruiker</th>
          <th className="text-start py-2">Beschrijving</th>
          <th className='text-end py-2'>Bedrag</th>
        </tr>
      </thead>
    </table>
  );
}
