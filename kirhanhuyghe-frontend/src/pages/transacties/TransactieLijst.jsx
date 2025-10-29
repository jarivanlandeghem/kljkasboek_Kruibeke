// src/pages/transactions/TransactionList.jsx
import { useState, useMemo, useEffect } from 'react'; 
import TransactionsTable from '../../components/transactions/TransactionsTable';
import { TRANSACTION_DATA } from '../../api/mock_data';

export default function TransactionList() {
  const [text, setText] = useState('');
  const [search, setSearch] = useState('');

  // 👇 2
  useEffect(() => {
    console.log('transactions are rendered');
  });
}