import TransactionsTable from './TransactionTable'; 
import { useState, useMemo, useCallback } from 'react';
import AsyncData from '../AsyncData';
import useSWR, { useSWRConfig } from 'swr';
import { getAll, deleteById, post } from '../../api';
import { useAuth } from '../../contexts/auth';
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
  const { user } = useAuth();
  const userid = user.userid
  // Debug: log het user object bij component mount
  

  const [openDialog, setOpenDialog] = useState(null);
  const [text, setText] = useState('');
  const [search, setSearch] = useState('');
  const { mutate } = useSWRConfig();

  const { register, handleSubmit, formState: { errors }, reset, watch, setValue } = useForm({
    defaultValues: { 
      beschrijving: '', 
      bedrag: '', 
      datum: new Date().toLocaleDateString('nl-BE', { day: '2-digit', month: '2-digit', year: 'numeric' }).split('/').join('-'), // DD-MM-YYYY
      categorieen: [] 
    },
  });

  const { data: transacties = [], isLoading, error } = useSWR('transacties', getAll);

  const filteredTransacties = useMemo(() =>
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

  const onSubmit = async (data) => {
    try {
      const bedragNum = parseFloat(String(data.bedrag).replace(',', '.'));

      // Converteer DD-MM-YYYY naar YYYY-MM-DD voor de backend
      const [day, month, year] = data.datum.split('-');
      const formattedDate = `${year}-${month}-${day}`;

      // Debug: log het user object
      
      
      // Probeer verschillende mogelijke veldnamen voor userID
      userid
      
      if (!userid) {
        console.error('Geen userID gevonden in user object:', user);
        alert('Fout: Gebruiker niet gevonden. Probeer opnieuw in te loggen.');
        return;
      }

      const newTransactie = {
        rekeningID: 1,
        userID: userid,
        beschrijving: data.beschrijving,
        in_uit: bedragNum >= 0 ? 'IN' : 'UIT',
        bedrag: bedragNum,
        datum: formattedDate,
      };

      console.log('Nieuwe transactie:', newTransactie);
      
      await post('transacties', { arg: newTransactie });
      mutate('transacties');
      reset();
      setOpenDialog(null);
    } catch (error) {
      console.error('Fout bij aanmaken transactie:', error);
      alert('Er is een fout opgetreden bij het aanmaken van de transactie.');
    }
  };

  const handleClose = () => {
    reset();
    setOpenDialog(null);
  };

  return (
    <div className="ml-5">
      <h1 className="text-4xl mb-4 mt-5 text-black">Transacties</h1>

      <div className="flex items-start justify-between mb-3 w-full">
        <div className="input-group flex items-center gap-2">
          <input
            type="search"
            className="form-control border-2 h-10 rounded text-black flex-1 min-w-50"
            placeholder="Zoek"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <button
            className="bg-gray-950 text-white rounded min-w-30"
            type="button"
            onClick={() => setSearch(text)}
          >
            Zoek
          </button>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="contained" color="error" onClick={() => setOpenDialog('voegtoe')} sx={{ width: 160 }}>
            Voeg toe
          </Button>
          <Button variant="contained" onClick={() => setOpenDialog('importcsv')} sx={{ width: 160, mr: 5 }}>
            Importeer CSV
          </Button>
        </div>
      </div>

      <div className="mt-4 mr-5">
        <AsyncData loading={isLoading} error={error}>
          <TransactionsTable transacties={filteredTransacties} onDelete={handleDelete} />
        </AsyncData>
      </div>

      <Dialog open={openDialog === 'voegtoe'} onClose={handleClose} maxWidth="sm" fullWidth>
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
              type="text"
              fullWidth
              {...register('bedrag', {
                required: 'Bedrag is verplicht',
                validate: (v) => !isNaN(parseFloat(String(v).replace(',', '.'))) || 'Ongeldig getal',
              })}
              error={Boolean(errors.bedrag)}
              helperText={errors.bedrag?.message}
            />

            <TextField
              margin="dense"
              label="Datum (DD-MM-YYYY)"
              type="text"
              fullWidth
              placeholder="DD-MM-YYYY"
              {...register('datum', { 
                required: 'Datum is verplicht',
                pattern: {
                  value: /^(0[1-9]|[12][0-9]|3[01])-(0[1-9]|1[0-2])-\d{4}$/,
                  message: 'Gebruik formaat DD-MM-YYYY'
                }
              })}
              error={Boolean(errors.datum)}
              helperText={errors.datum?.message}
            />

          
          </DialogContent>

          <DialogActions>
            <Button onClick={handleClose} color="inherit">Annuleren</Button>
            <Button type="submit" color="error" variant="contained">Opslaan</Button>
          </DialogActions>
        </form>
      </Dialog>

      <Dialog open={openDialog === 'importcsv'} onClose={handleClose} fullWidth maxWidth="md">
        <DialogTitle>CSV importeren</DialogTitle>
        <DialogContent>
          <Importer
            parserOptions={{
              header: true,
              skipEmptyLines: true,
              delimiter: ';',
              quoteChar: '"',
              escapeChar: '"',
              transformHeader: (h) => h.trim().replace(/\u200B/g, ''),
              transform: (value, field) => {
                if (field.header === 'Bedrag') {
                  let cleaned = String(value).replace(/[^\d,-]/g, '');
                  cleaned = cleaned.replace(',', '.');
                  return parseFloat(cleaned) || 0;
                }
                return String(value).trim().replace(/\u200B/g, '');
              },
            }}
            dataHandler={async (rows) => {
              const mapped = rows.map((r) => ({
                datum: r['Datum'] || '',
                bedrag: r['Bedrag'] || 0,
                vrijeMededeling: r['Vrije mededeling'] || '',
                naamTegenpartij: r['Naam tegenpartij'] || '',
              }));
              console.log('Mapped rows:', mapped);
            }}
            onComplete={() => {
              mutate('transacties');
              setOpenDialog(null);
            }}
          >
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