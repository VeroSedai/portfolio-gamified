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
  isSkillsModalVisibleAtom,
  skillsDataAtom,
} from "./store";

// --- FUNZIONE PER CREARE I PORTALI OLOGRAFICI ---
function makeHoloSection(k, posVec2, sectionName, contentCallback) {
  let iconSymbol = "●";
  let neonColor = "#2de2e6"; // Ciano Default

  const nameLower = sectionName.toLowerCase();
  if (nameLower.includes("skills")) {
    iconSymbol = "</>";
    neonColor = "#ff0055"; // Rosso/Magenta
  } else if (nameLower.includes("experience")) {
    iconSymbol = "💼"; // Valigetta
    neonColor = "#2de2e6"; // Ciano
  } else if (nameLower.includes("projects")) {
    iconSymbol = "🚀"; // Razzo
    neonColor = "#f9f871"; // Giallo
  } else if (nameLower.includes("about")) {
    iconSymbol = "☺"; // Faccina
    neonColor = "#bd93f9"; // Viola
  }

  // 1. Creazione del Portale (Quadrato)
  const section = k.add([
    k.rect(160, 160, { radius: 16 }),
    k.anchor("center"),
    k.area(),
    k.pos(posVec2),
    k.color(k.Color.fromHex("#0b0c15")), // Sfondo Scuro
    k.opacity(0.8),
    k.outline(4, k.Color.fromHex(neonColor)), // Bordo Neon
    sectionName,
    "portal_button"
  ]);

  // 2. Icona gigante sullo sfondo (Watermark)
  section.add([
    k.text(iconSymbol, { font: "ibm-bold", size: 80 }),
    k.anchor("center"),
    k.color(k.Color.fromHex(neonColor)),
    k.opacity(0.25),
    k.pos(0, -10),
  ]);

  // 3. Etichetta Testo (sotto il box)
  section.add([
    k.text(sectionName, { font: "ibm-bold", size: 24 }),
    k.color(k.Color.fromHex("#ffffff")),
    k.anchor("center"),
    k.pos(0, 110),
  ]);

  // 4. Animazione Respiro
  section.onUpdate(() => {
    const t = k.time() * 3;
    section.opacity = 0.8 + Math.sin(t) * 0.1;
  });

  // 5. Animazione Hover Mouse
  section.onHover(() => {
    k.setCursor("pointer");
    section.use(k.scale(1.1));
    section.color = k.Color.fromHex(neonColor);
    section.opacity = 0.2;
  });

  section.onHoverEnd(() => {
    k.setCursor("default");
    section.use(k.scale(1));
    section.color = k.Color.fromHex("#0b0c15");
    section.opacity = 0.8;
  });

  // 6. LOGICA DI COLLISIONE
  if (contentCallback) {
    const onCollideHandler = section.onCollide("player", () => {
      contentCallback(section); 
      onCollideHandler.cancel(); 
    });
  }

  return section;
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

  store.set(skillsDataAtom, skillsData);

  const k = makeKaplayCtx();

  // --- ASSETS ---
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
  
  // Loghi
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
  
  k.loadShaderURL("tiledPattern", null, "./shaders/tiledPattern.frag");

  // Audio
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

  // --- NUOVA LOGICA DI PAUSA PLAYER ---
  // Controlla costantemente se il modale è aperto e congela il player
  k.onUpdate(() => {
    const isSkillsOpen = store.get(isSkillsModalVisibleAtom);
    const player = k.get("player")[0];
    
    if (player) {
      if (isSkillsOpen) {
        // Se il modale è aperto, mettiamo in pausa il player
        if (!player.paused) {
          player.moveTo(player.pos); // Stop movimento
          player.play("walk-down-idle"); // Stop animazione
          player.paused = true; // Congela aggiornamenti
        }
      } else {
        // Se il modale è chiuso, riattiviamo il player
        if (player.paused) {
          player.paused = false;
        }
      }
    }
  });

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

  // --- BACKGROUND SHADER ---
  const tiledBackground = k.add([
    k.uvquad(k.width(), k.height()),
    k.shader("tiledPattern", () => ({
      u_time: k.time() / 15,
      u_color1: k.Color.fromHex("#0b0c15"), 
      u_color2: k.Color.fromHex("#2de2e6"), 
      u_speed: k.vec2(0.3, -0.3),
      u_aspect: k.width() / k.height(),
      u_size: 10,
    })),
    k.pos(0, 0),
    k.fixed(),
  ]);

  tiledBackground.onUpdate(() => {
    tiledBackground.width = k.width();
    tiledBackground.height = k.height();
    tiledBackground.uniform.u_aspect = k.width() / k.height();
  });

  // --- SEZIONE 1: HEADER & SOCIALS ---
  makeSection(
    k,
    k.vec2(k.center().x, k.center().y - 400),
    generalData.section1Name,
    (parent) => {
      const container = parent.add([k.pos(-805, -700), k.opacity(0)]);
      container.add([
        k.text(generalData.header.title, { font: "ibm-bold", size: 40 }),
        k.color(k.Color.fromHex("#ffffff")), 
        k.pos(395, 0),
        k.opacity(0),
      ]);

      container.add([
        k.text(generalData.header.subtitle, {
          font: "ibm-bold",
          size: 20,
        }),
        k.color(k.Color.fromHex("#2de2e6")), 
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

  // --- SEZIONE 2: SKILLS ---
  makeHoloSection(
    k,
    k.vec2(k.center().x - 400, k.center().y),
    generalData.section2Name,
    () => {
        // Apriamo il modale. La logica di pausa è gestita sopra in k.onUpdate
        store.set(isSkillsModalVisibleAtom, true);
    }
  );

  // --- SEZIONE 3: WORK EXPERIENCE ---
  makeHoloSection(
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

  // --- SEZIONE 4: PROJECTS ---
  makeHoloSection(
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