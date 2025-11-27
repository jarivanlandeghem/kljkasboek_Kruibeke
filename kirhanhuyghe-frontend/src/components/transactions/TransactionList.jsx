import TransactionsTable from './TransactionTable';
import { useState, useMemo, useCallback, useEffect } from 'react';
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
  Box,
  Typography,
  Paper
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import * as api from '../../api';
import { nlCSV } from '../../utils/csvLocale';



// ICONS
import { DirectionsWalk, Add, CloudUpload, Assessment, Search } from '@mui/icons-material';

// FRAMER MOTION
import { motion, AnimatePresence } from 'framer-motion';

//MUI DATEPICKER 
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';
import 'dayjs/locale/nl';

// CSV IMPORTER
import { Importer, ImporterField } from 'react-csv-importer';
import 'react-csv-importer/dist/index.css';



//  ANIMATIE VARIANTEN 
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { y: 10, opacity: 0 },
  visible: { y: 0, opacity: 1 }
};

const modernButtonStyle = {
    borderRadius: '12px', 
    textTransform: 'none',
    fontWeight: 600,
    padding: '8px 20px',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    letterSpacing: '0.5px',
};


const LoadingState = () => {
  return (
    <Box
      sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center', 
        minHeight: '400px',
        width: '100%',
        bgcolor: '#ffffff',
        borderRadius: 4,
        zIndex: 10,
        position: 'relative'
      }}
    >
      <style>
        {`
          @keyframes walkAcross {
            0% { transform: translateX(-60px); }
            100% { transform: translateX(360px); }
          }
          @keyframes bounce {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-12px); }
          }
        `}
      </style>

      <div style={{ width: '300px', height: '100px', position: 'relative', overflow: 'hidden' }}>
        <div style={{
          position: 'absolute',
          bottom: '10px',
          animation: 'walkAcross 3.5s linear infinite',
          willChange: 'transform'
        }}>
          <div style={{ animation: 'bounce 0.4s ease-in-out infinite' }}>
             <DirectionsWalk sx={{ fontSize: 60, color: '#d32f2f' }} />
          </div>
        </div>
        <div style={{ width: '100%', height: '2px', backgroundColor: '#e0e0e0', position: 'absolute', bottom: '10px' }}></div>
      </div>
      
      <Typography variant="h5" color="text.primary" sx={{ mt: 2, fontWeight: 600 }}>
        Gegevens ophalen...
      </Typography>
      <Typography variant="body1" color="text.secondary">
        Een moment geduld alstublieft.
      </Typography>
    </Box>
  );
};

export default function TransactionList() {
  const { user } = useAuth();
  const userid = user.userid;
  
  const [openDialog, setOpenDialog] = useState(null);
  const [text, setText] = useState('');
  const [search, setSearch] = useState('');
  
  const [duplicateWarning, setDuplicateWarning] = useState(false);
  const [pendingData, setPendingData] = useState(null);

  const { mutate } = useSWRConfig();

  const { register, control, handleSubmit, formState: { errors }, reset } = useForm({
    defaultValues: { 
      beschrijving: '', 
      bedrag: '', 
      datum: dayjs(), 
      categorieen: [] 
    },
  });

  const { data: transacties, isLoading, error } = useSWR('transacties', getAll);
  const { data: gebruikers = [] } = useSWR('users', getAll);

  const [forceLoading, setForceLoading] = useState(true); 
  useEffect(() => {
    const timer = setTimeout(() => setForceLoading(false), 1500); 
    return () => clearTimeout(timer);
  }, []);

  const showLoading = forceLoading || isLoading || (!transacties && !error);

  const gebruikerMapping = useMemo(() => {
    const mapping = {};
    gebruikers.forEach(gebruiker => {
      mapping[gebruiker.userid] = gebruiker.voornaam;
    });
    return mapping;
  }, [gebruikers]);

  const verrijkteTransacties = useMemo(() => 
    (transacties || []).map(transactie => ({
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

  const handleFinalSave = async (transactieData) => {
    try {
      await post('transacties', { arg: transactieData });
      mutate('transacties');
      reset();
      setOpenDialog(null);
      setDuplicateWarning(false);
      setPendingData(null);
    } catch (error) {
      console.error('Fout bij aanmaken transactie:', error);
      alert('Er is een fout opgetreden bij het aanmaken van de transactie.');
    }
  };

  const onSubmit = async (data) => {
    try {
      const bedragNum = parseFloat(String(data.bedrag).replace(',', '.'));
      const formattedDate = dayjs(data.datum).format('YYYY-MM-DD');

      if (!userid) {
        alert('Fout: Gebruiker niet gevonden. Probeer opnieuw in te loggen.');
        return;
      }

      const newTransactie = {
        userID: userid,
        beschrijving: data.beschrijving,
        in_uit: bedragNum >= 0 ? 'IN' : 'UIT',
        bedrag: bedragNum,
        datum: formattedDate,
      };

      const duplicateFound = (transacties || []).find((t) => 
        t.bedrag === bedragNum && 
        (t.beschrijving || '').trim().toLowerCase() === data.beschrijving.trim().toLowerCase()
      );

      if (duplicateFound) {
        setPendingData(newTransactie);
        setDuplicateWarning(true);
      } else {
        await handleFinalSave(newTransactie);
      }

    } catch (error) {
      console.error('Fout in validatie:', error);
    }
  };

  const handleClose = () => {
    reset();
    setOpenDialog(null);
    setDuplicateWarning(false);
    setPendingData(null);
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
    <motion.div 
      className="px-6 py-8"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <motion.div variants={itemVariants} className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
        <Typography variant="h3" component="h1" sx={{ fontWeight: 800, color: '#1a1a1a', letterSpacing: '-1px' }}>
            Transacties
        </Typography>

        <div className="flex items-center bg-white rounded-full px-4 py-2 shadow-sm border border-gray-200 w-full md:w-auto focus-within:ring-2 focus-within:ring-red-500 transition-all">
            <Search sx={{ color: 'gray', mr: 1 }} />
            <input
                type="search"
                className="bg-transparent border-none outline-none text-gray-700 placeholder-gray-400 w-full"
                placeholder="Zoek op beschrijving..."
                value={text}
                onChange={(e) => {
                    setText(e.target.value);
                    setSearch(e.target.value);
                }}
            />
        </div>
      </motion.div>

      <motion.div variants={itemVariants} className="flex flex-wrap gap-3 mb-6">
        <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.95 }}>
            <Button 
                variant="contained" 
                startIcon={<Add />}
                onClick={() => setOpenDialog('voegtoe')} 
                sx={{ ...modernButtonStyle, bgcolor: '#d32f2f', '&:hover': { bgcolor: '#b71c1c' } }}
            >
                Nieuwe Transactie
            </Button>
        </motion.div>

        <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.95 }}>
            <Button 
                variant="contained" 
                startIcon={<CloudUpload />}
                onClick={() => setOpenDialog('importcsv')} 
                sx={{ ...modernButtonStyle, bgcolor: '#263238', '&:hover': { bgcolor: '#102027' } }}
            >
                CSV Importeren
            </Button>
        </motion.div>

        <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.95 }}>
            <Button 
                variant="contained" 
                startIcon={<Assessment />}
                onClick={handleGenerateReport} 
                sx={{ ...modernButtonStyle, bgcolor: '#6366f1', '&:hover': { bgcolor: '#4f46e5' } }}
            >
                PDF Rapport
            </Button>
        </motion.div>
      </motion.div>

      <div className="relative" style={{ minHeight: '500px' }}>
         <AnimatePresence>
            {showLoading && (
                <motion.div 
                    key="loader"
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5 }}
                    style={{ 
                        position: 'absolute', 
                        top: 0, 
                        left: 0, 
                        width: '100%', 
                        height: '100%', 
                        zIndex: 50,
                        backgroundColor: 'white' 
                    }}
                >
                    <LoadingState />
                </motion.div>
            )}
         </AnimatePresence>

         <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: !showLoading ? 1 : 0 }}
            transition={{ duration: 0.5 }}
         >
            <AsyncData loading={false} error={error}>
                <Paper elevation={0} sx={{ borderRadius: 4, overflow: 'hidden', border: '1px solid #f0f0f0' }}>
                    <TransactionsTable transacties={filteredTransacties} onDelete={handleDelete} />
                </Paper>
            </AsyncData>
         </motion.div>
      </div>

      <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="nl">
        <Dialog 
            open={openDialog === 'voegtoe'} 
            onClose={handleClose} 
            maxWidth="sm" 
            fullWidth
            PaperProps={{ sx: { borderRadius: 3, p: 1 } }}
        >
            <DialogTitle sx={{ fontWeight: 'bold', fontSize: '1.5rem', textAlign: 'center' }}>
                Transactie toevoegen
            </DialogTitle>
            <form onSubmit={handleSubmit(onSubmit)}>
            <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 2 }}>
                <TextField
                    label="Beschrijving"
                    fullWidth
                    variant="outlined"
                    {...register('beschrijving', { required: 'Beschrijving is verplicht' })}
                    error={Boolean(errors.beschrijving)}
                    helperText={errors.beschrijving?.message}
                />
                <TextField
                    label="Bedrag (€)"
                    type="text"
                    fullWidth
                    variant="outlined"
                    {...register('bedrag', {
                        required: 'Bedrag is verplicht',
                        validate: (v) => !isNaN(parseFloat(String(v).replace(',', '.'))) || 'Ongeldig getal',
                    })}
                    error={Boolean(errors.bedrag)}
                    helperText={errors.bedrag?.message}
                />
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
            <DialogActions sx={{ px: 3, pb: 3 }}>
                <Button onClick={handleClose} color="inherit" sx={{ borderRadius: 2 }}>Annuleren</Button>
                <Button type="submit" variant="contained" color="error" sx={{ borderRadius: 2, px: 4 }}>Opslaan</Button>
            </DialogActions>
            </form>
        </Dialog>
      </LocalizationProvider>

      <Dialog 
        open={duplicateWarning} 
        onClose={() => setDuplicateWarning(false)}
        PaperProps={{ sx: { borderRadius: 3, p: 1 } }}
      >
        <DialogTitle sx={{ color: '#d32f2f', fontWeight: 'bold' }}>
          Mogelijke dubbele transactie
        </DialogTitle>
        <DialogContent>
          <Typography>
            Er bestaat al een transactie met de beschrijving <strong>"{pendingData?.beschrijving}"</strong> en bedrag <strong>€{pendingData?.bedrag}</strong>.
          </Typography>
          <Typography sx={{ mt: 2, fontSize: '0.9rem', color: 'text.secondary' }}>
            Weet je zeker dat je deze nogmaals wilt toevoegen?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button 
            onClick={() => setDuplicateWarning(false)} 
            variant="outlined" 
            sx={{ borderRadius: 2, textTransform: 'none' }}
          >
            Annuleren
          </Button>
          <Button 
            onClick={() => handleFinalSave(pendingData)} 
            variant="contained" 
            color="primary"
            sx={{ borderRadius: 2, textTransform: 'none' }}
            autoFocus
          >
            Ja, toch toevoegen
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openDialog === 'importcsv'} onClose={handleClose} fullWidth maxWidth="md" PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ fontWeight: 'bold' }}>CSV importeren</DialogTitle>
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
            locale={nlCSV} 
          >
            <ImporterField name="Datum" label="Datum" />
            <ImporterField name="Bedrag" label="Bedrag" />
            <ImporterField name="Vrije mededeling" label="Vrije mededeling" />
            <ImporterField name="Naam tegenpartij" label="Naam tegenpartij" />
          </Importer>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}