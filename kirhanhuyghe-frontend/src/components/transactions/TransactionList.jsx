import TransactionsTable from './TransactionTable';
import { useState, useMemo, useCallback } from 'react';
import AsyncData from '../AsyncData';
import useSWR, { useSWRConfig } from 'swr';
import { getAll, deleteById } from '../../api';


export default function TransactionList() {

  const [text, setText] = useState('');
  const [search, setSearch] = useState('');  
  const { mutate } = useSWRConfig();

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

  const handleDelete = useCallback(async (transactieID) => {
    try {
      await deleteById('transacties', { arg: transactieID });
      mutate('transacties');
    } catch (error) {
      console.error('Error deleting transaction:', error);
      alert('Er is een fout opgetreden bij het verwijderen van de transactie.');
    }
  }, [mutate]);

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
          <TransactionsTable transacties={filteredTransacties} onDelete={handleDelete}/>
        </AsyncData>
      </div>
    </div>
  );
}
