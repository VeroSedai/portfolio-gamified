import makeKaplayCtx from "./kaplayCtx";
import makePlayer from "./entities/Player";
import makeSection from "./components/Section";

import {
  musicVolumeAtom,
  sfxVolumeAtom,
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
  sfxTriggerAtom,
  themeAtom
} from "./store";

// --- PATH HELPER FOR PRODUCTION BUILD ---
const BASE_URL = import.meta.env.BASE_URL;

const resolvePath = (path) => {
  // Remove leading ./ or / to clean the path
  const cleanPath = path.replace(/^\.?\//, "");
  return `${BASE_URL}${cleanPath}`;
};

// Helper for safe fetching
const safeFetch = async (relativePath) => {
  const fullPath = resolvePath(relativePath);
  try {
    const response = await fetch(fullPath);
    if (!response.ok) throw new Error(`File missing: ${fullPath}`);
    return await response.json();
  } catch (e) {
    console.error(`JSON Error ${fullPath}:`, e);
    return {}; // Return empty object to prevent crash
  }
};

export default async function initGame() {
  // --- 1. DATA LOADING ---
  const theme = await safeFetch("configs/theme.json");
  const aboutData = await safeFetch("configs/aboutData.json");
  const layoutData = await safeFetch("configs/layoutData.json"); 
  const playerData = await safeFetch("configs/playerData.json"); 
  
  const skillsData = await safeFetch("configs/skillsData.json");
  const socialsData = await safeFetch("configs/socialsData.json");
  const experiencesData = await safeFetch("configs/experiencesData.json");
  const projectsData = await safeFetch("configs/projectsData.json");

  // --- 2. THEME SETUP ---
  const root = document.documentElement;
  // Default fallbacks if theme colors are missing
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

  const k = makeKaplayCtx();

  // --- 4. DYNAMIC ASSET LOADING ---
  const loadPromises = []; 
  const loadedAssets = new Set(); 
  
  const loadAsset = (name, relativePath) => {
    if (!name || loadedAssets.has(name)) return;
    // Fix path using base url
    loadPromises.push(k.loadSprite(name, resolvePath(relativePath)));
    loadedAssets.add(name);
  };

  // Sprite Loading
  if (Array.isArray(skillsData)) skillsData.forEach(s => s.logoData?.name && loadAsset(s.logoData.name, `logos/${s.logoData.name}.png`));
  if (Array.isArray(socialsData)) socialsData.forEach(s => s.logoData?.name && loadAsset(s.logoData.name, `logos/${s.logoData.name}.png`));
  if (Array.isArray(projectsData)) projectsData.forEach(p => p.thumbnail && loadAsset(p.thumbnail, `projects/${p.thumbnail}.png`));

  // Load Player Sprite
  const spriteName = playerData.sprite || "player";
  loadPromises.push(k.loadSprite("player", resolvePath(`sprites/${spriteName}.png`), {
    sliceX: playerData.sliceX || 4,
    sliceY: playerData.sliceY || 8,
    anims: playerData.anims || { "walk-down-idle": 0 },
  }));

  // Load Fonts & Shader
  k.loadFont("ibm-regular", resolvePath("fonts/IBMPlexSans-Regular.ttf"));
  k.loadFont("ibm-bold", resolvePath("fonts/IBMPlexSans-Bold.ttf"));
  k.loadShaderURL("tiledPattern", null, resolvePath("shaders/tiledPattern.frag"));
  
  // --- AUDIO LOADING ---
  
  const loadSoundSafe = (k, id, relativePath) => {
    const fullPath = resolvePath(relativePath);
    return new Promise((resolve) => {
        k.loadSound(id, fullPath).then(resolve).catch(e => {
            console.warn(`[Audio Skipped] ID: ${id}, Path: ${fullPath}`, e);
            resolve(); 
        });
    });
  };

  // 1. SFX
  loadPromises.push(loadSoundSafe(k, "flip", "audio/flip.mp3"));
  loadPromises.push(loadSoundSafe(k, "match", "audio/match.mp3"));
  
  if (theme.audio && theme.audio.sfx) {
    for (const [key, filename] of Object.entries(theme.audio.sfx)) {
      loadPromises.push(loadSoundSafe(k, key, `audio/${filename}`));
    }
  }

  // 2. Playlist (BGM)
  const playlist = theme.audio?.playlist || ["background-music.mp3"]; 
  playlist.forEach((trackName) => {
    loadPromises.push(loadSoundSafe(k, trackName, `audio/${trackName}`)); 
  });

  // --- WAIT FOR ALL ASSETS ---
  await Promise.all(loadPromises);
  
  // --- 5. AUDIO SYSTEM ---
  let currentTrackIndex = 0;
  let bgm = null;
  let musicStarted = false; // Flag to track if music has successfully started

  function playTrack(index) {
    if (bgm) bgm.stop();
    const trackName = playlist[index];
    
    try {
        console.log(`[BGM] Attempting to play: ${trackName}`);
        bgm = k.play(trackName, { 
            loop: false, 
            volume: store.get(musicVolumeAtom) 
        });

        bgm.onEnd(() => {
            currentTrackIndex = (currentTrackIndex + 1) % playlist.length;
            playTrack(currentTrackIndex);
        });
        
        return true; // Success
    } catch (e) {
        console.warn(`[BGM Error] Failed to play track: ${trackName}`, e);
        // Try next track if this one fails
        if (playlist.length > 1) {
            currentTrackIndex = (currentTrackIndex + 1) % playlist.length;
            setTimeout(() => playTrack(currentTrackIndex), 100); 
        }
        return false; // Failed
    }
  }

  // GLOBAL AUDIO UNLOCKER
  // Attaches to window events to ensure we catch the very first interaction
  const attemptStartBGM = () => {
    if (musicStarted) return; // Already running

    // Resume context if suspended (Mobile browser requirement)
    if (k.audioCtx && k.audioCtx.state === "suspended") {
        k.audioCtx.resume().catch(e => console.warn("Audio resume failed", e));
    }
    
    if (playlist.length > 0) {
        const success = playTrack(currentTrackIndex);
        if (success) {
            musicStarted = true;
            // Clean up listeners once music starts
            window.removeEventListener("touchstart", attemptStartBGM);
            window.removeEventListener("click", attemptStartBGM);
            window.removeEventListener("keydown", attemptStartBGM);
        }
    }
  };

  // Add listeners to global window for maximum compatibility
  window.addEventListener("touchstart", attemptStartBGM, { capture: true });
  window.addEventListener("click", attemptStartBGM, { capture: true });
  window.addEventListener("keydown", attemptStartBGM, { capture: true });

  // Sync volume updates
  k.onUpdate(() => { if (bgm) bgm.volume = store.get(musicVolumeAtom); });

  // 5b. SFX BRIDGE
  store.sub(sfxTriggerAtom, () => {
    const sfx = store.get(sfxTriggerAtom);
    if (sfx && sfx.name) {
       if (!musicStarted) attemptStartBGM(); // Piggyback BGM start on SFX

       try {
         k.play(sfx.name, { volume: store.get(sfxVolumeAtom) });
       } catch (e) {
         console.warn("SFX error:", e);
       }
    }
  });

  // --- 6. PLAYER PAUSE & CAMERA ---
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
  const bgConfig = theme.background || { type: "shader", asset: "tiledPattern" };
  
  if (bgConfig.type === "image") {
    // FIX: Add base URL to sprite load
    const bg = k.add([
        k.sprite(bgConfig.asset, { tiled: true, width: k.width(), height: k.height() }),
        k.pos(0, 0), k.fixed(), k.z(-100) 
    ]);
    bg.onUpdate(() => { bg.width = k.width(); bg.height = k.height(); });
  } else {
    // FIX: Ensure shader path is resolved (done above in loadShaderURL), asset name is just ID
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

  // --- 9. DYNAMIC SECTIONS GENERATION ---
  
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

  // --- CREATE PLAYER ---
  const playerSpeed = playerData.speed || 700;
  makePlayer(k, k.vec2(k.center()), playerSpeed);
}