import { useState, useMemo, useEffect, useCallback } from 'react';
import { FiEdit } from 'react-icons/fi';
import { IoTrash } from 'react-icons/io5';
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  flexRender,
} from '@tanstack/react-table';
import useSWR, { useSWRConfig } from 'swr';
import { useForm, Controller } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Box,
  Button,
  Typography,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Chip,
  IconButton,
  Tooltip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Select,
  FormControl,
  InputLabel,
  OutlinedInput,
} from '@mui/material';

import {
  Search,
  Add, DirectionsWalk
} from '@mui/icons-material';

import { getAll, post, deleteById, update } from '../api';

import { useAuth } from '../contexts/auth';
import AsyncData from './AsyncData';


const LEEFTIJDSGROEPEN = ['-8', '-12', '-16', '+16'];
const FUNCTIES_OPTIES = ['Hoofdleiding', 'Kassier', 'Materiaalmeester', 'EHBO', 'Kookouder', 'Lid'];

const modernButtonStyle = {
  borderRadius: '12px',
  textTransform: 'none',
  fontWeight: 600,
  padding: '8px 20px',
  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  letterSpacing: '0.5px',
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { y: 10, opacity: 0 },
  visible: { y: 0, opacity: 1 },
};

const LoadingState = () => (
  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '400px', width: '100%', bgcolor: '#ffffff', borderRadius: 4 }}>
    <style>{`
      @keyframes walkAcross { 0% { transform: translateX(-60px); } 100% { transform: translateX(360px); } }
      @keyframes bounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-12px); } }
    `}</style>
    <div style={{ width: '300px', height: '100px', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', bottom: '10px', animation: 'walkAcross 3.5s linear infinite' }}>
        <div style={{ animation: 'bounce 0.4s ease-in-out infinite' }}>
          <DirectionsWalk sx={{ fontSize: 60, color: '#d32f2f' }} />
        </div>
      </div>
      <div style={{ width: '100%', height: '2px', backgroundColor: '#e0e0e0', position: 'absolute', bottom: '10px' }}></div>
    </div>
    <Typography variant="h5" sx={{ mt: 2, fontWeight: 600 }}>Leiding laden...</Typography>
  </Box>
);

const getGroupColor = (group) => {
  switch (group) {
    case '-8': return 'info';     // Blauw
    case '-12': return 'success'; // Groen
    case '-16': return 'warning'; // Oranje
    case '+16': return 'error';   // Rood
    default: return 'default';
  }
};

export default function LeidingList() {
  const { user } = useAuth();
  const { mutate } = useSWRConfig();
  
  const isAdmin = user?.roles?.includes('ADMIN') || user?.roles?.includes('HOOFDLEIDING') || user?.roles?.includes('admin');

  const [openDialog, setOpenDialog] = useState(null); 
  const [editingId, setEditingId] = useState(null);
  const [globalFilter, setGlobalFilter] = useState('');
  
  const { data: leidingProfielen, isLoading: loadingProfielen, error } = useSWR('leiding-profiel', getAll);
  const { data: users } = useSWR(isAdmin ? 'users' : null, getAll); 

  const { control, handleSubmit, reset, setValue, formState: { errors } } = useForm({
    defaultValues: {
      userID: '',
      telnr: '',
      leeftijdsgroep: '-12',
      functies: [],
    },
  });

  const [forceLoading, setForceLoading] = useState(true);
  useEffect(() => {
    const timer = setTimeout(() => setForceLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);
  
  const showLoading = forceLoading || loadingProfielen || (!leidingProfielen && !error);


  const handleEditClick = useCallback((row) => {
    setEditingId(row.profielID);
    setValue('telnr', row.telnr);
    setValue('leeftijdsgroep', row.leeftijdsgroep);
    setValue('functies', row.functies || []);
    setValue('userID', row.userID);
    setOpenDialog('edit');
  }, [setValue]);

  const handleDeleteClick = useCallback(async (id, naam) => {
    if (window.confirm(`Ben je zeker dat je ${naam} wilt verwijderen als leiding?`)) {
      try {
        await deleteById('leiding-profiel', { arg: id });
        mutate('leiding-profiel');
      } catch (err) {
        console.error(err);
        alert('Fout bij verwijderen');
      }
    }
  }, [mutate]);

  const onSubmit = async (data) => {
    try {
      if (openDialog === 'create') {
        await post('leiding-profiel', { arg: data });
      } else if (openDialog === 'edit') {
        const { userID, ...updateData } = data;
        await update(`leiding-profiel/${editingId}`, { arg: updateData });
      }
      mutate('leiding-profiel');
      setOpenDialog(null);
      reset();
    } catch (err) {
      console.error(err);
      alert('Er ging iets mis bij het opslaan.');
    }
  };

  const columns = useMemo(() => [
    {
      header: 'Naam',
      accessorFn: row => `${row.voornaam} ${row.familienaam}`,
      cell: info => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xs">
            {info.row.original.voornaam[0]}{info.row.original.familienaam[0]}
          </div>
          <Typography variant="body2" fontWeight="600">{info.getValue()}</Typography>
        </Box>
      )
    },
    {
      header: 'Contact',
      accessorKey: 'email',
      cell: info => (
        <Box display="flex" flexDirection="column">
            <span className="text-xs text-gray-500">{info.getValue()}</span>
            <span className="text-xs font-medium text-gray-700">{info.row.original.telnr}</span>
        </Box>
      )
    },
    {
      header: 'Tak',
      accessorKey: 'leeftijdsgroep',
      cell: info => (
        <Chip 
          label={info.getValue()} 
          size="small" 
          color={getGroupColor(info.getValue())}
          sx={{ fontWeight: 'bold', minWidth: '50px' }} 
        />
      )
    },
    {
      header: 'Functies',
      accessorKey: 'functies',
      cell: info => (
        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
          {info.getValue().map((f, i) => (
            <Chip key={i} label={f} size="small" variant="outlined" sx={{ fontSize: '0.7rem', height: '20px' }} />
          ))}
        </Box>
      )
    },
    ...(isAdmin ? [{
      id: 'actions',
      header: '',
      cell: info => (
        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
          <Tooltip title="Bewerken">
            <IconButton
              size="small"
              onClick={() => handleEditClick(info.row.original)}
              sx={{ bgcolor: 'black', color: 'white', '&:hover': { bgcolor: 'gray.800' }, width: 36, height: 36 }}
            >
              <FiEdit size={16} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Verwijderen">
            <IconButton
              size="small"
              onClick={() => handleDeleteClick(info.row.original.profielID, info.row.original.voornaam)}
              sx={{ bgcolor: 'black', color: 'white', '&:hover': { bgcolor: 'gray.800' }, width: 36, height: 36 }}
            >
              <IoTrash size={16} />
            </IconButton>
          </Tooltip>
        </Box>
      )
    }] : [])
  ], [isAdmin, handleEditClick, handleDeleteClick]);

  const table = useReactTable({
    data: leidingProfielen || [],
    columns,
    state: { globalFilter },
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <motion.div 
      className="px-6 py-8"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <motion.div variants={itemVariants} className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
        <Typography variant="h3" component="h1" sx={{ fontWeight: 800, color: '#1a1a1a', letterSpacing: '-1px' }}>
            Leiding
        </Typography>

        <div className="flex items-center bg-white rounded-full px-4 py-2 shadow-sm border border-gray-200 w-full md:w-auto focus-within:ring-2 focus-within:ring-red-500 transition-all">
            <Search sx={{ color: 'gray', mr: 1 }} />
            <input
                type="search"
                className="bg-transparent border-none outline-none text-gray-700 placeholder-gray-400 w-full"
                placeholder="Zoek op naam."
                value={globalFilter ?? ''}
                onChange={(e) => setGlobalFilter(e.target.value)}
            />
        </div>
      </motion.div>

      {isAdmin && (
        <motion.div variants={itemVariants} className="flex justify-end mb-6">
             <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.95 }}>
                <Button 
                    variant="contained" 
                    startIcon={<Add />}
                    onClick={() => {
                        reset(); 
                        setOpenDialog('create');
                    }} 
                    sx={{ ...modernButtonStyle, bgcolor: '#d32f2f', '&:hover': { bgcolor: '#b71c1c' } }}
                >
                    Leiding Toevoegen
                </Button>
            </motion.div>
        </motion.div>
      )}

      <div className="relative" style={{ minHeight: '500px' }}>
         <AnimatePresence>
            {showLoading && (
                <motion.div 
                    key="loader"
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5 }}
                    style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 50, backgroundColor: 'white' }}
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
                    <TableContainer>
                        <Table>
                            <TableHead sx={{ bgcolor: '#fafafa' }}>
                                {table.getHeaderGroups().map(headerGroup => (
                                    <TableRow key={headerGroup.id}>
                                        {headerGroup.headers.map(header => (
                                            <TableCell key={header.id} sx={{ fontWeight: 700, color: '#616161', borderBottom: '2px solid #f0f0f0' }}>
                                                {flexRender(header.column.columnDef.header, header.getContext())}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))}
                            </TableHead>
                            <TableBody>
                                {table.getRowModel().rows.length > 0 ? (
                                    table.getRowModel().rows.map(row => (
                                        <TableRow key={row.id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                            {row.getVisibleCells().map(cell => (
                                                <TableCell key={cell.id} sx={{ py: 2 }}>
                                                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                                </TableCell>
                                            ))}
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={columns.length} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                                            Geen leiding gevonden.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Paper>
            </AsyncData>
         </motion.div>
      </div>

      <Dialog 
        open={!!openDialog} 
        onClose={() => setOpenDialog(null)} 
        maxWidth="sm" 
        fullWidth
        PaperProps={{ sx: { borderRadius: 3, p: 1 } }}
      >
        <DialogTitle sx={{ fontWeight: 'bold', fontSize: '1.5rem', textAlign: 'center' }}>
            {openDialog === 'create' ? 'Nieuwe Leiding' : 'Profiel Bewerken'}
        </DialogTitle>

        <form onSubmit={handleSubmit(onSubmit)}>
            <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 2 }}>
                
                {openDialog === 'create' && (
                   <Controller
                        name="userID"
                        control={control}
                        rules={{ required: 'Selecteer een gebruiker' }}
                        render={({ field }) => (
                            <FormControl fullWidth error={!!errors.userID}>
                                <InputLabel>Selecteer Gebruiker (Lid)</InputLabel>
                                <Select {...field} label="Selecteer Gebruiker (Lid)">
                                    {(users || []).map((u) => (
                                        <MenuItem key={u.userid} value={u.userid}>
                                            {u.voornaam} {u.familienaam} ({u.email})
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        )}
                   />
                )}

                <Controller
                    name="telnr"
                    control={control}
                    rules={{ required: 'Telefoonnummer is verplicht' }}
                    render={({ field }) => (
                        <TextField 
                            {...field} 
                            label="Telefoonnummer" 
                            variant="outlined" 
                            fullWidth 
                            error={!!errors.telnr}
                            helperText={errors.telnr?.message}
                        />
                    )}
                />

                <Controller
                    name="leeftijdsgroep"
                    control={control}
                    render={({ field }) => (
                        <TextField 
                            {...field} 
                            select 
                            label="Tak / Leeftijdsgroep" 
                            fullWidth
                        >
                            {LEEFTIJDSGROEPEN.map((opt) => (
                                <MenuItem key={opt} value={opt}>{opt}</MenuItem>
                            ))}
                        </TextField>
                    )}
                />

                <Controller
                    name="functies"
                    control={control}
                    render={({ field }) => (
                        <FormControl fullWidth>
                            <InputLabel>Functies</InputLabel>
                            <Select
                                {...field}
                                multiple
                                input={<OutlinedInput label="Functies" />}
                                renderValue={(selected) => (
                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                        {selected.map((value) => (
                                            <Chip key={value} label={value} size="small" />
                                        ))}
                                    </Box>
                                )}
                            >
                                {FUNCTIES_OPTIES.map((func) => (
                                    <MenuItem key={func} value={func}>
                                        {func}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    )}
                />

            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 3 }}>
                <Button onClick={() => setOpenDialog(null)} color="inherit" sx={{ borderRadius: 2 }}>Annuleren</Button>
                <Button type="submit" variant="contained" color="error" sx={{ borderRadius: 2, px: 4 }}>Opslaan</Button>
            </DialogActions>
        </form>
      </Dialog>
    </motion.div>
  );
}