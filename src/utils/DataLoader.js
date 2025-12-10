
import { safeFetch } from "./index";

export const loadGameData = async () => {
  const [
    theme,
    aboutData,
    layoutData,
    playerData,
    skillsData,
    socialsData,
    experiencesData,
    projectsData,
    npcData
  ] = await Promise.all([
    safeFetch("configs/theme.json"),
    safeFetch("configs/aboutData.json"),
    safeFetch("configs/layoutData.json"),
    safeFetch("configs/playerData.json"),
    safeFetch("configs/skillsData.json"),
    safeFetch("configs/socialsData.json"),
    safeFetch("configs/experiencesData.json"),
    safeFetch("configs/projectsData.json"),
    safeFetch("configs/npcData.json")
  ]);

  return {
    theme,
    aboutData,
    layoutData,
    playerData,
    skillsData,
    socialsData,
    experiencesData,
    projectsData,
    npcData
  };
};
