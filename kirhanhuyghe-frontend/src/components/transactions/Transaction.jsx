import { FiEdit } from 'react-icons/fi';
import { IoTrash } from 'react-icons/io5';
import CategoryDropdown from '../categories/CategoryDropdown';
import { useState, useEffect } from 'react';
import { put, putById } from '../../api';
import { useSWRConfig } from 'swr';
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, Alert } from '@mui/material';

const dateFormat = new Intl.DateTimeFormat('nl-BE', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
});

const amountFormat = new Intl.NumberFormat('nl-BE', {
  currency: 'EUR',
  style: 'currency',
  maximumFractionDigits: 2,
  minimumFractionDigits: 2,
});

function Transaction({ 
  transactieID, 
  beschrijving, 
  datum, 
  bedrag, 
  in_uit,
  userID, 
  currentUser,
  authorName = null,
  onDelete = () => {},
  categorieDetails = null,
  categorieKoppelingen = null,
  compact = false,
}) {
  const { mutate } = useSWRConfig();

  const [cat1, setCat1] = useState(null);
  const [cat2, setCat2] = useState(null);

  useEffect(() => {
    if (categorieDetails && Array.isArray(categorieDetails) && categorieDetails.length > 0) {
      setCat1(categorieDetails[0] ?? null);
      setCat2(categorieDetails[1] ?? null);
      return;
    }

    if (categorieKoppelingen && Array.isArray(categorieKoppelingen) && categorieKoppelingen.length > 0) {
      setCat1(
        categorieKoppelingen[0]
          ? { categorieID: categorieKoppelingen[0].categorieID, categorienaam: String(categorieKoppelingen[0].categorieID) }
          : null,
      );
      setCat2(
        categorieKoppelingen[1]
          ? { categorieID: categorieKoppelingen[1].categorieID, categorienaam: String(categorieKoppelingen[1].categorieID) }
          : null,
      );
    }
  }, [categorieDetails, categorieKoppelingen]);
 

  const handleDelete = () => {
    onDelete(transactieID);
  };

  const [editOpen, setEditOpen] = useState(false);
  const [editError, setEditError] = useState('');
  const [form, setForm] = useState({ beschrijving: '', datum: '', bedrag: '' });

  

  const handleEditSave = async () => {
    setEditError('');
    const amt = Number(form.bedrag);
    if (Number.isNaN(amt)) {
      setEditError('Ongeldig bedrag');
      return;
    }
    const in_uit = amt < 0 ? 'UIT' : 'IN';
    const payload = {};
    if (form.beschrijving !== undefined) payload.beschrijving = form.beschrijving;
    if (form.datum) payload.datum = form.datum; 
    payload.bedrag = Math.abs(amt);
    payload.in_uit = in_uit;
    try {
      console.log('Updating transaction payload:', payload);
      await putById('transacties', { id: transactieID, arg: payload });
      mutate('transacties');
      setEditOpen(false);
    } catch (err) {
      console.error('Error updating transaction', err?.response?.data || err.message || err);
      const serverMsg = err?.response?.data?.message || err?.response?.data || err.message;
      setEditError(serverMsg || 'Kon transactie niet opslaan');
    }
  };

  const saveCategories = async (newCat1, newCat2) => {
    const ids = [newCat1?.categorieID, newCat2?.categorieID].filter((v) => v != null);
    try {
      await put(`transacties/${transactieID}/categorieen`, { categorieIDs: ids });
      mutate('transacties');
    } catch (err) {
      console.error('Error saving categories', err);
    }
  };

  const handleCategoryChange = async (index, newValue) => {
    if (index === 1) setCat1(newValue);
    else setCat2(newValue);
    const newCat1 = index === 1 ? newValue : cat1;
    const newCat2 = index === 2 ? newValue : cat2;
    await saveCategories(newCat1, newCat2);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'N/A';
      return dateFormat.format(date);
    } catch {
      return 'N/A';
    }
  };

  let displayUserName;
  if (authorName === undefined) {
    displayUserName = 'Laden...';
  } else if (authorName) {
    displayUserName = authorName;
  } else if (currentUser && String(currentUser.userid) === String(userID)) {
    displayUserName = `${currentUser.voornaam || ''} ${currentUser.familienaam || ''}`.trim();
  } else {
    displayUserName = 'Onbekend';
  }

  if (compact) {
    const signed = in_uit === 'UIT' ? -Math.abs(bedrag || 0) : Math.abs(bedrag || 0);
    return (
      <tr className="border-b border-gray-200">
        <td className="py-2 px-4">{beschrijving || 'N/A'}</td>
        <td className="py-2 px-4">{formatDate(datum)}</td>
        <td className="py-2 px-4">{amountFormat.format(signed)}</td>
      </tr>
    );
  }

  return (
    <>
    <tr className="border-b border-gray-200">
      <td className="py-2 px-4">{beschrijving || 'N/A'}</td>
      <td className="py-2 px-4">
        <CategoryDropdown
          value={cat1}
          onChange={(v) => handleCategoryChange(1, v)}
          fullWidth={true}
          sx={{ width: 250 }}
        />
      </td>
      <td className="py-2 px-4">
        <CategoryDropdown
          value={cat2}
          onChange={(v) => handleCategoryChange(2, v)}
          fullWidth={false}
          sx={{ width: 250 }}
        />
      </td>
      <td className="py-2 px-4">{formatDate(datum)}</td>
      <td className="py-2 px-4 hidden sm:table-cell">{displayUserName}</td>
      <td className="py-2 px-4">{amountFormat.format(in_uit === 'UIT' ? -Math.abs(bedrag || 0) : Math.abs(bedrag || 0))}</td>
      <td className='text-right py-2 pr-4'>
        <button
          className='inline-flex items-center justify-center w-9 h-9 bg-black text-white rounded-full mr-2'
          onClick={() => { setForm({ beschrijving: beschrijving || '', datum: datum ? new Date(datum).toISOString().slice(0,10) : '', bedrag: typeof bedrag === 'number' ? String(in_uit === 'UIT' ? -Math.abs(bedrag) : Math.abs(bedrag)) : (bedrag || '') }); setEditError(''); setEditOpen(true); }}
          aria-label={`Bewerk transactie ${transactieID}`}
        >
          <FiEdit size={16} />
        </button>
      </td>
      <td>
        <button
          className='inline-flex items-center justify-center w-9 h-9 bg-black text-white rounded-full'
          onClick={handleDelete}
          aria-label={`Verwijder transactie ${transactieID}`}
        >
          <IoTrash size={16} />
        </button>
      </td>
    </tr>
      <Dialog open={editOpen} onClose={() => setEditOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Bewerk transactie</DialogTitle>
        <DialogContent>
          {editError && <Alert severity="error" sx={{ mb: 2 }}>{editError}</Alert>}
          <TextField
            label="Beschrijving"
            fullWidth
            margin="normal"
            value={form.beschrijving}
            onChange={(e) => setForm((s) => ({ ...s, beschrijving: e.target.value }))}
          />
          <TextField
            label="Datum"
            type="date"
            fullWidth
            margin="normal"
            value={form.datum}
            onChange={(e) => setForm((s) => ({ ...s, datum: e.target.value }))}
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            label="Bedrag"
            type="number"
            fullWidth
            margin="normal"
            value={form.bedrag}
            onChange={(e) => setForm((s) => ({ ...s, bedrag: e.target.value }))}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditOpen(false)}>Annuleer</Button>
          <Button onClick={handleEditSave} variant="contained">Opslaan</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default Transaction;