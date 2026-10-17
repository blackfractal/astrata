import fs from "node:fs/promises";
import { cards, VERSION } from "../src/content.mjs";
const defs = Object.values(cards).filter((c) => c.expansion === "growth");
const table =
  "| Card | From S | Element / type | Focus | Channel | Uses | Recall | Effect |\n| --- | --- | --- | ---: | ---: | ---: | ---: | --- |\n" +
  defs
    .map(
      (c) =>
        `| ${c.name} | ${c.stratum} | ${c.element} / ${c.type} | ${c.focus} | ${c.effects.placementStrike ? "—" : c.channel} | ${c.limit} | ${c.recall ?? "No"} | ${c.text}${c.ideonText ? " " + c.ideonText : ""} |`,
    )
    .join("\n");
const rules = `### Druid engine expansion — game 4.0.7

Jonathan approved twenty engine/formation cards plus Chaos Fracture. These expand the registry to 84 cards: 79 playable cards and five Hexes. Later-Stratum cards join the cumulative reward/shop pool at their introduction Stratum; probabilities do not change midway through a Stratum. Existing starter exclusions and Tavern guarantees remain. These initial versions have no upgrades; future upgrade designs should be assessed separately rather than silently giving generic damage bonuses to new mechanics.

${table}

**Shared decisions and timing:**

- All these activations obey the ordinary once-per-turn rule. Channel costs of zero, two or three are explicit on the activation control. Formation cards are not Blink. A new card in hand does not implicitly grant resources.
- Borrowed Dawn's projected Insight is the existing next-Reveal resource calculation: current equipment, queued next-turn bonuses/debts, one Memory Acorn bonus if an Acorn is currently in Draw, and Fog currently in Discard. Require at least four before taking the three-Insight debt; previous borrowing counts. Later enemy effects, pile changes or equipment changes may change the projection. The ordinary minimum of one Insight still applies. It is a current-state forecast, not knowledge of future draws.
- Rooted Concentration supplies a separate **Player Guard** pool, Arcane, selectable on the Druid. It is independent of armor, survives destruction of its source, can be declined, and expires at the next player turn. It cannot stop Pierce, Cull or status ticks. Selecting it moves the attack to the player end of the one-way defense path; no returning to grid defenders. Nausea reduces the granted Guard normally. Hypnosis grants that Guard to the enemy and suppresses the resource gain.
- Memory Acorn's Draw bonus snapshots before Reveal. Revealing it does not retroactively reduce that Reveal. Its Destroyed bonus enters recurring Focus at resource refill. Multiple Acorns in the same pile do not stack; the Draw and Destroyed bonuses can coexist. Thought Bulwark counts cards actually revealed, including extra consumable draws, not cards returned to hand by Undertow.
- Ashen Roots snapshots the Destroyed count when activated; its adjacency remains live. Each adjacent direct-damage card receives only the largest active Roots bonus. Sever/Frozen-from-Insanity connections do not count. Bonuses expire next turn. Compost Ward obeys normal depletion and Nausea rules.
- Crosswind Reed/Rootwall require all four orthogonal neighbor spaces to exist. The required pair must contain connected player cards; the other pair must be truly empty, including no Ideon. Full-row/full-column cards count the source itself and spent cards, but not empty spaces, Ideons, or disconnected cards. Starleaf uses diagonal player cards for both its count and Attunement, with ordinary connection restrictions.
- Thornfall is a targeted placement action, not a persistent placed card or activation. Pay its Focus cost (including placement taxes), resolve damage, then put it in Discard. It neither occupies nor overwrites the target space, cannot be melded, and does not trigger activation-only ring attacks. Its Ideon option is hidden in descriptions until S3.
- Season's Turn remembers the element of its previous activation across turns, resetting on fresh placement. Braided Seasons chooses one or two distinct available non-Arcane sources (Arcane only when none exist); each hit receives elemental resolution. The last chosen element becomes its relay. A Transmuted copy uses that fixed element. Each chosen element must satisfy any Refraction-field restriction.
- Forked Current commits a deterministic route after the first target is chosen: advance one column east per hop, with row difference at most one; prefer a route reaching the enemy edge, then most Ideons, then reading order. Choose the final legal main enemy when the route reaches the edge. Share the capped pool evenly, giving leftover points to earlier targets. Preview every target and its allocated damage before confirmation. Guardians protect their owner normally. Predatory Ivy chooses the lowest-current-HP next adjacent Ideon, then reading order, never revisits, and stops unless the preceding target dies.
- Chaos Fracture is not Burn/Poison/Corrode. Only non-Archons can receive it. The next direct card attack activation that hits consumes it, whatever the element; all direct hits from that activation share the extra Chaos weakness. Ring/equipment hits and status ticks neither consume nor benefit. Flicker that negates an activation does not consume it. The extra weakness does not multiply an existing Chaos weakness again. It expires with the target/battle.

**Balance review:** Two fresh-seed automated campaign attempts and paired fixed-build encounter tests across S1–S4 are archived in reports/growth-evaluation. Both campaigns died in S1; they do not establish a whole-campaign win or human difficulty. Later fights use explicitly constructed decks without Grove Titan/Transmute, with 3 Focus/4 Channel at S2, 4/4 at S3, and 5/5 at S4. Increase The Trickster's False face, Dazzle and Anti-elemental from base15 to base18 (21 after S2 pressure scaling). Preserve its rotation, telegraphs and fixed-damage behavior. All other enemy values are retained in this pass: the tests did not justify broad additional buffs. See the build report for results and limitations.
`;
const path = "_plans/astrata_design.md";
let design = await fs.readFile(path, "utf8");
design = design.replace("v4.228", "v4.229");
if (!design.includes("### Druid engine expansion — game 4.0.7"))
  design += "\n\n" + rules;
await fs.writeFile(path, design);
await fs.writeFile(
  "reports/growth-card-reference.md",
  "# Druid engine expansion — card reference\n\nGame " +
    VERSION.rules +
    ". Follows the cumulative Stratum pools.\n\n" +
    table +
    "\n",
);
