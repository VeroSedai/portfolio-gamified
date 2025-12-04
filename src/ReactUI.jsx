import CameraController from "./reactComponents/CameraController";
import SocialModal from "./reactComponents/SocialModal";
import EmailModal from "./reactComponents/EmailModal";
import ProjectModal from "./reactComponents/ProjectModal";
import VolumeControl from "./reactComponents/VolumeControl";

export default function ReactUI() {
  return (
    <>
      <p className="controls-message">Tap/Click around to move</p>
      <p className="cp-message">Sound Effect by u_y3wk5ympz8, Shiden Beats Music and Maksym Malko from Pixabay</p>
      <CameraController />
      <SocialModal />
      <EmailModal />
      <ProjectModal />
      <VolumeControl />
    </>
  );
}