import TransactionsTable from './TransactionTable';

export default function TransactionList() {
  return (
    <div className='ml-5'>
      <h1 className="text-4xl mb-4 mt-5 text-black">Transactions</h1>
      <div className='input-group mb-3 w-50'>
        <input
          type='search'
          id='search'
          className='form-control rounded mt-3 text-black'
          placeholder='Search'
        />
        <button className='mt-3'>
          Search
        </button>
      </div>
      
      <div className='m-4'>
        <TransactionsTable />
      </div>
    </div>
  );
}
