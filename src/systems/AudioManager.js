import { resolvePath } from "../utils/index";
import { store, musicVolumeAtom, sfxTriggerAtom, sfxVolumeAtom, isMusicPausedAtom } from "../stores";

export function initAudioSystem(k, theme) {
    const loadPromises = [];

    // --- AUDIO LOADING ---
    const loadSoundSafe = (id, relativePath) => {
        const fullPath = resolvePath(relativePath);
        return new Promise((resolve) => {
            k.loadSound(id, fullPath).then(resolve).catch(e => {
                console.warn(`[Audio Skipped] ID: ${id}, Path: ${fullPath}`, e);
                resolve();
            });
        });
    };

    // 1. SFX
    loadPromises.push(loadSoundSafe("flip", "audio/flip.mp3"));
    loadPromises.push(loadSoundSafe("match", "audio/match.mp3"));

    if (theme.audio && theme.audio.sfx) {
        for (const [key, filename] of Object.entries(theme.audio.sfx)) {
            loadPromises.push(loadSoundSafe(key, `audio/${filename}`));
        }
    }

    // 2. Playlist (BGM)
    const playlist = theme.audio?.playlist || ["background-music.mp3"];
    playlist.forEach((trackName) => {
        loadPromises.push(loadSoundSafe(trackName, `audio/${trackName}`));
    });

    // --- AUDIO LOGIC ---
    let currentTrackIndex = 0;
    let bgm = null;
    let musicStarted = false;

    function playTrack(index) {
        if (bgm) bgm.stop();
        const trackName = playlist[index];
        try {
            bgm = k.play(trackName, {
                loop: false,
                volume: store.get(musicVolumeAtom)
            });
            bgm.onEnd(() => {
                currentTrackIndex = (currentTrackIndex + 1) % playlist.length;
                playTrack(currentTrackIndex);
            });
        } catch (e) {
            console.warn(`[BGM Error]`, e);
        }
    }

    const tryStartAudio = async () => {
        if (musicStarted) return; 

        const ctx = k.audioCtx;
        if (!ctx) return;

        try {
            if (ctx.state === "suspended") {
                await ctx.resume();
            }

            if (ctx.state === "running") {
                if (playlist.length > 0) {
                    playTrack(currentTrackIndex);
                    musicStarted = true;

                    // Cleanup listeners
                    window.removeEventListener("touchstart", tryStartAudio, { capture: true });
                    window.removeEventListener("click", tryStartAudio, { capture: true });
                    window.removeEventListener("keydown", tryStartAudio, { capture: true });
                }
            }
        } catch (e) {
            console.warn("Audio resume attempt failed", e);
        }
    };

    window.addEventListener("touchstart", tryStartAudio, { capture: true });
    window.addEventListener("click", tryStartAudio, { capture: true });
    window.addEventListener("keydown", tryStartAudio, { capture: true });

    k.onUpdate(() => { if (bgm) bgm.volume = store.get(musicVolumeAtom); });

    store.sub(sfxTriggerAtom, () => {
        const sfx = store.get(sfxTriggerAtom);
        if (sfx && sfx.name) {
            if (!musicStarted) tryStartAudio();

            try {
                k.play(sfx.name, { volume: store.get(sfxVolumeAtom) });
            } catch (e) {
                console.warn("SFX error:", e);
            }
        }
    });

    store.sub(isMusicPausedAtom, () => {
        const isPaused = store.get(isMusicPausedAtom);
        if (bgm) {
            if (isPaused) {
                bgm.paused = true; 
            } else {
                bgm.paused = false;
            }
        }
    });

    return Promise.all(loadPromises);
}
