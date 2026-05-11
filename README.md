# 🌿 Kuralneri: The Kural Guru

**Kuralneri** is a sophisticated, private, and graceful interface for the *Thirukkural*. More than a digital library, it serves as an **Autonomous Moral Guide (Guru)**—an offline AI companion that interprets 2,000-year-old Tamil wisdom to navigate modern life’s complexities.

**[Explore the Vision]()** • **[Design Language]()** • **[Technical Stack]()** • **[Roadmap]()**

---

## 👁️ Product Vision

To provide a sanctuary for contemplation. Kuralneri bridges the gap between ancient antiquity and the 21st century by utilizing **Local RAG (Retrieval-Augmented Generation)** to ensure every insight provided by the AI is anchored strictly in the 1,330 couplets of the *Thirukkural*.

### Key Pillars:

* **The Guru Chat:** A dignified, non-hallucinatory AI interpreter.
* **Zero-Friction Privacy:** No accounts, no tracking, no cloud.
* **Digital Sovereignty:** You own your data; you govern your storage.
* **Modern Antiquity:** A UI that feels like physical parchment meets modern glass.

---

## 🎨 Aesthetic: "Midnight Forest"

The UI avoids the "loud" distractions of modern social media. It is designed for deep reading and low eye strain.

### Color Palettes

| Element | **Forest Floor (Light)** | **Midnight Moss (Dark)** |
| --- | --- | --- |
| **Primary Background** | `#DAD7CD` (Dust Grey) | `#1B2621` (Midnight Moss) |
| **Secondary Surface** | `#A3B18A` (Dry Sage) | `#26362E` (Deep Jungle) |
| **Primary Text** | `#344E41` (Pine Teal) | `#DAD7CD` (Dust Grey) |
| **Accent/Action** | `#588157` (Fern) | `#A39171` (Gold Leaf) |

**Typography:**

* **Tamil:** *Mukta Malar* (Variable weight for anti-glow in dark mode).
* **English/Modern:** *Inter* (Medium 500 for crisp readability).

---

## 🛠️ Technical Specifications

### AI Inference Pipeline

Kuralneri runs a high-performance, completely offline inference engine:

* **Model:** `Gemma 2B IT` (Instruction Tuned), 4-bit INT4 quantization.
* **Framework:** `Mediapipe LLM Inference API` (Flutter) leveraging XNNPACK for NPU/GPU acceleration.
* **Vector Engine:** `ObjectBox Vector Search` for local semantic retrieval.
* **The "Silent Sage" Protocol:** A strict internal prompt architecture that forbids personal opinions, ensuring the Guru remains a vocal mirror of the text.

### Data Architecture

* **Database:** SQLite (FTS5 enabled) for sub-second keyword searching across multiple translations (G.U. Pope, Mu. Va., etc.).
* **Storage Management:** Modular "Shrink-to-Fit" logic allowing users to prune language packs and chat history to reclaim space via `VACUUM` commands.

---

## 📱 Functional Highlights

### 1. The Onboarding (Zero-Data Core)

The app arrives as a 1.5GB "Clean Slate" containing the model. Theological data is injected only upon user consent, respecting network data limits.

### 2. The Guru Chat

* **Query Analysis:** Identifies emotional intent (grief, ambition, anger).
* **The Citation Loop:** Every response must cite Kural IDs, encouraging the user to "Trust-but-Verify" with the source text.
* **The "Burn" Feature:** One-tap purging of session RAM for ultimate privacy.

### 3. The Library

A flat hierarchy (Aram, Porul, Inbam) with a "Modern Scroll" feel. Features include transliteration toggles and "Author Pinning" to customize whose interpretation you trust most.

---

## 🗺️ Future Roadmap

* **Phase 2: Glanceable Wisdom:** Home screen widgets and iOS/Android Live Activities.
* **Phase 3: Oral Tradition:** STT (Speech-to-Text) and "Oduvar-style" TTS (Text-to-Speech) for perfect Tamil meter.
* **Phase 4: The Student's Notebook:** Semantic tagging (e.g., "Leadership," "Stress Management") and personal reflections.
* **Phase 5: The Vault:** Optional E2EE (End-to-End Encrypted) local backups via iCloud/Google Drive.

---

## 🤝 Contribution

This is a solo "Modern Antiquity" project. If you wish to contribute to the UI/UX patterns or the Tamil NLP layers:

1. Fork the repo.
2. Follow the **Forest Floor** design guidelines.
3. Submit a PR with a focus on "Zero-friction" philosophy.

---

> *"To discern the truth in everything, by whomsoever spoken, is wisdom."* — **Kural 423**

---
