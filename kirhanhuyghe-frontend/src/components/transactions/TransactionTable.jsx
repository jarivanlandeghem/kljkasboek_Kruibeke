import { useMemo } from 'react';
import Transaction from './Transaction';
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
} from '@tanstack/react-table';

function TransactionsTable({ 
  transacties, 
  onDelete, 
  currentUser, 
  compact = false,
  pagination,
  setPagination,
  rowCount,
  isLoading,
  sorting,
  setSorting,
}) {
  const rows = useMemo(() => {
    return (transacties || []).map((transaction) => {
      let authorName;
      if (transaction.author) {
        authorName = `${transaction.author.voornaam || ''} ${transaction.author.familienaam || ''}`.trim();
      } else {
        authorName = 'Onbekend';
      }
      return { ...transaction, authorName };
    });
  }, [transacties]);

  const columns = useMemo(() => {
    if (compact) {
      return [
        { accessorKey: 'beschrijving', header: 'Beschrijving' },
        { accessorKey: 'datum', header: 'Datum', cell: (info) => new Date(info.getValue() || '').toLocaleDateString('nl-BE') },
        { accessorKey: 'bedrag', header: 'Bedrag', cell: (info) => {
            const v = Number(info.getValue() || 0);
            return new Intl.NumberFormat('nl-BE', { style: 'currency', currency: 'EUR' }).format(v < 0 ? v : Math.abs(v));
          } },
      ];
    }

    return [
      { accessorKey: 'beschrijving', header: 'Beschrijving' },
      { accessorFn: (row) => (row.categorieDetails?.[0]?.categorienaam || row.categorienaam || ''), id: 'cat1', header: 'Categorie 1' },
      { accessorFn: (row) => (row.categorieDetails?.[1]?.categorienaam || ''), id: 'cat2', header: 'Categorie 2' },
      { accessorKey: 'datum', header: 'Datum', cell: (info) => new Date(info.getValue() || '').toLocaleDateString('nl-BE') },
      { accessorKey: 'authorName', header: 'Gebruiker', cell: (info) => info.getValue() },
      { accessorKey: 'bedrag', header: 'Bedrag', cell: (info) => {
          const v = Number(info.getValue() || 0);
          return new Intl.NumberFormat('nl-BE', { style: 'currency', currency: 'EUR' }).format(v < 0 ? v : Math.abs(v));
        } },
    ];
  }, [compact]);

  const table = useReactTable({
    data: rows,
    columns,
    pageCount: Math.ceil((rowCount || 0) / (pagination?.pageSize || 10)),
    state: {
      pagination: pagination || { pageIndex: 0, pageSize: 10 },
      sorting: sorting || [],
    },
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    manualPagination: true,
    manualSorting: true,
    getCoreRowModel: getCoreRowModel(),
  });

  if (!isLoading && (transacties || []).length === 0) {
    return (
      <div className='p-4 mb-4 text-sm text-red-600 rounded-lg bg-red-100'>Er zijn nog geen transacties gevonden.</div>
    );
  }

  return (
    <div className="w-full">
      <div className="overflow-x-auto w-full relative">
        {isLoading && (
           <div className="absolute inset-0 bg-white/50 z-10 flex items-center justify-center">
             <span className="text-gray-500 font-semibold">Laden...</span>
           </div>
        )}
        <table className='min-w-full table-auto border-collapse mt-2'>
          <thead className='text-black'>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id} className="border-b-2 border-gray-300">
                {headerGroup.headers.map((header) => (
                  <th key={header.id} className="text-start py-2 px-4 align-top">
                    <div className="flex items-center gap-2">
                      <div>
                                {header.isPlaceholder ? null : (
                                  <div
                                    onClick={header.column.getToggleSortingHandler()}
                                    style={{ cursor: header.column.getCanSort() ? 'pointer' : 'default', display: 'inline-flex', alignItems: 'center', gap: 6 }}
                                  >
                                    {flexRender(header.column.columnDef.header, header.getContext())}
                                    {header.column.getIsSorted() ? (header.column.getIsSorted() === 'asc' ? ' ↑' : ' ↓') : ''}
                                  </div>
                                )}
                      </div>
                    </div>
                  </th>
                ))}
                {!compact && <th className='py-2 px-4 w-24 text-right'></th>}
              </tr>
            ))}
          </thead>
          <tbody className={isLoading ? 'opacity-50' : ''}>
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

      {!compact && pagination && (
        <div className="flex items-center justify-between mt-4 px-2">
          <div className="flex items-center gap-2">
            <button
              className="border rounded p-1 px-3 disabled:opacity-50 ml-5 mb-5"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              {'<'}
            </button>
            <button
              className="border rounded p-1 px-3 disabled:opacity-50 mb-5"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              {'>'}
            </button>
            <span className="flex items-center gap-1 text-sm mb-5">
              <div>Pagina</div>
              <strong>
                {table.getState().pagination.pageIndex + 1} van{' '}
                {table.getPageCount()}
              </strong>
            </span>
          </div>
          <select
            value={table.getState().pagination.pageSize}
            onChange={e => {
              table.setPageSize(Number(e.target.value))
            }}
            className="border p-1 rounded mr-10 mb-5"
          >
            {[10, 20, 30, 40, 50].map(pageSize => (
              <option key={pageSize} value={pageSize}>
                Toon {pageSize}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
}

export default TransactionsTable;