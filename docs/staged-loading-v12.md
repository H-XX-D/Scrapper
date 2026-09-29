# V12: staged loading, directional shots and clinger ambushes

The original title and painted HUD now appear before mission art is decoded. `AssetLoader` deduplicates paths and limits decode concurrency to three. A mission loads its own station theme, introduced enemies and present crew's weapon sheets before simulation starts. Other themes and absent crew sheets are released on chapter changes. All source assets remain in both downloads.

## Playable exports

- Recommended: `exports/Scrapper-Fast-Load-v12.zip`. Extract the entire folder and open `Scrapper-Fast-Load-v12/Scrapper.html`; retain the adjacent `assets` folder. The 1.11 MiB launcher does not contain the complete game art. The complete download is about 185 MiB.
- Portable: `exports/Scrapper-Playable-v12.html`, also copied to `exports/Scrapper.html`, approximately 245 MiB. `Scrapper-Playable-v12.zip` contains the exact portable HTML.
- Solo needs no server. Online rooms need internet and V12 on every device. Both export forms use protocol 8 and interoperate.

Direct-file image URLs tainted the canvases used for HUD extraction and suit recoloring in the first folder prototype. The verified folder loads individual classic-script art packages that hand losslessly packed image data to the same bounded loader. This keeps canvas pixel access working under `file://`. The portable version stores art in inert HTML payloads, outside executable JavaScript. Release CI preserves the committed expected checksum before building, validates the rebuilt HTML against it, runs tests and publishes both ZIPs plus the portable HTML.

## Gameplay and presentation

Rockets, fireballs and Prism pulses have sixteen observer-relative directions. Fireballs and Prism use four animation phases per direction. Rockets use sixteen rigid bodies with separate animated exhaust, keeping the silver cone constant during flight. These 144 projectile images plus 32 pod frames total 176 new source frames. The original PNGs are retained; alpha-bound extraction supplies transparent padding without repainting the art. Prompts, generation method and source identifiers are in `art-prompts-v12.json`.

Arc links remain connected across their 0.4-second shot cadence. Prism uses a continuous pixel ray through pierced actors to the wall. Both use bounded cached animation strips. Enemy fireballs and network observers choose the appropriate trajectory-relative view as well.

Tentacles are retracted until a 0.07-second tell and 0.09-second strike. Detection and strike volumes are wider; the strike commits to the position detected at its start. Unit tests use actual movement at walking and sprinting speeds: walking is caught, while sprinting can beat the locked strike. The maximum span remains thirty metres and walls still block the attack.

Dedicated small pods occupy valid floor cells near walls, blind corners and equipment, leaving arrival areas and interactions clear. Singles contain one clinger; clusters contain two, three or five. Ten-metre proximity and line of sight trigger the whole cluster immediately, with distinct launch positions and a fast physical leap. A full actor budget retains the unspawned brood for a later tick instead of losing it. Opened pods become empty husks even after the player leaves. Shooting a closed pod prevents its ambush. Normal brood spawners no longer supply facehuggers. Pod states are saved and replicated by the host.

Facehugger peel recovery takes 1.65 seconds with all eight frames preserved for each salvager. Local victims keep the first-person face coverage; other players see the third-person animation. Free WASD mashing and protection from non-captor damage still apply through recovery. The struggle dropdown and enemy-health display are removed. Mission Link hides when no transmission is active. Yellow compass contacts are removed; red enemy ticks and blue objective diamonds scale with spatial distance and route distance respectively, while the twenty-contact limit and route-aware guidance remain.

Four shader density samples make fog flow along the actual floors of stacked decks, clear near the viewer and become opaque at twenty metres. The camera far plane stays twenty metres. An eight-light station pool selects nearby visible-line-of-sight fixtures with a thirty-five-metre reach, including screens, puzzle equipment and ceiling lights. A fixture outside the camera's fog range can still illuminate nearby surfaces. Combat lights retain their ten-light pool and now also reach thirty-five metres. No fog particles or new render targets are created.

## Measured loading

`scripts/verify-loading-v12.mjs` opened one fresh Chromium session for each local-file export, sequentially at 1280×577. OS disk caching was uncontrolled. The report records file hashes; these are local observations, not download times or a low-end-device guarantee.

| Export | Title usable | Title rendered | Deploy to rendered mission |
| --- | ---: | ---: | ---: |
| V11 portable | 3.424 s | 3.847 s | 0.515 s |
| V12 fast folder | 0.282 s | 0.286 s | 2.906 s |
| V12 portable | 0.952 s | 0.956 s | 2.857 s |

The deployment step intentionally performs work that V11 did before showing its title. V12 decoded one shared HUD image for title startup and 56 unique images for chapter one, with a measured peak of three concurrent loads. Across twelve solo chapters, resident image counts stayed between 56 and 66. Data: `artifacts/loading-v12.json`, `artifacts/chapters-v12.json`, and `exports/size-report-v12.json`.

## Verification

- `npm run check` and 136 Node tests passed. Checks cover loading limits and retry, stale/duplicate acknowledgements, cancelled deployments, a late-join race, projectile direction, rigid rocket tips, pod proximity/broods/walls/budgets/save state, sprint dodging, lights beyond the camera range, lossless export content and multi-entry ZIP offsets.
- Both final ZIPs passed `unzip -tq`. Export tests verified every separately addressed file and the decoded image-data hashes. The portable HTML hash is recorded in `exports/Scrapper-Playable-v12.sha256`.
- Direct-file browser checks loaded all twelve chapters and all four themes, restored a save with identical pod state, and found no browser errors. All 176 new frames had visible pixels and clear edge gutters. The existing 192 peel/projectile/dressing frames also passed their alpha audit.
- Twelve solo captures covered all four salvagers with facehuggers, gnats and burrowers. Captor escape, outside-damage protection, all peel poses and damage restoration passed. Forty-eight isolated tentacle captures covered four strains, three surfaces and four characters. That fixture advances the actual tell/strike phases before other hazards update, preventing nearby new pod ambushes from taking its place; movement/collision behavior is checked separately.
- Four real online clients, mixing fast-folder and portable exports, received unique Rook/Echo/Flint/EOS assignments. One guest's decode was deliberately held: host and two ready guests stayed out of simulation until the held guest completed. All twelve multiplayer parasite captures and escapes showed matching remote sheets and local first-person coverage. A five-egg pod launched five facehuggers and synchronized its empty husk on all four clients. Evidence: `artifacts/coop-grabs-v12.json`, `artifacts/coop-pods-host-v12.json`, `artifacts/coop-pods-v12.json`.
- The combat fixture used the same seed, three ruptured nests and eighteen fan attacks in V11 and V12. Both held a 16.7 ms median frame time over 270 measured frames; p95 was 16.7 ms and 16.8 ms respectively. V12 had no frames above 33.4 ms. V12's CPU update p95 was 3.8 ms versus 3.9 ms in V11. The new encounter rules resulted in 109 actors versus 113, so the lower observed draw-call count (276.7 versus 434) cannot be attributed solely to rendering optimization. This demonstrates the added fog and lights fit this machine's frame budget; it does not establish a universal FPS improvement. See `artifacts/performance-baseline-v12.json` and `artifacts/performance-current-v12.json`.

This is targeted automated playtesting, not a full human campaign playthrough, a low-end GPU benchmark, cross-browser certification or a long-distance multiplayer soak.
