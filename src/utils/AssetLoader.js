import { resolvePath } from "./index";

export const loadAssets = (k, { skillsData, socialsData, projectsData, playerData }) => {
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
