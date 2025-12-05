import makeKaplayCtx from "./kaplayCtx";
import makePlayer from "./entities/Player";
import makeSection from "./components/Section";
import makeSocialIcon from "./components/SocialIcon";
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

export default async function initGame() {
  // --- 1. DATA LOADING ---
  // Load configuration and content from JSON files
  const theme = await (await fetch("./configs/theme.json")).json();
  const generalData = await (await fetch("./configs/generalData.json")).json();
  const skillsData = await (await fetch("./configs/skillsData.json")).json();
  const socialsData = await (await fetch("./configs/socialsData.json")).json();
  const experiencesData = await (await fetch("./configs/experiencesData.json")).json();
  const projectsData = await (await fetch("./configs/projectsData.json")).json();

  // --- 2. THEME APPLICATION ---
  // Apply theme colors to CSS variables for React UI components
  const root = document.documentElement;
  root.style.setProperty("--color1", theme.colors.background); 
  root.style.setProperty("--color2", theme.colors.primary);    
  root.style.setProperty("--color3", theme.colors.text);       

  // Store skills data for the React Modal
  store.set(skillsDataAtom, skillsData);

  // Initialize Kaplay context
  const k = makeKaplayCtx();

  // --- 3. DYNAMIC ASSET LOADING ---
  // Avoid duplicate loading
  const loadedAssets = new Set(); 
  
  const loadAsset = (name, path) => {
    if (!name || loadedAssets.has(name)) return;
    k.loadSprite(name, path);
    loadedAssets.add(name);
  };

  // Load Skills logos
  skillsData.forEach(skill => {
    if (skill.logoData?.name) loadAsset(skill.logoData.name, `./logos/${skill.logoData.name}.png`);
  });
  
  // Load Socials logos
  socialsData.forEach(social => {
    if (social.logoData?.name) loadAsset(social.logoData.name, `./logos/${social.logoData.name}.png`);
  });
  
  // Load Project thumbnails
  projectsData.forEach(project => {
    if (project.thumbnail) loadAsset(project.thumbnail, `./projects/${project.thumbnail}.png`);
  });

  // Load Core Assets (Player, Fonts, Shader, Audio)
  k.loadSprite("player", "./sprites/player.png", {
    sliceX: 4, sliceY: 8,
    anims: {
      "walk-down-idle": 0, "walk-down": { from: 0, to: 3, loop: true },
      "walk-left-down": { from: 4, to: 7, loop: true }, "walk-left-down-idle": 4,
      "walk-left": { from: 8, to: 11, loop: true }, "walk-left-idle": 8,
      "walk-left-up": { from: 12, to: 15, loop: true }, "walk-left-up-idle": 12,
      "walk-up": { from: 16, to: 19, loop: true }, "walk-up-idle": 16,
      "walk-right-up": { from: 20, to: 23, loop: true }, "walk-right-up-idle": 20,
      "walk-right": { from: 24, to: 27, loop: true }, "walk-right-idle": 24,
      "walk-right-down": { from: 28, to: 31, loop: true }, "walk-right-down-idle": 28,
    },
  });

  k.loadFont("ibm-regular", "./fonts/IBMPlexSans-Regular.ttf");
  k.loadFont("ibm-bold", "./fonts/IBMPlexSans-Bold.ttf");
  k.loadShaderURL("tiledPattern", null, "./shaders/tiledPattern.frag");
  
  k.loadSound("bgm", "./audio/background-music.mp3");
  k.loadSound("flip", "./audio/flip.mp3");
  k.loadSound("match", "./audio/match.mp3");

  // --- 4. GAME LOGIC & AUDIO ---
  let bgm = null;
  let musicStarted = false;

  function startBGM() {
    if (!musicStarted) {
      // Resume audio context if suspended (common browser behavior)
      if (k.audioCtx && k.audioCtx.state === "suspended") {
         k.audioCtx.resume();
      }
      bgm = k.play("bgm", { loop: true, volume: store.get(musicVolumeAtom) });
      musicStarted = true;
    }
  }

  // Audio start listeners (Mouse, Keyboard, Touch for mobile)
  k.onKeyPress(startBGM);
  k.onMousePress(startBGM);
  k.onTouchStart(startBGM); 
  k.onTouchEnd(startBGM);   

  // Update music volume
  k.onUpdate(() => { if (bgm) bgm.volume = store.get(musicVolumeAtom); });

  // --- 5. PLAYER PAUSE LOGIC ---
  // Freezes the player when a React Modal is open (e.g. Skills)
  k.onUpdate(() => {
    const isSkillsOpen = store.get(isSkillsModalVisibleAtom);
    const player = k.get("player")[0];
    
    if (player) {
      if (isSkillsOpen) {
        if (!player.paused) {
          player.moveTo(player.pos); // Stop movement target
          player.play("walk-down-idle"); // Stop animation
          player.paused = true; // Freeze updates
        }
      } else if (player.paused) {
        player.paused = false; // Unfreeze
      }
    }
  });

  // --- 6. CAMERA SETTINGS ---
  const setInitCamZoomValue = () => {
    if (k.width() < 1000) { k.camScale(k.vec2(0.5)); store.set(cameraZoomValueAtom, 0.5); return; }
    k.camScale(k.vec2(0.8)); store.set(cameraZoomValueAtom, 0.8);
  };
  setInitCamZoomValue();

  k.onUpdate(() => {
    const cameraZoomValue = store.get(cameraZoomValueAtom);
    if (cameraZoomValue !== k.camScale().x) k.camScale(k.vec2(cameraZoomValue));
  });

  // --- 7. BACKGROUND SHADER ---
  const tiledBackground = k.add([
    k.uvquad(k.width(), k.height()),
    k.shader("tiledPattern", () => ({
      u_time: k.time() / 15,
      u_color1: k.Color.fromHex(theme.colors.background), // Dynamic Theme Color
      u_color2: k.Color.fromHex(theme.colors.primary),    // Dynamic Theme Color
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

  // --- 8. GAME SECTIONS ---
  
  // SECTION 1: HEADER & SOCIALS
  makeSection(
    k,
    k.vec2(k.center().x, k.center().y - 400),
    generalData.section1Name,
    (parent) => {
      const container = parent.add([k.pos(-805, -700), k.opacity(0)]);
      container.add([
        k.text(generalData.header.title, { font: "ibm-bold", size: 40 }),
        k.color(k.Color.fromHex(theme.colors.text)), 
        k.pos(395, 0),
        k.opacity(0),
      ]);

      container.add([
        k.text(generalData.header.subtitle, { font: "ibm-bold", size: 20 }),
        k.color(k.Color.fromHex(theme.colors.primary)), 
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
            socialData.address,
            theme
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
          socialData.description,
          theme
        );
      }
      makeAppear(k, container);
      makeAppear(k, socialContainer);
    },
    theme // Pass theme for dynamic styling
  );

  // SECTION 2: SKILLS (Opens React Modal)
  makeSection(
    k,
    k.vec2(k.center().x - 400, k.center().y),
    generalData.section2Name,
    () => { store.set(isSkillsModalVisibleAtom, true); }, // Collision callback
    theme
  );

  // SECTION 3: WORK EXPERIENCE
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
          experienceData.roleData,
          theme // Pass theme to cards
        );
      }
      makeAppear(k, container);
    },
    theme
  );

  // SECTION 4: PROJECTS
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
          project.thumbnail,
          theme // Pass theme to cards
        );
      }
      makeAppear(k, container);
    },
    theme
  );

  // Initialize Player
  makePlayer(k, k.vec2(k.center()), 700);
}