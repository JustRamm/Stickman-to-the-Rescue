# 🆘 Stickman to the Rescue

**A serious game simulator teaching the QPR (Question, Persuade, Refer) method for suicide prevention.**

> *Be the bridge to help. Learn to identify warning signs, ask the difficult questions, and connect people to professional care.*

![Project Status](https://img.shields.io/badge/Status-Active_Development-green)
![Tech Stack](https://img.shields.io/badge/Tech-React_Vite_Tailwind-blue)

## 📖 About The Project

**Stickman to the Rescue** is an interactive, narrative-driven educational game designed to train users in the **QPR Gatekeeper Training** method. Through role-playing scenarios with distressed characters, players learn to:

1.  **Question:** Recognize warning signs and ask directly about suicide.
2.  **Persuade:** Listen with empathy and persuade the person to seek help.
3.  **Refer:** Connect the person to appropriate resources.

The game features dynamic dialogue choices, trust mechanics, multiple mini-games, and an immersive soundscape. It has been culturally adapted with **Indian mental health resources** (e.g., KIRAN, DISHA Kerala).

## ✨ Key Features

*   **Interactive Narrative:** Branching dialogue paths where your choices affect the "Trust Meter" and the mission outcome.
*   **"Observation Mode":** Explore environments to find physical clues (e.g., eviction notices, failing grades) that unlock deeper empathetic dialogue options.
*   **Mini-Games Suite:**
    *   **🧠 Fact vs. Myth:** A Tinder-style card sorting game to debunk common suicide myths.
    *   **📡 Signal Scout:** Tune into the right emotional frequencies to identify hidden warning signs in a crowd.
    *   **🛡️ Resource Relay:** A strategy game where you match specific crises (e.g., Debt, Cyberbullying) to the correct helpline or support service.
*   **Dynamic Audio:**
    *   **Text-to-Speech (TTS):** Characters speak with distinct voices and pitches.
    *   **Adaptive Soundscape:** Ambient music and SFX shift based on scene tension and trust levels.
*   **Culturally Relevant:** Features real Indian support resources like **KIRAN Helpline (1800-599-0019)**, **DISHA (1056)**, and **Kudumbashree**.
*   **Mobile Optimized:** Designed for a premium Landscape experience on mobile devices, installable as a PWA.

## 🛠️ Technology Stack

*   **Frontend:** React 18, Vite
*   **Styling:** Tailwind CSS (with custom animations and glassmorphism design)
*   **State Management:** React Hooks (`useState`, `useEffect`) and LocalStorage for persistence
*   **Audio:** Custom `SoundEngine` class using Web Audio API & Web Speech API
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

4.  **Open in browser**

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
