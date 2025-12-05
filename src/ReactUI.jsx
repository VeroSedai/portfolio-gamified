import CameraController from "./reactComponents/CameraController";
import SocialModal from "./reactComponents/SocialModal";
import EmailModal from "./reactComponents/EmailModal";
import ProjectModal from "./reactComponents/ProjectModal";
import VolumeControl from "./reactComponents/VolumeControl";
import SkillsModal from "./reactComponents/SkillsModal";
import WorkExperienceModal from "./reactComponents/WorkExperienceModal";
import ProjectGalleryModal from "./reactComponents/ProjectGalleryModal";
import AboutModal from "./reactComponents/AboutModal";

export default function ReactUI() {
  return (
    <>
      <p className="controls-message">Tap/Click around to move</p>
      <CameraController />
      <VolumeControl />
      <SocialModal />
      <EmailModal />
      <ProjectModal />
      <SkillsModal />
      <WorkExperienceModal />
      <ProjectGalleryModal />
      <AboutModal />
    </>
  );
}