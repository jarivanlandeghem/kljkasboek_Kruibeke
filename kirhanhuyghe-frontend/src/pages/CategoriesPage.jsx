import { useState, useMemo, useCallback } from 'react';
import useSWR, { useSWRConfig } from 'swr';
import { getAll, deleteById } from '../api';
import CategoryDropdown from "../components/categories/CategoryDropdown";
import AddCategoryDialog from "../components/categories/AddCategoryDialog";
import Navbar from "../components/Navbar";
import TransactionsTable from '../components/transactions/TransactionTable';
import AsyncData from '../components/AsyncData';
import { useAuth } from '../contexts/auth';

export default function CategoriesPage() {
  const { user } = useAuth();
  const { mutate } = useSWRConfig();

  const [selected, setSelected] = useState(null);
  const [showAddDialog, setShowAddDialog] = useState(false);

  const { data: transacties = [], isLoading, error } = useSWR('transacties', getAll);

  const handleDelete = useCallback(async (id) => {
    try {
      await deleteById('transacties', { arg: id });
      mutate('transacties');
    } catch (err) {
      console.error('Error deleting transaction:', err);
      alert('Fout bij verwijderen');
    }
  }, [mutate]);

  const matchesCategory = useCallback((t, cat) => {
    if (!cat) return false;
    const cid = cat.categorieID;
    const name = (cat.categorienaam || '').toLowerCase();
    const details = t.categorieDetails || [];
    // match by id when available
    if (cid != null) {
      return details.some((d) => d.categorieID === cid);
    }
    // fallback to name match
    return details.some((d) => (d.categorienaam || '').toLowerCase() === name) ||
      (t.categorieDetails && t.categorieDetails.length === 0 && (t.categorienaam || '').toLowerCase() === name);
  }, []);

  const filtered = useMemo(() => {
    if (!selected) return [];
    return (transacties || []).filter((t) => matchesCategory(t, selected));
  }, [transacties, selected, matchesCategory]);

  const inTransacties = useMemo(() => filtered.filter((t) => String(t.in_uit).toUpperCase() === 'IN'), [filtered]);
  const uitTransacties = useMemo(() => filtered.filter((t) => String(t.in_uit).toUpperCase() === 'UIT'), [filtered]);

  return (
    <div>
      <Navbar />
      <div className="p-4">
        <div className="max-w-5xl mx-auto">
          <div className="mb-4 flex items-center justify-between">
            <div className="mr-4 flex-1">
              <CategoryDropdown value={selected} onChange={setSelected} />
            </div>
            {user && user.roles && user.roles.includes('admin') && (
              <div className="ml-4">
                <button
                  className="bg-blue-600 text-white px-4 py-2 rounded"
                  onClick={() => setShowAddDialog(true)}
                >
                  Nieuwe categorie
                </button>
              </div>
            )}
            <AddCategoryDialog
              open={showAddDialog}
              onClose={() => setShowAddDialog(false)}
              onSaved={() => mutate('categorieen')}
            />
          </div>

          <AsyncData loading={isLoading} error={error}>
            {!selected ? (
              <div className="text-sm text-gray-600">Selecteer een categorie om transacties te zien.</div>
            ) : (
              <div className="flex flex-col md:flex-row gap-4">
                <div className="md:w-1/2 w-full">
                  <h2 className="text-lg mb-2">IN</h2>
                  <TransactionsTable transacties={inTransacties} onDelete={handleDelete} currentUser={user} />
                </div>
                <div className="md:w-1/2 w-full">
                  <h2 className="text-lg mb-2">UIT</h2>
                  <TransactionsTable transacties={uitTransacties} onDelete={handleDelete} currentUser={user} />
                </div>
              </div>
            )}
          </AsyncData>
        </div>
      </div>
    </div>
  );
}