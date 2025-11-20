import { Link } from 'react-router'; 
import AlgemeneLayout from "../components/AlgemeneLayout";
import WelcomeMessage from "../components/WelcomeMessage";
import ActionButton from "../components/ActionButton";
import kidsPlaying from "../assets/PlayingKids.jpg";
import { useAuth } from '../contexts/auth';

// --- FRAMER MOTION IMPORTS ---
import { motion } from 'framer-motion';

// --- ANIMATIE VARIANTEN ---
const containerVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.1,
      duration: 0.5
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: "spring", stiffness: 60, damping: 12 }
  }
};

const buttonHoverVariants = {
  hover: { scale: 1.05 },
  tap: { scale: 0.95 }
};

export default function HomePage() {
  const { user } = useAuth();
  const username = user ? `${user.voornaam}` : 'Gebruiker';
  const isAdmin = user?.roles?.includes('admin');

  const handleClick = (section) => {
    console.log(`Navigating to: ${section}`);
  };

  return (
    <AlgemeneLayout image={kidsPlaying}>
      {/* Centrerende container voor de pagina */}
      <div className="flex items-center justify-center w-full h-full min-h-[60vh]"> 
        
        <motion.div 
          // 👇 HIER ZIT DE FIX:
          // - items-center: Zet de knoppen in het midden
          // - text-center: Zet de tekst in het midden
          // - mx-auto: Centreert de div zelf
          className="flex flex-col gap-6 items-center justify-center bg-white/90 backdrop-blur-sm p-8 rounded-2xl shadow-xl w-full max-w-md mx-auto text-center"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* 1. Welkomstbericht */}
          <motion.div variants={itemVariants} className="w-full">
            <WelcomeMessage username={username} />
          </motion.div>

          {/* 2. Knop: Transacties */}
          <motion.div 
            variants={itemVariants}
            className="w-full flex justify-center"
          >
            <Link to='/transactions' className="w-full">
              <motion.div variants={buttonHoverVariants} whileHover="hover" whileTap="tap">
                <ActionButton label="Transacties weergeven" />
              </motion.div>
            </Link>
          </motion.div>
          
          {/* 3. Knop: Categorieoverzicht */}
          <motion.div 
            variants={itemVariants}
            className="w-full flex justify-center"
          >
            <Link to='/categories' className="w-full"> 
              <motion.div variants={buttonHoverVariants} whileHover="hover" whileTap="tap">
                <ActionButton 
                  label="Categorieoverzicht" 
                  onClick={() => handleClick("categorieoverzicht")} 
                />
              </motion.div>
            </Link>
          </motion.div>

          {/* 4. Knop: Admin */}
          {isAdmin && (
            <motion.div 
              variants={itemVariants}
              className="w-full flex justify-center"
            >
              <Link to='/register' className="w-full">
                <motion.div variants={buttonHoverVariants} whileHover="hover" whileTap="tap">
                  <ActionButton 
                    label="Gebruiker toevoegen" 
                    onClick={() => handleClick("gebruiker")} 
                  />
                </motion.div>
              </Link>
            </motion.div>
          )}
          
        </motion.div>
      </div>
    </AlgemeneLayout>
  );
}