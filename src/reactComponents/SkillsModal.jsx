import { useState, useEffect } from "react";
import { useAtom, useAtomValue } from "jotai";
import { 
  isSkillsModalVisibleAtom, 
  skillsDataAtom, 
  sfxVolumeAtom,
  themeAtom
} from "../store";

// Helper function to shuffle array (Fisher-Yates)
const shuffleArray = (array) => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

export default function SkillsModal() {
  const [isVisible, setIsVisible] = useAtom(isSkillsModalVisibleAtom);
  const skillsData = useAtomValue(skillsDataAtom);
  const sfxVolume = useAtomValue(sfxVolumeAtom);
  const theme = useAtomValue(themeAtom);

  const [cards, setCards] = useState([]);
  const [flippedIndices, setFlippedIndices] = useState([]);
  const [matchedNames, setMatchedNames] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);

  // --- AUDIO HELPER ---
  const playAudio = (key) => {
    try {
      // 1. Search in loaded theme
      // 2. If not found, smart fallback on key name (e.g. "flip.mp3")
      const filename = theme?.audio?.sfx?.[key] || `${key}.mp3`;
      
      const audio = new Audio(`./audio/${filename}`);
      audio.volume = sfxVolume; 
      audio.play().catch(e => console.warn("Audio play blocked", e));
    } catch (e) {
      console.error("Audio error", e);
    }
  };

  // Initialize game when modal opens
  useEffect(() => {
    if (isVisible && skillsData.length > 0) {
      const deck = [...skillsData, ...skillsData].map((item, index) => ({
        ...item,
        uniqueId: index, 
      }));
      setCards(shuffleArray(deck));
      setFlippedIndices([]);
      setMatchedNames([]);
      setIsProcessing(false);
    }
  }, [isVisible, skillsData]);

  // Handle Card Click
  const handleCardClick = (index) => {
    if (
      isProcessing ||
      flippedIndices.includes(index) ||
      matchedNames.includes(cards[index].name)
    ) {
      return;
    }

    playAudio("flip"); // Reads from JSON

    const newFlipped = [...flippedIndices, index];
    setFlippedIndices(newFlipped);

    if (newFlipped.length === 2) {
      setIsProcessing(true);
      const index1 = newFlipped[0];
      const index2 = newFlipped[1];

      if (cards[index1].name === cards[index2].name) {
        // MATCH!
        setTimeout(() => {
          playAudio("match");
          
          setMatchedNames((prev) => [...prev, cards[index1].name]);
          setFlippedIndices([]);
          setIsProcessing(false);
        }, 500);
      } else {
        // NO MATCH
        setTimeout(() => {
          setFlippedIndices([]);
          setIsProcessing(false);
        }, 1000);
      }
    }
  };

  if (!isVisible) return null;

  return (
    <div className="modal">
      <div className="modal-content skills-modal">
        {/* Header */}
        <div className="skills-header">
            <h1>Solve the memory game to discover my skills</h1>
            <button 
                className="close-btn" 
                onClick={() => setIsVisible(false)}
            >X</button>
        </div>

        {/* Game Grid */}
        <div className="memory-grid">
          {cards.map((card, index) => {
            const isFlipped = flippedIndices.includes(index);
            const isMatched = matchedNames.includes(card.name);
            
            // Build image path
            const imgSrc = `./logos/${card.logoData.name}.png`; 

            return (
              <div
                key={card.uniqueId}
                className={`memory-card ${isFlipped || isMatched ? "flipped" : ""}`}
                onClick={() => handleCardClick(index)}
              >
                <div className="card-inner">
                  {/* FRONT (Cover) */}
                  <div className="card-front">
                    <span>{"</>"}</span>
                  </div>
                  {/* BACK (Skill Image) */}
                  <div className="card-back">
                    <img src={imgSrc} alt={card.name} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}