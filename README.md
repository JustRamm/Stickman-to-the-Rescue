<div align="center">

<img src="./public/logo.svg" alt="Stickman to the Rescue Logo" width="200"/>

# Stickman to the Rescue

**A serious game simulator teaching the QPR (Question, Persuade, Refer) method for suicide prevention.**

> *Be the bridge to help. Learn to identify warning signs, ask the difficult questions, and connect people to professional care.*

![Project Status](https://img.shields.io/badge/Status-Active_Development-green)
![Tech Stack](https://img.shields.io/badge/Tech-React_Vite_Tailwind-blue)
![License](https://img.shields.io/badge/License-MIT-yellow)

</div>

---

## About The Project

**Stickman to the Rescue** is an interactive, narrative-driven educational game designed to train users in the **QPR Gatekeeper Training** method. Through role-playing scenarios with distressed characters, players learn to:

<div align="center">
<table>
<tr>
<td align="center" width="33%">
<img src="./public/stickman_assets/thinking_stickman.svg" width="80"/><br/>
<b>Question</b><br/>
Recognize warning signs and ask directly about suicide
</td>
<td align="center" width="33%">
<img src="./public/stickman_assets/stickman_hands.svg" width="80"/><br/>
<b>Persuade</b><br/>
Listen with empathy and persuade the person to seek help
</td>
<td align="center" width="33%">
<img src="./public/stickman_assets/shield_stickman.svg" width="80"/><br/>
<b>Refer</b><br/>
Connect the person to appropriate resources
</td>
</tr>
</table>
</div>

The game features dynamic dialogue choices, trust mechanics, multiple mini-games, and an immersive soundscape. It has been culturally adapted with **Indian mental health resources** (e.g., KIRAN, DISHA Kerala).

---

## Key Features

### Interactive Narrative
Branching dialogue paths where your choices affect the "Trust Meter" and the mission outcome.

### Observation Mode
Explore environments to find physical clues (e.g., eviction notices, failing grades) that unlock deeper empathetic dialogue options.

### Mini-Games Suite

<div align="center">
<table>
<tr>
<td align="center" width="33%">
<img src="./public/stickman_assets/scholar_stickman.svg" width="60"/><br/>
<b>Fact vs. Myth</b><br/>
A Tinder-style card sorting game to debunk common suicide myths
</td>
<td align="center" width="33%">
<img src="./public/stickman_assets/scout_stickman.svg" width="60"/><br/>
<b>Signal Scout</b><br/>
Identify hidden warning signs in a crowd
</td>
<td align="center" width="33%">
<img src="./public/stickman_assets/catch_stickman.svg" width="60"/><br/>
<b>Resource Relay</b><br/>
Match specific crises to the correct helpline or support service
</td>
</tr>
<tr>
<td align="center" width="33%">
<img src="./public/stickman_assets/hope_stickman.svg" width="60"/><br/>
<b>Words of Hope</b><br/>
Learn empowering language vs stigmatizing phrases
</td>
<td align="center" width="33%">
<img src="./public/stickman_assets/stickman_laptop.svg" width="60"/><br/>
<b>Interactive Scenarios</b><br/>
Practice real conversations with AI-driven NPCs
</td>
<td align="center" width="33%">
<img src="./public/stickman_assets/group_hug.svg" width="60"/><br/>
<b>Resolution Cutscenes</b><br/>
See the impact of your choices
</td>
</tr>
</table>
</div>

### Dynamic Audio
- **Text-to-Speech (TTS):** Characters speak with distinct voices and pitches
- **Adaptive Soundscape:** Ambient music and SFX shift based on scene tension and trust levels

### Culturally Relevant
Features real Indian support resources:
- **KIRAN Helpline:** 1800-599-0019
- **DISHA Kerala:** 1056
- **Kudumbashree** and other local resources

### Mobile Optimized
Designed for a premium Landscape experience on mobile devices, installable as a PWA.

---

## Technology Stack

<div align="center">

| Category | Technologies |
|----------|-------------|
| **Frontend** | React 18, Vite |
| **Styling** | Tailwind CSS (custom animations, glassmorphism) |
| **State Management** | React Hooks, LocalStorage |
| **Audio** | Web Audio API, Web Speech API |
| **Authentication** | Supabase Auth (Email + Google OAuth) |
| **PWA** | Service Worker, Web App Manifest |

</div>

---

## Authentication

The application uses **Supabase** for secure user authentication with support for:

- ✅ **Email/Password Authentication** with email verification
- ✅ **Google OAuth** for one-click sign-in
- ✅ **Password Reset** functionality
- ✅ **Session Management** with automatic token refresh
- ✅ **Secure Storage** with PKCE flow

### Setup Instructions

1. **Email Authentication** is ready to use out of the box
2. **Google OAuth** requires additional setup - see [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) for detailed instructions
3. All authentication flows include proper error handling and user feedback

For complete setup instructions and troubleshooting, see:
- [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) - Detailed setup guide
- [IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md) - Technical implementation details

</div>

---

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/JustRamm/Stickman-to-the-Rescue.git
   cd Stickman-to-the-Rescue
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run the development server**
   ```bash
   npm run dev
   ```

4. **Build for production**
   ```bash
   npm run build
   ```

5. **Preview production build**
   ```bash
   npm run preview
   ```

---

## Game Features

### Enhanced Gameplay Mechanics

**Streak System**
- Track consecutive correct catches in mini-games
- Visual feedback with fire indicators
- Best streak tracking per session

**Progressive Difficulty**
- Dynamic speed increases based on performance
- Adaptive challenge that rewards skill improvement

**Explanation Mode**
- Toggle real-time tips during gameplay
- Learn why each choice matters
- Educational tooltips on game elements

**Word History Glossary**
- Review all encountered word pairs
- Comprehensive explanations
- Track your learning progress

**Visual Trail Effects**
- Color-coded glowing trails on game elements
- Green for positive/correct choices
- Red for negative/incorrect choices

**Skip Previously Seen Dialogue**
- Fast-forward through familiar content
- Keyboard shortcuts (Space/Enter)
- Persistent tracking across sessions

---

## Mobile Experience

<div align="center">
<img src="./public/stickman_assets/stickman_phone.svg" width="100"/>
</div>

This game is optimized for **Landscape Mode**.

- **Install to Home Screen:** Use your browser's "Add to Home Screen" feature for a full-screen app experience
- **Haptics:** Enjoy tactile vibrations on mobile during card games and key interactions
- **Touch Controls:** Intuitive joystick and tap controls for mobile gameplay

---

## Project Structure

```
qpr/
├── public/
│   ├── logo.svg                    # Main logo
│   ├── thumbnail.svg               # Social media thumbnail
│   ├── stickman_assets/            # Character SVGs
│   ├── ThemeAudio/                 # Background music
│   └── manifest.json               # PWA manifest
├── src/
│   ├── components/                 # Reusable components
│   ├── pages/                      # Game screens
│   ├── data/                       # Game data (scenarios, resources)
│   ├── utils/                      # Helper functions
│   └── App.jsx                     # Main app component
└── README.md
```

---

## Contributing

<div align="center">
<img src="./public/stickman_assets/stickman_group.svg" width="120"/>
</div>

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## Acknowledgments

<div align="center">
<img src="./public/stickman_assets/happy_stickman.svg" width="80"/>
</div>

- **QPR Institute** for the foundational training methodology
- **KIRAN Helpline** and **DISHA Kerala** for mental health support resources
- **Mental health professionals** who provided guidance and feedback
- **Open source community** for the amazing tools and libraries

---

## Contact & Support

**Project Link:** [https://github.com/JustRamm/Stickman-to-the-Rescue](https://github.com/JustRamm/Stickman-to-the-Rescue)

**Mental Health Resources:**
- **KIRAN (India):** 1800-599-0019
- **DISHA (Kerala):** 1056
- **International Association for Suicide Prevention:** [https://www.iasp.info/resources/Crisis_Centres/](https://www.iasp.info/resources/Crisis_Centres/)

---

<div align="center">

**Made with care for mental health awareness**

<img src="./public/stickman_assets/hope_stickman.svg" width="60"/>

*Be the bridge to help*

</div>
