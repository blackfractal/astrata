# Palimpsest replacement draw

Version 4.0.16; design 4.237. Jonathan approved adding: **When drawn, draw 1 additional card.** Placement remains 1 Focus; Meld still reduces the Construct's Recall cost by 1, minimum zero. Destruction can still erase that investment.

Reveal, Insight Dew and Inspiration consumables now use the same actual-draw routine. Palimpsests chain through each other, recycle Discard only after Draw is exhausted, and terminate when neither pile has cards. Extra cards count toward cards actually revealed (including Thought Bulwark) and use the existing reveal presentation. Inspiration's free play applies only to its original selected card, not the replacement draw.

Melding, Undertow returns, and loading an already drawn card do not trigger the effect. Existing saves remain compatible; there are no retroactive extra draws on Continue. Player saves were not edited.

Validation: 735 rules tests pass, including six new tests covering Reveal chains, exhaustion/recycling, consumables, drawn Hex state, Inspiration scope, Undertow and save compatibility. See `palimpsest-draw-tests.txt` and the focused test output. Packaged UI and archive verification results are recorded separately alongside this report.

The packaged UI harness could not attach: two attempts failed inside Playwright's Chromium session handler (`CRSession._onMessage`, assertion at coreBundle.js:35014). No visual pass is claimed. The regression tests exercise the actual shared engine and consumable paths; the existing reveal renderer receives all replacement card IDs. The isolated UI harness is retained for reproduction. This is a tooling limitation, not evidence of a renderer failure.

This change implements the approved draw benefit only. No other card costs, enemy values or gameplay balances were changed.
