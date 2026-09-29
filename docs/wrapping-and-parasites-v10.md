# V10: wrapping, parasites, atmosphere and corpse cleanup

## Gameplay

Four tentacle strains retain their original growth, tell, recoil, rupture and husk art. Their animated flesh ribbons extend toward the next solid surface, capped at 30 metres, on walls, floors and ceilings. A swept body-segment check detects crossing the extended arm. Grabbing still requires the 0.85-second tell and clear line of sight. Extension advances at 10 m/s; a captive is dragged in small collision-checked steps, stopping before a wall or missing floor.

Longer arms increase wrap duration from roughly 1 to 1.5 seconds, minimum hold from roughly 2 to 3.57 seconds, and required taps from 10 to 18. Each capture generates a sequence of repeated direction bursts, two to four taps per burst, with variation across repeated grabs. Holding a key does not repeat input; each physical tap or neutral-to-direction controller flick adds an ordered event. The last 32 events travel with network input and are deduplicated on the host, preserving quick taps across coalesced packets. Incorrect taps animate resistance without erasing earned progress. The safety timeout is bounded at 14 seconds, periodic damage discourages waiting it out, recovery lasts 1.15 seconds, and escape grants four seconds of grab immunity.

Three new enemies have idle, movement, tell, attack, hurt and death animation rows. The visor clinger appears from the first contract, gnat swarms from the second, and suit burrowers from the third. They advance toward the target during the telegraphed attack and attach only after a clear, close contact. Broods can also spawn introduced parasites. A teammate can kill the attached attacker to rescue the victim; escaping kills it and plays the appropriate release/crush poses. Restored saves or disconnected captives cannot leave invisible attached attackers behind.

The visor clinger covers the attacked player's first-person screen, with suit-colored hands peeling it away. Remote players still see the victim's matching third-person escape sheet. Tentacles, swarms and burrowers retain the collision-checked third-person local camera. Rook, Echo, Flint and EOS each have explicit wrapping, struggle and release poses. The gun and wipe stay hidden during captures and recovery. The original title art and dashboard layout remain; the health display now uses the same painted dial housing as ammunition.

The escape prompt is a scrolling industrial strip immediately beneath the compass. A fixed diamond and repeated key/arrow burst show the next required input while the action and progress scroll beside it. Mission communications resume after the strip closes. Reduced-motion preferences stop the scrolling animation. There is no second duplicate mash prompt at the bottom of the screen.

## Atmosphere and retained bodies

Fog uses four world-space density samples along each camera-to-surface ray. Slow drift and layered density vary the haze through the station; existing depth-tested surfaces keep it behind solid architecture. It patches the existing mesh and sprite shaders and adds no fog particles, render targets or draw passes. Materials share time and camera uniforms, and a periodic scan picks up new world objects. Theme fog colors match the freight, research, cryo and foundry environments. This is sampled density fog, not a full multiple-scattering lighting simulation.

The host enforces at most 30 dead enemies globally and five per room, preferring newer remains and occupied rooms. When no living crew member has occupied a room for 12 seconds, it thins to two reminders. Deck-aware room lookup handles stacked spaces. Pruned actors leave the simulation and snapshots; each client disposes its removed sprite material while shared atlas textures stay cached. Dead nest husks and recoverable downed teammates remain separate gameplay objects.

Death clears any leap/attachment offset. Remaining bodies track the actual floor, including lift movement; a body over missing floor is discarded. Death frames use a cached opaque-pixel bottom anchor so transparent padding cannot suspend the visible remains above the deck. The hover offset is applied only to living creatures. This corrects both airborne-state and image-padding causes of floating corpses.

## Art

The built-in image generation tool created eleven PNG sheets with alpha transparency. Original images remain unchanged. Eight 8-column × 4-row sheets provide 256 character/first-person frames: four tentacle strains, clinger, gnat swarm, burrower and the local first-person clinger. Three 8-column × 6-row enemy sheets provide 144 frames. Each character sheet orders rows Rook, Echo, Flint, EOS. Enemy rows are idle, move, tell, attack, hurt, death.

Exact observed crop rectangles are recorded in `src/escape-layouts.js`, with 320-pixel crew/first-person cells and 256-pixel enemy cells. Generated source dimensions were inspected rather than assuming the requested grid boundaries. Prompts are in `docs/art-prompts-v10.json` and `docs/facehugger-fp-art-v10.txt`. Runtime alpha audits cover all 400 frames, including empty-frame and edge-clipping checks.

## Verification

- 108 automated tests cover the existing campaign, traversal, audio, controllers, saving and network rules, plus repeated tap ordering, packet deduplication, controller flicks, 30-metre swept crossings, safe dragging, parasite attachment/rescue, first-person clinger selection, orphan cleanup, corpse caps/occupancy/decks/lifts, opaque foot anchors and fog shader binding.
- The standalone HTML is opened directly from disk. Browser audits inspect all 400 new frames and all twelve character/parasite combinations. All 48 pilot × tentacle-strain × surface combinations acquire a capture and select the correct sheet.
- Actual keydown/keyup events escape all three parasite types. Browser screenshots inspect the new compass frame, local visor capture, wrapped body, health gauge and grounded remains.
- Four separate browser clients connect through live room signaling, receive unique salvagers, and observe each character's captures. The attacked local clinger victim remains first person; the other three clients see its third-person sheet. Every character escapes each parasite through transmitted keyboard taps.
- A corpse burst fixture verifies both caps, subsequent empty-room thinning, grounded sprite positions and multiplayer replication. A fog-on/fog-off frame sample records render calls and frame timing for the same paused scene. Raw evidence and measurement conditions are retained in `artifacts`.

The browser fixtures use controlled teleports, high health and scripted taps to isolate mechanics. These checks do not claim a full human campaign balance pass, a long multiplayer soak, separate-household NAT coverage, physical controller testing or a guaranteed frame rate on every GPU. Room protocol 6 rejects older clients; every player should use the V10 HTML. The release workflow independently rebuilds, checks the committed SHA-256, runs tests and publishes the actual standalone HTML.

To repeat the room fixtures after exporting, with `agent-browser` installed, run `node scripts/verify-grab-room-connect.mjs`, then `node scripts/verify-grab-room.mjs`, then `node scripts/verify-corpse-room.mjs` from the repository root. The browser-context scripts under `tests/browser/*v10.js` are evaluated through `agent-browser eval --stdin` after solo deployment and pause. These are controlled verification fixtures, not production game inputs.
