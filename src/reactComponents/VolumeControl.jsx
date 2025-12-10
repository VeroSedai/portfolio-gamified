import { useState } from "react";
import { useAtom } from "jotai";
import { musicVolumeAtom, sfxVolumeAtom } from "../stores";

export default function VolumeControl() {
  const [musicVolume, setMusicVolume] = useAtom(musicVolumeAtom);
  const [sfxVolume, setSfxVolume] = useAtom(sfxVolumeAtom);
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="settings-widget">
      <button 
        className={`settings-btn ${isExpanded ? "active" : ""}`}
        onClick={() => setIsExpanded(!isExpanded)}
        title="Settings"
      >
        {isExpanded ? "X" : "⚙️"}
      </button>

      <div className={`settings-panel ${isExpanded ? "expanded" : ""}`}>
        <div className="volume-row">
          <span className="vol-icon">🎵</span>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={musicVolume}
            onChange={(e) => setMusicVolume(Number(e.target.value))}
            className="cyber-range"
          />
        </div>

        <div className="volume-row">
          <span className="vol-icon">🔊</span>
          <input
            type="range"
            min="0"
            max="1.5"
            step="0.01"
            value={sfxVolume}
            onChange={(e) => setSfxVolume(Number(e.target.value))}
            className="cyber-range"
          />
        </div>
      </div>
    </div>
  );
}