# Apex first-Archon movement pause

Version 4.0.37; design 4.258; S4 planning draft 0.18.

After the first Archon victory on an Apex floor, every enemy skips the immediate movement and the player receives a full movement turn. This applies on every round, replacing the round-eight-only exception. The round, spawns, Restlessness and loot values do not advance during this additional opportunity. Ending the movement resumes ordinary enemy behavior, including the surviving Archon's normal deadline. Voluntary encounters consume the opportunity; they and Continue cannot refresh it.

The existing second-Archon rule is retained: resolve the entire encounter and rewards, then ascend without cleanup movement. Leaving map enemies behind prevents I Stand Alone.

Verification: 25 Apex/reward tests pass, including all three floors, rounds 4–8, pending and active save/load, frozen Mote/Eidolon positions, voluntary encounters, pause expiry, paired rewards and forced ascent. No live save edits or automatic fight rewind. Jonathan's current save already begins the Bellows Grub / Loose Echo encounter; this update does not undo it.
