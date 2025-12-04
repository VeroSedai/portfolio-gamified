import { useAtom } from "jotai";
import { musicVolumeAtom, sfxVolumeAtom } from "../store";


export default function VolumeControl() {
  const [musicVolume, setMusicVolume] = useAtom(musicVolumeAtom);
  const [sfxVolume, setSfxVolume] = useAtom(sfxVolumeAtom);

  return (
    <div
    className="music-control"
    >
      <div>
        <label>🎵 Musica</label>
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={musicVolume}
          onChange={(e) => setMusicVolume(Number(e.target.value))}
        />
      </div>

      <div style={{ marginTop: "10px" }}>
        <label>🔊 Effetti</label>
        <input
          type="range"
          min="0"
          max="1.5"
          step="0.01"
          value={sfxVolume}
          onChange={(e) => setSfxVolume(Number(e.target.value))}
        />
      </div>
    </div>
  );
}
