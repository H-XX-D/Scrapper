# Compass contacts

The previous compass supplied one rotating route arrow in a fixed slot. The new bearing tape keeps the original industrial bezel, heading and route-distance readout while showing moving pixel markers:

- Blue diamonds: current objective, active puzzle devices and outstanding recovery terminals.
- Yellow diamonds: available weapon cases, loose supplies and discovered secrets.
- Red ticks: living creatures and hostile players. Cooperative teammates are excluded.

The current objective retains one slot. The remaining nineteen slots go to the closest eligible contacts by three-dimensional distance. The cap applies to all contact types together. The current objective has a pale diamond center. A top or bottom edge indicates another deck; rear contacts sit at the appropriate tape edge with a small turn cue. Nearby bearings use three small vertical lanes inside the bezel.

Blue and yellow markers use the next walkable waypoint on their own route, including corridor turns, gates, stairs and lifts. Red ticks use the enemy's actual bearing. Turning updates positions every frame. Routing refreshes at most every quarter second while stationary and immediately on a changed player cell, deck, target set or gate state. A shared route tree uses the same collision and elevation rules as the existing pathfinder, avoiding a separate breadth-first search for every diamond.

Dead enemies, taken or delayed pickups, opened cases, sealed armory cases and undiscovered secret contents do not appear. New chapter setup and save/network state use the existing navigation and mission state; no marker state is stored or transmitted. Each multiplayer client computes its own contacts. Room protocol 4 is unchanged, so v5 and v6 clients remain compatible.

Five new tests cover bearing sides and rear cues; filtering and discovered-secret gating; the twenty-contact cap and enemy replacement; shared-versus-individual paths across all twelve layered chapters with open and closed gates; and waypoint selection, immediate rotation and replanning. The complete suite passes 70 tests. Browser checks verify all four cardinal headings, desktop and 760×480 bezel bounds, exact-file enemy/loot removal and local multiplayer bearings. These are bounded integration checks, not a full campaign balance playthrough or cross-network soak.
