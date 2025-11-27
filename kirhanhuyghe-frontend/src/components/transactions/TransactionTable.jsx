import { useEffect, useState, useMemo } from 'react';
import Transaction from './Transaction';
import { getById } from '../../api';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
} from '@tanstack/react-table';

function TransactionsTable({ transacties, onDelete, currentUser, compact = false }) {
  const [userMap, setUserMap] = useState({});
  const [sorting, setSorting] = useState([{ id: 'datum', desc: true }]);

  useEffect(() => {
    const ids = Array.from(
      new Set(
        (transacties || [])
          .filter((t) => !t.author)
          .map((t) => t.userID)
          .filter(Boolean),
      ),
    );
    const missing = ids.filter((id) => !(String(id) in userMap));
    if (missing.length === 0) return;

    let cancelled = false;
    const loadingMap = { ...userMap };
    missing.forEach((id) => {
      loadingMap[String(id)] = undefined;
    });
    setUserMap(loadingMap);

    Promise.all(missing.map((id) => getById(`users/${id}`).catch(() => null))).then((results) => {
      if (cancelled) return;
      const next = { ...loadingMap };
      missing.forEach((id, idx) => {
        const user = results[idx];
        next[String(id)] = user || null;
      });
      setUserMap(next);
    });
    return () => {
      cancelled = true;
    };
  }, [transacties]);

  const rows = useMemo(() => {
    return (transacties || []).map((transaction) => {
      let authorName;
      if (transaction.author) {
        authorName = `${transaction.author.voornaam || ''} ${transaction.author.familienaam || ''}`.trim();
      } else {
        const entry = userMap[String(transaction.userID)];
        if (entry === undefined) authorName = undefined;
        else if (entry === null) authorName = null;
        else authorName = `${entry.voornaam || ''} ${entry.familienaam || ''}`.trim();
      }
      return { ...transaction, authorName };
    });
  }, [transacties, userMap]);

  const columns = useMemo(() => {
    if (compact) {
      return [
        { accessorKey: 'beschrijving', header: 'Beschrijving', enableColumnFilter: true },
        { accessorKey: 'datum', header: 'Datum', cell: (info) => new Date(info.getValue() || '').toLocaleDateString('nl-BE'), enableColumnFilter: true, enableSorting: true },
        { accessorKey: 'bedrag', header: 'Bedrag', cell: (info) => {
            const v = Number(info.getValue() || 0);
            return new Intl.NumberFormat('nl-BE', { style: 'currency', currency: 'EUR' }).format(v < 0 ? v : Math.abs(v));
          }, enableSorting: true },
      ];
    }

    return [
      { accessorKey: 'beschrijving', header: 'Beschrijving', enableColumnFilter: true },
      { accessorFn: (row) => (row.categorieDetails?.[0]?.categorienaam || row.categorienaam || ''), id: 'cat1', header: 'Categorie 1', enableColumnFilter: true },
      { accessorFn: (row) => (row.categorieDetails?.[1]?.categorienaam || ''), id: 'cat2', header: 'Categorie 2', enableColumnFilter: true },
      { accessorKey: 'datum', header: 'Datum', cell: (info) => new Date(info.getValue() || '').toLocaleDateString('nl-BE'), enableColumnFilter: true, enableSorting: true },
      { accessorKey: 'authorName', header: 'Gebruiker', cell: (info) => info.getValue(), enableColumnFilter: true },
      { accessorKey: 'bedrag', header: 'Bedrag', cell: (info) => {
          const v = Number(info.getValue() || 0);
          return new Intl.NumberFormat('nl-BE', { style: 'currency', currency: 'EUR' }).format(v < 0 ? v : Math.abs(v));
        }, enableSorting: true },
    ];
  }, [compact]);

  const table = useReactTable({
    data: rows,
    columns,
    state: { sorting },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
  });

  if ((transacties || []).length === 0) {
    return (
      <div className='p-4 mb-4 text-sm text-red-600 rounded-lg bg-red-100'>Er zijn nog geen transacties toegevoegd.</div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex justify-end mr-6 mt-3 mb-2">
        <label className="flex items-center gap-2 text-sm text-gray-700">
          <span>Sorteer op datum:</span>
          <select
            value={sorting.find(s => s.id === 'datum') ? (sorting.find(s => s.id === 'datum').desc ? 'new' : 'old') : 'new'}
            onChange={(e) => {
              const v = e.target.value;
              if (v === 'new') setSorting([{ id: 'datum', desc: true }]);
              else if (v === 'old') setSorting([{ id: 'datum', desc: false }]);
            }}
            className="px-2 py-1 border rounded bg-white"
          >
            <option value="new">Nieuw → Oud</option>
            <option value="old">Oud → Nieuw</option>
          </select>
        </label>
      </div>

      <div className="overflow-x-auto w-full">
        <table className='min-w-full table-auto border-collapse'>
          <thead className='text-black'>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id} className="border-b-2 border-gray-300">
                {headerGroup.headers.map((header) => (
                  <th key={header.id} className="text-start py-2 px-4 align-top">
                    <div className="flex items-center gap-2">
                      <div>
                        {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                      </div>
                    </div>
                  </th>
                ))}
                {!compact && <th className='py-2 px-4 w-24 text-right'></th>}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => {
              const data = row.original;
              return (
                <Transaction
                  key={data.transactieID}
                  {...data}
                  onDelete={onDelete}
                  currentUser={currentUser}
                  authorName={data.authorName}
                  compact={compact}
                />
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default TransactionsTable;