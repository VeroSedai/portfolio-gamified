import { opacityTrickleDown } from "../utils";

export default function makeWorkExperienceCard(
  k,
  parent,
  posVec2,
  height,
  roleData
) {
  // 1. IL CONTENITORE (Card)
  const card = parent.add([
    k.rect(800, height, { radius: 8 }),
    k.area(),
    // Bordo NEON CIANO
    k.outline(4, k.Color.fromHex("#2de2e6")), 
    k.pos(posVec2),
    // Sfondo SCURO (Blu notte profondo)
    k.color(k.Color.fromHex("#0b0c15")), 
    k.opacity(0),
    k.offscreen({ hide: true, distance: 300 }),
  ]);

  // 2. IL TITOLO DEL RUOLO
  const title = card.add([
    k.text(roleData.title, { font: "ibm-bold", size: 32 }),
    // Colore NEON CIANO (Matcha con il bordo)
    k.color(k.Color.fromHex("#2de2e6")), 
    k.pos(20, 20),
    k.opacity(0),
  ]);

  // 3. LA STORIA (Azienda e Date)
  const history = card.add([
    k.text(
      `${roleData.company.name} -- ${roleData.company.startDate}-${roleData.company.endDate}`,
      {
        font: "ibm-regular",
        size: 20,
      }
    ),
    // Colore GRIGIO CHIARO (Distinzione visiva dal titolo)
    k.color(k.Color.fromHex("#aaaaaa")), 
    k.pos(20, 60),
    k.opacity(0),
  ]);

  // 4. LA DESCRIZIONE (Elenco puntato)
  const description = card.add([
    k.text(roleData.description, { 
        font: "ibm-regular", 
        size: 22, // Ridotto leggermente per eleganza (era 25)
        width: 750 
    }),
    // Colore BIANCO PURO (Massima leggibilità su scuro)
    k.color(k.Color.fromHex("#ffffff")), 
    k.pos(20, 110),
    k.opacity(0),
  ]);

  opacityTrickleDown(parent, [title, history, description]);

  return card;
}