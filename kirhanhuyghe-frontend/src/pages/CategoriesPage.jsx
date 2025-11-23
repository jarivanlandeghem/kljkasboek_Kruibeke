import { useState, useMemo, useCallback } from 'react';
import useSWR, { useSWRConfig } from 'swr';
import { getAll, deleteById } from '../api';
import CategoryDropdown from "../components/categories/CategoryDropdown";
import AddCategoryDialog from "../components/categories/AddCategoryDialog";
import Navbar from "../components/Navbar";
import TransactionsTable from '../components/transactions/TransactionTable';
import AsyncData from '../components/AsyncData';
import { useAuth } from '../contexts/auth';

import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
    PointElement,
    LineElement,
} from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import { motion, AnimatePresence } from 'framer-motion';
import { Assessment, TableChart, PieChart } from '@mui/icons-material';
import { Button, ButtonGroup } from '@mui/material';

// Registreer ChartJS componenten
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

export default function CategoriesPage() {
  const { user } = useAuth();
  const { mutate } = useSWRConfig();

  const [selected, setSelected] = useState(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  
  // --- NIEUW: Hier ontbrak de state voor de weergave modus ---
  const [viewMode, setViewMode] = useState('table'); // 'table' of 'charts'

  const { data: transacties = [], isLoading, error } = useSWR('transacties', getAll);

  const handleDelete = useCallback(async (id) => {
    try {
      await deleteById('transacties', { arg: id });
      mutate('transacties');
    } catch (err) {
      console.error('Error deleting transaction:', err);
      alert('Fout bij verwijderen');
    }
  }, [mutate]);

  // --- LOGICA VOOR SPECIFIEKE CATEGORIE ---
  const matchesCategory = useCallback((t, cat) => {
    if (!cat) return false;
    const cid = cat.categorieID;
    const name = (cat.categorienaam || '').toLowerCase();
    const details = t.categorieDetails || [];
    if (cid != null) return details.some((d) => d.categorieID === cid);
    return details.some((d) => (d.categorienaam || '').toLowerCase() === name) ||
      (t.categorieDetails && t.categorieDetails.length === 0 && (t.categorienaam || '').toLowerCase() === name);
  }, []);

  const filtered = useMemo(() => {
    if (!selected) return [];
    return (transacties || []).filter((t) => matchesCategory(t, selected));
  }, [transacties, selected, matchesCategory]);

  const inTransacties = useMemo(() => filtered.filter((t) => String(t.in_uit).toUpperCase() === 'IN'), [filtered]);
  const uitTransacties = useMemo(() => filtered.filter((t) => String(t.in_uit).toUpperCase() === 'UIT'), [filtered]);

  // --- DATA VOOR GESELECTEERDE CATEGORIE GRAFIEKEN ---
  const specificChartData = useMemo(() => {
    const totalIn = inTransacties.reduce((acc, curr) => acc + Number(curr.bedrag), 0);
    const totalUit = uitTransacties.reduce((acc, curr) => acc + Number(curr.bedrag), 0);

    return {
      comparison: {
        labels: ['Inkomsten', 'Uitgaven'],
        datasets: [{
          label: 'Bedrag (€)',
          data: [totalIn, totalUit],
          backgroundColor: ['rgba(34, 197, 94, 0.6)', 'rgba(239, 68, 68, 0.6)'],
          borderColor: ['rgb(34, 197, 94)', 'rgb(239, 68, 68)'],
          borderWidth: 1,
          borderRadius: 8,
        }],
      },
      ratio: {
        labels: ['Inkomsten', 'Uitgaven'],
        datasets: [{
          data: [totalIn, totalUit],
          backgroundColor: ['rgba(34, 197, 94, 0.8)', 'rgba(239, 68, 68, 0.8)'],
          borderWidth: 0,
        }],
      },
      timeline: {
        labels: filtered.map(t => new Date(t.datum).toLocaleDateString('nl-BE', { day: '2-digit', month: '2-digit' })),
        datasets: [{
          label: 'Verloop',
          data: filtered.map(t => String(t.in_uit).toUpperCase() === 'UIT' ? -Math.abs(t.bedrag) : t.bedrag),
          borderColor: 'rgb(59, 130, 246)',
          backgroundColor: 'rgba(59, 130, 246, 0.5)',
          tension: 0.4,
        }]
      }
    };
  }, [inTransacties, uitTransacties, filtered]);

  // --- DATA VOOR GLOBALE GRAFIEKEN (ALLE CATEGORIEËN) ---
  const globalChartData = useMemo(() => {
    // 1. Groepeer transacties per categorie
    const categoryStats = {};
    
    transacties.forEach(t => {
        // Probeer categorienaam te vinden, fallback naar 'Overig'
        const catName = t.categorieDetails?.[0]?.categorienaam || t.categorienaam || 'Ongecategoriseerd';
        
        if (!categoryStats[catName]) {
            categoryStats[catName] = { in: 0, uit: 0 };
        }

        const bedrag = Number(t.bedrag);
        if (String(t.in_uit).toUpperCase() === 'IN') {
            categoryStats[catName].in += bedrag;
        } else {
            categoryStats[catName].uit += bedrag;
        }
    });

    const labels = Object.keys(categoryStats);
    const dataIn = labels.map(l => categoryStats[l].in);
    const dataUit = labels.map(l => categoryStats[l].uit);

    // Kleurenpalet
    const colors = [
        '#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#6366f1', '#14b8a6'
    ];

    return {
        // Grafiek 1: Uitgaven per Categorie (Doughnut)
        expensesByCategory: {
            labels: labels,
            datasets: [{
                label: 'Uitgaven',
                data: dataUit,
                backgroundColor: colors,
                borderWidth: 0,
            }]
        },
        // Grafiek 2: Inkomsten vs Uitgaven per Categorie (Bar)
        comparisonPerCategory: {
            labels: labels,
            datasets: [
                {
                    label: 'Inkomsten',
                    data: dataIn,
                    backgroundColor: 'rgba(34, 197, 94, 0.7)',
                    borderRadius: 4,
                },
                {
                    label: 'Uitgaven',
                    data: dataUit,
                    backgroundColor: 'rgba(239, 68, 68, 0.7)',
                    borderRadius: 4,
                }
            ]
        }
    };
  }, [transacties]);

const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    layout: {
        padding: {
            bottom: 20,
            left: 10,
            right: 10
        }
    },
    plugins: {
      legend: { position: 'bottom' },
      title: { display: false },
    },
    scales: {
       y: { 
           beginAtZero: true, 
           grid: { color: 'rgba(0,0,0,0.05)' } 
       },
       x: { 
           grid: { display: false },
           ticks: {
               autoSkip: false, 
               maxRotation: 45, 
               minRotation: 0
           }
       }
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <Navbar />
      <div className="p-4">
        <div className="max-w-5xl mx-auto">
          
          {/* --- HEADER CONTROLS --- */}
          <div className="mb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Dropdown */}
            <div className="flex-1 min-w-[250px]">
              <CategoryDropdown value={selected} onChange={setSelected} />
            </div>

            <div className="flex items-center gap-3">
                {/* --- NIEUW: KNOPPEN OM TE WISSELEN TUSSEN TABEL EN GRAFIEK --- */}
                <ButtonGroup variant="outlined" aria-label="view mode" size="medium">
                    <Button 
                        onClick={() => setViewMode('table')}
                        variant={viewMode === 'table' ? 'contained' : 'outlined'}
                        startIcon={<TableChart />}
                    >
                        Tabel
                    </Button>
                    <Button 
                        onClick={() => setViewMode('charts')}
                        variant={viewMode === 'charts' ? 'contained' : 'outlined'}
                        startIcon={<Assessment />}
                    >
                        Grafieken
                    </Button>
                </ButtonGroup>

                {user && user.roles && user.roles.includes('admin') && (
                <button
                    className="bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700 transition"
                    onClick={() => setShowAddDialog(true)}
                >
                    + Categorie
                </button>
                )}
            </div>
            
            <AddCategoryDialog
              open={showAddDialog}
              onClose={() => setShowAddDialog(false)}
              onSaved={() => mutate('categorieen')}
            />
          </div>

          <AsyncData loading={isLoading} error={error}>
             <AnimatePresence mode="wait">
                
                {/* SCENARIO 1: TABEL MODUS + GEEN SELECTIE */}
                {viewMode === 'table' && !selected && (
                     <motion.div 
                        key="no-selection-table"
                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                        className="text-center py-20 text-gray-500 bg-white rounded-xl shadow-sm border border-gray-100"
                    >
                        <TableChart sx={{ fontSize: 60, color: '#e5e7eb', mb: 2 }} />
                        <p>Selecteer een categorie om transacties te bekijken.</p>
                    </motion.div>
                )}

                {/* SCENARIO 2: TABEL MODUS + WEL SELECTIE */}
                {viewMode === 'table' && selected && (
                  <motion.div
                    key="table-view"
                    initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="flex flex-col md:flex-row gap-6">
                      <div className="md:w-1/2 w-full bg-white p-4 rounded-xl shadow-sm border border-green-100">
                        <h2 className="text-xl font-bold mb-4 text-green-700 flex items-center gap-2">
                           <span>⬇️</span> Inkomsten: {selected.categorienaam}
                        </h2>
                        <TransactionsTable transacties={inTransacties} onDelete={handleDelete} currentUser={user} compact={true} />
                      </div>
                      <div className="md:w-1/2 w-full bg-white p-4 rounded-xl shadow-sm border border-red-100">
                        <h2 className="text-xl font-bold mb-4 text-red-700 flex items-center gap-2">
                           <span>⬆️</span> Uitgaven: {selected.categorienaam}
                        </h2>
                        <TransactionsTable transacties={uitTransacties} onDelete={handleDelete} currentUser={user} compact={true} />
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* SCENARIO 3: GRAFIEKEN MODUS + GEEN SELECTIE (GLOBAL OVERVIEW) */}
                {viewMode === 'charts' && !selected && (
                    <motion.div
                        key="global-charts"
                        initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.05 }}
                        transition={{ duration: 0.4 }}
                    >
                        <div className="mb-6">
                            <h2 className="text-2xl font-bold text-gray-800">Algemeen Overzicht</h2>
                            <p className="text-gray-500">Vergelijking tussen alle categorieën</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                             {/* Globale Doughnut */}
                             <div className="bg-white p-6 rounded-xl shadow-md h-96 flex flex-col items-center">
                                <h3 className="text-gray-700 font-semibold mb-4 flex items-center gap-2"><PieChart/> Uitgaven Verdeling</h3>
                                <div className="w-full h-full relative">
                                    <Doughnut 
                                        data={globalChartData.expensesByCategory} 
                                        options={{...chartOptions, maintainAspectRatio: false}} 
                                    />
                                </div>
                            </div>

                            {/* Globale Bar Chart */}
                            <div className="bg-white p-6 rounded-xl shadow-md h-96">
                                <h3 className="text-gray-700 font-semibold mb-4 flex items-center gap-2"><Assessment/> Inkomsten vs Uitgaven per Categorie</h3>
                                <Bar 
                                    data={globalChartData.comparisonPerCategory} 
                                    options={chartOptions} 
                                />
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* SCENARIO 4: GRAFIEKEN MODUS + WEL SELECTIE (SPECIFIEKE GRAFIEKEN) */}
                {viewMode === 'charts' && selected && (
                  <motion.div
                    key="specific-charts"
                    initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.4 }}
                    className="grid grid-cols-1 md:grid-cols-2 gap-6"
                  >
                      <div className="col-span-1 md:col-span-2 mb-2">
                        <h2 className="text-2xl font-bold text-gray-800">Analyse: {selected.categorienaam}</h2>
                      </div>

                    {/* Specifieke Bar Chart */}
                    <div className="bg-white p-6 rounded-xl shadow-md h-80">
                        <h3 className="text-gray-700 font-semibold mb-4">Balans (In vs Uit)</h3>
                        <Bar data={specificChartData.comparison} options={chartOptions} />
                    </div>

                    {/* Specifieke Doughnut */}
                    <div className="bg-white p-6 rounded-xl shadow-md h-80 flex flex-col items-center">
                        <h3 className="text-gray-700 font-semibold mb-4">Verhouding</h3>
                        <div className="w-full h-full relative">
                             <Doughnut data={specificChartData.ratio} options={{...chartOptions, maintainAspectRatio: false}} />
                        </div>
                    </div>

                    {/* Specifieke Line Chart */}
                    <div className="bg-white p-6 rounded-xl shadow-md h-80 md:col-span-2">
                        <h3 className="text-gray-700 font-semibold mb-4">Verloop over tijd</h3>
                        <Line data={specificChartData.timeline} options={chartOptions} />
                    </div>
                  </motion.div>
                )}

              </AnimatePresence>
          </AsyncData>
        </div>
      </div>
    </div>
  );
}