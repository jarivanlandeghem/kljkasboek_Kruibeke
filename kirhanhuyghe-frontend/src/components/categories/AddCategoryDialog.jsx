import { useState } from 'react';
import { post } from '../../api';

export default function AddCategoryDialog({ open, onClose, onSaved }) {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  const handleSave = async () => {
    if (!name.trim()) {
      alert('Geef een categorienaam op.');
      return;
    }
    setLoading(true);
    try {
      const result = await post('categorieen', { arg: { categorienaam: name.trim() } });
      console.debug('Categorie aangemaakt, server response:', result);
      setName('');
      try {
        await onSaved?.();
      } catch (mutErr) {
        console.error('Fout bij verversen categorieën (mutate):', mutErr);
        alert('Categorie toegevoegd, maar verversen mislukt. Herlaad de pagina.');
        onClose?.();
        return;
      }
      onClose?.();
      alert('Categorie succesvol toegevoegd.');
    } catch (err) {
      console.error('Fout bij toevoegen categorie:', err);
      console.error('err.response?.status =', err?.response?.status);
      console.error('err.response?.data =', err?.response?.data);
      console.error('err.message =', err?.message);
      alert('Fout bij toevoegen categorie');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black opacity-40" onClick={onClose} />
      <div className="bg-white rounded-md shadow-lg z-10 w-full max-w-md p-6">
        <h3 className="text-lg font-medium mb-4">Nieuwe categorie</h3>

        <label className="block text-sm text-gray-700 mb-1">Categorienaam</label>
        <input
          className="w-full border rounded px-3 py-2 mb-4"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Bijv. kilometervergoeding"
        />

        <div className="flex justify-end gap-2">
          <button
            className="px-4 py-2 rounded border"
            onClick={() => {
              setName('');
              onClose?.();
            }}
            disabled={loading}
          >
            Annuleren
          </button>
          <button
            className="px-4 py-2 rounded bg-blue-600 text-white"
            onClick={handleSave}
            disabled={loading}
          >
            {loading ? 'Opslaan...' : 'Opslaan'}
          </button>
        </div>
      </div>
    </div>
  );
}
