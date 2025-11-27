import { useState, useEffect } from 'react';
import { putById, deleteById } from '../../api';

export default function EditCategoryDialog({ open, onClose, onSaved, category }) {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (category) setName(category.categorienaam || '');
  }, [category]);

  if (!open) return null;

  const handleSave = async () => {
    if (!name.trim()) {
      alert('Geef een categorienaam op.');
      return;
    }
    setLoading(true);
    try {
      // send only the updated name; backend identifies the category via the URL id
      await putById('categorieen', { id: category.categorieID, arg: { categorienaam: name.trim() } });
      try {
        await onSaved?.();
      } catch (mutErr) {
        console.error('Fout bij verversen categorieën (mutate):', mutErr);
        alert('Categorie aangepast, maar verversen mislukt. Herlaad de pagina.');
        onClose?.();
        return;
      }
      onClose?.();
      alert('Categorie aangepast.');
    } catch (err) {
      console.error('Fout bij aanpassen categorie:', err);
      // Try to display a helpful error message from the server if available
      const serverMessage = err?.response?.data || err?.message || 'Onbekende fout';
      alert(`Fout bij aanpassen categorie: ${JSON.stringify(serverMessage)}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Weet je zeker dat je deze categorie wilt verwijderen? Dit kan bestaande koppelingen beïnvloeden.')) return;
    setLoading(true);
    try {
      await deleteById('categorieen', { arg: category.categorieID });
      try {
        await onSaved?.();
      } catch (mutErr) {
        console.error('Fout bij verversen categorieën (mutate):', mutErr);
        alert('Categorie verwijderd, maar verversen mislukt. Herlaad de pagina.');
        onClose?.();
        return;
      }
      onClose?.();
      alert('Categorie verwijderd.');
    } catch (err) {
      console.error('Fout bij verwijderen categorie:', err);
      alert('Fout bij verwijderen categorie');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black opacity-40" onClick={onClose} />
      <div className="bg-white rounded-md shadow-lg z-10 w-full max-w-md p-6">
        <h3 className="text-lg font-medium mb-4">Categorie aanpassen</h3>

        <label className="block text-sm text-gray-700 mb-1">Categorienaam</label>
        <input
          className="w-full border rounded px-3 py-2 mb-4"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Bijv. kilometervergoeding"
        />

        <div className="flex justify-between items-center gap-2">
          <button
            className="px-4 py-2 rounded border text-red-600"
            onClick={handleDelete}
            disabled={loading}
          >
            Verwijder categorie
          </button>

          <div className="flex items-center gap-2">
            <button
              className="px-4 py-2 rounded border"
              onClick={() => { setName(category?.categorienaam || ''); onClose?.(); }}
              disabled={loading}
            >
              Annuleren
            </button>
            <button
              className="px-4 py-2 rounded bg-green-600 text-white"
              onClick={handleSave}
              disabled={loading}
            >
              {loading ? 'Bezig...' : 'Opslaan'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
