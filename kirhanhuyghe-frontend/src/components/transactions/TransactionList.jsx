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
  Button
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import * as api from '../../api';

// --- NIEUWE IMPORTS VOOR MUI DATEPICKER ---
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';
import 'dayjs/locale/nl'; // Voor Nederlandse taal in de kalender

// CSV IMPORTER
import { Importer, ImporterField } from 'react-csv-importer';
import 'react-csv-importer/dist/index.css';

// --- DEFINITIEVE VERTALING ---
const nlNL = {
  general: { goToPreviousStep: 'Vorige', goToNextStep: 'Volgende' },
  fileStep: {
    initialDragDropPrompt: 'Sleep het CSV bestand hierheen of klik om te selecteren',
    activeDragDropPrompt: 'Laat het bestand hier los...',
    getImportError: (errMsg) => `Fout bij importeren: ${errMsg}`,
    getDataFormatError: () => 'Controleer of het bestand het juiste formaat heeft',
    goBackButton: 'Terug',
    nextButton: 'Volgende',
    rawFileContents: 'Ruwe bestandsinhoud',
    previewImportData: 'Voorbeeld import data',
    changeFile: 'Wijzig bestand',
    hasHeaders: 'Bevat kopteksten',
    loadingPreview: 'Voorbeeld laden...',
  },
  fieldsStep: {
    stepTitle: 'Kolommen toewijzen',
    dragSource: 'Kolom uit CSV',
    dropTarget: 'Veld in Database',
    columnTooltip: 'Sleep de kolom naar het juiste veld',
    nextButton: 'Importeren',
    backButton: 'Terug',
    getColumnCardHeader: (code) => `Kolom: ${code}`,
    getDragTargetRequiredCaption: () => 'Verplicht',
    getDragTargetOptionalCaption: () => 'Optioneel',
    getDragTargetRemoveTooltip: () => 'Verwijder toewijzing',
    getDragSourcePageIndicator: (currentPage, pageCount) => `Pagina ${currentPage} van ${pageCount}`,
    getDragSourceNextPageTitle: (nextPage) => `Ga naar pagina ${nextPage}`,
    getDragSourcePreviousPageTitle: (previousPage) => `Ga naar pagina ${previousPage}`,
    getDragSourceReset: () => 'Reset',
    getDragSourceSelectAll: () => 'Alles selecteren',
  },
  progressStep: {
    stepTitle: 'Bezig met importeren...',
    nextButton: 'Klaar',
    status: {
      uploading: 'Uploaden...',
      processing: 'Verwerken...',
      complete: 'Voltooid!',
    },
  },
};

export default function TransactionList() {
  const { user } = useAuth();
  const userid = user.userid;
  
  console.log('User object:', user);

  const [openDialog, setOpenDialog] = useState(null);
  const [text, setText] = useState('');
  const [search, setSearch] = useState('');
  const { mutate } = useSWRConfig();

  // Gebruik useForm met dayjs() als default datum
  const { register, control, handleSubmit, formState: { errors }, reset } = useForm({
    defaultValues: { 
      beschrijving: '', 
      bedrag: '', 
      datum: dayjs(), // HIER GEBRUIKEN WE NU DAYJS
      categorieen: [] 
    },
  });

  const { data: transacties = [], isLoading, error } = useSWR('transacties', getAll);
  const { data: gebruikers = [] } = useSWR('users', getAll);

  const gebruikerMapping = useMemo(() => {
    const mapping = {};
    gebruikers.forEach(gebruiker => {
      mapping[gebruiker.userid] = gebruiker.voornaam;
    });
    return mapping;
  }, [gebruikers]);

  const verrijkteTransacties = useMemo(() => 
    transacties.map(transactie => ({
      ...transactie,
      displayVoornaam: gebruikerMapping[transactie.userID] || `User ${transactie.userID}`
    })),
    [transacties, gebruikerMapping]
  );

  const filteredTransacties = useMemo(() =>
    verrijkteTransacties.filter((t) => {
      const beschrijving = (t.beschrijving || t.description || '').toString();
      return beschrijving.toLowerCase().includes(search.toLowerCase());
    }),
    [search, verrijkteTransacties]
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

  const handleGenerateReport =  async () => {
    const confirm = window.confirm("Wil je een PDF rapport van al je transacties per categorie ontvangen via e-mail?");
    if (confirm) {
        try {
            await api.post('transacties/report', { arg: {} }); 
            alert('Succes! Het rapport is verzonden naar je e-mailadres.');
        } catch (err) {
            console.error('Fout bij rapport:', err);
            alert('Er ging iets mis bij het genereren van het rapport.');
        }
    }
  };

  const onSubmit = async (data) => {
    try {
      const bedragNum = parseFloat(String(data.bedrag).replace(',', '.'));
      
      // Datum formattering met dayjs is veel simpeler
      // data.datum is een dayjs object, dus we roepen gewoon .format aan
      const formattedDate = dayjs(data.datum).format('YYYY-MM-DD');

      if (!userid) {
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

  const handleCSVImport = async (rows) => {
    try {
      if (!userid) {
        alert('Fout: Gebruiker niet gevonden. Probeer opnieuw in te loggen.');
        return;
      }
      
      const importResults = { success: 0, failed: 0, errors: [] };

      for (const row of rows) {
        try {
          const rawAmount = row['Bedrag'] || row['bedrag'] || 0;
          let bedragNum;
          if (typeof rawAmount === 'number') {
            bedragNum = rawAmount;
          } else {
            const amountStr = String(rawAmount).trim();
            let cleaned = amountStr.replace(/[^\d,-]/g, '').replace(',', '.');
            bedragNum = parseFloat(cleaned) || 0;
          }

          const rawDate = row['Datum'] || row['datum'] || '';
          let formattedDate;
          if (rawDate.includes('/')) {
            const [day, month, year] = rawDate.split('/');
            formattedDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
          } else {
            formattedDate = new Date().toISOString().split('T')[0];
          }

          const vrijeMededeling = row['Vrije mededeling'] || row['vrijeMededeling'] || '';
          const naamTegenpartij = row['Naam tegenpartij'] || row['naamTegenpartij'] || '';
          const beschrijving = vrijeMededeling && naamTegenpartij 
            ? `${vrijeMededeling} ${naamTegenpartij}`
            : vrijeMededeling || naamTegenpartij || 'Geen beschrijving';

          const newTransactie = {
            rekeningID: 1,
            userID: userid,
            beschrijving: beschrijving,
            in_uit: bedragNum >= 0 ? 'IN' : 'UIT',
            bedrag: bedragNum,
            datum: formattedDate,
          };
          
          await post('transacties', { arg: newTransactie });
          importResults.success++;
        } catch (rowError) {
          importResults.failed++;
          importResults.errors.push({ row: row, error: rowError.message });
        }
      }
      
      if (importResults.failed === 0) {
        alert(`Succesvol ${importResults.success} transacties geïmporteerd!`);
      } else {
        alert(`Import voltooid: ${importResults.success} succesvol, ${importResults.failed} gefaald.`);
      }
      mutate('transacties');
    } catch (error) {
      console.error('Algemene fout bij CSV import:', error);
      alert('Er is een fout opgetreden bij het importeren van de CSV.');
    }
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
          <Button variant="contained" onClick={() => setOpenDialog('importcsv')} sx={{ width: 160 }}>
            Importeer CSV
          </Button>
          <Button 
            variant="contained" 
            color="secondary" 
            onClick={handleGenerateReport} 
            sx={{ width: 180, mr: 5 }}
          >
            Rapport genereren
          </Button>
        </div>
      </div>

      <div className="mt-4 mr-5">
        <AsyncData loading={isLoading} error={error}>
          <TransactionsTable transacties={filteredTransacties} onDelete={handleDelete} />
        </AsyncData>
      </div>

      {/* WRAPPER VOOR DATEPICKER SUPPORT */}
      <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="nl">
        <Dialog open={openDialog === 'voegtoe'} onClose={handleClose} maxWidth="sm" fullWidth>
            <DialogTitle>Transactie toevoegen</DialogTitle>
            <form onSubmit={handleSubmit(onSubmit)}>
            <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
                
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

                {/* IMPLEMENTATIE MATERIAL UI DATEPICKER */}
                <Controller
                    name="datum"
                    control={control}
                    rules={{ required: 'Datum is verplicht' }}
                    render={({ field }) => (
                        <DatePicker
                            label="Datum"
                            value={field.value}
                            onChange={(newValue) => field.onChange(newValue)}
                            format="DD-MM-YYYY"
                            slotProps={{
                                textField: {
                                    fullWidth: true,
                                    error: !!errors.datum,
                                    helperText: errors.datum?.message
                                }
                            }}
                        />
                    )}
                />

            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose} color="inherit">Annuleren</Button>
                <Button type="submit" color="error" variant="contained">Opslaan</Button>
            </DialogActions>
            </form>
        </Dialog>
      </LocalizationProvider>

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
            }}
            processChunk={handleCSVImport}
            onComplete={() => {
              console.log('CSV import voltooid');
              setOpenDialog(null);
            }}
            onError={(error) => {
              console.error('CSV import fout:', error);
              alert('Er is een fout opgetreden bij het lezen van het CSV bestand.');
            }}
            locale={nlNL} 
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