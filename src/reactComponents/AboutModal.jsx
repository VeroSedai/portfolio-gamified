import { useState } from "react";
import { useAtom, useAtomValue } from "jotai";
import { isAboutModalVisibleAtom, aboutDataAtom, socialsDataAtom } from "../store";

export default function AboutModal() {
  const [isVisible, setIsVisible] = useAtom(isAboutModalVisibleAtom);
  const aboutData = useAtomValue(aboutDataAtom);
  const socials = useAtomValue(socialsDataAtom);
  
  const [copyMsg, setCopyMsg] = useState("");

  if (!isVisible || !aboutData) return null;

  const { header, about, education, certifications } = aboutData;

  const handleSocialClick = (social) => {
    if (social.name === "Email") {
      navigator.clipboard.writeText(social.address);
      setCopyMsg("Email copiata!");
      setTimeout(() => setCopyMsg(""), 2000);
    } else {
      window.open(social.link, "_blank");
    }
  };

  return (
    <div className="modal">
      <div className="modal-content about-modal">
        <div className="modal-header">
          <h1>PLAYER_PROFILE</h1>
          <button className="close-btn" onClick={() => setIsVisible(false)}>X</button>
        </div>

        <div className="about-container">
          {/* LEFT COLUMN: AVATAR & STATS */}
          <div className="about-left">
            <div className="avatar-frame">
                <img src={`${import.meta.env.BASE_URL}/icon.svg`}  alt="Avatar" className="pixel-avatar" /> 
            </div>
            
            <div className="stats-box">
              <h3>STATS</h3>
              {about.stats.map((stat, i) => (
                <div key={i} className="stat-row">
                  <span className="stat-label">{stat.label}</span>
                  <div className="stat-bar-container">
                    <div 
                      className="stat-bar-fill" 
                      style={{ width: `${Math.min(stat.value, 100)}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT COLUMN: BIO, SOCIALS, EDU & CERTS */}
          <div className="about-right">
            <h2 className="profile-name">{header.title}</h2>
            <h3 className="profile-role">{header.subtitle}</h3>
            
            {/* SOCIALS GRID */}
            <div className="socials-grid">
              {socials.map((social, index) => (
                <div 
                  key={index} 
                  className="social-item" 
                  onClick={() => handleSocialClick(social)}
                  title={social.name}
                >
                  <img 
                    src={`${import.meta.env.BASE_URL}/logos/${social.logoData.name}.png`} 
                    alt={social.name} 
                    className="social-icon-img"
                  />
                </div>
              ))}
            </div>
            {copyMsg && <p className="copy-feedback">{copyMsg}</p>}

            <div className="divider"></div>
            <p className="profile-bio">{about.description}</p>

            {/*EDUCATION SECTION */}
            {education && education.length > 0 && (
              <div className="about-section">
                <h4>EDUCATION</h4>
                <div className="info-grid">
                  {education.map((edu, index) => (
                    <div key={index} className="info-card">
                      <span className="info-title">{edu.degree}</span>
                      <span className="info-subtitle">{edu.institution}</span>
                      <span className="info-year">{edu.year}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* NEW: CERTIFICATIONS SECTION */}
            {certifications && certifications.length > 0 && (
              <div className="about-section">
                <h4>CERTIFICATIONS</h4>
                <div className="info-grid">
                  {certifications.map((cert, index) => (
                    <div key={index} className="info-card cert-card">
                      <span className="info-title">{cert.name}</span>
                      <div className="cert-details">
                        <span className="info-subtitle">{cert.issuer}</span>
                        <span className="info-year">{cert.year}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}