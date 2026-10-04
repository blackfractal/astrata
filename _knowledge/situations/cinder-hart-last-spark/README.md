# Cinder Hart: The Last Spark

Jonathan's winning run, seed **62551554**, run ID **53c326bc-5296-4bfc-a9b2-7f3e05f4af48**. Played with package **1.3.88**, rules **1.3.47**, content **1.1.53** at the preserved battle positions. Cinder Hart is immune to Burn and Poison. The full run crossed earlier versions; its original archive retains those transitions.

Jonathan won on turn 8 with **4 HP**, without upgraded cards. This position is useful because the visible hand suggests a need for a lucky draw, while the existing board supports another finishing line.

## Play without spoilers

Double-click one of these launchers and click **Continue**:

- **Open final turn.cmd** — 4 HP, Burn 7, Hart 27 HP; turn 8 Placement. Prompt: **Find a winning line this turn. Explain what each action contributes.**
- **Open Stampede defense.cmd** — 10 HP, Burn 8, Hart 27 HP; turn 7 enemy phase, first 11-Earth Stampede hit pending. Prompt: **Choose a defense sequence for the two hits and evaluate whether you can survive the next turn start.**
- **Open full fight.cmd** — 30 HP, Hart 153 HP, opening enemy Antler pending. Prompt: **Win from this battle checkpoint. Plan resource development, recalls and protection against Wildfire.**

All three are exact states from the final successful attempt, not simplified training fixtures. The final-turn hand still contains its real cards. Do not inspect the snapshot JSON while assessing a player; it contains the hidden deck order.

[Solution and assessment notes — spoilers](solutions/README.md)

## Records

- `manifest.json`: versions, checksums, source event indices, seed and entry points.
- `snapshots/`: unmodified gameplay states extracted from the original run.
- `archive/`: complete original compressed run trace, metadata and result.
- `solutions/jonathan-replay.json`: actual winning decisions from the battle-start entry through rewards.
- `verification.json`: deterministic replay and isolated UI checks.
- `screenshots/`: preserved views of the three entry points.

The launcher only supplies omitted empty log/history arrays and fresh practice-session UI metadata. It does not alter HP, resources, RNG, draw order, enemies or card state. Each launch creates a new profile; the original snapshots and real profile remain untouched.

