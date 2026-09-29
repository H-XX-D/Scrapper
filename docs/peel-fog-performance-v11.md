# V11: free escapes, projectile art, station dressing and a smaller cartridge

V11 replaces prescribed escape-key bursts with arbitrary fresh WASD taps or controller stick flicks. Repeated taps on the same direction count, held inputs do not, and input event IDs still prevent duplicated network packets from granting progress. Long tentacle spans retain their greater required effort. A separate eight-frame 2.8-second facehugger release sequence pulls left and right legs away, lifts the body, and throws it off. The victim sees their own colored gloves in first person; observers see the matching full character. All four pilot rows exist in both sheets.

Capture damage is checked in the shared hit function and before local hit feedback. Only a matching current captor ID and kind can apply its small periodic interaction tick. Other damage is rejected through the entire recovery timer. Ordinary damage becomes valid immediately when recovery reaches zero, independently of the four-second immunity to re-grabbing. The host applies the rule for all crew members.

Tentacles remain retracted while idle and through a half-second root tell. A 0.2-second strike extends toward a locked target; crossing/line-of-sight tests resolve the hit, and a miss retracts. The maximum physical span remains 30 metres or the next blocking wall. Dense world-space fog becomes fully opaque at 20 metres; the camera clips at the same distance. Four density samples maintain drifting pockets without new fog geometry.

The crosshair and central hit marker are removed. A new 64-frame sheet separates ion bolts, electrical orbs, lightning ribbons, prism lances, rockets, cryo shots, spinning blades and flame. Shot presentation still uses existing weapon hit timing and authority. Arc shot lighting follows the travelling core and discharge, sharing the existing fixed ten-light pool. The event channel carries the same sheets to observers without duplicating the primary lightning ribbon.

Four 16-object static sheets cover transit, research, cryo and foundry. Pipes and cables use bracketed wall anchors; consoles and scientific instruments have grounded bases. Reserved interactions, gate approaches, lifts and narrow stair cells remain clear. Seeded dressing does not consume combat randomness. New static dressing adds at most sixteen instanced batches per map. Existing art remains in the project.

## Rendering and memory

- Architecture is partitioned into 16-metre spatial chunks so camera culling can skip distant floor, ceiling and wall batches.
- Flat transparent scenery uses a single pass for both sides. The added static objects share instances; they do not each require a new draw call.
- Transient effect sprites reuse up to 128 materials, reset on reuse, and dispose excess entries. Beam orientation reuses scratch vectors and the vertex buffer.
- Sprite textures skip unused mipmap generation. Environment textures retain their existing mipmaps. Scene replacement releases GPU textures, and mixed-color wipe canvases retain at most 32 variants.
- HUD text refreshes at 15 Hz; combat, input, physics and rendering keep their ordinary update cadence.

A matching 149-actor combat fixture at 1280×577 measured mean draw calls of 537.58 in V10 and 418.82 in V11 (22.1% fewer), with mean submitted triangles of 40,021 and 5,182 (87.1% fewer). Both ran at a median 16.7 ms and 95th percentile 16.8 ms on this machine. These numbers establish less submitted rendering work for the combined changes, including the shorter requested view distance. They do not establish a frame-rate improvement on a slower GPU or isolate each optimization's contribution. See `artifacts/performance-baseline-v11.json` and `artifacts/performance-current-v11.json`.

## Export

The exporter uses pinned Sharp 0.35.5 to produce lossless WebP only when it is smaller than the PNG. Each candidate is decoded to RGBA and must equal the original in every byte and dimension; otherwise the original PNG is retained. Source PNGs are unchanged. Content-addressed local build caches avoid repeated encoding. The codec options are documented in [Sharp's output API](https://sharp.pixelplumbing.com/api-output/#webp).

The HTML is 247,602,302 bytes (236.1 MiB), 12.2% below V10's 281,965,804 bytes despite seven new sheets and 192 additional frames. The optional ZIP is 186,978,172 bytes (178.3 MiB) and contains that exact HTML. A standard ZIP decoder independently verified the extracted HTML hash. `exports/size-report-v11.json` lists the 101 unique packed assets. Most payload size is artwork; reducing JavaScript alone would make little difference.

## Verification

- 118 automated checks pass, including damage ownership/recovery boundaries, arbitrary/coalesced input, strike dodges, all mounting surfaces, all twelve chapter routes with new obstacles, exact-pixel compression, sprite-pool reset and ZIP extraction.
- The exact exported HTML passed twelve solo pilot/parasite escape cases, including each of the eight peel frames, external-damage protection, and damage restoration.
- An alpha audit of all 192 new art frames found no empty frames or clipped edges.
- All 48 pilot/strain/mounting-surface tentacle cases captured and selected the correct sheet in the exported build.
- Four browser clients joined the public discovery service with unique pilots. Twelve capture checks, twelve free-input releases, four local/remote peel views and twelve host-authoritative damage-protection probes passed. Room protocol is 7; all peers need V11.
- No browser errors were observed. This is a targeted automated playtest, not a complete human campaign playthrough, low-end device benchmark, or long-distance multiplayer soak.

The generated PNGs are native image-generation outputs; only frame-boundary metadata and runtime padding were derived from alpha gutters. Full generation instructions are recorded in `docs/art-prompts-v11.json`.
