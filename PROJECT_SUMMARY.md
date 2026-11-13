# Dev Graveyard 🪦

## Overview
**Dev Graveyard** is a social platform and cathartic resting place for abandoned developer projects. It serves as a digital cemetery where developers can lay their unfinished, failed, or sunsetted applications to rest, sharing the lessons learned along the way. Rather than letting abandoned code rot on a hard drive, developers can commemorate their efforts, connect with others, and learn from the collective failures of the community.

## Theme & UI Design
The application embraces a **dark, gothic, and spooky aesthetic** with a premium, modern execution, recently expanded to include dynamic themed pages.
- **Color Palette:** Deep, immersive darks (`zinc-950`, `zinc-900`, `black`) contrasted with striking accents like neon crimson (`#df3636`) for an eerie, ambient glow.
- **Typography:** 
  - *Sans-serif* for bold, impactful headings.
  - *Monospace* for technical metadata, tags, and small labels (evoking a terminal/coding feel).
  - *Serif Italic* for the "Lessons Learned" and atmospheric subheadings, giving them an engraved, memorial quality.
- **Visuals & Interactions:**
  - **Grave Cards:** Projects are represented as tombstones. Interacting with them brings up a "Soul Container", revealing the project's details in a glassmorphism card with ambient light effects.
  - **Avatars:** High-quality, pixel-art SVG avatars (skulls, ghosts, reapers, demons) reinforce the theme while maintaining a distinct, indie-developer identity.
  - **Thematic Pages:** Highly interactive pages such as the **Collaborations** page feature a custom hanging Spiderman animation interacting with dynamic web threads and rotating UI cards.

## Core Features & Pages

### 1. Bury a Project (Graves)
Users can "bury" their projects by providing:
- **Project Name:** The title of the abandoned project.
- **Cause of Death:** Standardized reasons such as *Lack of Time*, *Loss of Interest*, *Technical Roadblocks*, *Market Fit Missing*, *Scope Creep*, or *Co-founder Conflict*.
- **Tech Stack:** The languages and tools used.
- **Lived For:** The lifespan of the project.
- **Lesson Learned:** The most important takeaway from the project's demise.
- **Anonymous Posting:** Users can optionally bury a project completely anonymously.

### 2. Confessions 🤫
A dedicated space for developers to admit their darkest coding secrets:
- Post anonymous confessions regarding bad coding practices, deleted production databases, or imposter syndrome.
- Features thematic blood-red ambient glows, dripping visuals, and stark typography to match the "confessional" vibe.

### 3. Collaborations 🕸️
*Where dead projects meet new allies.*
- **Current & Upcoming:** A dynamic board showing active and future collaborations between developers.
- **Spiderman Theme:** Features an interactive, suspended Spiderman animation swinging from an anchor point on a web. The Spiderman holds a dynamically swinging foreground card that reacts to hover interactions.

### 4. Chats 💬
- A real-time direct messaging system for developers to communicate, plan revivals of dead projects, or discuss shared technical hurdles.
- Seamlessly integrated with the platform's custom friend system.

### 5. Leaderboard 🏆
- Tracks the most active developers and the most recognized projects.
- Ranks users based on their "graveyard footprint" and community interactions.

### 6. Social & Memorial Interactions
- **Press 'F' to Pay Respects:** A gamified interaction where users can pay their respects to dead projects, incrementing the grave's "RIP" counter.
- **Eulogies:** Users can leave comments (eulogies) on graves, offering condolences, shared experiences, or thoughts on the tech stack.
- **Grave Sharing:** Users can securely share specific graves with their friends or generate dynamic "Share Cards" with syntax-highlighted snippets for social media.

### 7. Community & Networking
- **Friends System:** Users can search for others via unique `@usernames`, send friend requests, and build a network of fellow developers.
- **Followers & Following:** Track connections within the graveyard.
- **Profiles (Personal Plots):** A dedicated space showing a user's avatar, their network stats, and the grid of projects they've buried.

## Technical Architecture
- **Frontend Framework:** React 18, bootstrapped with Vite.
- **Language:** TypeScript for robust, type-safe development.
- **Styling:** Tailwind CSS (utility-first, responsive, and highly customized for the dark theme).
- **Animations:** `motion/react` (Framer Motion) for fluid layout transitions, modal animations, infinite swings (Spiderman), and interactive feedback.
- **Icons:** `lucide-react` for clean, consistent SVG iconography.
- **Backend/Database:** Firebase Firestore (NoSQL cloud database with secure rules).
- **Authentication:** Firebase Auth (handling user sessions, anonymous modes, and profile management).
