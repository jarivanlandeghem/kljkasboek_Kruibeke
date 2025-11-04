import TransactionsTable from './TransactionTable';
import { useState, useMemo } from 'react';
import AsyncData from '../AsyncData';
import useSWR from 'swr';
import { getAll } from '../../api';


export default function TransactionList() {

  const [text, setText] = useState('');
  const [search, setSearch] = useState('');  

   const {
    data: transacties = [],
    isLoading,
    error,
  } = useSWR('transacties', getAll);

  const filteredTransacties = useMemo(
    () =>
      transacties.filter((t) => {
        const beschrijving = (t.beschrijving || t.description || '').toString();
        return beschrijving.toLowerCase().includes(search.toLowerCase());
      }),
    [search, transacties],
  );

  return (
    <div className='ml-5'>
      <h1 className="text-4xl mb-4 mt-5 text-black">Transactions</h1>
      <div className='input-group mb-3 w-50'>
        <input
          type='search'
          id='search'
          className='form-control rounded mt-3 text-black'
          placeholder='Search'
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <button className='mt-3' type='button' onClick={() => setSearch(text)}>
          Search
        </button>
        <button className='ml-5 text-center bg-red-700 w-30'>
          +
        </button>
      </div>
      
       <div className='mt-4'>
        <AsyncData loading={isLoading} error={error}>
          <TransactionsTable transacties={filteredTransacties}/>
        </AsyncData>
      </div>
    </div>
  );
}
