# V13: AURA browser transport and encounter budgets

V13 adds per-player combat replication, acknowledged state deltas and smaller encounters. [Download V13 Fast Load](https://github.com/H-XX-D/Scrapper/releases/download/v13/Scrapper-Fast-Load-v13.zip), extract the whole ZIP and open `Scrapper-Fast-Load-v13/Scrapper.html` with its assets beside it. The [V13 release](https://github.com/H-XX-D/Scrapper/releases/tag/v13) also includes the standalone HTML. Build either form from source with `npm run export`. All players need V13 (room protocol 9).

## Repository inspection and integration decision

Inspected [H-XX-D/AURA](https://github.com/H-XX-D/AURA) at commit `ee2b81895c2f3d89bf66c0da9174daec3d6b3ab8` before implementing. Relevant sources are its [AIWire specification](https://github.com/H-XX-D/AURA/blob/ee2b81895c2f3d89bf66c0da9174daec3d6b3ab8/docs/aiwire_v1_spec.md), [session dictionary contract](https://github.com/H-XX-D/AURA/blob/ee2b81895c2f3d89bf66c0da9174daec3d6b3ab8/docs/aiwire_session_dictionary.md), [Python session encoder](https://github.com/H-XX-D/AURA/blob/ee2b81895c2f3d89bf66c0da9174daec3d6b3ab8/src/aura_compression/ai_wire.py), and [Node entry point](https://github.com/H-XX-D/AURA/blob/ee2b81895c2f3d89bf66c0da9174daec3d6b3ab8/index.js).

AURA negotiates shared structure, carries session/control messages separately, and supports recovery/fallback. Its Node entry uses `node:crypto`, `node:zlib` and `Buffer`; the Python/native session stream uses stateful DEFLATE. Neither is a drop-in runtime for this standalone browser cartridge. Scrapper therefore implements a browser adaptation of the structure-and-delta approach, with its own versioned wire contract. It is **not byte-compatible with `aura.aiwire`**, and does not load the Python, Node, native, or ML runtime.

`src/aura-codec.js` implements a shared structural vocabulary whose exact ordered contents are pinned by SHA-256 in the handshake. Binary values retain exact finite JavaScript numbers, strings, Unicode, booleans and nulls. Keyframes establish per-peer baselines; deltas reference a baseline acknowledged by that particular receiver. Entity collections are keyed by ID, so one enemy leaving view does not renumber every other enemy. Simulation receives detached state and cannot mutate the decoder's baselines. There is no lossy coordinate quantization.

Control, input, loading, ping, ACK and recovery messages remain explicit. The codec has bounded packet size, recursion, histories and outstanding frames. A missing baseline requests a fresh keyframe; repeated decode failure or a mismatched capability uses ordinary PeerJS state messages for that connection. Other crew members retain their negotiated codec. Keyframes recur at least every three seconds when the link can send. New missions clear all baselines, and run IDs reject stale input and acknowledgements.

## What changed

- Each guest receives combat state in a 36m neighborhood around **that guest**, including nearby enemies, projectiles, waves, clinger pods, growths and effects. This covers the 20m fog distance and approaching hazards. Mission, puzzles, doors, pickups, teammates and guardian objective positions remain shared. A global event cursor prevents old offscreen explosions replaying when someone enters another room.
- The host checks both WebRTC's queued bytes and PeerJS's pending buffer before building a frame. It skips obsolete state while a connection has at least 24,000 queued bytes; it does not queue an ever-growing history. Delta baselines advance only after a successful send and acknowledgement. Eight pending encoder states and 32 decoder baselines bound memory.
- Local movement remains immediate. Guest input history replays motion newer than the input consumed by the host. Replay obeys the same collision and floor rules and stops during captures/death. Enemy and teammate sprite positions interpolate between received positions. Captures and teleports snap to their authoritative positions.
- Normal movement sends only the latest struggle-input watermark. Captures retain the bounded list of fresh button presses, so coalescing cannot lose a rapid escape sequence.
- Enemy populations are no longer multiplied by crew size. The default first chapter places **38 solo/two-player enemies or 46 with three/four players**, including one guardian. The measured V12 four-player opening had 372. Later chapters progress to 78 solo or 86 with three/four players at the default seed. The species introductions, bosses and original artwork remain.
- A host-owned budget permits at most **30 active monsters within 32m of each player**. The radius admits enemies before the 20m fog plane. Players together share the cap; separated teammates can each have a local encounter. Overlapping areas must satisfy every nearby player's budget. Dormant reserve enemies do not simulate attacks, render or intercept shots. Bosses and attached parasites have priority. A 180-live-actor resident cap prevents indefinite spawning across the whole station.
- Ordinary pods reinforce every 14 seconds instead of eight, with a three-wave budget (two after the prior purge choice) instead of five. Brood size is no longer multiplied by crew size. Dedicated facehugger clusters still release several creatures, retaining eggs when the budget is full. Existing damage values and weapon behavior remain.

## Evidence and interpretation

`scripts/verify-network-v13.mjs` creates four real PeerJS/WebRTC clients, then measures the crew together and split between four rooms. It counts actual bytes passed to `RTCDataChannel.send`, including PeerJS framing; UDP/DTLS/IP overhead is outside that count. The first instrumentation draft accidentally dropped PeerJS's internal chunk flag; those disconnected runs were discarded. The corrected wrapper forwards every argument and requires four active members throughout both scenarios.

Representative source-build observations:

| Four-player scenario | V12 host traffic | V13 with raw fallback | V13 with AURA adapter |
| --- | ---: | ---: | ---: |
| Together | 3.46 MB/s | 0.81 MB/s | 0.17 MB/s |
| Separate rooms | 3.11 MB/s | 0.67 MB/s | 0.17 MB/s |

The new encounter budget and interest filtering already reduce traffic substantially. The AURA adapter reduces it further by roughly 74–79% compared with the smaller encounter build using raw snapshots in these runs. Overall traffic was about 94–95% below V12. These runs have the same scripted route/actions but stochastic combat evolves over real time; they are not identical-frame experiments.

To isolate serialization, 48 peer/frame combinations from captured V12 states were also replayed through the adapter. The exact same nearby state took 967,339 JSON bytes versus 73,611 codec bytes, a **92.4% payload reduction**, and every reconstructed value matched. Full unfiltered JSON was 7,260,426 bytes. Local Node encode-plus-decode median was 0.63ms and p95 was 1.55ms. This replay covers the captured opening states, not every possible combat workload.

V12 host p95 frame intervals reached 133ms together and 217ms split in the local fixture; V13 source runs stayed around 16.8ms with either codec. This supports reducing host workload as well as bandwidth. It does **not** show that compression alone caused the FPS change: monster counts and replication scope also changed, and the raw V13 run already reached the display refresh rate.

Four-client recovery checks confirmed:

- Deleting one guest's baseline triggered a keyframe and continued replication.
- Artificially blocking one host send queue held that guest's frame count steady while the other two guests received eight updates each, then the blocked guest resumed.
- Repeated injected decoder faults fell back to raw for that guest while the others retained AURA and all four stayed connected.
- With 90ms injected at each application send boundary, guest movement began locally in 9.3ms, had no observed backward step, traveled 4.81m, and converged to the host position after stopping. Measured ping RTT was 189ms. This is controlled delay, not an Internet loss/jitter simulation.
- All twelve combinations of four salvagers and three parasite types showed the correct capture and completed free-mash escape in a mixed-codec room with delay.

Automated tests cover exact codec round trips, corrupt/truncated packets, prototype keys, missing/stale baselines, state removal/reentry, bounded queues, interest separation, delayed movement, collision, overlapping monster budgets, boss/captor priority, and existing campaign/gameplay behavior. See `artifacts/tests-v13.txt`, `artifacts/network-v12.json`, `artifacts/network-v13.json`, `artifacts/network-v13-raw.json`, `artifacts/aura-replay-v13.json`, and `artifacts/coop-regressions-v13.json` in the local checkout.

These measurements use isolated Chromium clients on one Mac. They do not establish cross-device WAN latency, mobile performance, long-session memory behavior, or complete campaign balance. PeerJS room discovery, host authority and the requirement that the host remain online are unchanged.
