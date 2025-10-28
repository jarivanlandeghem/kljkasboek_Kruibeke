
import { Link } from 'react-router';
import AlgemeneLayout from "../components/AlgemeneLayout";
import WelcomeMessage from "../components/WelcomeMessage";
import ActionButton from "../components/ActionButton";
import kidsPlaying from "../assets/PlayingKids.jpg";

export default function HomePage() {
  const username = "Aykon"; //later dit uit db halen adhv bepaalde user

  const handleClick = (section) => {
    console.log(`Navigating to: ${section}`);
  };

  return (
    <AlgemeneLayout image={kidsPlaying}>
      <div className="flex flex-col gap-4 items-center page-bg-white">
        <WelcomeMessage username={username} />

        <Link to='transactions'>
          <ActionButton 
            label="Transacties weergeven" 
          />
        </Link>
        <Link to='/categories'>  
          <ActionButton 
            label="Categorieoverzicht" 
            onClick={() => handleClick("categorieoverzicht")} 
          />
        </Link>
        <Link to='adduser'>
          <ActionButton 
            label="Gebruiker toevoegen" 
            onClick={() => handleClick("gebruiker")} 
          />
        </Link>
      </div>
    </AlgemeneLayout>
  );
}
