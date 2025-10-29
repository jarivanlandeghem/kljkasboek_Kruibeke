import TransactionsTable from './TransactionTable';

export default function TransactionList() {
  return (
    <>
      <h1 className="text-4xl mb-4">Transactions</h1>
      <div className='input-group mb-3 w-50'>
        <input
          type='search'
          id='search'
          className='form-control rounded'
          placeholder='Search'
        />
        <button>
          Search
        </button>
      </div>

      {/* 👇 */}
      <div className='m-4'>
        <TransactionsTable />
      </div>
    </>
  );
}
