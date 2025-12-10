import { resolvePath } from "./index";

export const loadAssets = (k, { skillsData, socialsData, projectsData, playerData, npcData }) => {
  const loadPromises = [];
  const loadedAssets = new Set();

  const loadAsset = (name, relativePath) => {
    if (!name || loadedAssets.has(name)) return;
    loadPromises.push(k.loadSprite(name, resolvePath(relativePath)));
    loadedAssets.add(name);
  };

  // Sprite Loading
  if (Array.isArray(skillsData)) {
    skillsData.forEach(s => s.logoData?.name && loadAsset(s.logoData.name, `logos/${s.logoData.name}.png`));
  }
  if (Array.isArray(socialsData)) {
    socialsData.forEach(s => s.logoData?.name && loadAsset(s.logoData.name, `logos/${s.logoData.name}.png`));
  }
  if (Array.isArray(projectsData)) {
    projectsData.forEach(p => p.thumbnail && loadAsset(p.thumbnail, `projects/${p.thumbnail}.png`));
  }
  
  // NPC Sprites
  if (Array.isArray(npcData)) {
      npcData.forEach(npc => {
         if (npc.sprite && npc.sprite !== "player") {
           // Providing default sprite config - can be customized per NPC if json supports it
           loadPromises.push(k.loadSprite(npc.sprite, resolvePath(`sprites/${npc.sprite}.png`), {
             sliceX: npc.sliceX || 4,
             sliceY: npc.sliceY || 8,
             anims: npc.anims || { "idle": 0, "walk-down": 0 }
           }));
         }
      });
  }

  // Load Player Sprite
  const spriteName = playerData.sprite || "player";
  loadPromises.push(k.loadSprite("player", resolvePath(`sprites/${spriteName}.png`), {
    sliceX: playerData.sliceX || 4,
    sliceY: playerData.sliceY || 8,
    anims: playerData.anims || { "walk-down-idle": 0 },
  }));

  // Load Fonts & Shader
  loadPromises.push(k.loadFont("ibm-regular", resolvePath("fonts/IBMPlexSans-Regular.ttf")));
  loadPromises.push(k.loadFont("ibm-bold", resolvePath("fonts/IBMPlexSans-Bold.ttf")));
  loadPromises.push(k.loadShaderURL("tiledPattern", null, resolvePath("shaders/tiledPattern.frag")));

  return loadPromises;
};
