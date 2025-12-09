# 🕹️ RPG Developer Portfolio Template

A **data-driven 2D RPG portfolio engine** built with **React**, **Kaplay.js**, and **Jotai**.

Turn your resume into an interactive game world.
The template is fully modular: logic is decoupled from content, which is supplied through JSON configuration files.

---

## 🚀 Live Demo

**https://verosedai.github.io/portfolio-gamified/**

---

## ⚡ Key Features

### **Hybrid Architecture**

Combines **Kaplay.js** for high-performance 2D rendering with **React** for UI overlays such as modals and HUD elements.

### **Data-Driven Layout**

World elements (portals, positions, interactions) are generated dynamically from `layoutData.json`.
No hardcoded coordinates.

### **Dynamic Theme Engine**

Runtime injection of CSS variables and GLSL shader uniforms through `theme.json`.
Includes configurable **background music** and **sound effects**.

### **Custom Avatar System**

Supports:

* **4-direction** sprite sheets
* **8-direction** advanced sprite sheets

Configured entirely through `playerData.json`.

### **Mobile Optimized**

Touch-to-move controls, virtual D-pad, and fully responsive UI.

### **Asset Management**

Sprites, audio, textures, and more are loaded dynamically from JSON manifests.

---

## 🛠️ Tech Stack

### **Core**

* React 18
* Kaplay.js
* Vite

### **State**

* Jotai
* JSON configuration files

---

## 🚀 Quick Start

```bash
# 1. Clone the repository
git clone https://github.com/your-username/rpg-portfolio-template.git
cd rpg-portfolio-template

# 2. Install dependencies
npm install

# 3. Run development server
npm run dev
```

---

## ⚙️ Configuration Guide

All configuration files live in `public/configs/`.

| File                     | Description                                                 |
| ------------------------ | ----------------------------------------------------------- |
| **aboutData.json**       | Personal info: Name, Bio, Stats, Education, Certifications. |
| **layoutData.json**      | World entities: portals, icons, types, coordinates.         |
| **theme.json**           | Colors, shaders/images, music playlist, SFX.                |
| **playerData.json**      | Player sprite configuration, sliceX/Y, animations, speed.   |
| **skillsData.json**      | Skills and icons used in the Memory Game modal.             |
| **projectsData.json**    | Project list for the Gallery modal.                         |
| **experiencesData.json** | Work experience entries.                                    |
| **socialsData.json**     | Social links.                                               |

---

## 🎨 Theming & Audio (`theme.json`)

```json
{
  "colors": {
    "background": "#0b0c15",
    "primary": "#2de2e6",
    "text": "#ffffff"
  },
  "background": {
    "type": "shader", //or image
    "asset": "tiledPattern"
  },
  "audio": {
    "enabled": true,
    "playlist": ["background-music.mp3"],
    "sfx": { "flip": "flip.mp3", "match": "match.mp3" }
  }
}
```

---

## 👾 Player Sprite Customization (`playerData.json`)

### **Option A: Simple (4-Direction)**

```json
{
  "sprite": "hero_simple",
  "directions": 4,
  "sliceX": 3,
  "sliceY": 4,
  "anims": {
    "idle": 0,
    "walk-down": { "from": 0, "to": 2, "loop": true },
    "walk-right": { "from": 3, "to": 5, "loop": true },
    "walk-up": { "from": 6, "to": 8, "loop": true }
  }
}
```

### **Option B: Pro (8-Direction)**

```json
{
  "sprite": "hero_complex",
  "directions": 8,
  "sliceX": 4,
  "sliceY": 8,
  "anims": {
    "walk-down": { "from": 0, "to": 3, "loop": true },
    "walk-right-down": { "from": 28, "to": 31, "loop": true }
  }
}
```

---

## 📂 Folder Structure

```
├── public/
│   ├── configs/        # JSON data layer
│   ├── logos/
│   ├── projects/
│   ├── sprites/
│   ├── audio/
│   └── fonts/
├── src/
│   ├── components/     # Kaplay.js game objects
│   ├── entities/       # Player logic & movement
│   ├── reactComponents/ # React UI
│   ├── initGame.js     # Game initialization
│   └── store.js        # Jotai state
└── ...
```

---

## 🎮 Controls

| Platform    | Move          | Interact                  |
| ----------- | ------------- | ------------------------- |
| **Desktop** | Point & Click | Walk into portals         |
| **Mobile**  | Tap to move   | Auto-trigger on collision |

---

## 🤝 Contributing

1. Fork the project
2. Create a feature branch
3. Commit your changes
4. Push your branch
5. Open a pull request

---

## 📝 Credits

* Player asset: Modified version of *8-Directional Gameboy Character*
* Sound effects: u_y3wk5ympz8, Shiden Beats Music, Maksym Malko (Pixabay)
* Inspiration: JSLegendDev

---
