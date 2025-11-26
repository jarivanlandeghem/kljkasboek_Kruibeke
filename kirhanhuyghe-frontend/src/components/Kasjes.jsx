import { useState, useMemo } from 'react';
import { useAuth } from '../contexts/auth';
import useSWR, { useSWRConfig } from 'swr';
import { getAll, updateKasje } from '../api';
import Navbar from "../components/Navbar";
import AsyncData from '../components/AsyncData';

import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { motion } from 'framer-motion';
import { Edit, Check, Close, ReceiptLong } from '@mui/icons-material';

ChartJS.register(ArcElement, Tooltip, Legend);

const LEEFTIJDSGROEPEN = ['-8', '-12', '-16', '+20'];

export default function BudgetsPage() {
  const { mutate } = useSWRConfig();

  // 1. Data ophalen
  const { data: transacties = [], isLoading: loadingTx } = useSWR('transacties', getAll);
  const { data: kasjes = [], isLoading: loadingKasjes } = useSWR('kasjes', getAll);

  // Helper: Filter transacties en sorteer
  const getTransactionsForGroup = useMemo(() => (groepNaam) => {
    if (!transacties.length) return [];
    return transacties
      .filter(t => {
        const catNaam = (t.categorienaam || t.categorieDetails?.[0]?.categorienaam || '').toLowerCase();
        // Filter: juiste groep EN het is een uitgave ('UIT')
        return catNaam.includes(groepNaam.toLowerCase()) && String(t.in_uit).toUpperCase() === 'UIT';
      })
      .sort((a, b) => new Date(b.datum) - new Date(a.datum)); // Nieuwste bovenaan
  }, [transacties]);

  return (
    <div className="bg-gray-50 min-h-screen">
      <Navbar />
      
      <div className="p-4 max-w-7xl mx-auto">
        <div className="mb-8 text-center md:text-left">
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3 justify-center md:justify-start">
            
            Budgetten per leeftijdsgroep
          </h1>
          <p className="text-gray-500 mt-2">
             Beheer hier het jaarlijkse budget van je leeftijdsgroep.
          </p>
        </div>

        <AsyncData loading={loadingTx || loadingKasjes}>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 items-start">
            {LEEFTIJDSGROEPEN.map((groepNaam, index) => {
              // 1. Data voorbereiden
              const kasjeData = kasjes.find(k => k.groep === groepNaam);
              const kasjeID = kasjeData?.kasjeID;
              const budget = kasjeData ? Number(kasjeData.bedrag) : 0;
              
              const groupTransactions = getTransactionsForGroup(groepNaam);

              // 2. Bereken totaal uitgegeven (Let op: input is negatief, dus Math.abs gebruiken)
              const spent = groupTransactions.reduce((acc, curr) => acc + Math.abs(Number(curr.bedrag)), 0);
              
              return (
                <BudgetCard 
                  key={groepNaam} 
                  id={kasjeID}
                  groep={groepNaam} 
                  transactions={groupTransactions}
                  spent={spent} 
                  initialBudget={budget} 
                  mutate={mutate}
                  index={index}
                />
              );
            })}
          </div>
        </AsyncData>
      </div>
    </div>
  );
}

// --- SUBCOMPONENT: BudgetCard ---
function BudgetCard({ id, groep, spent, transactions, initialBudget, mutate, index }) {
  const { user } = useAuth();
  const cannotEditBudget = !user || (Array.isArray(user.roles) && user.roles.length === 1 && String(user.roles[0]).toUpperCase() === 'USER');
  const [isEditing, setIsEditing] = useState(false);
  const [newBudget, setNewBudget] = useState(initialBudget);
  const [isSaving, setIsSaving] = useState(false);

  // Sync state
  if (!isEditing && newBudget !== initialBudget && initialBudget !== 0) {
      setNewBudget(initialBudget);
  }

  // Berekeningen
  const percentage = initialBudget > 0 ? (spent / initialBudget) * 100 : 0;
  const remaining = initialBudget - spent; // Budget (500) - Uitgegeven (100) = 400
  const isOverBudget = remaining < 0;

  // Kleuren
  let colorClass = 'bg-blue-500';
  let textClass = 'text-blue-600';
  let chartColors = ['#3b82f6', '#e5e7eb']; // Blauw, Grijs

  if (percentage > 85 && !isOverBudget) {
    colorClass = 'bg-orange-500'; 
    textClass = 'text-orange-600'; 
    chartColors = ['#f97316', '#e5e7eb'];
  }
  if (isOverBudget) {
    colorClass = 'bg-red-500'; 
    textClass = 'text-red-600'; 
    chartColors = ['#ef4444', '#ef4444']; // Alles rood bij overschrijding
  }

  const handleSave = async () => {
    if (!id) return alert("Geen ID gevonden.");
    setIsSaving(true);
    try {
      await updateKasje(id, { bedrag: Number(newBudget) });
      await mutate('kasjes'); 
      setIsEditing(false);
    } catch (err) {
      console.error(err);
      alert('Kon budget niet opslaan');
    } finally {
      setIsSaving(false);
    }
  };

  const chartData = {
    labels: ['Uitgegeven', 'Over'],
    datasets: [{
      data: [spent, Math.max(0, remaining)],
      backgroundColor: chartColors,
      borderWidth: 0,
      cutout: '75%',
    }]
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className={`bg-white rounded-2xl shadow-sm border ${isOverBudget ? 'border-red-200' : 'border-gray-100'} overflow-hidden flex flex-col h-full`}
    >
      {/* Header: Simpel & Clean */}
      <div className={`p-4 border-b border-gray-100 ${isOverBudget ? 'bg-red-50' : 'bg-gray-50'}`}>
        <h2 className="text-xl font-bold text-gray-800 text-center">{groep}</h2>
      </div>

      <div className="p-6 flex-1 flex flex-col">
        
        {/* 1. Grafiek & Totaal */}
        <div className="flex flex-col items-center relative mb-6">
            <div className="w-36 h-36 relative z-10">
            <Doughnut 
                data={chartData} 
                options={{ plugins: { tooltip: { enabled: false }, legend: { display: false } }, maintainAspectRatio: true }} 
            />
            <div className="absolute inset-0 flex items-center justify-center flex-col">
                <span className="text-xs text-gray-400 font-medium uppercase tracking-wider">Uitgegeven</span>
                <span className={`text-xl font-black ${textClass}`}>
                  €{spent.toLocaleString('nl-BE', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                </span>
            </div>
            </div>
        </div>

        {/* 2. Budget Edit Veld */}
        <div className="w-full mb-6 border-b border-gray-100 pb-4">
          <div className="flex justify-between items-end mb-2">
            <span className="text-xs font-bold text-gray-400 uppercase">Jaarbudget</span>
            {!isEditing && !cannotEditBudget && (
               <button onClick={() => { setNewBudget(initialBudget); setIsEditing(true); }} className="text-gray-400 hover:text-blue-600 transition p-1">
                 <Edit fontSize="small" />
               </button>
            )}
          </div>

          {isEditing ? (
            <div className="flex items-center gap-2">
              <input 
                type="number" 
                value={newBudget}
                onChange={(e) => setNewBudget(e.target.value)}
                className="w-full border-2 border-blue-100 rounded-md py-1 px-2 text-sm focus:outline-none focus:border-blue-500"
                autoFocus
              />
              <button onClick={handleSave} className="text-green-600 hover:bg-green-50 p-1 rounded"><Check/></button>
              <button onClick={() => setIsEditing(false)} className="text-red-600 hover:bg-red-50 p-1 rounded"><Close/></button>
            </div>
          ) : (
             <div className="flex justify-between items-center">
                <span className="text-lg font-bold text-gray-700">€{initialBudget.toLocaleString('nl-BE')}</span>
                <span className={`text-xs font-bold ${isOverBudget ? 'text-red-500' : 'text-gray-400'}`}>
                    {remaining < 0 
                        ? `${Math.abs(remaining).toLocaleString('nl-BE')} tekort` 
                        : `${remaining.toLocaleString('nl-BE')} over`
                    }
                </span>
             </div>
          )}
        </div>

        {/* 3. Lijst met Transacties (Altijd zichtbaar) */}
        <div className="flex-1 min-h-[150px]">
             <h3 className="text-xs font-bold text-gray-400 uppercase mb-3 flex items-center gap-2">
                <ReceiptLong fontSize="small"/> Recente Uitgaven
             </h3>
             
             <div className="max-h-48 overflow-y-auto pr-1 custom-scrollbar">
                {transactions.length === 0 ? (
                    <p className="text-xs text-gray-400 italic text-center py-4">Nog geen uitgaven.</p>
                ) : (
                    <ul className="divide-y divide-gray-50">
                        {transactions.map((t) => (
                            <li key={t.transactieID} className="py-2 flex justify-between items-start text-xs">
                                <div className="pr-2">
                                    <div className="font-medium text-gray-700 truncate max-w-[120px]" title={t.beschrijving}>
                                        {t.beschrijving || 'Geen omschrijving'}
                                    </div>
                                    <div className="text-gray-400 text-[10px]">
                                        {new Date(t.datum).toLocaleDateString('nl-BE', { day: '2-digit', month: '2-digit' })}
                                    </div>
                                </div>
                                <div className="font-semibold text-red-500 whitespace-nowrap">
                                    {/* Weergave: - € 12,50 (We gebruiken Math.abs voor nette formatting met minteken ervoor) */}
                                    - € {Math.abs(Number(t.bedrag)).toLocaleString('nl-BE', { minimumFractionDigits: 2 })}
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
             </div>
        </div>

      </div>
    </motion.div>
  );
}