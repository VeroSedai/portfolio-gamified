import makeKaplayCtx from "./kaplayCtx";
import makePlayer from "./entities/Player";
import makeSection from "./components/Section";
import { PALETTE } from "./constants";
import makeSocialIcon from "./components/SocialIcon";
import makeSkillIcon from "./components/SkillIcon";
import { makeAppear } from "./utils";
import makeWorkExperienceCard from "./components/WorkExperienceCard";
import makeEmailIcon from "./components/EmailIcon";
import makeProjectCard from "./components/ProjectCard";
import {
  musicVolumeAtom,
  sfxVolumeAtom,
  cameraZoomValueAtom,
  store,
} from "./store";

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

  // --- CARICAMENTO ASSETS ---
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

  k.loadFont("ibm-regular", "./fonts/IBMPlexSans-Regular.ttf");
  k.loadFont("ibm-bold", "./fonts/IBMPlexSans-Bold.ttf");
  
  // Caricamento Loghi
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
  k.loadSprite("netcore-logo", "./logos/netcore-logo.png");
  k.loadSprite("TarnishedMindMap", "./projects/TarnishedMindMap.png");
  
  // Caricamento Shader
  k.loadShaderURL("tiledPattern", null, "./shaders/tiledPattern.frag");

  // Music & SFX
  k.loadSound("bgm", "./audio/background-music.mp3");
  k.loadSound("flip", "./audio/flip.mp3");
  k.loadSound("match", "./audio/match.mp3");

  let bgm = null;
  let musicStarted = false;

  function startBGM() {
    if (!musicStarted) {
      bgm = k.play("bgm", {
        loop: true,
        volume: store.get(musicVolumeAtom),
      });
      musicStarted = true;
    }
  }

  k.onKeyPress(startBGM);
  k.onMousePress(startBGM);

  k.onUpdate(() => {
    if (bgm) bgm.volume = store.get(musicVolumeAtom);
  });

  // Camera settings
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

  // --- BACKGROUND SHADER (CYBERPUNK STYLE) ---
  const tiledBackground = k.add([
    k.uvquad(k.width(), k.height()),
    k.shader("tiledPattern", () => ({
      u_time: k.time() / 15,
      // COLORI HARDCODED PER STILE DARK/NEON (Ignoriamo PALETTE qui per sicurezza)
      u_color1: k.Color.fromHex("#0b0c15"), // Sfondo: Blu Notte Profondo
      u_color2: k.Color.fromHex("#2de2e6"), // Griglia: Ciano Neon
      u_speed: k.vec2(0.3, -0.3),           // Movimento lento
      u_aspect: k.width() / k.height(),
      u_size: 10,                           // Griglia più fitta (tech look)
    })),
    k.pos(0, 0),
    k.fixed(),
  ]);

  tiledBackground.onUpdate(() => {
    tiledBackground.width = k.width();
    tiledBackground.height = k.height();
    tiledBackground.uniform.u_aspect = k.width() / k.height();
  });


  // --- SEZIONE 1 (Header/Socials) ---
  makeSection(
    k,
    k.vec2(k.center().x, k.center().y - 400),
    generalData.section1Name,
    (parent) => {
      const container = parent.add([k.pos(-805, -700), k.opacity(0)]);
      container.add([
        k.text(generalData.header.title, { font: "ibm-bold", size: 40 }),
        // Forziamo il bianco/neon per contrasto su sfondo scuro
        k.color(k.Color.fromHex("#ffffff")), 
        k.pos(395, 0),
        k.opacity(0),
      ]);

      container.add([
        k.text(generalData.header.subtitle, {
          font: "ibm-bold",
          size: 20,
        }),
        k.color(k.Color.fromHex("#2de2e6")), // Sottotitolo Neon
        k.pos(400, 50),
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

  // --- SEZIONE 2: SKILLS MEMORY GAME (STILE TECH) ---
  makeSection(
    k,
    k.vec2(k.center().x - 400, k.center().y),
    generalData.section2Name,
    (parent) => {
      const fadeContainer = parent.add([k.opacity(0), k.pos(0, 0)]);

      const numPairs = 12;
      const selectedSkills = skillsData.slice(0, numPairs);
      let memoryDeck = shuffleArray([...selectedSkills, ...selectedSkills]);
      let flippedCards = [];
      let isProcessing = false;

      const cols = 4;
      const cardSize = 100;
      const gap = 20;
      
      const totalWidth = cols * (cardSize + gap);
      const totalHeight = Math.ceil(memoryDeck.length / cols) * (cardSize + gap);

      // --- TABELLONE PRINCIPALE (Stile Terminale) ---
      const consoleBoard = fadeContainer.add([
        k.rect(totalWidth + 40, totalHeight + 40, { radius: 8 }),
        k.pos(-300, 0), 
        k.anchor("center"),
        k.color(k.Color.fromHex("#0b0c15")), // Sfondo console scuro
        k.outline(4, k.Color.fromHex("#2de2e6")), // Outline Neon
        k.area(),                  
        k.body({ isStatic: true }),
        "game-area" 
      ]);

      consoleBoard.add([
        k.text("Skills_Memory_Game", { font: "ibm-bold", size: 32 }),
        k.anchor("center"),
        k.pos(0, -totalHeight / 2 - 40),
        k.color(k.Color.fromHex("#ffffff")), // Titolo Bianco
      ]);

      const startX = -(totalWidth / 2) + cardSize / 2;
      const startY = -(totalHeight / 2) + cardSize / 2;

      memoryDeck.forEach((skill, index) => {
        const col = index % cols;
        const row = Math.floor(index / cols);

        const x = startX + col * (cardSize + gap);
        const y = startY + row * (cardSize + gap);

        const card = consoleBoard.add([
          k.rect(cardSize, cardSize, { radius: 6 }),
          k.pos(x, y),
          k.anchor("center"),
          k.area(),
          k.color(k.Color.fromHex("#1a1b26")), // Sfondo carta scoperta (grigio scuro)
          k.outline(2, k.Color.fromHex("#2de2e6")), // Outline sottile neon
          "memory-card",
          {
            isFlipped: false,
            isMatched: false,
            skillName: skill.name,
          },
        ]);

        card.add([
          k.sprite(skill.logoData.name),
          k.anchor("center"),
          k.scale(0.35),
        ]);

        // --- RETRO DELLA CARTA (Stile Code/Hacker) ---
        const cardBack = card.add([
          k.rect(cardSize, cardSize, { radius: 6 }),
          k.anchor("center"),
          k.color(k.Color.fromHex("#11111b")), // Molto scuro
          k.outline(2, k.Color.fromHex("#2de2e6")), // Outline Neon
        ]);

        cardBack.add([
          // Simbolo codice invece del punto interrogativo
          k.text("</>", { font: "ibm-bold", size: 28 }),
          k.anchor("center"),
          k.color(k.Color.fromHex("#2de2e6")),
          k.opacity(0.6), // Leggermente trasparente
        ]);

        card.onClick(async () => {
          if (isProcessing || card.isFlipped || card.isMatched) return;

          const boardPos = parent.pos.add(consoleBoard.pos); 
          const player = k.get("player")[0];
          
          if (player) {
             const dist = player.pos.dist(boardPos);
             if (dist > 600) return; 
          }

          k.play("flip", { volume: store.get(sfxVolumeAtom) || 0.5 });

          card.isFlipped = true;
          cardBack.opacity = 0;
          flippedCards.push({ card, cardBack });

          if (flippedCards.length === 2) {
            isProcessing = true;
            const [first, second] = flippedCards;

            if (first.card.skillName === second.card.skillName) {
              // --- MATCH ---
              k.play("match", { volume: store.get(sfxVolumeAtom) || 0.5 });
              first.card.isMatched = true;
              second.card.isMatched = true;

              first.cardBack.destroy();
              second.cardBack.destroy();
              
              first.card.use(k.scale(1.1));
              second.card.use(k.scale(1.1));
              await k.wait(0.2);
              first.card.use(k.scale(1));
              second.card.use(k.scale(1));

              flippedCards = [];
              isProcessing = false;
            } else {
              // --- NO MATCH ---
              await k.wait(1);
              if (first.cardBack) first.cardBack.opacity = 1;
              if (second.cardBack) second.cardBack.opacity = 1;
              
              first.card.isFlipped = false;
              second.card.isFlipped = false;

              flippedCards = [];
              isProcessing = false;
            }
          }
        });
      });

      makeAppear(k, fadeContainer);
    }
  );

  // --- SEZIONE 3 (Work Experience) ---
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

  // --- SEZIONE 4 (Projects) ---
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