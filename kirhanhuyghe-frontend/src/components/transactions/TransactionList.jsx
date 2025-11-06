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
      <h1 className="text-4xl mb-4 mt-5 text-black">Transacties</h1>
      <div className='flex items-start justify-between mb-3 w-full'>
        <div className='input-group flex items-center gap-2'>
          <input
            type='search'
            id='search'
            className='form-control border-2 h-10 rounded text-black flex-1 min-w-50'
            placeholder='Search'
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <button className='bg-gray-950 text-white rounded min-w-30' type='button' onClick={() => setSearch(text)}>
            Search
          </button>
        </div>

        <div className='flex items-center gap-2'>
          <button className='text-center w-40 bg-red-700 px-3 py-2 text-white rounded' type='button'>
            Voeg toe
          </button>
          <button className='bg-blue-950 w-40 mr-5 text-white px-3 py-2 rounded' type='button'>
            Importeer CSV
          </button>
        </div>
      </div>
      
       <div className='mt-4 mr-5'>
        <AsyncData loading={isLoading} error={error}>
          <TransactionsTable transacties={filteredTransacties} onDelete={handleDelete}/>
        </AsyncData>
      </div>
    </div>
  );
}
