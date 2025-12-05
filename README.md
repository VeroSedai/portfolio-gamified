# 🕹️ RPG Portfolio Template

**A data-driven, 2D RPG portfolio engine built with React, Kaplay.js, and Jotai.**

Turn your resume into an interactive game world. Designed as a generic template: logic is decoupled from content, allowing full customization via JSON configuration files.

**🚀 Live Demo:** [Insert Link Here]

## ⚡ Key Features

* **Hybrid Architecture:** React handles accessible UI overlays (Modals), while Kaplay.js handles the game loop, physics, and rendering.
* **Data-Driven Layout:** The game world (portals, positions, interactions) is generated dynamically from `layoutData.json`. No hardcoded coordinates.
* **Dynamic Theme Engine:** Runtime injection of CSS variables and GLSL shader uniforms via `theme.json`.
* **Asset Management:** Dynamic loading of sprites, audio, and textures based on JSON manifests.
* **Mobile Optimized:** Touch controls integration and responsive UI/HUD.

## 🛠️ Tech Stack

* **Core:** React 18, [Kaplay.js](https://kaplayjs.com/) (Game Engine)
* **State Management:** [Jotai](https://jotai.org/) (Atomic state, bridges Game <-> UI)
* **Build Tool:** Vite
* **Styling:** Native CSS Variables & Flexbox

## 🚀 Quick Start

```bash

npm install

npm run dev
````

## ⚙️ Configuration

All configuration files are located in `public/configs/`. No code changes required for standard customization.

| File | Description |
| :--- | :--- |
| **`generalData.json`** | Personal info (Name, Bio, Stats, Education, Certs). |
| **`layoutData.json`** | Defines game world entities (Portal positions, Icons, Types). |
| **`theme.json`** | Global styling (Colors, Background Shader/Image) and Audio Playlist. |
| **`playerData.json`** | Player sprite sheet config (Slice X/Y, Anims) and speed. |
| **`skillsData.json`** | List of skills/logos for the Memory Game modal. |
| **`projectsData.json`** | List of projects for the Gallery modal. |

### Example: Changing the Theme

Modify `public/configs/theme.json`:

```json
{
  "colors": {
    "background": "#0b0c15",
    "primary": "#2de2e6",
    "text": "#ffffff"
  },
  "background": {
    "type": "shader", // or "image"
    "asset": "tiledPattern"
  }
}
```

## 📂 Architecture Overview

```text
public/configs/      # JSON Data Layer
src/
├── components/      # Kaplay Game Objects (Portals, Icons logic)
├── entities/        # Player Controller & Physics
├── reactComponents/ # React UI Layer (Modals, HUD)
├── initGame.js      # Game Bootstrapper & Asset Loader
└── store.js         # Shared State (Jotai Atoms)
```

## 🤝 Contributing

PRs are welcome. Please open an issue for major changes.

## Credits

Player character asset is a slightly modified version of the asset hosted here :  https://gibbongl.itch.io/8-directional-gameboy-character-template
Sound Effect by u_y3wk5ympz8, Shiden Beats Music and Maksym Malko from Pixabay
Project inspired by JSLegendDev https://github.com/JSLegendDev