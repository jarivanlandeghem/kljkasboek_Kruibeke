import TransactionsTable from './TransactionTable';
import { useState, useMemo, useCallback } from 'react';
import AsyncData from '../AsyncData';
import useSWR, { useSWRConfig } from 'swr';
import { getAll, deleteById } from '../../api';

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  MenuItem,
} from '@mui/material';
import { useForm } from 'react-hook-form';

// CSV IMPORTER
import { Importer, ImporterField } from 'react-csv-importer';
import 'react-csv-importer/dist/index.css';

export default function TransactionList() {
  const [openDialog, setOpenDialog] = useState(null);
  const [text, setText] = useState('');
  const [search, setSearch] = useState('');
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

  const handleDelete = useCallback(
    async (transactieID) => {
      try {
        await deleteById('transacties', { arg: transactieID });
        mutate('transacties');
      } catch (err) {
        console.error(err);
        alert('Er is een fout opgetreden bij het verwijderen van de transactie.');
      }
    },
    [mutate]
  );

  const onSubmit = (data) => {
    console.log('Form data:', data);
    // TODO: await create('transacties', data);
    mutate('transacties');
    reset();
    setOpenDialog(null);
  };

  const handleClose = () => {
    reset();
    setOpenDialog(null);
  };

  return (
    <div className="ml-5">
      <h1 className="text-4xl mb-4 mt-5 text-black">Transacties</h1>

      <div className="flex items-start justify-between mb-3 w-full">
        {/* Zoeken */}
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

        {/* Knoppen */}
        <div className="flex items-center gap-2">
          <Button
            variant="contained"
            color="error"
            onClick={() => setOpenDialog('voegtoe')}
            sx={{ width: 160 }}
          >
            Voeg toe
          </Button>
          <Button
            variant="contained"
            onClick={() => setOpenDialog('importcsv')}
            sx={{ width: 160, mr: 5 }}
          >
            Importeer CSV
          </Button>
        </div>
      </div>

      {/* Tabel */}
      <div className="mt-4 mr-5">
        <AsyncData loading={isLoading} error={error}>
          <TransactionsTable transacties={filteredTransacties} onDelete={handleDelete} />
        </AsyncData>
      </div>

      {/* DIALOG: Transactie toevoegen */}
      <Dialog
        open={openDialog === 'voegtoe'}
        onClose={() => setOpenDialog(null)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Transactie toevoegen</DialogTitle>

        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogContent>
            <TextField
              margin="dense"
              label="Beschrijving"
              fullWidth
              {...register('beschrijving', { required: 'Beschrijving is verplicht' })}
              error={Boolean(errors.beschrijving)}
              helperText={errors.beschrijving?.message}
            />

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


{/* DIALOG: CSV importeren */}
<Dialog
  open={openDialog === 'importcsv'}
  onClose={() => setOpenDialog(null)}
  fullWidth
  maxWidth="md"
>
  <DialogTitle>CSV importeren</DialogTitle>
  <DialogContent>
    <Importer
      /* -------------------------------------------------
         1. Data ontvangen (async) – enkel de 4 gewenste velden
         ------------------------------------------------- */
      dataHandler={async (rows) => {
        const mapped = rows.map((r) => ({
          datum: r.Datum?.trim() ?? '',
          bedrag: Number(String(r.Bedrag).replace(',', '.')) || 0,
          vrijeMededeling: r['Vrije mededeling']?.trim() ?? '',
          naamTegenpartij: r['Naam tegenpartij']?.trim() ?? '',
        }));
        console.log('Mapped', mapped);
        // TODO stuur naar backend: await create('transacties', mapped);
      }}

      /* -------------------------------------------------
         2. Klaar – sluit dialog en ververs lijst
         ------------------------------------------------- */
      onComplete={() => {
        mutate('transacties');
        setOpenDialog(null);
      }}

      /* -------------------------------------------------
         3. PARSER-OPTIES – hier gebeurt de magie
         ------------------------------------------------- */
      parserOptions={{
        delimiter: ';',          // BELANGRIJK: semicolon!
        newline: '',             // laat de parser zelf kiezen
        header: true,            // eerste regel = headers
        skipEmptyLines: true,
        transformHeader: (h) => h.trim(), // spaties weg
        transform: (v) => v.trim(),       // spaties weg
      }}
    >
      {/* Deze namen moeten exact overeenkomen met de HEADER in je CSV */}
      <ImporterField name="Datum" label="Datum" />
      <ImporterField name="Bedrag" label="Bedrag" />
      <ImporterField name="Vrije mededeling" label="Vrije mededeling" />
      <ImporterField name="Naam tegenpartij" label="Naam tegenpartij" />
    </Importer>
  </DialogContent>
</Dialog>
    </div>
  );
}
