# Scrapper

[Download the playable v8 HTML](https://github.com/H-XX-D/Scrapper/releases/download/v8/Scrapper-Playable-v8.html) · [Release notes](https://github.com/H-XX-D/Scrapper/releases/tag/v8)

First-person salvage and infestation shooter. Current playable export: **exports/Scrapper-Playable-v8.html** (also **exports/Scrapper.html**). Open the HTML in a desktop browser, allow the embedded art to load, and select **DEPLOY SOLO**. Code, art, fonts and audio synthesis are included; solo play works from disk without a server. The file is approximately 232 MiB.

The original title artwork and painted steel HUD remain. Gameplay uses low ceilings, compact branching passages, stairs, automatic lifts, stacked service routes, optional caches and a jumpable maintenance gap. World signs have been removed. Necessary puzzle readouts sit on their equipment, with cyan, pink and lime text inside the original industrial frame.

## Playing

| Action | Input |
| --- | --- |
| Move / aim | WASD / mouse |
| Sprint / jump | Left Shift / Space |
| Fire / reload | Left click / R |
| Use terminal, collect specimen, open case | E |
| Revive a downed co-op teammate | Hold E nearby for three uninterrupted seconds |
| Wipe mixed-color goo in one pass | Q |
| Select an owned weapon | Mouse wheel / 1–7 |
| Communications / station plan | Tab / M |
| Choose an option | Z / X, or the choice buttons |
| Pause | Esc / pause button |

Standard Xbox and PlayStation controllers are supported through the browser Gamepad API. Connect the controller, click the page once if needed for browser audio, and press/release a button to wake detection. You can deploy and play without mouse pointer lock.

| Action | Xbox / PlayStation |
| --- | --- |
| Move / look | Left / right stick |
| Sprint / precise aim | Hold L3 / LT or L2 |
| Fire / reload | RT or R2 / X or Square |
| Jump / wipe | A or Cross / B or Circle |
| Interact / revive | Y or Triangle; hold to revive |
| Previous / next owned weapon | LB or L1 / RB or R1 |
| Comms / station plan | R3 / View or Share |
| Story choices | D-pad left / right |
| Pause / resume | Menu or Options |

In menus, use the D-pad or left stick to move focus, A/Cross to select, B/Circle to go back, and left/right to change values. Right stick scrolls. Selecting the room-code field starts six-character editing: up/down changes a character, left/right moves the cursor, A accepts and B cancels. System file pickers for save import still use the operating system's controls.

**FIELD MANUAL** contains saved look sensitivity, stick dead zone and inverted-look settings. Analog movement scales with stick pressure and diagonal movement stays capped. LT/L2 slows aiming without changing the weapon artwork. Disconnecting the active controller pauses local control; buttons and sticks must return to neutral after resume/reconnection. Online rooms continue simulating while an individual player pauses.

Each chapter has its own route topology, room silhouette and primary recovery puzzle. The repeated two-coupler opening is gone from new missions. Twelve new mechanics join the four earlier systems (sixteen in total): neighbor fuse circuits, sliding cargo, signal tuning, an interlocked airlock, a cargo crane, signal memory, walking a sensor grid, power sharing, temperature stabilization, species-matched specimen isolation, RGB filtering and timed dispatch shutdown. Pressure, optical, phase-lock and coolant systems are secondary puzzles in selected chapters. Restore the chapter system, recover access and the archive, decide how to route power, defeat the guardian and extract. Chapters 1, 5 and 9 retain the extra relay sequence; the other chapters restore that circuit through their own puzzles.

Blue objective diamonds, yellow supply/discovered-secret diamonds, and red enemy ticks move along the original compass bezel as you turn. The current objective retains one slot; the remaining slots show the closest contacts by three-dimensional distance, up to twenty total. Blue and yellow diamonds point toward the next reachable passage on their own route; red ticks point toward the enemy. Dead enemies, taken pickups, opened cases, sealed armory cases and undiscovered secret contents are excluded. Markers beyond the forward half-circle sit at the appropriate edge with a small turn cue. A tiny top/bottom edge indicates another deck. Route distance remains inside the bezel. Guidance updates from the player's current cell and deck, aims at a reachable passage or room connection, and handles stairs, waiting for lifts, boarding, riding and exiting. It traces collision-safe movement before skipping a waypoint. The twelve-map overview is in **artifacts/chapter-layouts-v3.svg**.

Guns come from supply cases. Each of the seven weapons has its own ammunition, reload animation and sound. Scrap is score; enemies can drop scrap, health and ammo. Nests, feeding growth and fabrication vents spawn reinforcements, rupture into a final brood and leave husks. The opening solo contract contains 93 placed enemies and 38 spawners; later contracts introduce more of the original roster.

Four new wall parasite families use 32 growth, pulse and husk frames. Colonies mature over about 28 seconds and spread to nearby panels when left alive, capped at 96 patches per chapter. Fire destroys them faster; cleared patches remain dead. The opening contract starts with 58 wall colonies. Growth never adds a collision barrier to mission routes. Flame streams now use three animated fire puffs per shot with warm moving lights. Alien shockwaves have upright pixel crests, and acid impacts leave short-lived damaging pools. Both cast sustained colored light on the architecture. The new flame/area sheet contains another 32 frames.

The station now adds **341–377 industrial props per chapter** at the default campaign seed. Twenty-eight prop types include animated pumps, control panels, life-support tanks, cycling trash compactors, steam vents, valve manifolds, open electrical cabinets and air filters. Original fans, radar and machinery remain in use. Sixteen smaller objects add cable reels, oxygen bottles, tools, service carts, ladders, bins, spare filters, scrap and litter. Chapter themes favor different equipment; 183–216 placements are in passages and service routes, with the rest distributed through rooms.

Four new pixel sheets supply 64 frames and objects. Vents emit intermittent pixel steam; cabinets throw occasional sparks; compactors cycle their press and release dust. Nearby pumps, airflow, vents and compactors have spatial sounds on the quieter world bus. Machine phases are seeded and follow mission time, including saves and room synchronization. Equipment stays within the low ceilings; floor collision is indexed by nearby cells and leaves the compass paths clear. If an older save places the player inside newly installed equipment, loading moves the player just clear of that footprint on the same floor.

The Q wipe now uses the **actual original four-pose glove sheet**, `assets/legacy/visor-wipe.png`, unchanged. The prior v4 build still used the later eight-frame sheet. The gun lowers fully, one hand makes a single right-to-left sweep, and the gun returns with its support grip. Existing mixed-color blood is masked onto the contact poses; there is no shake or smear pass.

## Campaign and saves

Twelve expanded contracts follow Rook from an ordinary salvage job into the Brood, Choir and Splice outbreaks. New case files develop the omitted Dock Nine crew list, Iona Vale’s ignored recall, the shared carrier product, the falsified inspections and Rook’s recovery lien. Echo, Flint and EOS have distinct roles in the investigation and repair effort. Recovered evidence unlocks in the existing RECOVERY JOURNAL; each research/power decision adds its consequence. Later intros remember prior research decisions, and the closing report reflects the research balance, maintenance routes and key records actually recovered. Discoveries, completed puzzles, secrets and guardian aftermath advance the communication panel. Field logs queue without replacing unfinished messages; decisions interrupt and then resume the current log. History and pending messages survive saves and synchronize to the crew. Archive and power decisions affect the current route, the next contract and the campaign ending. The recovery journal on the title screen contains the longer chapter context and acquired case evidence. Purging before recovering the control ledger is recorded honestly in the case history.

Three solo save slots preserve position, equipment, ammunition, score, enemies, nests, wall-growth stages and husks, opened cases, puzzles, choices and campaign progress. Autosaves occur on progress and at intervals; **SAVE RECOVERY** is also available while paused. **CONTINUE RECOVERY** loads a slot. Export/import a JSON save to move it between browsers or HTML versions. Browser saves belong to the browser profile and file/site origin. Older v2 saves retain their current map and puzzle state; the next chapter uses v3. Start a new deployment to test a revised chapter immediately.

## Online rooms

Choose the salvager in **FIELD MANUAL**, then open **ASSEMBLE CREW**. Select a mode, **HOST ROOM**, share the six-character code, and **DEPLOY CREW** after friends join. The host assigns up to four different salvagers: Rook, Echo, Flint and EOS. Your preferred salvager is kept when available; otherwise the next unused character is assigned. The large share code and COPY CODE button appear in the crew lobby and pause menu. Each has weapon-specific pixel sprites with sixteen facing slots and two to four walking poses. Your own view remains first person with matching sleeves, gloves and fingertips, including all reload poses and the original single-pass wipe. Weapon crystals, missiles and fuel panels retain their own colors. Co-op deployment places teammates on separate walkable spots ahead of the host; host and guest movement both animate.

- **CO-OP RECOVERY:** shared mission, no friendly fire, enemy populations and spawned broods multiplied by crew count; hold E to revive. Four players begin the first contract with 372 enemies.
- **FREE-FOR-ALL:** no monsters or campaign objectives. Find weapons, score 20 frags or lead after ten minutes. Death triggers a short respawn.
- **RIVAL RECOVERY:** hostile salvagers and infestation share a mission. The first salvager to complete the recovery and extract wins; scrap and frag scores appear in the result.

V5 through v8 share room protocol 4. Use v8 on every device for the rendering and suit fixes, and host on v8 for unique character assignment; each player computes compass markers from their own position. Earlier protocol versions are rejected. Online rooms require internet access and a network that permits WebRTC peer connections. The host runs the simulation and must keep the game open. There is no host migration or joining a mission already underway; guests can join the next deployment. The room service handles discovery; no account or hosted game installation is required.

## Development and verification

Use Node.js 22 or newer. From a fresh clone:

```sh
npm ci
npm start
```

Open http://localhost:4186. To build the standalone HTML and run all checks, including the exported file:

```sh
npm run check
npm run export
npm test
```

The generated HTML files are distributed through GitHub Releases and excluded from Git history. All source art needed to rebuild them is included. The existing third-party notices are in `vendor/THREE-LICENSE`, `vendor/PEERJS-LICENSE`, and the font license files under `assets`.

`npm start` serves the source at **http://localhost:4186**. **atlas.html** previews exact runtime crops for enemies, effects, weapons, crew, puzzles and environment sheets. `npm run check` checks all source modules; `npm test` runs gameplay, audio, traversal, network-input, save, sprite-metadata and standalone-export tests. `npm run export` rebuilds both current HTML files. The original checkpoint remains separately available.

The v5 checks pass 65 tests, including twelve chapter profiles across ten seeds each; real player movement following the compass through every chapter and overhead route; all sixteen puzzle rules; save round trips; and export embedding. Browser interaction checks complete every chapter's puzzle sequence, using verification teleports between devices (not a full human playthrough). The v3 browser checks verified the prior puzzle state, objective, destroyed wall growth and illuminated area attacks in a two-browser co-op room. V4 adds separate evidence for its exact file, saves, equipment and room synchronization in **artifacts/final-verification-v4.json**. Earlier v2 four-player/FFA/Rival Recovery, revive and damage checks remain recorded separately; no new four-player network soak or full campaign balance pass is claimed.

The earlier five station checks cover deterministic placement without consuming combat RNG, 24 populated chapter layouts (two seeds each), 24 actual compass-guided walks through installed equipment, new audio sample quality, and older saves intersecting new equipment. An additional browser alpha audit checked every one of the 64 station frames: no empty frames or clipped source edges, with a minimum two-pixel source margin before runtime padding.

The legacy combat burst sheet had effects reaching across its grid cuts. **assets/generated/combat-bursts-v3.png** replaces those sixteen frames with complete shapes and empty margins; burst materials no longer write depth. A browser alpha audit checked 240 growth, flame, explosion, attack, gore and visor-splatter frames, including the source boundary inside runtime padding, with zero empty/clipped frames. Original source files remain intact.

V5 adds seven focused tests for the original art identity, the single-hand motion, mixed palettes, interrupted communications, twelve case files, branching outcomes and purge order. A live browser audit completes all twelve puzzle sequences and verifies each new completion log, evidence unlock and research consequence. Wipe alpha checks cover 128 pilot/palette/pose variants. V5 evidence is in **artifacts/final-verification-v5.json**; implementation notes are in **docs/story-and-wipe-v5.md**.

V6 adds five compass tests, for 70 passing tests in total. A shared route traversal supplies multiple objective markers without a separate breadth-first search per diamond. Checks compare those paths with the existing pathfinder across all twelve chapters, including gates and the overhead deck, then verify the 20-contact cap, heading rotation, filtering and route replanning. Current evidence is in **artifacts/final-verification-v6.json**.

Original images are preserved in **assets/legacy**. New and extended sheets are in **assets/generated**; generation provenance is recorded under **docs**. Cropping, keying, palette mixing and sleeve recoloring happen during runtime import. Screenshots and verification artifacts are in **artifacts**. No tower-defense, dropship or gun-leveling mechanics remain in this first-person build.

V7 adds seven controller tests (77 total) covering analog movement, drift, frame-rate-independent aiming, press edges, neutral rearming, jump transmission buffering and menu repeat. The exact HTML passes browser checks using a simulated standard Gamepad API; the reproducible script is `tests/browser/controller-check.js`. No physical gamepad was connected during verification, so hardware/browser mapping still needs a hands-on playtest. The original title art and in-mission HUD layout are unchanged.

V8 adds six regression tests (83 total) for unique host-assigned characters, separated floor-checked crew deployment, directional walk animation and disconnected glove/wipe recoloring. Four browser clients joined the live room service with the same requested character and received four different salvagers. Screenshots verify teammate rendering from host and guest views, with recovery after a deliberately detached sprite. Validation and limits are recorded in **artifacts/final-verification-v8.json** and **docs/crew-and-suits-v8.md**.
