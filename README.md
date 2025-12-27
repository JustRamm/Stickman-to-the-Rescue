# 🆘 Stickman to the Rescue

**A serious game simulator teaching the QPR (Question, Persuade, Refer) method for suicide prevention.**

> *Be the bridge to help. Learn to identify warning signs, ask the difficult questions, and connect people to professional care.*

![Project Status](https://img.shields.io/badge/Status-Active_Development-green)
![Tech Stack](https://img.shields.io/badge/Tech-React_Vite_Tailwind-blue)

## 📖 About The Project

**Stickman to the Rescue** is an interactive, narrative-driven educational game designed to train users in the **QPR Gatekeeper Training** method. Through role-playing scenarios with a distressed stickman character ("Sam"), players learn to:

1.  **Question:** Recognize warning signs and ask directly about suicide.
2.  **Persuade:** Listen with empathy and persuade the person to seek help.
3.  **Refer:** Connect the person to appropriate resources.

The game features dynamic dialogue choices, trust mechanics, a "Myth vs. Fact" sorting mini-game, and an immersive soundscape.

## ✨ Key Features

*   **Interactive Narrative:** Branching dialogue paths where your choices affect "Sam's" trust level and the mission outcome.
*   **"Observation Mode":** Explore 3D-style environments to find physical clues (e.g., unopened mail, pill bottles) that unlock new dialogue options.
*   **Mini-Games:**
    *   **Myth vs. Fact:** A Tinder-style card sorting game to debunk common suicide myths. (Mobile-optimized with swipe gestures & haptics!)
*   **Dynamic Audio:** Ambient soundscapes that shift based on scene tension and trust levels.
*   **Resource Wallet:** Collect real-world resource cards (Hotlines, Support Groups) to use during the "Refer" phase.
*   **Mobile PWA:** Installable as a native-like app on iOS and Android with offline support.

## 🛠️ Technology Stack

*   **Frontend:** React 18, Vite
*   **Styling:** Tailwind CSS (with custom animations and glassmorphism design)
*   **State Management:** React Hooks (`useState`, `useEffect`, `useRef`)
*   **Audio:** Custom `SoundEngine` class using Web Audio API
*   **PWA:** Service Worker & Web App Manifest for offline installation

## 🚀 Getting Started

### Prerequisites

*   Node.js (v14 or higher)
*   npm or yarn

### Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/JustRamm/Stickman-to-the-Rescue.git
    cd Stickman-to-the-Rescue
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Run the development server**
    ```bash
    npm run dev
    ```

4.  **Open in browser** (usually at `http://localhost:5173`)

## 📱 Mobile Experience

This game is optimized for **Landscape Mode**.
*   **Install to Home Screen:** Use your browser's "Add to Home Screen" feature for a full-screen app experience.
*   **Haptics:** Enjoy tactile vibrations on mobile during card games and key interactions.

## 🤝 Contribution

Contributions are welcome! Please feel free to submit a Pull Request.

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---
*Created with ❤️ for mental health awareness.*
