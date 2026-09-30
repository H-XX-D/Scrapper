# Scrapper

[Download V12 Fast Load](https://github.com/H-XX-D/Scrapper/releases/download/v12/Scrapper-Fast-Load-v12.zip) · [Standalone HTML](https://github.com/H-XX-D/Scrapper/releases/download/v12/Scrapper-Playable-v12.html) · [Release notes](https://github.com/H-XX-D/Scrapper/releases/tag/v12)

**The current source build is V13; the links above are the published V12 release.** Run `npm run export` to create `exports/Scrapper-Fast-Load-v13.zip`, its extracted folder, and `exports/Scrapper-Playable-v13.html`. V13 uses a browser adaptation of AURA's negotiated state deltas, sends nearby combat separately to each teammate, and caps active monsters at 30 around each player. Overlapping groups share that cap. Co-op no longer multiplies every enemy and brood by crew size, and ordinary pod reinforcements are slower. [Implementation, measurements and verification](docs/aura-multiplayer-v13.md).

First-person salvage and infestation shooter. **Extract the entire Fast Load ZIP, then open `Scrapper-Fast-Load-v12/Scrapper.html`. Keep its `assets` folder beside it.** The launcher is about 1.11 MiB; the complete ZIP is about 185 MiB and includes all art, code, fonts and audio synthesis. Solo play works directly from disk without installation or a server. The title loads first, followed by the selected mission's art before deployment.

For a single-file copy, use `exports/Scrapper-Playable-v12.html` (also `exports/Scrapper.html`), approximately 245 MiB. The [standalone ZIP](https://github.com/H-XX-D/Scrapper/releases/download/v12/Scrapper-Playable-v12.zip) contains that identical HTML. Both export forms use the same game and can join the same V12 room.

The original title artwork and painted steel HUD remain. Gameplay uses low ceilings, compact branching passages, stairs, automatic lifts, stacked service routes, optional caches and a jumpable maintenance gap. World signs have been removed. Necessary puzzle readouts sit on their equipment, with cyan, pink and lime text inside the original industrial frame.

## V12 changes

Loading is split into the original title, current chapter and active crew. Three art files decode at a time; unrelated station themes and absent players' weapon sheets remain on disk. Rooms wait for every player to finish loading before starting the simulation. The portable HTML keeps art in inert payloads; the fast folder uses separately loaded art packages that support direct-file canvas pixel operations. The existing lossless image packing remains: no source pixels or frames are removed.

Rockets, fireballs and Prism pulses have sixteen camera-relative views, including nose-on, exhaust-on and both side profiles. Rocket bodies keep one rigid silver nose per angle while a separate exhaust animates. Arc electricity connects continuously across its firing cadence; Prism draws a straight pixel ray through its pierced targets to the wall. Observer-relative views also apply to online teammates and hostile fireballs.

Tentacles remain retracted until a 0.07-second tell and 0.09-second snap. Their wider catch area covers angled crossings, but they commit to the detected position so a sprint can beat the strike. Small clinger pods hide near corners and equipment, separate from normal brood spawners. Singles release one facehugger; clusters release two, three or five together within ten metres and clear line of sight. They open, jump, empty, break and leave husks; shooting unopened eggs prevents their ambush. Pod state is saved and shared with the crew.

Facehugger peel recovery now takes 1.65 seconds and retains all eight frames for every character, with first-person coverage for the victim and third-person animation for teammates. Fresh WASD taps in any order and controller stick flicks still work. Other enemies cannot damage a captured player or interrupt recovery; normal damage resumes immediately afterward. The struggle dropdown and enemy-health display are removed. The idle Mission Link tab and yellow supply ticks are gone. Red enemy ticks and blue route diamonds grow nearer and shrink farther away.

Fog flows along each deck's actual floor, clears near the player and becomes opaque at twenty metres. Screens, puzzle equipment and ceiling fixtures use a fixed pool of eight real lights with a 35-metre reach; combat lights also reach 35 metres. The twenty-metre camera limit and existing bounded effects, corpse cleanup, instancing and texture release remain.

[V12 implementation, measurements and verification](docs/staged-loading-v12.md) · [Art prompts and provenance](docs/art-prompts-v12.json) · [Previous V11 rendering and scenery work](docs/peel-fog-performance-v11.md)

## Playing

| Action | Input |
| --- | --- |
| Move / aim | WASD / mouse |
| Sprint / jump | Left Shift / Space |
| Fire / reload | Left click / R |
| Use terminal, collect specimen, open case | E |
| Revive a downed co-op teammate | Hold E nearby for three uninterrupted seconds |
| Wipe mixed-color goo in one pass | Q |
| Break free from a capture | Mash any WASD keys in any order; repeated taps on one key also count |
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
| Break free from a capture | Flick and release the left stick in any direction |

In menus, use the D-pad or left stick to move focus, A/Cross to select, B/Circle to go back, and left/right to change values. Right stick scrolls. Selecting the room-code field starts six-character editing: up/down changes a character, left/right moves the cursor, A accepts and B cancels. System file pickers for save import still use the operating system's controls.

**FIELD MANUAL** contains saved look sensitivity, stick dead zone and inverted-look settings. Analog movement scales with stick pressure and diagonal movement stays capped. LT/L2 slows aiming without changing the weapon artwork. Disconnecting the active controller pauses local control; buttons and sticks must return to neutral after resume/reconnection. Online rooms continue simulating while an individual player pauses.

Each chapter has its own route topology, room silhouette and primary recovery puzzle. The repeated two-coupler opening is gone from new missions. Twelve new mechanics join the four earlier systems (sixteen in total): neighbor fuse circuits, sliding cargo, signal tuning, an interlocked airlock, a cargo crane, signal memory, walking a sensor grid, power sharing, temperature stabilization, species-matched specimen isolation, RGB filtering and timed dispatch shutdown. Pressure, optical, phase-lock and coolant systems are secondary puzzles in selected chapters. Restore the chapter system, recover access and the archive, decide how to route power, defeat the guardian and extract. Chapters 1, 5 and 9 retain the extra relay sequence; the other chapters restore that circuit through their own puzzles.

Blue objective diamonds and red enemy ticks move along the original compass bezel as you turn. The current objective retains one slot; the remaining slots show the closest contacts by three-dimensional distance, up to twenty total. Blue diamonds point toward the next reachable passage on their own route; red ticks point toward the enemy. Dead enemies and supply markers are excluded. Marker size increases as the objective route or enemy becomes closer. Markers beyond the forward half-circle sit at the appropriate edge with a small turn cue. A tiny top/bottom edge indicates another deck. Route distance remains inside the bezel. Guidance updates from the player's current cell and deck, aims at a reachable passage or room connection, and handles stairs, waiting for lifts, boarding, riding and exiting. It traces collision-safe movement before skipping a waypoint. The twelve-map overview is in **artifacts/chapter-layouts-v3.svg**.

Guns come from supply cases. Each of the seven weapons has its own ammunition, reload animation and sound. Scrap is score; enemies can drop scrap, health and ammo. Nests, feeding growth and fabrication vents spawn reinforcements, rupture into a final brood and leave husks. The opening solo contract includes the new visor clinger alongside the original roster and 38 spawners; later contracts introduce more of the original roster.

Four new wall parasite families use 32 growth, pulse and husk frames. Colonies mature over about 28 seconds and spread to nearby panels when left alive, capped at 96 patches per chapter. Fire destroys them faster; cleared patches remain dead. The opening contract starts with 58 wall colonies. Growth never adds a collision barrier to mission routes. Flame streams now use three animated fire puffs per shot with warm moving lights. Alien shockwaves have upright pixel crests, and acid impacts leave short-lived damaging pools. Both cast sustained colored light on the architecture. The new flame/area sheet contains another 32 frames.

The station now adds **341–377 industrial props per chapter** at the default campaign seed. Twenty-eight prop types include animated pumps, control panels, life-support tanks, cycling trash compactors, steam vents, valve manifolds, open electrical cabinets and air filters. Original fans, radar and machinery remain in use. Sixteen smaller objects add cable reels, oxygen bottles, tools, service carts, ladders, bins, spare filters, scrap and litter. Chapter themes favor different equipment; 183–216 placements are in passages and service routes, with the rest distributed through rooms.

Four new pixel sheets supply 64 frames and objects. Vents emit intermittent pixel steam; cabinets throw occasional sparks; compactors cycle their press and release dust. Nearby pumps, airflow, vents and compactors have spatial sounds on the quieter world bus. Machine phases are seeded and follow mission time, including saves and room synchronization. Equipment stays within the low ceilings; floor collision is indexed by nearby cells and leaves the compass paths clear. If an older save places the player inside newly installed equipment, loading moves the player just clear of that footprint on the same floor.

The Q wipe now uses the **actual original four-pose glove sheet**, `assets/legacy/visor-wipe.png`, unchanged. The prior v4 build still used the later eight-frame sheet. The gun lowers fully, one hand makes a single right-to-left sweep, and the gun returns with its support grip. Existing mixed-color blood is masked onto the contact poses; there is no shake or smear pass.

## Campaign and saves

Twelve expanded contracts follow Rook from an ordinary salvage job into the Brood, Choir and Splice outbreaks. New case files develop the omitted Dock Nine crew list, Iona Vale’s ignored recall, the shared carrier product, the falsified inspections and Rook’s recovery lien. Echo, Flint and EOS have distinct roles in the investigation and repair effort. Recovered evidence unlocks in the existing RECOVERY JOURNAL; each research/power decision adds its consequence. Later intros remember prior research decisions, and the closing report reflects the research balance, maintenance routes and key records actually recovered. Discoveries, completed puzzles, secrets and guardian aftermath advance the communication panel. Field logs queue without replacing unfinished messages; decisions interrupt and then resume the current log. History and pending messages survive saves and synchronize to the crew. Archive and power decisions affect the current route, the next contract and the campaign ending. The recovery journal on the title screen contains the longer chapter context and acquired case evidence. Purging before recovering the control ledger is recorded honestly in the case history.

Three solo save slots preserve position, equipment, ammunition, score, enemies, nests, wall-growth stages and husks, opened cases, puzzles, choices and campaign progress. Autosaves occur on progress and at intervals; **SAVE RECOVERY** is also available while paused. **CONTINUE RECOVERY** loads a slot. Export/import a JSON save to move it between browsers or HTML versions. Browser saves belong to the browser profile and file/site origin. Older v2 saves retain their current map and puzzle state; the next chapter uses v3. Start a new deployment to test a revised chapter immediately.

## Online rooms

Choose the salvager in **FIELD MANUAL**, then open **ASSEMBLE CREW**. Select a mode, **HOST ROOM**, share the six-character code, and **DEPLOY CREW** after friends join. The host assigns up to four different salvagers: Rook, Echo, Flint and EOS. Your preferred salvager is kept when available; otherwise the next unused character is assigned. The large share code and COPY CODE button appear in the crew lobby and pause menu. Each has weapon-specific pixel sprites with sixteen facing slots and two to four walking poses. Your own view remains first person with matching sleeves, gloves and fingertips, including all reload poses and the original single-pass wipe. Weapon crystals, missiles and fuel panels retain their own colors. Co-op deployment places teammates on separate walkable spots ahead of the host; host and guest movement both animate.

- **CO-OP RECOVERY:** shared mission, no friendly fire; hold E to revive. In V13, the default opening chapter places 38 enemies for one/two players or 46 for three/four. Nearby combat is capped at 30 active monsters per player, and a grouped crew shares that cap. Separated teammates have their own local encounters. The published V12 build predates this change and began four-player missions with 372 enemies.
- **FREE-FOR-ALL:** no monsters or campaign objectives. Find weapons, score 20 frags or lead after ten minutes. Death triggers a short respawn.
- **RIVAL RECOVERY:** hostile salvagers and infestation share a mission. The first salvager to complete the recovery and extract wins; scrap and frag scores appear in the result.

V13 uses room protocol 9; all players in a room need V13. The published V12 release uses protocol 8 and cannot join a V13 room. Free-mash escapes, peel animations, capture protection and per-player compass paths remain. Online rooms require internet access and a network that permits WebRTC peer connections. The host runs the simulation and must keep the game open. There is no host migration or joining a mission already underway; guests can join the next deployment. The room service handles discovery; no account or hosted game installation is required.

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

## V9 tentacle and world update

Colonies on walls, ceilings and floors can grab a salvager after a visible tell. Wiggle WASD or the controller left stick to escape the brief third-person struggle; teammates can destroy the root or gripping hook. Four strains and all four characters have matching animation sheets. Bosses and mini-bosses continue hunting once they detect you.

This build also repairs arm/HUD framing, layered wall boundaries, overlapping stair landings, lift-floor z-fighting, floating accessory panels and solid puzzle-device placement, and reduces repeated pathfinding during crowded fights. See [implementation and verification](docs/tentacles-and-world-v9.md), [new art provenance](docs/art-prompts-v9.md) and [measured performance](artifacts/performance-v9.json).

## V10 history: wrapping, parasites, atmosphere and cleanup

V10 introduced up-to-30-metre tentacle spans, variable wrap effort and ordered input bursts below the compass. V11 supersedes the ordered bursts with free mashing, keeps arms retracted until the strike, and adds protection through the recovery animation. V12 removes the prompt entirely and shortens the peel; see the controls above.

The new visor clinger covers the victim’s first-person view while matching hands peel it away. Other players see that character struggling in third person. Gnat swarms trigger swatting, and suit burrowers trigger pulling and crushing, in third person. All four salvagers have dedicated capture, struggle and release art for these enemies and all four tentacle strains: **400 new frames across eleven sheets**, with original art preserved. The right-hand health readout now uses the original painted ammo gauge housing.

Drifting world-space fog builds with view distance, using four density samples in existing material shaders without additional particle objects or draw passes. Dead enemies settle onto the actual deck, with airborne offsets cleared and transparent artwork padding removed from their ground anchor. The host retains at most **30 enemy corpses globally and five per room**; after every living player has left a room for 12 seconds, that room keeps at most two. Clients receive the same removals. Shared sprite textures remain cached; removed corpse materials are disposed.

See [V10 implementation and verification](docs/wrapping-and-parasites-v10.md) for timings, art provenance, browser evidence and testing limits.
