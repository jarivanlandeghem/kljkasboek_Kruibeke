import TransactionsTable from './TransactionTable';
import { useState, useMemo, useCallback } from 'react';
import AsyncData from '../AsyncData';
import useSWR, { useSWRConfig } from 'swr';
import { getAll, deleteById } from '../../api';

import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button } from '@mui/material';
import { useForm } from 'react-hook-form';
import { MenuItem } from '@mui/material';

export default function TransactionList() {
  const [text, setText] = useState('');
  const [search, setSearch] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const { mutate } = useSWRConfig();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    defaultValues: { beschrijving: '', bedrag: 0, datum: '', categorieen: [] },
  });

  const { data: transacties = [], isLoading, error } = useSWR('transacties', getAll);

  const filteredTransacties = useMemo(
    () =>
      transacties.filter((t) => {
        const beschrijving = (t.beschrijving || t.description || '').toString();
        return beschrijving.toLowerCase().includes(search.toLowerCase());
      }),
    [search, transacties]
  );

  const handleDelete = useCallback(async (transactieID) => {
    try {
      await deleteById('transacties', { arg: transactieID });
      mutate('transacties');
    } catch (err) {
      console.error(err);
      alert('Er is een fout opgetreden bij het verwijderen van de transactie.');
    }
  }, [mutate]);

  const onSubmit = (data) => {
    console.log('Form data:', data);
    // TODO: await create('transacties', data);
    mutate('transacties');
    reset();
    setIsOpen(false);
  };

  const handleClose = () => {
    reset();
    setIsOpen(false);
  };

  return (
    <div className="ml-5">
      <h1 className="text-4xl mb-4 mt-5 text-black">Transacties</h1>
      <div className="flex items-start justify-between mb-3 w-full">
        <div className="input-group flex items-center gap-2">
          <input
            type="search"
            className="form-control border-2 h-10 rounded text-black flex-1 min-w-50"
            placeholder="Search"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <button
            className="bg-gray-950 text-white rounded min-w-30"
            type="button"
            onClick={() => setSearch(text)}
          >
            Search
          </button>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="contained" color="error" onClick={() => setIsOpen(true)} sx={{ width: 160 }}>
            Voeg toe
          </Button>
          <Button variant="contained" sx={{ width: 160, mr: 5 }}>
            Importeer CSV
          </Button>
        </div>
      </div>

      <div className="mt-4 mr-5">
        <AsyncData loading={isLoading} error={error}>
          <TransactionsTable transacties={filteredTransacties} onDelete={handleDelete} />
        </AsyncData>
      </div>

<Dialog open={isOpen} onClose={handleClose} maxWidth="sm" fullWidth>
  <DialogTitle>Transactie toevoegen</DialogTitle>

  <form onSubmit={handleSubmit(onSubmit)}>
    <DialogContent>
      {/* Beschrijving */}
      <TextField
        margin="dense"
        label="Beschrijving"
        fullWidth
        {...register('beschrijving', { required: 'Beschrijving is verplicht' })}
        error={Boolean(errors.beschrijving)}
        helperText={errors.beschrijving?.message}
      />

      {/* Bedrag (met decimalen) */}
      <TextField
        margin="dense"
        label="Bedrag"
        type="number"
        step="0.01"
        fullWidth
        {...register('bedrag', {
          required: 'Bedrag is verplicht',
          valueAsNumber: true,
        })}
        error={Boolean(errors.bedrag)}
        helperText={errors.bedrag?.message}
      />

      {/* Datum */}
      <TextField
        margin="dense"
        label="Datum"
        type="date"
        fullWidth
        InputLabelProps={{ shrink: true }}
        {...register('datum', { required: 'Datum is verplicht' })}
        error={Boolean(errors.datum)}
        helperText={errors.datum?.message}
      />

      {/* Categorieën – max 2 */}
      <TextField
        margin="dense"
        label="Categorieën"
        select
        SelectProps={{
          multiple: true,
          renderValue: (selected) => (selected || []).join(', '),
        }}
        fullWidth
        defaultValue={[]}
        {...register('categorieen', {
          required: 'Kies minstens 1 categorie',
          validate: (v) => v.length <= 2 || 'Maximaal 2 categorieën',
        })}
        error={Boolean(errors.categorieen)}
        helperText={errors.categorieen?.message}
      >
        <MenuItem value="Voeding">Voeding</MenuItem>
        <MenuItem value="Transport">Transport</MenuItem>
        <MenuItem value="Vermaak">Vermaak</MenuItem>
        <MenuItem value="Wonen">Wonen</MenuItem>
        <MenuItem value="Overig">Overig</MenuItem>
      </TextField>
    </DialogContent>

    <DialogActions>
      <Button onClick={handleClose} color="inherit">
        Annuleren
      </Button>
      <Button type="submit" color="error" variant="contained">
        Opslaan
      </Button>
    </DialogActions>
  </form>
</Dialog>
    </div>
  );
}