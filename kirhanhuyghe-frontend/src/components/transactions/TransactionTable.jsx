import { useEffect, useState } from 'react';
import Transaction from './Transaction';
import { getById } from '../../api';

function TransactionsTable({ transacties, onDelete, currentUser }) {
  const [userMap, setUserMap] = useState({});

  useEffect(() => {
    // collect unique userIDs from transactions where the server did NOT already attach an author
    const ids = Array.from(
      new Set(
        transacties
          .filter((t) => !t.author)
          .map((t) => t.userID)
          .filter(Boolean),
      ),
    );
    // find which ids are missing from the map
    const missing = ids.filter((id) => !(String(id) in userMap));
    if (missing.length === 0) return;

    // fetch missing user details
    let cancelled = false;
    // mark missing ids as loading (undefined) so UI can show a placeholder
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
        // if API returned a user object, store it; if failed, store null (meaning unknown)
        next[String(id)] = user || null;
      });
      setUserMap(next);
    });
    return () => {
      cancelled = true;
    };
  }, [transacties]);
  if (transacties.length === 0) {
    return (
      <div className='p-4 mb-4 text-sm text-red-600 rounded-lg bg-red-100'>Er zijn nog geen transacties toegevoegd.</div>
    );
  }
  return (
    <div className="overflow-x-auto w-full">
      <table className='min-w-full table-auto border-collapse'>
        <thead className='text-black'>
          <tr className="border-b-2 border-gray-300">
            <th className="text-start py-2 px-4 min-w-[220px]">Beschrijving</th>
            <th className='text-start py-2 px-4 min-w-[160px]'>Categorie 1</th>
            <th className='text-start py-2 px-4 min-w-[160px]'>Categorie 2</th>
            <th className="text-start py-2 px-4 min-w-[120px]">Datum</th>
            <th className="text-start py-2 px-4 min-w-[140px] hidden sm:table-cell">Gebruiker</th>
            <th className='text-start py-2 px-4 min-w-[120px]'>Bedrag</th>
            <th className='py-2 px-4 w-24 text-right'></th>
          </tr>
        </thead>
        <tbody>
        {transacties.map((transaction) => {
          // Prefer server-provided author if present
          if (transaction.author) {
            const authorName = `${transaction.author.voornaam || ''} ${transaction.author.familienaam || ''}`.trim();
            return (
              <Transaction
                key={transaction.transactieID}
                {...transaction}
                onDelete={onDelete}
                currentUser={currentUser}
                authorName={authorName}
              />
            );
          }

          const entry = userMap[String(transaction.userID)];
          let authorName;
          if (entry === undefined) {
            // still loading
            authorName = undefined;
          } else if (entry === null) {
            // fetch failed or user unknown
            authorName = null;
          } else {
            authorName = `${entry.voornaam || ''} ${entry.familienaam || ''}`.trim();
          }
          return (
            <Transaction
              key={transaction.transactieID}
              {...transaction}
              onDelete={onDelete}
              currentUser={currentUser}
              authorName={authorName}
            />
          );
        })}
        </tbody>
      </table>
    </div>
  );
}

export default TransactionsTable;

