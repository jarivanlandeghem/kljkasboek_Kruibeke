
import AlgemeneLayout from "../components/AlgemeneLayout";
import WelcomeMessage from "../components/WelcomeMessage";
import ActionButton from "../components/ActionButton";
import kidsPlaying from "../assets/PlayingKids.jpg";

export default function HomePage() {
  // 🟢 PROPS — vaste data die we doorgeven
  const username = "Aykon";

  const handleClick = (section) => {
    console.log(`Navigating to: ${section}`);
  };

  return (
    <AlgemeneLayout image={kidsPlaying}>
      <div className="flex flex-col gap-4 items-center">
        <WelcomeMessage username={username} />

        <ActionButton 
          label="Transactie toevoegen" 
          onClick={() => handleClick("transactie")} 
        />
        <ActionButton 
          label="Categorieoverzicht" 
          onClick={() => handleClick("categorieoverzicht")} 
        />
        <ActionButton 
          label="Gebruiker toevoegen" 
          onClick={() => handleClick("gebruiker")} 
        />
      </div>
    </AlgemeneLayout>
  );
}
