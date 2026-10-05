# Stratum 2 planning — The Unfinished Loom

Implementation baseline 0.9 · 2026-10-04 · Jonathan / Codex

Companion to [the main design](astrata_design.md), especially §§1.4 and11.5. Jonathan authorized implementation and repository consolidation on 2026-10-04. Main design §10.12 now records the selected playable v2 rules; the earlier proposals below remain useful rationale, not competing requirements. Main-design rules take precedence. No hidden lore is exposed by the current Sapling introduction.


**Current 2.1.4 implementation supersedes the earlier proposals below.** See main design §10.12.1 for exact cycles/timing. The Black Bile (230HP/Earth), King Bombadier (240HP/Fire), and The Trickster (220HP/Chaos) are now Archons. Seamstress/Censer/Borrowed Choir are Eidolons at110/120/100HP, two less damage per hit. Bile moves without a trail and spends one activation on arrival; all Mind Mines use one-response-turn20Fire bombs; Bombadier adds Holes and an8Fire/10Water/12Wind sequence; Trickster shifts complete rows/columns two spaces with lethal Hole and immediate Hypnosis collisions, and chooses Anti-elemental against the largest elemental Guard total. Machine Elves place anywhere, have three uses and Mend self/NESW-adjacent spaces. Ordinary repairs are immediate; Hole/Hypnosis take two turns, one upgraded. Return to discard after the final successful repair. These rules replace the old one-use/placement-only/upgrade-access proposals, including the earlier stated Hole restriction. Art, tutorial, tooltips, replay sources and focused regressions are part of this delivery.

## Implementation decisions

The Unfinished Loom now has eight normal Motes, six Eidolons and three spatial Archons, plus tutorial opponents. The current rules and move cycles are specified in main design §10.12.1 and the update above. The revised Mending Ground teaches Nausea, Anger and covering, then two-turn Memory Hole repairs with basic three-use Elves and an upgrade hint. Its independent Patient Spoolkeeper rotates five Corruptions with fixed single7Arcane attacks; see main design10.12.2. Anger forces the weakest eligible NESW card to activate without optional Attunement for1Channel; covering suppresses it. Earlier one-use and upgrade-access proposals below are historical design rationale, not current requirements.

## What is confirmed

**Current pressure tuning (2.0.9):** All normal Stratum2 damaging moves receive +1 damage per hit, including Eidolons and bosses; tutorial damage is unchanged. Sourcap Tender, Loop Moth, Borrowed Face and Censer Engine mark an opening Corruption before the first player turn and apply it with their first regular attack. If enemies attack first on arrival, they still attack immediately but defer that Corruption until the player has had one response turn. Other Corruptors mark multiple spaces while attacking, then apply while attacking. Nausea and other empty-space warnings prioritize adjacency to the most cards. Hollow Scribe is deliberately exceptional: fourteen scattered Memory Holes, one third of the 7×6 grid; fourteen active at most, replacing repaired holes on later cycles. Detailed cycles are recorded in main design §10.12. Non-Corrupting enemies retain some relief turns, and the tutorial opponents remain gentle. Each Corruption has its own painted space-card art and localized animation, including falling crater particles and queasy green Nausea swirls; covered effects remain identifiable without obscuring the player's card.

- Each Stratum introduces a specific Ally through a brief illustrated story.
- Stratum1's Ally depends on the chosen character. Druid meets Sapling; this is the existing starting card, not an extra copy. Other characters' companions are not chosen yet.
- Every character meets the **Machine Elves** after the end-of-Stratum-1 Lantern Rest. Grant the card only on **Enter the Unfinished Loom**, after the introduction and just before the first Stratum2 map; it is not in the Tavern Grimoire.
- Stratum2 introduces new Motes, Eidolons and Archons and centers on understanding and managing **Corruptions**.
- Machine Elves repair Corruptions. Upgrades allow them to repair more difficult kinds.
- The player spends Focus to place them on the actual corrupted space, then activates them; repair takes an extra turn.
- They have one activation. Successful repair automatically returns them to the discard pile.
- They are vulnerable Allies. Losing them matters; ordinary Ally death means Destroyed until the next battle.
- Corruptions belong to spaces and persist beneath covers. The existing7×6 Mind Grid remains the starting point.
- A challenge achievement requires retaining Machine Elves continuously in the owned deck from Stratum2 through Stratum4 victory, never placing or activating them. Corruption encounters must support that route.

## The journey and companions

**Working Stratum name: The Unfinished Loom.** Beyond the Weald, roots thread through arches of dark metal. Streams pass through broken channels and emerge in impossible places. Small figures repair seams in bark, stone and empty air. The place feels repeatedly mended and repeatedly damaged. “Machine” should mean intricate living craftsmanship, not a sudden science-fiction factory.

The story introduces a relationship before explaining a function. Show the full Ally art, a short passage, then a single Continue action. Tutorial teaching follows the encounter rather than interrupting its first sentence. A companion joins the Grimoire once; the story must not duplicate it on Continue, replay or loading a save. Do not secretly make companions immortal or exempt them from normal Ally rules.

**Druid / Sapling — current opening copy**

> At the forest’s edge, a sapling lifts its roots from the earth and falls into step beside you. It pauses when you pause. When you turn toward the darker trees, it shakes the dew from its leaves and follows. You make room in your grimoire. Neither of you has to enter the Weald alone.

Familiar still belongs to the starting deck. The featured Stratum companion is not a rule that removes other Allies.

**Machine Elves — proposed encounter copy**

> The path ends at a tear in the ground. Three small figures kneel beside it, passing a silver thread through places your eyes cannot follow. One pulls; the far bank draws close.
>
> They pack their needles when they see you. The smallest points at your grimoire, then at the damaged path ahead. You open the book. They climb inside.

Keep their purposes local and concrete. They need not explain what Astrata really is. Their tools, impatience and care can tell the story without explanatory lore speeches. Later Strata can introduce further companions; their identities and mechanics remain open.

## Machine Elves: proposed playable contract

Treat the plural group as **one Ally card**, one space and one HP pool. Working values: Arcane,1Focus placement,4HP, one1Channel activation named **Mend**. No ordinary attack is proposed: the value is repair plus optional interception. These are tuning suggestions, not confirmed costs/stats beyond needing Focus and a single activation.

The intended sequence:

1. Draw the card normally.
2. During Placement, spend Focus to put it directly on an eligible Corruption. Preview the Corruption, repair difficulty and completion time.
3. During Activation, use Mend once. Show a persistent progress symbol on both the card and its space.
4. Keep the Elves alive while the enemy acts.
5. On successful completion, remove that Corruption and automatically move the Elves to discard. Normal seeded draw/recycling can bring them back.

**Timing awaiting confirmation:** recommended completion is the beginning of the next player turn, before that turn's uncovered-Corruption ticks. The spent allowance refreshes when they return through discard; they still only activate once per placement. This is a proposed explicit exception to spent non-recallable Allies, not an extra activation hidden in the repair.

The delay is the main cost. The player commits Focus, Channel, a draw and a vulnerable card before getting a cleared space. Do not also add an arbitrary cooldown after successful repair unless playtests demonstrate a problem.

**Consequences and interactions proposed for the first implementation**

| Situation | Proposed resolution / reason |
| --- | --- |
| Killed before completion | No repair. Elves enter Destroyed; the Corruption remains. Show that the repair failed. |
| Battle ends during repair | End-of-battle cleanup restores the Ally normally. No repair carries to the next battle. |
| Placed but not activated | They cover the hazard where covering normally works, but do not repair it. |
| Stack placed over the Elves | Disallow stacking onto them while repairing. Progress should not continue invisibly beneath a stack. |
| Moved off the target | Cancel repair; no activation refund. Corruption stays on its space. A preview must warn of this. |
| Frozen before activation | Cannot start Mend. |
| Frozen during repair | Proposed: delay completion until unfrozen, rather than silently cancel. Show “repair paused.” |
| Severed | No effect on their own-space repair; this is not adjacency. |
| Locked | Does not prevent Mend, consistent with existing activation rules. |
| Recall | Ordinary no-Recall Ally rule applies. Success is an explicit automatic return. |
| Intercepts an attack | Uses HP and positional eligibility normally; surviving allows repair to finish. |
| Corruption removed by another effect first | Return safely to discard at the scheduled completion; do not award a second removal. |
| Another Corruption is placed there | Recommended v1 of Stratum2: at most one Corruption per space, no replacement while repairing. |
| Successful return | Next placement starts at printed/upgraded HP, with one use, under normal recycled-card reset rules. No player HP healing. |
| Extra activation effects | Do not give additional Mend uses or instant repairs. One successful repair per placement. |

**Upgrade proposal:** base repairs Nausea and Insanity; one upgrade adds advanced repair of Memory Hole, Mind Mine and Hypnosis. Prefer one clear upgrade first over a hidden hierarchy of many grades. Show compatibility on both the Elf card and inspected Corruption. Make the upgrade reliably available before advanced hazards become common, but keep cover/avoid/kill solutions viable without it.

**Memory Hole question:** its current rule forbids all placement. The proposed upgraded exception must explicitly permit Machine Elves to be placed there; normal cards still cannot. Do not quietly bypass the restriction with generic placement code.

**Hypnosis question:** repaired-space placement alone cannot work if Hypnosis commandeers the repairer. Proposed upgraded Elves resist Hypnosis on their own space while repairing. This exception needs visible text. It should not protect surrounding cards or grant immunity to normal attacks.

Mind Mine keeps ticking during repair. The UI must predict which resolves first; if it detonates in the enemy round before Mend completes, it destroys the covering Elves and prevents repair. No hidden timing advantage. Mine fuse remains three actual player response turns.

## Corruption teaching and encounter budget

A space-status layer must remain visible under artwork, with an icon, name, severity and any progress/fuse. Telegraph committed affected spaces one full player turn ahead; once committed, moving cards must not secretly redirect the hazard. State whether covering suppresses it. Clicking a space shows the hazard and any covering stack separately.

Start with **Nausea**, then **Insanity**. Memory Hole should first be a rare, clearly marked pressure on usable space; Mind Mine and Hypnosis belong to later specialist encounters. Introduce one new rule per teaching fight, not five new hazards in the opening battle.

Proposed guardrails for initial testing:

- Early Motes maintain at most one active Corruption each. Begin with one corrupting enemy per encounter.
- Ordinary mixed encounters should normally add no more than one new Corruption every two enemy rounds.
- Eidolons can maintain two; Archons can escalate to three or four with explicit breathing turns.
- Count already committed hazards against those limits. At the cap, use a listed fallback attack; never retarget or overwrite silently.
- Do not fill an opening board with permanent holes. Pressure should create a decision, not require an unavailable card from the draw pile.
- A7×6 board offers many avoidable spaces, but repair costs compete with default1Focus. Tune hazard pressure against placement economy and the deck entering Stratum2, including its guaranteed Stratum1 legendary.
- Repair must sometimes be worth postponing. Finishing a fight can be better than spending a turn mending a harmless corner.
- Each encounter needs a viable line if the Machine Elves are drawn late or killed. Deckbuilding counters improve options; they should not be a mandatory draw check.

## Challenge achievement: Without the Menders

Working title; the confirmed condition is **win one complete four-Stratum run with Machine Elves continuously retained in the owned deck from their Stratum2 grant through Stratum4 victory, never placed or activated**. This is not a Stratum2-only challenge and does not require hidden Stratum5. It is not currently a prerequisite for unlocking Stratum5.

Jonathan clarified that keeping the companion is part of the challenge. Drawing it, ordinary discarding/recycling and upgrading it are allowed; it need not remain in the draw pile. Removing, sacrificing, trading away or otherwise losing the companion disqualifies the run, even if another copy is acquired later. Placing or activating any copy also disqualifies it, including upgraded/duplicated copies and automatic play. Placing them only to suppress a hazard or intercept damage still counts. Other Allies, repairs and Corruption responses are allowed. Survive the full Stratum4 victory resolution to earn it. Tutorials and partial runs do not qualify.

Track the original Stratum2 companion's continuous ownership and persistent disqualification for removal or placement/activation, with action evidence across saves and Strata. A failed repair, later destruction or reacquisition cannot restore eligibility. The final deck alone is insufficient evidence. Do not retroactively award from incomplete old logs. Tutorial use must not contaminate a separate normal run. The future implementation must reconcile any battle-restart feature explicitly so reloads cannot erase recorded disqualification in the same run.

Design implication: every required encounter must be winnable without the Elves. This should reward careful covering, spacing, sacrifice and killing priorities, not require a single substitute cleanse card or one lucky draw. Include an explicit no-Elves route in each Archon playtest and in eventual seeded AI balance comparisons. Do not make the normal route harder merely to inflate this achievement's rarity.

## Mote candidates

All values are first-pass discussion values before Restlessness/scaling, not approved balance. “Mark” announces a space now; its Corruption is applied on the following enemy turn. Damage and a corruption are not automatically bundled on the same move. Most cycles include at least one non-damaging turn.

| Enemy / element | Proposed cycle | What it teaches |
| --- | --- | --- |
| **Sourcap Tender / Earth** | Spore Puff5Earth → mark Nausea → place Nausea → Rake7Earth; repeat while respecting one-hazard cap. | Cover a harmful space now, or spend longer repairing it. First corruption opponent. |
| **Loop Moth / Wind** | Flutter6Wind → mark Insanity → place Insanity → Still Wings (no attack). | Reset escalating harm by covering it; use a quiet turn to begin repair. |
| **Frayed Hound / Fire** | Snap5Fire twice → Sniff (next turn−1Focus) → Lunge9Fire. | Straightforward pressure beside a hazard specialist; no new Corruption rule. |
| **Dew Thief / Water** | Siphon6Water → gain6Guard → Hesitate (no attack). | A readable elemental opponent that gives the player a repair window. |
| **Thread Mite / Arcane** | Nibble4Arcane → Rattle (next turn−1Channel) → Rest. Later packs of2, never debut as a large swarm. | Channel competition without constant incoming damage. |
| **Hollow Scribe / Light** | Mark a peripheral empty space → inscribe Memory Hole → Scratch8Light → Blot (no attack). One Hole cap. | Distinguish permanent lost space from a suppressible hazard. Later Mote only. |
| **Bellows Grub / Fire** | Inhale (Tell next strike) → Exhale10Fire → Deflate (no attack). | Plan interception and protect a4HP repairer during a clearly timed hit. |
| **Loose Echo / Chaos** | Echo7Chaos → repeat last attack element for7 → Forget (no attack). | Elemental defense adaptation while spatial rules remain familiar. Exact element rule requires a clear Tell. |

Early pool: Sourcap, Loop Moth, Dew Thief and Thread Mite. Introduce Hollow Scribe after the player has learned ordinary repair. Avoid pairing two Focus/Channel-denial enemies early. Distinct artwork and silhouettes are required eventually; no reused Act1 enemy images in a shipped Stratum2.

## Eidolon candidates

**The Spoolkeeper — Nausea and placement economy.** Arcane. Cycle: Needle8 → mark two separated Nauseas → apply them → Tighten6×2 → Rewind (no attack). Cap two. It tests whether the player can keep a useful cluster functioning rather than repairing every space. The targets should threaten useful adjacency but not both invalidate the same only legal placement.

**The Borrowed Face — Insanity and endurance.** Water. Cycle: mark Insanity → apply it → Reflection9Water → Recall a Voice (gain8Guard, no attack) → Reflection9Water. Cap two, next mark only after a full cycle. It punishes abandoning an escalating uncovered space, but offers time to cover or repair.

**The Quiet Surveyor — holes and planned formations.** Earth. Cycle: Survey (commit one empty space) → Memory Hole → Measure7Earth×2 → Recalculate (no attack). Cap two. Mark a useful empty gap beside existing cards using a visible deterministic score; never select the player's occupied card and imply it is being destroyed. Losing a desired formation is the problem; immediate card destruction is not.

Elite fights should test a learned concept under pressure. Their rewards may offer repair-support tools, but the ability to progress cannot depend on winning the very fight those tools are needed to survive.

## Three possible Archons

These are concepts for a three-boss pool, not a requirement that the player fights all three.

### The Seamstress of Absence — preserve or replace a formation

An elegant figure sewing blank patches into the environment; proposed Light element.

Cycle: Stitch8Light×2 → mark one Nausea and one empty-space Memory Hole → place them → Unravel12Light → Measure (gain10Guard, no attack). Cap three persistent Corruptions. At cap, marking becomes a clearly announced8Light fallback.

The challenge is deciding which formation is worth saving. Do not make destruction universal or invalidate all adjacency cards. The Machine Elves recover a valuable space, while the player can also build elsewhere.

### The Censer Engine — repair under a fuse

A crawling shrine with a furnace breathing through living wood; proposed Fire element.

Cycle: Stoke9Fire → mark Mind Mine → plant Mine with three player response turns → Vent6Fire×2 → Cool (no attack). Cap two Mines, one new Mine per cycle. Start discussion damage for an uncovered explosion:18Arcane; covered detonation destroys its covering top card under the existing design concept. Exact stack semantics must be settled before building.

Covering and sacrificing a cheap card is a valid response. Advanced Machine Elves can save the space and card only if placed and activated early enough to finish. Never require a newly drawn repairer on the last fuse turn.

### The Choir of Borrowed Hands — your own strength turned against you

A ring of empty gloves following a conductor made of thread; proposed Chaos element.

Cycle: Beckon8Chaos → mark one occupied space for Hypnosis → apply Hypnosis → Cut the Thread10Chaos → Release (remove its Hypnosis, no attack). Only one active Hypnosis in the first implementation.

Mark a card with a useful attack or Guard effect, show exactly what it will do on the enemy turn, and allow a full response turn before the first forced effect. Recall, sacrifice, selective activation/placement or advanced repair are possible answers. Do not ship until the hard cases below have precise rules.

**Hypnosis scope proposal:** initially target only direct-damage or Guard effects; one forced effect per enemy turn. Exclude summons, heals, resource generation, repairers and unimplemented utility effects. Define whether ordinary activation allowance is spent (recommend yes), whether multi-target attacks become one hit to the player, and how charge cards work before expanding target eligibility. “Activates for the enemy” alone is too underspecified for fair play.

All Archons retain the existing one-turn disruptive telegraphs and explicit status/Purify rules unless later approved otherwise. Do not assume Act1 boss escalation formulas apply to every new hazard's damage or timer.

## Other player tools worth exploring

These are candidate designs, not approved additions.

- **Waymarker:** an inexpensive temporary cover, good against Nausea/Insanity but unable to repair or block a Memory Hole.
- **Threadguard:** an Ally that gains a modest defensive benefit beside a repairing Ally, giving formations a new purpose.
- **Careful Stitch:** move an eligible card without moving its space status, giving a route around a hazard; exact costs and Locked handling remain open.
- **Surveyor's Lantern:** preview more precise corruption information, never a tax for understanding the basic Tell.
- **Mending Kit:** a future consumable that accelerates an already-started repair. Do not introduce until the ordinary repair loop is balanced.

Avoid a generic cheap “remove all Corruptions” card. It would erase the Stratum's positioning decisions. Avoid requiring upgraded Elves for every fight; upgrade should create options rather than a hidden entry fee.

## Stratum2 tutorial outline

1. Meet the Machine Elves through the story. Grant exactly one copy for every class.
2. Show a clearly telegraphed Nausea. Demonstrate a nearby card's reduced live value.
3. Cover it with an ordinary card; show suppression without removal. Expose it again so the icon's persistence is unmistakable.
4. Place Elves on it, spend their only activation, then visibly wait through the enemy turn. Protect them using the established right-to-left interception rules.
5. Repair finishes, the space clears, and the Elves travel visibly into discard. Explain that death would instead send them to Destroyed for the battle.
6. Recycle and draw them again to demonstrate the difference between one activation per placement and one repair for the entire battle.
7. Introduce Insanity, covering/reset, and the choice to postpone repair.
8. Show an advanced Corruption and the upgrade requirement without trapping the player. Teach the chosen Memory Hole exception explicitly if approved.
9. End with an easy independent Eidolon; hints after inactivity as in Stratum1.

Actual starting hand, draw order, HP, enemy attacks, repair timing and rewards must be authored deterministically. Stratum2 tutorial unlocks only with Stratum2; keep it absent from the current v1 menu.

## Decisions to settle and measurements to collect

Two specific questions have been sent to Jonathan: exact completion timing and upgraded placement into Memory Hole. Until answered, the recommendations above are proposals.

Before implementation, settle HP/Focus/Channel values; eligible Corruptions per upgrade; interruption and covered repair; Hypnosis targeting/allowance rules; Mine stack casualties; Corruption stacking, rounding and tick order. Record chosen builder defaults when implementing rather than treating this draft's enemy numbers as approved.

Record Corruption creation/marks by space and owner, covering/uncovering, actual losses caused, repair start/completion/interruption, Elf upgrade/deaths/redraws, decision times, and build versions. Compare at least: early/late/no Elf draw, upgraded/unupgraded Elves, death mid-repair, default1Focus versus developed Focus, large versus small decks, and each Archon.

The useful balance question is not only win rate. Measure how often players had multiple reasonable responses, how often a repair was wasted, and whether loss resulted from a visible choice or an unavoidable draw/timing trap.


### 2.1.1 follow-up — one-turn bombs and clearer Corruptions

Main design4.150 supersedes older timing notes: every newly placed Mind Mine gives one player turn before detonation; all uncovered mines deal20 Fire. From the fifth bombardment, three bombs; after four Black Bile cycles, two fresh globs when none can spread (one spreading move remains). Telegraph both glob targets and all bomb targets. Nausea swirls extend over affected cards; Bile flows over its space/card; remove tiny Bile/half-power labels and trailing Corruption-warning arrows. Covered/uncovered mine explosions visibly precede card destruction or the Fire defense-chain attack. Existing saved mine fuses/types remain intact.
