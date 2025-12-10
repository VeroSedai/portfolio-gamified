import makeKaplayCtx from "./kaplayCtx";
import makePlayer from "./entities/Player";
import makeSection from "./components/Section";
import makeNPC from "./entities/NPC"; // Import NPC factory

import {
  store,
  skillsDataAtom,
  workExperienceDataAtom,
  projectsDataAtom,
  aboutDataAtom,
  socialsDataAtom,
  themeAtom,
  cameraZoomValueAtom,
  isSkillsModalVisibleAtom,
  isWorkExperienceModalVisibleAtom,
  isProjectGalleryVisibleAtom,
  isAboutModalVisibleAtom,
  npcDataAtom
} from "./stores";
import { loadGameData } from "./utils/DataLoader";
import { loadAssets } from "./utils/AssetLoader";
import { initAudioSystem } from "./systems/AudioManager";

export default async function initGame() {
  // --- 1. DATA LOADING ---
  const data = await loadGameData();
  const { theme, aboutData, layoutData, playerData, skillsData, socialsData, experiencesData, projectsData, npcData } = data;

  // --- 2. THEME SETUP ---
  const root = document.documentElement;
  root.style.setProperty("--color1", theme.colors?.background || "#0b0c15"); 
  root.style.setProperty("--color2", theme.colors?.primary || "#2de2e6");    
  root.style.setProperty("--color3", theme.colors?.text || "#ffffff");       

  // --- 3. STORE INITIALIZATION ---
  store.set(skillsDataAtom, skillsData);
  store.set(workExperienceDataAtom, experiencesData);
  store.set(projectsDataAtom, projectsData);
  store.set(aboutDataAtom, aboutData); 
  store.set(socialsDataAtom, socialsData); 
  store.set(themeAtom, theme); 
  store.set(npcDataAtom, npcData);

  const k = makeKaplayCtx();

  // --- 4. ASSET & AUDIO LOADING ---
  const assetPromises = loadAssets(k, data);
  const audioPromise = initAudioSystem(k, theme);
  
  await Promise.all([...assetPromises, audioPromise]);
  
  // --- 5. PLAYER PAUSE LOGIC ---
  const pauseAnim = playerData.directions === 4 ? "idle" : "walk-down-idle";

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
          try { player.play(pauseAnim); } catch(e) {}
          player.paused = true; 
        }
      } else if (player.paused) {
        player.paused = false; 
      }
    }
  });

  // --- 6. CAMERA ---
  const setInitCamZoomValue = () => {
    if (k.width() < 1000) { k.setCamScale(k.vec2(0.5)); store.set(cameraZoomValueAtom, 0.5); return; }
    k.setCamScale(k.vec2(0.8)); store.set(cameraZoomValueAtom, 0.8);
  };
  setInitCamZoomValue();
  k.onUpdate(() => {
    const val = store.get(cameraZoomValueAtom);
    if (val !== k.getCamScale().x) k.setCamScale(k.vec2(val));
  });

  // --- 7. BACKGROUND ---
  const bgConfig = theme.background || { type: "shader", asset: "tiledPattern" };
  
  if (bgConfig.type === "image") {
    const bg = k.add([
        k.sprite(bgConfig.asset, { tiled: true, width: k.width(), height: k.height() }),
        k.pos(0, 0), k.fixed(), k.z(-100) 
    ]);
    bg.onUpdate(() => { bg.width = k.width(); bg.height = k.height(); });
  } else {
    const sp = bgConfig.shaderParams || {};
    const bg = k.add([
      k.uvquad(k.width(), k.height()),
      k.shader(bgConfig.asset || "tiledPattern", () => ({
        u_time: k.time() / 15,
        u_color1: k.Color.fromHex(theme.colors?.background || "#000"), 
        u_color2: k.Color.fromHex(theme.colors?.primary || "#0f0"),    
        u_speed: k.vec2(sp.speedX || 0.3, sp.speedY || -0.3),
        u_aspect: k.width() / k.height(),
        u_size: sp.size || 10,
      })),
      k.pos(0, 0), k.fixed(), k.z(-100)
    ]);
    bg.onUpdate(() => { 
        bg.width = k.width(); bg.height = k.height(); 
        bg.uniform.u_aspect = k.width() / k.height(); 
    });
  }

  // --- 8. SECTIONS ---
  const atomMap = {
    "about": isAboutModalVisibleAtom,
    "skills": isSkillsModalVisibleAtom,
    "work": isWorkExperienceModalVisibleAtom,
    "projects": isProjectGalleryVisibleAtom
  };

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
          
          if (targetAtom) {
            store.set(targetAtom, true);
          }

          if (config.type === "special_about") {
             if (sectionObj.hasDrawnContent) return;
             sectionObj.hasDrawnContent = true;

             sectionObj.add([
                k.text(aboutData.header?.title || "Portfolio", { font: "ibm-bold", size: 30 }),
                k.color(k.Color.fromHex(theme.colors?.text || "#fff")),
                k.anchor("center"),
                k.pos(0, -130), 
             ]);
          }
        },
        triggerOnce
      );
    });
  }

  // --- 9. SPAWN NPCs ---
  if (Array.isArray(npcData)) {
      npcData.forEach(npcConfig => {
          makeNPC(k, npcConfig);
      });
  }

  // --- CREATE PLAYER ---
  makePlayer(k, k.vec2(k.center()), playerData);
}