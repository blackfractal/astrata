# Title screen and Archives — 4.0.41

2026-10-30 · requested by Jonathan · implemented on main, not committed or pushed.

The title screen now uses “Your mind is the battlefield.” and omits the old introductory eyebrow and version/controls footer. Controls help lives in Settings. The complete menu fits with both Continue and Resume tutorial available.

Archives opens directly to Cards. Cards, Enemies, Equipment, Achievements and Run History form the top navigation above the page heading. Collections support search, discovery visibility and expandable filters. Card art uses consistent Focus, Channel, Uses and Recall corners, with full rules on inspection. The character filter is ready for multiple characters but omitted while Druid is the only choice. Equipment uses its actual categories and effects rather than an invented rarity.

Patient Spoolkeeper and Borrowed Oracle appear once each. Known tutorial/encounter variants remain available in Oracle details; seeing a tutorial never reveals the regular encounter's data. Legacy encounter-name discovery now distinguishes the normal and tutorial Oracle. Unknown entries cannot be identified by facet filtering. The three demoted S2 boss achievements are retired from the screen, with earned records preserved. Run History still shows only the latest 20 while saving all runs.

## Validation

- All **812 automated tests passed**; archive-specific tests cover discovery privacy, duplicate grouping, hybrid roles, dynamic costs, legacy identity and retained achievement records.
- `node tools/archives-ui-smoke.mjs --packaged` passed against the packaged renderer in isolated headless Edge: title, Settings controls, all five tabs, compound filters/reset/search, unknown cards, card and equipment details, Oracle variants, retired achievements and 20-run limit.
- Screenshots inspected at 1600×900 and 1280×720. No horizontal overflow, renderer errors or broken visible card art. Gallery images load lazily. Title verified with both save options.
- The Electron/Playwright launcher encountered a protocol assertion, so visual testing used the existing project's Edge approach against packaged HTML/CSS/JS. No desktop-shell behavior changed.
- Git diff checked; branch is main. User save, history and live profile were not modified. No gameplay or balance changes. Package/content version 4.0.41; rules remain 4.0.40.

Broader battle/mobile UI work remains in [_plans/ui_design_v2.md](../_plans/ui_design_v2.md), pending a later branch and design discussion. Approximate additional time: 35 minutes, including planning, implementation, verification and packaging.
