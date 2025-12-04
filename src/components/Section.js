import { PALETTE } from "../constants";

export default function makeSection(k, posVec2, sectionName, onCollide = null) {
  
  // 1. Scegliamo un'icona e un colore in base al nome della sezione
  let iconSymbol = "●"; // Default
  let neonColor = "#2de2e6"; // Ciano Default

  if (sectionName.toLowerCase().includes("skills")) {
    iconSymbol = "</>";
    neonColor = "#ff0055"; // Rosso/Magenta per le Skills (o usa #2de2e6 se vuoi tutto uguale)
  } else if (sectionName.toLowerCase().includes("experience")) {
    iconSymbol = "💼"; // Valigetta
    neonColor = "#2de2e6"; 
  } else if (sectionName.toLowerCase().includes("projects")) {
    iconSymbol = "🚀"; // Razzo
    neonColor = "#f9f871"; // Giallo Neon
  } else if (sectionName.toLowerCase().includes("about")) {
    iconSymbol = "☺"; // Faccina
    neonColor = "#bd93f9"; // Viola
  }

  // 2. Creiamo il CONTENITORE (Il Portale Olografico)
  const section = k.add([
    k.rect(160, 160, { radius: 16 }), // Quadrato smussato
    k.anchor("center"),
    k.area(),
    k.pos(posVec2),
    
    // SFONDO: Scuro e semitrasparente (Effetto vetro)
    k.color(k.Color.fromHex("#0b0c15")), 
    k.opacity(0.8),
    
    // BORDO: Neon colorato
    k.outline(4, k.Color.fromHex(neonColor)),
    
    // Tag per identificarlo
    sectionName,
    "portal_button"
  ]);

  // 3. Aggiungiamo l'ICONA GIGANTE al centro (Effetto Watermark)
  section.add([
    k.text(iconSymbol, { font: "ibm-bold", size: 80 }),
    k.anchor("center"),
    k.color(k.Color.fromHex(neonColor)),
    k.opacity(0.25), // Molto trasparente per non disturbare
    k.pos(0, -10),
  ]);

  // 4. Aggiungiamo l'ETICHETTA (Il nome della sezione)
  section.add([
    k.text(sectionName, { font: "ibm-bold", size: 24 }), // Testo più piccolo e pulito
    k.color(k.Color.fromHex("#ffffff")), // Bianco per leggibilità
    k.anchor("center"),
    k.pos(0, 110), // Posizionato SOTTO il box, non dentro o sopra lontano
  ]);

  // 5. ANIMAZIONI (Respiro e Hover)
  
  // Animazione "Respiro" costante (Idle)
  section.onUpdate(() => {
    const t = k.time() * 3;
    // Fa pulsare leggermente l'opacità del bordo/sfondo
    section.opacity = 0.8 + Math.sin(t) * 0.1; 
  });

  // Interazione Mouse: Si ingrandisce quando ci passi sopra
  section.onHover(() => {
    k.setCursor("pointer");
    section.use(k.scale(1.1)); // Zoom in
    section.color = k.Color.fromHex(neonColor); // Si "accende" lo sfondo
    section.opacity = 0.2; // Ma resta trasparente
  });

  section.onHoverEnd(() => {
    k.setCursor("default");
    section.use(k.scale(1)); // Zoom out
    section.color = k.Color.fromHex("#0b0c15"); // Torna scuro
    section.opacity = 0.8;
  });

  // 6. LOGICA DI COLLISIONE (Rimasta uguale all'originale)
  if (onCollide) {
    const onCollideHandler = section.onCollide("player", () => {
      onCollide(section);
      // Nota: Rimuovere cancel() se vuoi poter riaprire la sezione più volte tornando indietro
      onCollideHandler.cancel(); 
    });
  }

  return section;
}