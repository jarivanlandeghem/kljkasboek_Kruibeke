import { Link } from 'react-router'; 
import AlgemeneLayout from "../components/AlgemeneLayout";
import WelcomeMessage from "../components/WelcomeMessage";
import kidsPlaying from "../assets/PlayingKids.jpg";
import { useAuth } from '../contexts/auth';

// --- MUI ICON IMPORTS ---
// We importeren iconen die passen bij de acties
import { 
  ReceiptLong,      // Transacties
  Category,         // Categorieën
  Savings,          // Kasjes
  Group,            // Leiding
  EventAvailable,   // Aanwezigheden
  DirectionsWalk,   // Ronde
  PersonAdd,        // Admin add user
  AdminPanelSettings // Admin algemeen icon
} from '@mui/icons-material';

// --- FRAMER MOTION IMPORTS ---
import { motion } from 'framer-motion';

// --- ANIMATIE VARIANTEN (Ongewijzigd) ---
const containerVariants = {
  hidden: { opacity: 0, scale: 0.98 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 }
  }
};

const itemVariants = {
  hidden: { y: 30, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: "spring", stiffness: 80, damping: 15 }
  }
};

const blockHoverVariants = {
  hover: { scale: 1.03, y: -5, boxShadow: "0px 10px 20px rgba(0,0,0,0.1)" },
  tap: { scale: 0.98, y: 0 }
};


// --- NIEUW SUBCOMPONENT: DASHBOARD BLOCK ---
// Dit vervangt de ActionButton voor de homepage.
// Het is een groter, vierkanter blok met een icoon boven de tekst.
function DashboardBlock({ icon: Icon, label, theme = 'blue' }) {
  // Kleurthema's definiëren voor subtiele variatie
  const themes = {
    blue:  "bg-blue-50 text-blue-700 border-blue-100 hover:border-blue-300",
    green: "bg-emerald-50 text-emerald-700 border-emerald-100 hover:border-emerald-300",
    purple:"bg-violet-50 text-violet-700 border-violet-100 hover:border-violet-300",
  };
  const themeClass = themes[theme] || themes.blue;

  return (
    <div className={`flex flex-col items-center justify-center p-6 h-full w-full rounded-2xl border-2 transition-all ${themeClass}`}>
      {/* Het Icoon: Groot weergegeven */}
      <Icon sx={{ fontSize: 48 }} className="mb-3 opacity-90" />
      {/* Het Label: Dikgedrukt eronder */}
      <span className="text-lg font-bold text-gray-800">{label}</span>
    </div>
  );
}


// --- MAIN COMPONENT ---
export default function HomePage() {
  const { user } = useAuth();
  const username = user ? `${user.voornaam}` : 'Gebruiker';
  const isAdmin = user?.roles?.includes('admin');

  return (
    <AlgemeneLayout image={kidsPlaying}>
      <div className="flex items-center justify-center w-full h-full min-h-[70vh] p-4 md:p-8"> 
        
        <motion.div 
          // Container iets breder en transparanter voor een moderne look
          className="flex flex-col gap-8 items-center bg-white/80 backdrop-blur-md p-8 sm:p-10 rounded-3xl shadow-2xl w-full max-w-4xl mx-auto"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* 1. Welkomstbericht */}
          <motion.div variants={itemVariants} className="w-full text-center">
            <WelcomeMessage username={username} />
            <p className="text-gray-600 mt-2 text-lg">Wat wil je vandaag doen?</p>
          </motion.div>

          {/* 2. HET DASHBOARD GRID */}
          {/* We gebruiken grid-cols-2 op mobiel en grid-cols-3 op grotere schermen voor een echte 'blokken' look */}
          <div className="w-full grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
            
            {/* --- BLOK: FINANCIËN (Blauw thema) --- */}
            <motion.div variants={itemVariants}>
              <Link to='/transactions' className="block h-full">
                <motion.div variants={blockHoverVariants} whileHover="hover" whileTap="tap" className="h-full">
                  <DashboardBlock icon={ReceiptLong} label="Transacties" theme="blue" />
                </motion.div>
              </Link>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Link to='/categories' className="block h-full"> 
                <motion.div variants={blockHoverVariants} whileHover="hover" whileTap="tap" className="h-full">
                  <DashboardBlock icon={Category} label="Categorieën" theme="blue" />
                </motion.div>
              </Link>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Link to='/kasjes' className="block h-full"> 
                <motion.div variants={blockHoverVariants} whileHover="hover" whileTap="tap" className="h-full">
                  <DashboardBlock icon={Savings} label="Budgetten" theme="blue" />
                </motion.div>
              </Link>
            </motion.div>

            {/* --- BLOK: ORGANISATIE (Groen thema) --- */}
            <motion.div variants={itemVariants}>
              <Link to='/leiding' className="block h-full">
                <motion.div variants={blockHoverVariants} whileHover="hover" whileTap="tap" className="h-full">
                  <DashboardBlock icon={Group} label="Leiding Lijst" theme="green" />
                </motion.div>
              </Link>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Link to='/aanwezigheden' className="block h-full">
                <motion.div variants={blockHoverVariants} whileHover="hover" whileTap="tap" className="h-full">
                  <DashboardBlock icon={EventAvailable} label="Aanwezigheden" theme="green" />
                </motion.div>
              </Link>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Link to='/ronde' className="block h-full">
                <motion.div variants={blockHoverVariants} whileHover="hover" whileTap="tap" className="h-full">
                  <DashboardBlock icon={DirectionsWalk} label="Ronde Maken" theme="green" />
                </motion.div>
              </Link>
            </motion.div>

          </div>

           {/* --- ADMIN SECTIE (Paars thema) --- */}
           {/* Deze staat apart onder het grid */}
           {isAdmin && (
              <motion.div 
                variants={itemVariants}
                className="w-full md:w-2/3 mt-4 pt-6 border-t border-gray-200/50 flex flex-col items-center"
              >
                 <div className="flex items-center gap-2 text-violet-700 mb-4 font-semibold">
                    <AdminPanelSettings /> Admin Acties
                 </div>
                <Link to='/register' className="w-full block h-24">
                  <motion.div variants={blockHoverVariants} whileHover="hover" whileTap="tap" className="h-full">
                    {/* Een iets breder, minder hoog blok voor admin */}
                     <div className={`flex items-center justify-center gap-4 p-4 h-full w-full rounded-2xl border-2 transition-all bg-violet-50 text-violet-700 border-violet-100 hover:border-violet-300`}>
                      <PersonAdd sx={{ fontSize: 36 }} className="opacity-90" />
                      <span className="text-lg font-bold text-gray-800">Nieuwe Gebruiker Toevoegen</span>
                    </div>
                  </motion.div>
                </Link>
              </motion.div>
            )}
          
        </motion.div>
      </div>
    </AlgemeneLayout>
  );
}