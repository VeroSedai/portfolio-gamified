import { useState, useEffect } from "react";
import { useAtom, useAtomValue } from "jotai";
import { isProjectGalleryVisibleAtom, projectsDataAtom } from "../store";

export default function ProjectGalleryModal() {
  const [isVisible, setIsVisible] = useAtom(isProjectGalleryVisibleAtom);
  const projects = useAtomValue(projectsDataAtom);
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextProject = () => {
    if (projects.length === 0) return;
    setCurrentIndex((prev) => (prev + 1) % projects.length);
  };

  const prevProject = () => {
    if (projects.length === 0) return;
    setCurrentIndex((prev) => (prev - 1 + projects.length) % projects.length);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isVisible) return;
      if (e.key === "ArrowRight") nextProject();
      if (e.key === "ArrowLeft") prevProject();
      if (e.key === "Escape") setIsVisible(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isVisible, projects]);

  if (!isVisible || projects.length === 0) return null;

  const currentProject = projects[currentIndex];
  const projectLink = currentProject.data.link || currentProject.data.github;

  return (
    <div className="modal">
      <div className="modal-content project-modal">
        <div className="modal-header">
          <h1 style={{ fontFamily: "ibm-bold" }}>PROJECT_ARCHIVE</h1>
          <button className="close-btn" onClick={() => setIsVisible(false)}>X</button>
        </div>

        <div className="gallery-container">
          <button className="nav-btn left" onClick={prevProject}>&lt;</button>

          <div className="project-display">
            
            <div className="project-image-container">
              {currentProject.thumbnail && (
                // FIX: Use BASE_URL for project thumbnail path
                <img 
                  src={`${import.meta.env.BASE_URL}/projects/${currentProject.thumbnail}.png`} 
                  alt={currentProject.data.title} 
                  className="project-img"
                />
              )}
            </div>

            <div className="project-info">
              <h2 style={{ fontFamily: "ibm-bold" }}>{currentProject.data.title}</h2>
              <p className="project-desc" style={{ fontFamily: "ibm-regular" }}>
                {currentProject.data.shortDesc}
              </p>
              
              <div className="project-links">
                {projectLink && (
                  <button 
                    className="modal-btn" 
                    onClick={() => window.open(projectLink, "_blank")}
                    style={{ fontFamily: "ibm-bold" }}
                  >
                    VIEW CODE
                  </button>
                )}
              </div>
              
              <div className="project-counter" style={{ fontFamily: "ibm-bold" }}>
                {currentIndex + 1} / {projects.length}
              </div>
            </div>
          </div>

          <button className="nav-btn right" onClick={nextProject}>&gt;</button>
        </div>
      </div>
    </div>
  );
}