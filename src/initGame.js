import makeKaplayCtx from "./kaplayCtx";
import makePlayer from "./entities/Player";
import makeSection from "./components/Section";
import { PALETTE } from "./constants";
import makeSocialIcon from "./components/SocialIcon";
import makeSkillIcon from "./components/SkillIcon"; // Potrebbe non servire più se usiamo custom cards
import { makeAppear } from "./utils";
import makeWorkExperienceCard from "./components/WorkExperienceCard";
import makeEmailIcon from "./components/EmailIcon";
import makeProjectCard from "./components/ProjectCard";
import { cameraZoomValueAtom, store } from "./store";

// Funzione di utilità per mescolare l'array (Fisher-Yates shuffle)
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

export default async function initGame() {
  const generalData = await (await fetch("./configs/generalData.json")).json();
  const skillsData = await (await fetch("./configs/skillsData.json")).json();
  const socialsData = await (await fetch("./configs/socialsData.json")).json();
  const experiencesData = await (
    await fetch("./configs/experiencesData.json")
  ).json();
  const projectsData = await (
    await fetch("./configs/projectsData.json")
  ).json();

  const k = makeKaplayCtx();
  
  // ... (Tutto il tuo codice di caricamento sprite/font rimane uguale fino a qui) ...
  k.loadSprite("player", "./sprites/player.png", {
    sliceX: 4,
    sliceY: 8,
    anims: {
      "walk-down-idle": 0,
      "walk-down": { from: 0, to: 3, loop: true },
      "walk-left-down": { from: 4, to: 7, loop: true },
      "walk-left-down-idle": 4,
      "walk-left": { from: 8, to: 11, loop: true },
      "walk-left-idle": 8,
      "walk-left-up": { from: 12, to: 15, loop: true },
      "walk-left-up-idle": 12,
      "walk-up": { from: 16, to: 19, loop: true },
      "walk-up-idle": 16,
      "walk-right-up": { from: 20, to: 23, loop: true },
      "walk-right-up-idle": 20,
      "walk-right": { from: 24, to: 27, loop: true },
      "walk-right-idle": 24,
      "walk-right-down": { from: 28, to: 31, loop: true },
      "walk-right-down-idle": 28,
    },
  });
  // ... (Caricamento loghi e shader rimane uguale) ...
  k.loadFont("ibm-regular", "./fonts/IBMPlexSans-Regular.ttf");
  k.loadFont("ibm-bold", "./fonts/IBMPlexSans-Bold.ttf");
  k.loadSprite("github-logo", "./logos/github-logo.png");
  k.loadSprite("linkedin-logo", "./logos/linkedin-logo.png");
  k.loadSprite("azure-logo", "./logos/azure-logo.png");
  k.loadSprite("azuredevops-logo", "./logos/azuredevops-logo.png");
  k.loadSprite("csharp-logo", "./logos/csharp-logo.png");
  k.loadSprite("javascript-logo", "./logos/javascript-logo.png");
  k.loadSprite("typescript-logo", "./logos/typescript-logo.png");
  k.loadSprite("react-logo", "./logos/react-logo.png");
  k.loadSprite("docker-logo", "./logos/docker-logo.png");
  k.loadSprite("langchain-logo", "./logos/langchain-logo.png");
  k.loadSprite("langsmith-logo", "./logos/langsmith-logo.png");
  k.loadSprite("html-logo", "./logos/html-logo.png");
  k.loadSprite("css-logo", "./logos/css-logo.png");
  k.loadSprite("promptflow-logo", "./logos/promptflow-logo.png");
  k.loadSprite("python-logo", "./logos/python-logo.png");
  k.loadSprite("email-logo", "./logos/email-logo.png");
  k.loadShaderURL("tiledPattern", null, "./shaders/tiledPattern.frag");

  // ... (Gestione Camera e Background rimane uguale) ...
  const setInitCamZoomValue = () => {
    if (k.width() < 1000) {
      k.camScale(k.vec2(0.5));
      store.set(cameraZoomValueAtom, 0.5);
      return;
    }
    k.camScale(k.vec2(0.8));
    store.set(cameraZoomValueAtom, 0.8);
  };
  setInitCamZoomValue();

  k.onUpdate(() => {
    const cameraZoomValue = store.get(cameraZoomValueAtom);
    if (cameraZoomValue !== k.camScale().x) k.camScale(k.vec2(cameraZoomValue));
  });

  const tiledBackground = k.add([
    k.uvquad(k.width(), k.height()),
    k.shader("tiledPattern", () => ({
      u_time: k.time() / 20,
      u_color1: k.Color.fromHex(PALETTE.color3),
      u_color2: k.Color.fromHex(PALETTE.color2),
      u_speed: k.vec2(1, -1),
      u_aspect: k.width() / k.height(),
      u_size: 5,
    })),
    k.pos(0, 0),
    k.fixed(),
  ]);

  tiledBackground.onUpdate(() => {
    tiledBackground.width = k.width();
    tiledBackground.height = k.height();
    tiledBackground.uniform.u_aspect = k.width() / k.height();
  });

  // SEZIONE 1 (Header/Socials) - Rimane invariata
  makeSection(
    k,
    k.vec2(k.center().x, k.center().y - 400),
    generalData.section1Name,
    (parent) => {
      const container = parent.add([k.pos(-805, -700), k.opacity(0)]);
        // ... (contenuto header esistente) ...
        // Per brevità non ricopio tutto l'interno della sezione 1, è uguale al tuo codice originale
       container.add([
        k.text(generalData.header.title, { font: "ibm-bold", size: 88 }),
        k.color(k.Color.fromHex(PALETTE.color1)),
        k.pos(395, 0),
        k.opacity(0),
      ]);

      container.add([
        k.text(generalData.header.subtitle, {
          font: "ibm-bold",
          size: 48,
        }),
        k.color(k.Color.fromHex(PALETTE.color1)),
        k.pos(485, 100),
        k.opacity(0),
      ]);

      const socialContainer = container.add([k.pos(130, 0), k.opacity(0)]);

      for (const socialData of socialsData) {
        if (socialData.name === "Email") {
          makeEmailIcon(
            k,
            socialContainer,
            k.vec2(socialData.pos.x, socialData.pos.y),
            socialData.logoData,
            socialData.name,
            socialData.address
          );
          continue;
        }

        makeSocialIcon(
          k,
          socialContainer,
          k.vec2(socialData.pos.x, socialData.pos.y),
          socialData.logoData,
          socialData.name,
          socialData.link,
          socialData.description
        );
      }

      makeAppear(k, container);
      makeAppear(k, socialContainer);
    }
  );

// --- SEZIONE 2: SKILLS MEMORY GAME ---
makeSection(
    k,
    k.vec2(k.center().x - 400, k.center().y),
    generalData.section2Name,
    (parent) => {
      const container = parent.add([
        k.opacity(0),
        k.pos(0, 0),
      ]);

      const numPairs = 8; 
      const selectedSkills = skillsData.slice(0, numPairs);
      
      let memoryDeck = [...selectedSkills, ...selectedSkills];
      memoryDeck = shuffleArray(memoryDeck);

      let flippedCards = []; 
      let isProcessing = false; 

      const cols = 4;
      const cardSize = 100;
      const gap = 20;
      
      // Calcolo dimensioni totali griglia
      const totalWidth = cols * (cardSize + gap);
      const totalHeight = Math.ceil(memoryDeck.length / cols) * (cardSize + gap);

      const startX = -(totalWidth / 2) + cardSize / 2; 
      const startY = -200; 

      // --- FIX MOVIMENTO: Barriera invisibile ---
      // Creiamo un rettangolo fisico sotto la prima riga di carte per fermare il player
      parent.add([
        k.rect(totalWidth + 40, 20), // Largo quanto la griglia + un po' di margine
        k.area(),
        k.body({ isStatic: true }), // Il player ci sbatterà contro
        k.pos(0, startY + totalHeight - 80), // Posizionato al bordo inferiore delle carte
        k.opacity(0), // Invisibile
        k.anchor("center"),
        "wall"
      ]);
      // ------------------------------------------

      memoryDeck.forEach((skill, index) => {
        const col = index % cols;
        const row = Math.floor(index / cols);

        const x = startX + col * (cardSize + gap);
        const y = startY + row * (cardSize + gap);

        const card = container.add([
          k.rect(cardSize, cardSize, { radius: 10 }),
          k.pos(x, y),
          k.anchor("center"),
          k.area(),
          k.color(k.Color.fromHex(PALETTE.color1)),
          k.outline(4, k.Color.fromHex(PALETTE.color1)),
          "memory-card",
          {
            isFlipped: false,
            isMatched: false,
            skillName: skill.name,
          },
        ]);

        // --- FIX GRAFICO: Scala ridotta ---
        // Le immagini originali sono grandi (es. 128px o più). 
        // La carta è 100px. Impostiamo scale a 0.3 o 0.35 per stare larghi.
        card.add([
            k.sprite(skill.logoData.name), 
            k.anchor("center"),
            k.scale(0.35), // <--- MODIFICATO: Era 0.5, ora 0.35 per farle stare dentro
        ]);
        // ----------------------------------

        const cardBack = card.add([
          k.rect(cardSize, cardSize, { radius: 10 }),
          k.anchor("center"),
          k.color(k.Color.fromHex(PALETTE.color2)),
          k.outline(2, k.Color.fromHex(PALETTE.color3)),
        ]);
        
        cardBack.add([
            k.text("?", { font: "ibm-bold", size: 40 }),
            k.anchor("center"),
            k.color(k.Color.fromHex(PALETTE.color3))
        ]);

        card.onClick(async () => {
          if (isProcessing || card.isFlipped || card.isMatched) return;

          // Controlliamo la distanza del player per permettere il click solo se vicino
          const player = k.get("player")[0];
          if (player) {
             const dist = player.pos.dist(parent.pos.add(card.pos));
             if (dist > 400) return; // Se sei troppo lontano non clicca
          }

          card.isFlipped = true;
          cardBack.opacity = 0;
          
          flippedCards.push({ card, cardBack });

          if (flippedCards.length === 2) {
            isProcessing = true;
            const [first, second] = flippedCards;

            if (first.card.skillName === second.card.skillName) {
              first.card.isMatched = true;
              second.card.isMatched = true;
              
              first.card.use(k.scale(1.1));
              second.card.use(k.scale(1.1));
              await k.wait(0.2);
              first.card.use(k.scale(1));
              second.card.use(k.scale(1));

              flippedCards = [];
              isProcessing = false;
            } else {
              await k.wait(1);
              
              first.cardBack.opacity = 1;
              second.cardBack.opacity = 1;
              first.card.isFlipped = false;
              second.card.isFlipped = false;

              flippedCards = [];
              isProcessing = false;
            }
          }
        });
      });

      makeAppear(k, container);
    }
  );

  // ... (Il resto delle sezioni e makePlayer rimane uguale) ...
  makeSection(
    k,
    k.vec2(k.center().x + 400, k.center().y),
    generalData.section3Name,
    (parent) => {
      const container = parent.add([k.opacity(0), k.pos(0)]);
      for (const experienceData of experiencesData) {
        makeWorkExperienceCard(
          k,
          container,
          k.vec2(experienceData.pos.x, experienceData.pos.y),
          experienceData.cardHeight,
          experienceData.roleData
        );
      }
      makeAppear(k, container);
    }
  );
  
  makeSection(
    k,
    k.vec2(k.center().x, k.center().y + 400),
    generalData.section4Name,
    (parent) => {
      const container = parent.add([k.opacity(0), k.pos(0, 0)]);
      for (const project of projectsData) {
        makeProjectCard(
          k,
          container,
          k.vec2(project.pos.x, project.pos.y),
          project.data,
          project.thumbnail
        );
      }
      makeAppear(k, container);
    }
  );

  makePlayer(k, k.vec2(k.center()), 700);
}