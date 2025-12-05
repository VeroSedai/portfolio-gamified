import { useState, useEffect } from "react";
import { useAtom, useAtomValue } from "jotai";
import { isSkillsModalVisibleAtom, skillsDataAtom } from "../store";

// Funzione per mescolare (Fisher-Yates)
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

  const [cards, setCards] = useState([]);
  const [flippedIndices, setFlippedIndices] = useState([]);
  const [matchedNames, setMatchedNames] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);

  // Inizializza il gioco quando il modale si apre
  useEffect(() => {
    if (isVisible && skillsData.length > 0) {
      // 1. Prendi i dati, duplicali e aggiungi ID unico
      const deck = [...skillsData, ...skillsData].map((item, index) => ({
        ...item,
        uniqueId: index, // ID univoco per React Key
      }));
      // 2. Mescola e setta
      setCards(shuffleArray(deck));
      setFlippedIndices([]);
      setMatchedNames([]);
      setIsProcessing(false);
    }
  }, [isVisible, skillsData]);

  // Gestione Click Carta
  const handleCardClick = (index) => {
    // Blocca se: sta processando, carta già girata, carta già indovinata
    if (
      isProcessing ||
      flippedIndices.includes(index) ||
      matchedNames.includes(cards[index].name)
    ) {
      return;
    }

    const newFlipped = [...flippedIndices, index];
    setFlippedIndices(newFlipped);

    // Se ne abbiamo girate 2, controlliamo il match
    if (newFlipped.length === 2) {
      setIsProcessing(true);
      const index1 = newFlipped[0];
      const index2 = newFlipped[1];

      if (cards[index1].name === cards[index2].name) {
        // MATCH!
        setTimeout(() => {
          setMatchedNames((prev) => [...prev, cards[index1].name]);
          setFlippedIndices([]);
          setIsProcessing(false);
        }, 500);
      } else {
        // NO MATCH -> Gira di nuovo dopo 1 secondo
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
        {/* Intestazione */}
        <div className="skills-header">
            <h1>Solve the memory game to discover my skills</h1>
            <button 
                className="close-btn" 
                onClick={() => setIsVisible(false)}
            >X</button>
        </div>

        {/* Griglia di Gioco */}
        <div className="memory-grid">
          {cards.map((card, index) => {
            const isFlipped = flippedIndices.includes(index);
            const isMatched = matchedNames.includes(card.name);
            
            // Costruiamo il percorso immagine (assumendo siano in /logos/)
            // Se le immagini sono base64 nel JSON, usa card.logoData direttamente
            const imgSrc = `./logos/${card.logoData.name}.png`; 

            return (
              <div
                key={card.uniqueId}
                className={`memory-card ${isFlipped || isMatched ? "flipped" : ""}`}
                onClick={() => handleCardClick(index)}
              >
                <div className="card-inner">
                  {/* FRONTE (Coperta) */}
                  <div className="card-front">
                    <span>{"</>"}</span>
                  </div>
                  {/* RETRO (Immagine Skill) */}
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