import makeKaplayCtx from "./kaplayCtx";
import makePlayer from "./entities/Player";
import makeSection from "./components/Section";
import {
  musicVolumeAtom,
  cameraZoomValueAtom,
  store,
  isSkillsModalVisibleAtom,
  skillsDataAtom,
  isWorkExperienceModalVisibleAtom,
  workExperienceDataAtom,
  isProjectGalleryVisibleAtom,
  projectsDataAtom,
  isAboutModalVisibleAtom, 
  aboutDataAtom,
  socialsDataAtom 
} from "./store";

export default async function initGame() {
  // --- 1. DATA LOADING ---
  const theme = await (await fetch("./configs/theme.json")).json();
  const generalData = await (await fetch("./configs/generalData.json")).json();
  const skillsData = await (await fetch("./configs/skillsData.json")).json();
  const socialsData = await (await fetch("./configs/socialsData.json")).json();
  const experiencesData = await (await fetch("./configs/experiencesData.json")).json();
  const projectsData = await (await fetch("./configs/projectsData.json")).json();

  // --- 2. THEME SETUP ---
  const root = document.documentElement;
  root.style.setProperty("--color1", theme.colors.background); 
  root.style.setProperty("--color2", theme.colors.primary);    
  root.style.setProperty("--color3", theme.colors.text);       

  // --- 3. STORE INITIALIZATION ---
  store.set(skillsDataAtom, skillsData);
  store.set(workExperienceDataAtom, experiencesData);
  store.set(projectsDataAtom, projectsData);
  store.set(aboutDataAtom, generalData); 
  store.set(socialsDataAtom, socialsData); 

  const k = makeKaplayCtx();

  // --- 4. DYNAMIC ASSET LOADING ---
  const loadedAssets = new Set(); 
  const loadAsset = (name, path) => {
    if (!name || loadedAssets.has(name)) return;
    k.loadSprite(name, path);
    loadedAssets.add(name);
  };

  skillsData.forEach(s => s.logoData?.name && loadAsset(s.logoData.name, `./logos/${s.logoData.name}.png`));
  socialsData.forEach(s => s.logoData?.name && loadAsset(s.logoData.name, `./logos/${s.logoData.name}.png`));
  projectsData.forEach(p => p.thumbnail && loadAsset(p.thumbnail, `./projects/${p.thumbnail}.png`));

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

  // --- 5. AUDIO SYSTEM ---
  let bgm = null;
  let musicStarted = false;

  function startBGM() {
    if (!musicStarted) {
      if (k.audioCtx && k.audioCtx.state === "suspended") k.audioCtx.resume();
      bgm = k.play("bgm", { loop: true, volume: store.get(musicVolumeAtom) });
      musicStarted = true;
    }
  }

  k.onKeyPress(startBGM);
  k.onMousePress(startBGM);
  k.onTouchStart(startBGM); 
  k.onTouchEnd(startBGM);   
  k.onUpdate(() => { if (bgm) bgm.volume = store.get(musicVolumeAtom); });

  // --- 6. PLAYER PAUSE LOGIC ---
  k.onUpdate(() => {
    const isSkills = store.get(isSkillsModalVisibleAtom);
    const isWork = store.get(isWorkExperienceModalVisibleAtom);
    const isProj = store.get(isProjectGalleryVisibleAtom);
    const isAbout = store.get(isAboutModalVisibleAtom); 
    
    const player = k.get("player")[0];
    if (player) {
      if (isSkills || isWork || isProj || isAbout) {
        if (!player.paused) {
          player.moveTo(player.pos); 
          player.play("walk-down-idle"); 
          player.paused = true; 
        }
      } else if (player.paused) {
        player.paused = false; 
      }
    }
  });

  // --- 7. CAMERA ---
  const setInitCamZoomValue = () => {
    if (k.width() < 1000) { k.camScale(k.vec2(0.5)); store.set(cameraZoomValueAtom, 0.5); return; }
    k.camScale(k.vec2(0.8)); store.set(cameraZoomValueAtom, 0.8);
  };
  setInitCamZoomValue();
  k.onUpdate(() => {
    const val = store.get(cameraZoomValueAtom);
    if (val !== k.camScale().x) k.camScale(k.vec2(val));
  });

  // --- 8. SHADER ---
  const tiledBackground = k.add([
    k.uvquad(k.width(), k.height()),
    k.shader("tiledPattern", () => ({
      u_time: k.time() / 15,
      u_color1: k.Color.fromHex(theme.colors.background), 
      u_color2: k.Color.fromHex(theme.colors.primary),    
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

  // --- 9. GAME SECTIONS ---

  // SECTION 1: ABOUT
  makeSection(
    k,
    k.vec2(k.center().x, k.center().y - 400),
    generalData.section1Name, 
    (section) => {
        store.set(isAboutModalVisibleAtom, true);

        if (section.hasDrawnContent) return;
        section.hasDrawnContent = true;

        section.add([
          k.text(generalData.header.title, { font: "ibm-bold", size: 30 }),
          k.color(k.Color.fromHex(theme.colors.text)),
          k.anchor("center"),
          k.pos(0, -130), 
        ]);
    }, 
    theme,
    false 
  );

  // SECTION 2: SKILLS
  makeSection(
    k,
    k.vec2(k.center().x - 400, k.center().y),
    generalData.section2Name,
    () => { store.set(isSkillsModalVisibleAtom, true); }, 
    theme,
    false 
  );

  // SECTION 3: WORK EXPERIENCE
  makeSection(
    k,
    k.vec2(k.center().x + 400, k.center().y),
    generalData.section3Name,
    () => { store.set(isWorkExperienceModalVisibleAtom, true); }, 
    theme,
    false 
  );

  // SECTION 4: PROJECTS
  makeSection(
    k,
    k.vec2(k.center().x, k.center().y + 400),
    generalData.section4Name,
    () => { store.set(isProjectGalleryVisibleAtom, true); },
    theme,
    false 
  );

  makePlayer(k, k.vec2(k.center()), 700);
}