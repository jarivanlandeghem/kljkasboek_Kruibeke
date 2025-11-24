import React, { useState, useMemo } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
import { Importer, ImporterField } from 'react-csv-importer';
import 'react-csv-importer/dist/index.css';
import { nlCSV } from '../utils/csvLocale';

// MUI Imports
import {
  Box, Button, Typography, Paper, TextField, 
  Dialog, DialogTitle, DialogContent, Stack, 
  Card, CardContent, Chip, IconButton, Tooltip,
  LinearProgress, Grid, Divider, List, ListItem, ListItemText, ListItemIcon
} from '@mui/material';

// Icons
import {
  CloudUpload, Map, CheckCircle, DirectionsRun, 
  Home, Badge, PlayArrow, ContentCopy, OpenInNew,
  Warning
} from '@mui/icons-material';

// API
import * as api from '../api'; // Zorg dat je hier je post/get import
import Navbar from '../components/Navbar';

// --- STIJLING & CONSTANTEN ---
const modernButtonStyle = {
  borderRadius: '12px', 
  textTransform: 'none', 
  fontWeight: 600, 
  padding: '10px 24px',
  boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1 },
};



// ============================================================================
// COMPONENT: CSV IMPORT DIALOG
// ============================================================================
const CsvDialog = ({ open, type, onClose, onComplete }) => {
    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="md" PaperProps={{ sx: { borderRadius: 3 } }}>
            <DialogTitle sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
                {type === 'huizen' ? <Home color="primary"/> : <Badge color="secondary"/>}
                {type === 'huizen' ? 'Ledenlijst importeren' : 'Leidinglijst importeren'}
            </DialogTitle>
            <DialogContent sx={{ minHeight: '400px' }}>
                <Importer
                    locale={nlCSV}
                    parserOptions={{ header: true, delimiter: ';', skipEmptyLines: true }} // Pas delimiter aan indien nodig (komma of puntkomma)
                    processChunk={async (rows) => {
                        // Simuleer verwerking, we slaan het pas later op in state
                        await new Promise((resolve) => setTimeout(resolve, 500));
                        onComplete(rows, type);
                    }}
                    onClose={onClose}
                >
                    {/* Velden die we verwachten in de Backend DTO */}
                    <ImporterField name="naam" label="Naam" />
                    <ImporterField name="straatEnNummer" label="Straat + Nummer (bv. Kerkstraat 1)" />
                    
                    <ImporterField name="gemeente" label="Gemeente" />
                    {type === 'huizen' && <ImporterField name="bus" label="Bus (Optioneel)" optional />}
                </Importer>
            </DialogContent>
        </Dialog>
    );
};

// ============================================================================
// MAIN PAGE
// ============================================================================
export default function RondePage() {
    const [step, setStep] = useState(0); // 0 = Input, 1 = Processing, 2 = Result
    const [rondeNaam, setRondeNaam] = useState('');
    
    // Data State
    const [huizen, setHuizen] = useState([]);
    const [leiding, setLeiding] = useState([]);
    const [resultaat, setResultaat] = useState(null);
    const [stats, setStats] = useState(null);

    // UI State
    const [importType, setImportType] = useState(null); // 'huizen' of 'leiding'

    const handleImportComplete = (rows, type) => {
        if (type === 'huizen') setHuizen(prev => [...prev, ...rows]);
        if (type === 'leiding') setLeiding(prev => [...prev, ...rows]);
        setImportType(null); // Sluit dialog
    };

    const handleStartVerdeling = async () => {
    if (!rondeNaam || huizen.length === 0 || leiding.length === 0) {
        alert("Vul een naam in en importeer beide lijsten.");
        return;
    }

    setStep(1); 

    try {
        // 1. Upload
        const response = await api.post('ronde/import', { 
            arg: {
                naam: rondeNaam,
                huizen: huizen,
                leiding: leiding
            }
        });

        console.log("✅ Import klaar:", response);
        setStats(response);

        // 2. Haal het resultaat op
        const rondeId = response.rondeId;
        const detailResponse = await api.getAll(`ronde/${rondeId}/resultaat`);
        
        // 👇 AANGEPAST: Haal de array uit de 'leiding' property
        // Was: setResultaat(detailResponse);
        setResultaat(detailResponse.leiding || []); 
        
        setStep(2); 

    } catch (err) {
        console.error(err);
        alert("Er ging iets mis tijdens de verwerking.");
        setStep(0);
    }
};

    return (
        <div className="bg-gray-50 min-h-screen">
            <Navbar />
            <div className="max-w-7xl mx-auto p-4 md:p-8">
                
                {/* HEADER */}
                <motion.div initial="hidden" animate="visible" variants={containerVariants} className="mb-8">
                    <Typography variant="h3" fontWeight="800" color="#1a1a1a" sx={{ letterSpacing: '-1px' }}>
                        Ronde Planner
                    </Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
                        Importeer leden en leiding. Het systeem berekent automatisch de meest optimale route per leiding.
                    </Typography>
                </motion.div>

                {/* STAP 0: INPUT & UPLOAD */}
                {step === 0 && (
                    <motion.div variants={containerVariants} initial="hidden" animate="visible">
                        <Paper sx={{ p: 4, borderRadius: 4 }}>
                            
                            {/* NAAM */}
                            <Box sx={{ mb: 4 }}>
                                <Typography variant="h6" fontWeight="bold" gutterBottom>1. Naam van de actie</Typography>
                                <TextField 
                                    fullWidth 
                                    placeholder="bv. Wijkenverdeling 2025" 
                                    value={rondeNaam} 
                                    onChange={(e) => setRondeNaam(e.target.value)}
                                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                                />
                            </Box>

                            <Divider sx={{ my: 4 }} />

                            {/* CARDS VOOR CSV */}
                            <Typography variant="h6" fontWeight="bold" gutterBottom>2. Data Importeren</Typography>
                            <Grid container spacing={3}>
                                {/* HUIZEN CARD */}
                                <Grid item xs={12} md={6}>
                                    <Card variant="outlined" sx={{ borderRadius: 4, height: '100%', borderColor: huizen.length > 0 ? '#4caf50' : '#e0e0e0', bgcolor: huizen.length > 0 ? '#f1f8e9' : 'white' }}>
                                        <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', p: 4 }}>
                                            <Home sx={{ fontSize: 50, color: huizen.length > 0 ? '#2e7d32' : '#bdbdbd', mb: 2 }} />
                                            <Typography variant="h6" fontWeight="bold">Leden / Huizen</Typography>
                                            <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 3 }}>
                                                Upload een CSV met kolommen: Naam, Straat, Nummer, Gemeente.
                                            </Typography>
                                            
                                            {huizen.length > 0 ? (
                                                <Chip icon={<CheckCircle/>} label={`${huizen.length} rijen geladen`} color="success" sx={{ px: 2, py: 2, borderRadius: 2, fontSize: '1rem' }} />
                                            ) : (
                                                <Button variant="contained" startIcon={<CloudUpload/>} onClick={() => setImportType('huizen')} sx={{ ...modernButtonStyle, bgcolor: '#263238' }}>
                                                    Upload CSV
                                                </Button>
                                            )}
                                        </CardContent>
                                    </Card>
                                </Grid>

                                {/* LEIDING CARD */}
                                <Grid item xs={12} md={6}>
                                    <Card variant="outlined" sx={{ borderRadius: 4, height: '100%', borderColor: leiding.length > 0 ? '#4caf50' : '#e0e0e0', bgcolor: leiding.length > 0 ? '#f1f8e9' : 'white' }}>
                                        <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', p: 4 }}>
                                            <Badge sx={{ fontSize: 50, color: leiding.length > 0 ? '#2e7d32' : '#bdbdbd', mb: 2 }} />
                                            <Typography variant="h6" fontWeight="bold">Leiding (Startpunten)</Typography>
                                            <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 3 }}>
                                                Upload een CSV met de adressen van de leiding.
                                            </Typography>
                                            
                                            {leiding.length > 0 ? (
                                                <Chip icon={<CheckCircle/>} label={`${leiding.length} leiding geladen`} color="success" sx={{ px: 2, py: 2, borderRadius: 2, fontSize: '1rem' }} />
                                            ) : (
                                                <Button variant="contained" startIcon={<CloudUpload/>} onClick={() => setImportType('leiding')} sx={{ ...modernButtonStyle, bgcolor: '#263238' }}>
                                                    Upload CSV
                                                </Button>
                                            )}
                                        </CardContent>
                                    </Card>
                                </Grid>
                            </Grid>

                            {/* ACTIE KNOP */}
                            <Box sx={{ mt: 6, display: 'flex', justifyContent: 'center' }}>
                                <Button 
                                    variant="contained" 
                                    size="large"
                                    endIcon={<PlayArrow />}
                                    disabled={!rondeNaam || !huizen.length || !leiding.length}
                                    onClick={handleStartVerdeling}
                                    sx={{ 
                                        ...modernButtonStyle, 
                                        bgcolor: '#6366f1', 
                                        fontSize: '1.1rem',
                                        px: 6, py: 1.5,
                                        opacity: (!rondeNaam || !huizen.length || !leiding.length) ? 0.5 : 1
                                    }}
                                >
                                    Start Verdeling & Optimalisatie
                                </Button>
                            </Box>
                        </Paper>
                    </motion.div>
                )}

                {/* STAP 1: PROCESSING */}
                {step === 1 && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center min-h-[400px]">
                        <Box sx={{ position: 'relative', width: 100, height: 100, mb: 4 }}>
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                            >
                                <Map sx={{ fontSize: 100, color: '#d32f2f' }} />
                            </motion.div>
                        </Box>
                        <Typography variant="h5" fontWeight="bold" gutterBottom>Route wordt berekend...</Typography>
                        <Typography color="text.secondary" align="center" sx={{ maxWidth: 500, mb: 3 }}>
                            We zoeken de coördinaten van alle adressen op, groeperen huisgenoten en verdelen de rondes zodat iedereen zo weinig mogelijk kilometers moet doen.
                        </Typography>
                        <Box sx={{ width: '100%', maxWidth: 400 }}>
                            <LinearProgress color="error" sx={{ height: 8, borderRadius: 4 }} />
                        </Box>
                    </motion.div>
                )}

                {/* STAP 2: RESULTAAT */}
                {step === 2 && resultaat && (
                    <motion.div variants={containerVariants} initial="hidden" animate="visible">
                        
                        {/* STATS HEADER */}
                        <Paper sx={{ p: 3, borderRadius: 3, mb: 4, bgcolor: '#e8eaf6', border: '1px solid #c5cae9' }}>
                            <Stack direction={{xs:'column', md:'row'}} spacing={3} alignItems="center" justifyContent="space-between">
                                <Box>
                                    <Typography variant="h5" fontWeight="800" color="primary.main">Resultaat: {rondeNaam}</Typography>
                                    <Typography variant="body2">
                                        {stats?.uniekeHuizen} unieke adressen verdeeld over {resultaat.length} leiding.
                                    </Typography>
                                </Box>
                                <Button variant="outlined" onClick={() => window.location.reload()} startIcon={<Warning/>} color="error">
                                    Opnieuw beginnen
                                </Button>
                            </Stack>
                        </Paper>

                        {/* RESULT GRID */}
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                            {resultaat.map((item, index) => (
                                <motion.div key={item.leidingID} variants={itemVariants}>
                                    <Card variant="outlined" sx={{ borderRadius: 4, height: '100%', display: 'flex', flexDirection: 'column', borderColor: '#f0f0f0', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
                                        
                                        {/* HEADER CARD */}
                                        <Box sx={{ p: 2, bgcolor: '#fafafa', borderBottom: '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <Stack direction="row" alignItems="center" spacing={1}>
                                                <Box sx={{ width: 32, height: 32, borderRadius: '50%', bgcolor: '#d32f2f', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                                                    {item.leidingNaam.charAt(0)}
                                                </Box>
                                                <Typography variant="h6" fontWeight="bold">{item.leidingNaam}</Typography>
                                            </Stack>
                                            <Chip label={`${item.totaalHuizen} Huizen`} size="small" color="primary" sx={{ fontWeight: 'bold' }} />
                                        </Box>

                                        {/* LIST */}
                                        <CardContent sx={{ p: 0, flex: 1, maxHeight: '400px', overflowY: 'auto' }}>
                                            <List dense>
                                                {item.route.map((huis, i) => (
                                                    <React.Fragment key={i}>
                                                        <ListItem 
                                                            secondaryAction={
                                                                <Tooltip title="Open in Google Maps">
                                                                    <IconButton edge="end" size="small" component="a" href={huis.link} target="_blank">
                                                                        <OpenInNew fontSize="small" color="primary" />
                                                                    </IconButton>
                                                                </Tooltip>
                                                            }
                                                        >
                                                            <ListItemIcon sx={{ minWidth: 32 }}>
                                                                <Typography variant="caption" fontWeight="bold" color="text.secondary">{i+1}</Typography>
                                                            </ListItemIcon>
                                                            <ListItemText 
                                                                primary={<Typography variant="body2" fontWeight="600">{huis.adres.split(',')[0]}</Typography>}
                                                                secondary={
                                                                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', lineHeight: 1.2 }}>
                                                                        {huis.bewoners}
                                                                    </Typography>
                                                                }
                                                            />
                                                        </ListItem>
                                                        {i < item.route.length - 1 && <Divider component="li" />}
                                                    </React.Fragment>
                                                ))}
                                            </List>
                                        </CardContent>

                                        {/* FOOTER ACTIONS */}
                                        <Box sx={{ p: 1.5, borderTop: '1px solid #f0f0f0', display: 'flex', justifyContent: 'center' }}>
                                            <Button 
                                                size="small" 
                                                startIcon={<ContentCopy/>}
                                                onClick={() => {
                                                    const text = `Ronde voor ${item.leidingNaam}:\n` + item.route.map((h, i) => `${i+1}. ${h.adres} (${h.bewoners})`).join('\n');
                                                    navigator.clipboard.writeText(text);
                                                    alert("Lijst gekopieerd naar klembord!");
                                                }}
                                            >
                                                Kopieer Lijst
                                            </Button>
                                        </Box>
                                    </Card>
                                </motion.div>
                            ))}
                        </div>

                    </motion.div>
                )}

            </div>

            {/* CSV IMPORT DIALOG */}
            {importType && (
                <CsvDialog 
                    open={Boolean(importType)} 
                    type={importType} 
                    onClose={() => setImportType(null)} 
                    onComplete={handleImportComplete} 
                />
            )}
        </div>
    );
}