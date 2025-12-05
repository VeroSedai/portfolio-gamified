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
  socialsDataAtom,
  themeAtom
} from "./store";

export default async function initGame() {
  // --- 1. DATA LOADING ---
  const theme = await (await fetch("./configs/theme.json")).json();
  const aboutData = await (await fetch("./configs/aboutData.json")).json();
  const layoutData = await (await fetch("./configs/layoutData.json")).json(); 
  const playerData = await (await fetch("./configs/playerData.json")).json(); 
  
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
  store.set(aboutDataAtom, aboutData); 
  store.set(socialsDataAtom, socialsData);
  store.set(themeAtom, theme); // <--- SALVIAMO IL TEMA NELLO STORE

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

// --- 4b. LOAD PLAYER SPRITE (From playerData.json) ---
  k.loadSprite("player", `./sprites/${playerData.sprite}.png`, {
    sliceX: playerData.sliceX,
    sliceY: playerData.sliceY,
    anims: playerData.anims,
  });

// Load Core Assets
  k.loadFont("ibm-regular", "./fonts/IBMPlexSans-Regular.ttf");
  k.loadFont("ibm-bold", "./fonts/IBMPlexSans-Bold.ttf");
  k.loadShaderURL("tiledPattern", null, "./shaders/tiledPattern.frag");
  
  // Audio Loading (Kaplay side)
  if (theme.audio && theme.audio.playlist) {
    theme.audio.playlist.forEach((trackName) => {
      k.loadSound(trackName, `./audio/${trackName}`);
    });
  }
  
  // Background Loading
  if (theme.background && theme.background.type === "image") {
    k.loadSprite(theme.background.asset, `./backgrounds/${theme.background.asset}.png`); 
  }

  // --- 5. AUDIO SYSTEM ---
  let currentTrackIndex = 0;
  let bgm = null;
  let musicStarted = false;

  function startBGM() {
    if (!musicStarted && theme.audio?.enabled && theme.audio?.playlist?.length > 0) {
      if (k.audioCtx && k.audioCtx.state === "suspended") k.audioCtx.resume();
      playTrack(currentTrackIndex);
      musicStarted = true;
    }
  }

  function playTrack(index) {
    if (bgm) bgm.stop();
    const trackName = theme.audio.playlist[index];
    bgm = k.play(trackName, { 
        loop: false, 
        volume: store.get(musicVolumeAtom) 
    });
    bgm.onEnd(() => {
        currentTrackIndex = (currentTrackIndex + 1) % theme.audio.playlist.length;
        playTrack(currentTrackIndex);
    });
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

  // --- 8. DYNAMIC BACKGROUND RENDER ---
  const bgConfig = theme.background || { type: "shader", asset: "tiledPattern", shaderParams: {} };
  let backgroundObj;

  if (bgConfig.type === "image") {
    backgroundObj = k.add([
        k.sprite(bgConfig.asset, { tiled: true, width: k.width(), height: k.height() }),
        k.pos(0, 0),
        k.fixed(),
        k.z(-100) 
    ]);
    backgroundObj.onUpdate(() => {
        backgroundObj.width = k.width();
        backgroundObj.height = k.height();
    });
  } else {
    const sp = bgConfig.shaderParams || {};
    backgroundObj = k.add([
      k.uvquad(k.width(), k.height()),
      k.shader(bgConfig.asset || "tiledPattern", () => ({
        u_time: k.time() / 15,
        u_color1: k.Color.fromHex(theme.colors.background), 
        u_color2: k.Color.fromHex(theme.colors.primary),    
        u_speed: k.vec2(sp.speedX || 0.3, sp.speedY || -0.3),
        u_aspect: k.width() / k.height(),
        u_size: sp.size || 10,
      })),
      k.pos(0, 0),
      k.fixed(),
      k.z(-100)
    ]);
    backgroundObj.onUpdate(() => {
      backgroundObj.width = k.width();
      backgroundObj.height = k.height();
      backgroundObj.uniform.u_aspect = k.width() / k.height();
    });
  }

  // --- 9. DYNAMIC SECTIONS GENERATION ---
  
// Mapping JSON IDs to React Atoms
  const atomMap = {
    "about": isAboutModalVisibleAtom,
    "skills": isSkillsModalVisibleAtom,
    "work": isWorkExperienceModalVisibleAtom,
    "projects": isProjectGalleryVisibleAtom
  };

// Iterate over layoutData from JSON
  if (layoutData.sections) {
    layoutData.sections.forEach(config => {
      
      const colorHex = theme.colors[config.colorKey] || theme.colors.primary;
      const targetAtom = atomMap[config.id];
      const triggerOnce = false; 

      makeSection(
        k,
        k.vec2(k.center().x + config.position.x, k.center().y + config.position.y),
        config.title,
        config.icon,
        colorHex,
        (sectionObj) => {
          if (targetAtom) store.set(targetAtom, true);

          if (config.type === "special_about") {
             if (sectionObj.hasDrawnContent) return;
             sectionObj.hasDrawnContent = true;
             sectionObj.add([
                k.text(aboutData.header.title, { font: "ibm-bold", size: 30 }),
                k.color(k.Color.fromHex(theme.colors.text)),
                k.anchor("center"),
                k.pos(0, -130), 
             ]);
          }
        },
        triggerOnce
      );
    });
  }

  // --- CREATE PLAYER ---
  makePlayer(k, k.vec2(k.center()), playerData.speed);
}