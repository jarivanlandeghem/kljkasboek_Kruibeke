import React, { useState, useMemo, useEffect } from 'react';
import useSWR, { useSWRConfig } from 'swr';
import { useForm, Controller } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
import dayjs from 'dayjs';
import 'dayjs/locale/nl';

// MUI Imports
import {
  Box, Button, Typography, Paper, Dialog, DialogTitle, DialogContent, 
  DialogActions, TextField, MenuItem, Chip, IconButton, Tooltip, 
  Stack, ToggleButton, ToggleButtonGroup, Card, CardContent,
  FormControl, InputLabel, Select
} from '@mui/material';

// Icons
import {
  Add, Edit as EditIcon, Delete as DeleteIcon,
  DirectionsWalk, AccessTime, 
  CheckCircle, Cancel, QueryBuilder, Groups,
  AdminPanelSettings, Person, EventBusy
} from '@mui/icons-material';

// API & Context
import { getAll, post, deleteById, update, updateAanwezigheid } from '../api';
import { useAuth } from '../contexts/auth';
import Navbar from '../components/Navbar';

dayjs.locale('nl');

// --- CONSTANTEN ---
const EVENT_TYPES = ['ACTIVITEIT', 'EVENEMENT', 'VERGADERING', 'OVERIGE'];

const STATUS_CONFIG = {
  'PRESENT': { label: 'Aanwezig', color: 'success', icon: <CheckCircle/> },
  'ABSENT':  { label: 'Afwezig',  color: 'error',   icon: <Cancel/> },
  'PARTIAL': { label: 'Aangepast',color: 'warning', icon: <QueryBuilder/> },
  'UNKNOWN': { label: 'Invullen!',color: 'default', icon: <EventBusy/> }
};

const modernButtonStyle = {
  borderRadius: '12px', textTransform: 'none', fontWeight: 600, padding: '8px 20px',
  boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { y: 10, opacity: 0 },
  visible: { y: 0, opacity: 1 },
};

// --- LOADING COMPONENT ---
const LoadingState = () => (
  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '300px', width: '100%' }}>
    <DirectionsWalk sx={{ fontSize: 60, color: '#d32f2f' }} />
    <Typography variant="h6" sx={{ mt: 2, color: 'text.secondary' }}>Aanwezigheden laden...</Typography>
  </Box>
);

// --- DIALOGS ---
const AttendanceDialog = ({ open, onClose, attendance, event, onSave }) => {
  const { control, handleSubmit, watch, reset, setValue } = useForm({
    defaultValues: { status: 'UNKNOWN', reden: '', startuur: '', einduur: '' }
  });
  const status = watch('status');

  useEffect(() => {
    if (attendance) {
      console.log("📝 AttendanceDialog OPENED for:", attendance);
      reset({
        status: attendance.status || 'UNKNOWN',
        reden: attendance.reden || '',
        startuur: attendance.aangepast_startuur ? attendance.aangepast_startuur.slice(0,5) : '',
        einduur: attendance.aangepast_einduur ? attendance.aangepast_einduur.slice(0,5) : '',
      });
    } else {
        console.warn("⚠️ AttendanceDialog opened without attendance object!");
    }
  }, [attendance, reset]);

  const onSubmit = (data) => {
    console.log("💾 AttendanceDialog SUBMIT:", data);
    const payload = {
      status: data.status,
      reden: (data.status === 'ABSENT' || data.status === 'PARTIAL') ? data.reden : null,
      aangepast_startuur: data.status === 'PARTIAL' ? data.startuur : null,
      aangepast_einduur: data.status === 'PARTIAL' ? data.einduur : null,
    };
    onSave(attendance?.aanwezigheidID, payload);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
      <DialogTitle sx={{ fontWeight: 'bold', textAlign: 'center' }}>Ben je erbij?</DialogTitle>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <Box sx={{ textAlign: 'center', mb: 1 }}>
              <Typography variant="h6" color="primary.main">{event?.naam}</Typography>
              <Typography variant="body2" color="text.secondary">
                {dayjs(event?.datum).format('dddd D MMMM')} • {event?.startuur?.slice(0,5)}
              </Typography>
          </Box>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} justifyContent="center">
            {['PRESENT', 'PARTIAL', 'ABSENT'].map((s) => (
               <Button key={s} variant={status === s ? 'contained' : 'outlined'} color={STATUS_CONFIG[s].color} onClick={() => setValue('status', s)} startIcon={STATUS_CONFIG[s].icon} sx={{ borderRadius: 2, flex: 1, py: 1.5 }}>
                 {STATUS_CONFIG[s].label}
               </Button>
            ))}
          </Stack>
          {(status === 'ABSENT' || status === 'PARTIAL') && (
            <Controller name="reden" control={control} rules={{ required: 'Geef aub een reden op.' }}
                render={({ field, fieldState }) => (
                    <TextField {...field} label="Reden" fullWidth multiline rows={2} error={!!fieldState.error} helperText={fieldState.error?.message} />
                )}
            />
          )}
          {status === 'PARTIAL' && (
            <Stack direction="row" spacing={2}>
                <Controller name="startuur" control={control} rules={{ required: 'Startuur' }}
                    render={({ field }) => <TextField {...field} type="time" label="Van" fullWidth InputLabelProps={{shrink: true}} />} />
                <Controller name="einduur" control={control} rules={{ required: 'Einduur' }}
                    render={({ field }) => <TextField {...field} type="time" label="Tot" fullWidth InputLabelProps={{shrink: true}} />} />
            </Stack>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3, justifyContent: 'center' }}>
          <Button onClick={onClose} color="inherit">Annuleren</Button>
          <Button type="submit" variant="contained" size="large">Opslaan</Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

const EventDialog = ({ open, onClose, event, onSave }) => {
    const { control, handleSubmit, reset, formState: { errors } } = useForm();
    useEffect(() => {
        if (event) {
            console.log("📝 EventDialog EDIT mode:", event);
            reset({ ...event, datum: dayjs(event.datum).format('YYYY-MM-DD') });
        }
        else {
            console.log("📝 EventDialog CREATE mode");
            reset({ naam: '', type: 'ACTIVITEIT', datum: '', startuur: '', einduur: '', beschrijving: '' });
        }
    }, [event, reset, open]);

    const onSubmit = (data) => {
        console.log("💾 EventDialog SUBMIT:", data);
        onSave(data);
    }

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
            <DialogTitle sx={{ fontWeight: 'bold' }}>{event ? 'Bewerken' : 'Nieuw'}</DialogTitle>
            <form onSubmit={handleSubmit(onSubmit)}>
                <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Controller name="naam" control={control} rules={{ required: 'Verplicht' }} render={({ field }) => <TextField {...field} label="Naam" fullWidth error={!!errors.naam} />} />
                    <Controller name="type" control={control} render={({ field }) => <TextField {...field} select label="Type" fullWidth>{EVENT_TYPES.map(t => <MenuItem key={t} value={t}>{t}</MenuItem>)}</TextField>} />
                    <Controller name="datum" control={control} rules={{ required: 'Verplicht' }} render={({ field }) => <TextField {...field} type="date" label="Datum" fullWidth InputLabelProps={{ shrink: true }} />} />
                    <Stack direction="row" spacing={2}>
                        <Controller name="startuur" control={control} render={({ field }) => <TextField {...field} type="time" label="Start" fullWidth InputLabelProps={{ shrink: true }} />} />
                        <Controller name="einduur" control={control} render={({ field }) => <TextField {...field} type="time" label="Eind" fullWidth InputLabelProps={{ shrink: true }} />} />
                    </Stack>
                    <Controller name="beschrijving" control={control} render={({ field }) => <TextField {...field} label="Beschrijving" multiline rows={3} fullWidth />} />
                </DialogContent>
                <DialogActions sx={{ p: 3 }}><Button onClick={onClose}>Annuleren</Button><Button type="submit" variant="contained">Opslaan</Button></DialogActions>
            </form>
        </Dialog>
    );
};

const AttendeeListDialog = ({ open, onClose, event, allAttendances, users }) => {
    // ... (code ongewijzigd, logs niet echt nodig hier)
    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
            {/* ... */}
            <DialogActions><Button onClick={onClose}>Sluiten</Button></DialogActions>
        </Dialog>
    );
};

// ============================================================================
// MAIN PAGE
// ============================================================================
export default function AanwezighedenPage() {
  const { user } = useAuth();
  const { mutate } = useSWRConfig();

  
  
  const hasRole = (roleName) => {
      if (!user || !user.roles) return false;
      // Zet alles om naar strings en uppercase voor de check
      return user.roles.some(r => String(r).toUpperCase() === roleName.toUpperCase());
  };

  const isAdmin = hasRole('ADMIN') || hasRole('HOOFDLEIDING');
  const isGV = hasRole('GROEPSVERANTWOORDELIJKE');
  const canManage = isAdmin || isGV;

  // 👇 DEBUG: Zie in de console wat je rollen écht zijn
  useEffect(() => {
      console.log("👮 Huidige User Rollen:", user?.roles);
      console.log("   -> Is Admin?", isAdmin);
  }, [user]);

  const [viewMode, setViewMode] = useState('personal'); 
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [selectedAttendance, setSelectedAttendance] = useState(null);
  
  const [showAttendanceDialog, setShowAttendanceDialog] = useState(false);
  const [showEventDialog, setShowEventDialog] = useState(false);
  const [showAttendeeList, setShowAttendeeList] = useState(false);

  // DATA FETCHING
  const { data: events, isLoading: loadEvents } = useSWR('evenementen', getAll);
  const { data: allAttendances, isLoading: loadAtt } = useSWR('aanwezigheden', getAll); 
  const { data: users } = useSWR(canManage ? 'users' : null, getAll); 

  useEffect(() => {
      if (events) console.log("📡 Events loaded:", events.length);
      if (allAttendances) console.log("📡 Attendances loaded:", allAttendances.length);
      if (user) console.log("👤 User ID:", user.userid);
  }, [events, allAttendances, user]);

  // --- LOGICA: PERSOONLIJKE LIJST ---
  const myEventsList = useMemo(() => {
    if (!events || !allAttendances || !user) return [];
    
    const today = dayjs().startOf('day');
    const futureEvents = events.filter(e => dayjs(e.datum).isAfter(today.subtract(1, 'day')));
    futureEvents.sort((a, b) => dayjs(a.datum).valueOf() - dayjs(b.datum).valueOf());

    return futureEvents.map(ev => {
        const myAtt = allAttendances.find(a => a.evenementID === ev.evenementID && a.userID === user.userid);
        
        // LOG ALS ER GEEN MATCH IS
        if (!myAtt) {
            console.warn(`⚠️ Geen aanwezigheid gevonden voor Event ${ev.evenementID} (${ev.naam}) en User ${user.userid}`);
        }

        return { ...ev, myAttendance: myAtt };
    });
  }, [events, allAttendances, user]);

  // --- LOGICA: ADMIN LIJST ---
  const adminEventsList = useMemo(() => {
      if (!events) return [];
      let list = [...events];
      if (isGV && !isAdmin) list = list.filter(e => e.type === 'ACTIVITEIT');
      list.sort((a, b) => dayjs(a.datum).valueOf() - dayjs(b.datum).valueOf());
      return list;
  }, [events, isAdmin, isGV]);

  // HANDLERS
  const handleAttendanceClick = (ev) => {
      console.log("🖱️ Clicked Attendance for:", ev.naam, "ID:", ev.evenementID);
      console.log("   Linked Attendance Object:", ev.myAttendance);
      
      setSelectedEvent(ev);
      setSelectedAttendance(ev.myAttendance);
      setShowAttendanceDialog(true);
  };

  const handleAttendanceSave = async (id, payload) => {
      console.log("🚀 Saving Attendance... ID:", id, "Payload:", payload);
      try {
          if (!id) {
              console.error("❌ SAVE FAILED: No ID provided!");
              return alert("Geen record gevonden. Contacteer admin.");
          }
          await updateAanwezigheid(id, payload);
          console.log("✅ Save Success!");
          mutate('aanwezigheden'); 
          setShowAttendanceDialog(false);
      } catch (err) {
          console.error("❌ Save API Error:", err);
          alert('Opslaan mislukt');
      }
  };

  const handleEventSave = async (data) => {
      console.log("🚀 Saving Event...", data);
      try {
          if (selectedEvent?.evenementID) {
              console.log("   -> Updating existing event:", selectedEvent.evenementID);
              await update(`evenementen/${selectedEvent.evenementID}`, { arg: data });
          } else {
              console.log("   -> Creating new event");
              await post('evenementen', { arg: data });
          }
          mutate('evenementen');
          mutate('aanwezigheden'); 
          setShowEventDialog(false);
      } catch (err) {
          console.error("❌ Event Save Error:", err);
          alert('Fout bij opslaan');
      }
  };

  const handleDeleteEvent = async (id) => {
      console.log("🗑️ Deleting Event ID:", id);
      if(window.confirm("Ben je zeker?")) {
          try {
              await deleteById('evenementen', { arg: id });
              mutate('evenementen');
          } catch(err) { 
              console.error("❌ Delete Error:", err);
              alert("Kon niet verwijderen"); 
          }
      }
  };

  const loading = loadEvents || loadAtt;

  return (
    <div className="bg-gray-50 min-h-screen">
      <Navbar />
      <div className="max-w-5xl mx-auto p-4 md:p-6">
        
        {/* HEADER */}
        <motion.div initial="hidden" animate="visible" variants={containerVariants} className="mb-8 flex flex-col md:flex-row justify-between items-center gap-4">
             <div>
                <Typography variant="h4" fontWeight="800" color="#1a1a1a">
                    {viewMode === 'personal' ? 'Mijn Agenda' : 'Evenementen Beheer'}
                </Typography>
             </div>
             {canManage && (
                 <ToggleButtonGroup value={viewMode} exclusive onChange={(e, val) => val && setViewMode(val)} sx={{ bgcolor: 'white', borderRadius: 3 }}>
                     <ToggleButton value="personal" sx={{ px: 3, textTransform: 'none', fontWeight: 600 }}><Person sx={{mr:1}}/> Mijn Agenda</ToggleButton>
                     <ToggleButton value="admin" sx={{ px: 3, textTransform: 'none', fontWeight: 600 }}><AdminPanelSettings sx={{mr:1}}/> Beheer</ToggleButton>
                 </ToggleButtonGroup>
             )}
        </motion.div>

        {/* CONTENT */}
        <AnimatePresence mode="wait">
            {loading ? (
                <motion.div key="loader" initial={{opacity: 0}} animate={{opacity: 1}} exit={{opacity:0}}>
                    <LoadingState />
                </motion.div>
            ) : (
                <motion.div key="content" variants={containerVariants} initial="hidden" animate="visible">
                    
                    {/* VIEW: PERSOONLIJK */}
                    {viewMode === 'personal' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {myEventsList.length === 0 ? (
                                <div className="col-span-full text-center py-10">
                                    <EventBusy sx={{ fontSize: 60, color: 'grey.300', mb: 2 }} />
                                    <Typography color="text.secondary">Geen aankomende evenementen gevonden.</Typography>
                                </div>
                            ) : (
                                myEventsList.map((ev) => {
                                    const status = ev.myAttendance?.status || 'UNKNOWN';
                                    const isUnknown = status === 'UNKNOWN';
                                    return (
                                    <motion.div key={ev.evenementID} variants={itemVariants} layout>
                                        <Card sx={{ borderRadius: 4, height: '100%', display: 'flex', flexDirection: 'column', border: isUnknown ? '2px dashed #e0e0e0' : '1px solid #f0f0f0', bgcolor: isUnknown ? '#fafafa' : 'white' }}>
                                            <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                                                <div className="flex justify-between items-start mb-3">
                                                    <div className="bg-gray-100 text-gray-600 rounded-lg px-2 py-1 text-xs font-bold uppercase">
                                                        {dayjs(ev.datum).format('MMM').toUpperCase()} <span className="block text-xl text-black">{dayjs(ev.datum).format('DD')}</span>
                                                    </div>
                                                    <Chip label={ev.type} size="small" sx={{ fontSize: '0.65rem', fontWeight: 700 }} />
                                                </div>
                                                <Typography variant="h6" fontWeight="bold" sx={{ mb: 0.5 }}>{ev.naam}</Typography>
                                                <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                                    <AccessTime fontSize="small" sx={{ mr: 0.5, fontSize: 16 }} /> {ev.startuur?.slice(0,5)} - {ev.einduur?.slice(0,5)}
                                                </Typography>
                                                <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between">
                                                    <Chip icon={STATUS_CONFIG[status].icon} label={STATUS_CONFIG[status].label} color={STATUS_CONFIG[status].color} variant={isUnknown ? 'outlined' : 'filled'} size="small" />
                                                    <Button size="small" variant="text" onClick={() => handleAttendanceClick(ev)} sx={{ fontWeight: 600 }}>{isUnknown ? 'Nu invullen' : 'Wijzigen'}</Button>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </motion.div>
                                )})
                            )}
                        </div>
                    )}

                    {/* VIEW: ADMIN */}
                    {viewMode === 'admin' && canManage && (
                        <>
                            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3 }}>
                                <Button variant="contained" startIcon={<Add/>} sx={{ ...modernButtonStyle, bgcolor: '#d32f2f' }} onClick={() => { setSelectedEvent(null); setShowEventDialog(true); }}>Evenement Toevoegen</Button>
                            </Box>
                            <Stack spacing={2}>
                                {adminEventsList.map((ev) => {
                                    const isPast = dayjs(ev.datum).isBefore(dayjs(), 'day');
                                    return (
                                    <motion.div key={ev.evenementID} variants={itemVariants}>
                                        <Paper variant="outlined" sx={{ p: 2, borderRadius: 3, display: 'flex', flexDirection: {xs: 'column', sm: 'row'}, justifyContent: 'space-between', alignItems: 'center', gap: 2, opacity: isPast ? 0.7 : 1 }}>
                                            <Box>
                                                <Stack direction="row" alignItems="center" spacing={1}>
                                                    <Typography fontWeight="bold" variant="subtitle1">{ev.naam}</Typography>
                                                    {isPast && <Chip label="Afgelopen" size="small" />}
                                                </Stack>
                                                <Typography variant="body2" color="text.secondary">{dayjs(ev.datum).format('DD MMM YYYY')} • {ev.type} • {ev.startuur?.slice(0,5)}</Typography>
                                            </Box>
                                            <Stack direction="row" spacing={1}>
                                                <Tooltip title="Aanwezigen"><IconButton color="info" onClick={() => { setSelectedEvent(ev); setShowAttendeeList(true); }}><Groups /></IconButton></Tooltip>
                                                <Tooltip title="Bewerken"><IconButton onClick={() => { setSelectedEvent(ev); setShowEventDialog(true); }}><EditIcon /></IconButton></Tooltip>
                                                <Tooltip title="Verwijderen"><IconButton color="error" onClick={() => handleDeleteEvent(ev.evenementID)}><DeleteIcon /></IconButton></Tooltip>
                                            </Stack>
                                        </Paper>
                                    </motion.div>
                                )})}
                            </Stack>
                        </>
                    )}
                </motion.div>
            )}
        </AnimatePresence>

        {showAttendanceDialog && <AttendanceDialog open={showAttendanceDialog} onClose={() => setShowAttendanceDialog(false)} attendance={selectedAttendance} event={selectedEvent} onSave={handleAttendanceSave} />}
        {showEventDialog && <EventDialog open={showEventDialog} onClose={() => setShowEventDialog(false)} event={selectedEvent} onSave={handleEventSave} />}
        {/* AttendeeListDialog (ongewijzigd, voeg toe indien nodig) */}
      </div>
    </div>
  );
}