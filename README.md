<div align="center">

# ○△□ Squid Obby

**A free 3D jump & run obby fan game in your browser.** Blocky Roblox-style characters, a glass bridge, spinning bars and five levels. Works on desktop, iPad and phones.

### [▶ Play now](https://designowpro-debug.github.io/squid-obby/)

![Gameplay](assets/gameplay.gif)

[![Play now](https://img.shields.io/badge/%E2%96%B6%20Play%20now-in%20your%20browser-1ec95a?style=for-the-badge)](https://designowpro-debug.github.io/squid-obby/)
![Three.js](https://img.shields.io/badge/three.js-r159-black?style=for-the-badge&logo=three.js)
![License: MIT](https://img.shields.io/badge/license-MIT-blue?style=for-the-badge)

English · [中文說明](#中文說明)

</div>

## Features
- 🎮 **5 obby levels**: Hopscotch Stones → Glass Bridge → Dalgona Jumps → Marble Spin → Final Showdown
- 🧍 **3 characters** with different stats and abilities (double jump, sprint, or hard mode)
- ❤️ **HP system**: spinning bars cost HP instead of knocking you off. Grab floating hearts to heal.
- 🚩 **Checkpoints** in every level (3–4 in the harder ones). Kid-friendly difficulty.
- 🪟 **Glass bridge**: one panel per row breaks, and safe panels you've found stay revealed
- 📱 **Touch controls**: virtual joystick, Jump/Dash buttons, drag to look. No scrolling or zooming, works in portrait and landscape.
- 🌐 **English / 中文** toggle (remembered; or use `?lang=en` / `?lang=zh`)
- ⏱ Total time and death counter on the win screen
- 📦 **One self-contained HTML file** with Three.js bundled in. Works offline, no build step.

## Controls
| | Desktop | iPad / phone |
|---|---|---|
| Move | WASD / arrow keys | Joystick (bottom-left) |
| Jump | Space (press again in the air = double jump for Bacon Hair) | **Jump** button |
| Sprint | Hold Shift (Crispy Kara) | Hold **Dash** button (Crispy Kara) |
| Camera | Drag the mouse, scroll to zoom | Drag anywhere on the screen |

## Characters
| | Speed | Jump | Ability |
|---|---|---|---|
| **Noob** | ★☆☆☆☆ | ★☆☆☆☆ | None: hard mode |
| **Bacon Hair** | ★★★☆☆ | ★★★★★ | Double jump |
| **Crispy Kara** | ★★★★★ | ★★★☆☆ | Sprint with a stamina bar |

## Levels
1. **Hopscotch Stones**: numbered squares and stepping stones over water (beginner)
2. **Glass Bridge**: 12 rows, two panels each, only one is tempered glass. Checkpoint halfway.
3. **Dalgona Jumps**: moving platforms, spinning discs, slow rotating bars
4. **Marble Spin**: spinning marble discs and a three-bar walkway
5. **Final Showdown**: rotating cross bar, more bar walkways, piggy bank of prize money at the goal

## Tech
- [three.js](https://threejs.org/) r159, inlined into a single `index.html` (~700 KB)
- Custom lightweight physics (AABB and disc platforms, moving and spinning platforms, rotating bars)
- WebAudio synth sound effects, no audio files
- Hosted on GitHub Pages. `src/game.html` is the source without three.js, and `src/test*.js` are the headless Chrome (Playwright) tests.

Run locally: open `index.html`, or `python3 -m http.server` and visit `http://localhost:8000`.
Debug URL params: `?level=1..5`, `&char=noob|bacon|kara`, `&lang=en|zh`.

## Disclaimer
This is an **unofficial, fan-made game**. It is not affiliated with, endorsed by, or connected to Netflix, the *Squid Game* series, or Roblox Corporation. All game code and art here are original.

## License
[MIT](LICENSE)

---

## 中文說明

**魷魚闖關 Squid Obby**：Roblox 風格的 3D 跳躍闖關粉絲自製小遊戲，打開瀏覽器就能玩，支援電腦、iPad 與手機。

▶️ 線上遊玩：https://designowpro-debug.github.io/squid-obby/

- **五道關卡**：跳格子踏石 → 玻璃橋 → 椪糖跳台 → 彈珠迴旋 → 最終決戰
- **三位角色**：菜鳥（無能力、困難模式）、培根頭（高跳＋二段跳）、小咔啦（跑得快＋衝刺）
- **生命值**：被旋轉橫桿打到 -20（不會被撞飛），生命歸零或掉下去都會回到檢查點並回滿血。檢查點附近的 ❤️ 可 +30。
- **操作**：電腦用 WASD／方向鍵移動、空白鍵跳、Shift 衝刺、滑鼠拖曳轉視角。平板用左下搖桿、「跳」「衝」按鈕、拖曳畫面轉視角。
- **語言**：右上角 🌐 可切換 English／中文（預設英文，會記住選擇）

本作為非官方粉絲自製遊戲，與 Netflix、《魷魚遊戲》或 Roblox 無任何關聯。
