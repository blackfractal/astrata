# UI Design v2 — working notebook

Jonathan · 2026-10-30

Simplify the information on screen while making spatial play more satisfying. The game already feels crowded on desktop; a phone will magnify that problem. Preserve strategic information, but distinguish what a player needs for the current decision from rules they can inspect when needed.

## Gameplay UI brainstorming — not implemented

These are ideas to explore, not settled designs or completed changes. The goal is a less cluttered, more intuitive, and more fun experience.

### Principles to test

- Show state visually before explaining it with sentences. Use persistent numbers and clear state changes for the information needed now; put rules in inspection and contextual help.
- Make the next legal action and its consequence obvious without pulsing everything simultaneously.
- Favor one selection and one contextual action area over repeating full controls and long descriptions on every card.
- Preserve the pleasures of placement, elemental chains and defense traversal. Simplification must make their relationships easier to see, not hide the information needed to plan them.
- Avoid relying on hover for information a touchscreen player needs. A tap/hold inspection interaction must have a clear, reliable equivalent.

### Candidate experiments

1. Compare a compact card face with the four-corner system used in Archives against the current battle cards. Decide which values must remain visible when a card is small, and which appear only when selected.
2. Try a single selected-card inspector, with art, full rules and actions, instead of text and controls repeated over the entire grid.
3. Separate persistent resource state, selected-action costs and damage previews visually. Keep the element matchup and defense origin visible during targeting.
4. Test how much side-panel content can collapse during battle without obscuring equipment, pending attacks or enemy intentions.
5. Prototype a dense S3/S4 board at landscape phone size. Test selecting a particular card, inspecting a Corruption underneath it, choosing an Ideon target and routing a multi-hit defense. Consider temporary zoom or a larger inspection view before reducing the grid or changing game rules.
6. Audit persistent explanatory copy screen by screen. Keep tutorial instruction and short labels; remove prose that merely narrates the interface.

### Questions for a future design session

- Which information should a selected card show first: damage/Guard, remaining uses or activation choices?
- Can connection effects communicate synergy without making a full grid visually noisy?
- Which gestures remain comfortable on a phone, and which need explicit buttons?
- Does enlarging the active decision area help more than making every element smaller?
- What should the UI teach through interaction, and what still needs a tutorial?

Keep the working Electron desktop shell and shared game rules. Mobile layout and a mobile shell are separate concerns; this notebook does not authorize a rewrite. Make a small working interaction prototype before choosing a broad redesign. Gameplay UI implementation should begin on a separate branch based on main after the completed title-screen and Archives changes are committed.
