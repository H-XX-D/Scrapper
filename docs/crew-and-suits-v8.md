# Crew visibility, room codes and suit colors / v8

The host now reserves a distinct salvager for each room member. A requested character is retained if free; otherwise the next unused one is assigned. The authoritative roster updates the local selection, first-person sleeves and remote artwork. The lobby shows the four original character sprites. Large selectable room codes and copy buttons appear in both the crew lobby and pause screen, within the existing industrial theme.

Co-op deploys the crew at separated points in front of the host, checked against floor elevation, collision and sightlines. Received crew records reconcile missing remote members and restore detached billboards. Both local host movement and guest movement advance the walking clock; sprite selection uses each sheet's actual column and walk-frame metadata.

The initial two-client reproduction rendered both players when placed on valid floor facing each other. It did not reproduce a permanently invisible teammate. It did expose the frozen host walk clock and deployment positions beside/behind the opening view. The new checks therefore include actual screenshots, not only network membership/state assertions.

The old first-person recolor flood-filled only orange connected to the bottom sleeve corners. Dark wrist bands isolated gloves and individual fingers, leaving orange on other characters. `suit-palette.js` classifies fabric islands with per-pose regions, includes disconnected fingers, and protects warm crystals, fuel panels and ammunition. All four original wipe frames recolor before the mixed goo overlay is composited. Source images, one-hand wipe timing, black glove pads and lighting details remain intact.

Validation:

- 83 automated tests pass, including six new regressions for authoritative unique assignment/capacity/reuse, separated floor-checked deployment, all directional crew layouts and disconnected fabric recoloring.
- Four Chromium instances requested Rook, received Rook/Echo/Flint/EOS, deployed together and rendered their teammates. Repeated with all four opening the exact standalone v8 file. A guest observed the host's advancing walk state and restored a deliberately removed host billboard.
- Screenshots inspect host and all three guest viewpoints, lobby code and pause code at 760×480 and 1280×577. The exact-file pause copy button reports COPIED after a native click.
- Runtime canvas checks cover 88 poses × three alternate pilots = 264 recolored variants, preserving every alpha byte and changing only orange pixels. All four wipe poses contain no orange fabric for Echo, Flint or EOS. Visual contact sheets review warm weapon parts separately and mixed goo on all four gloves.
- The existing simulated standard-controller browser checks are repeated against v8. Hardware, separate-network NAT behavior, prolonged four-player load and a full human campaign playthrough are outside this verification.

Evidence: `artifacts/final-verification-v8.json`, `crew-file-v8.json`, `suit-frames-v8.json`, contact sheets and in-game screenshots. Browser palette checks are reproducible by serving the repository and evaluating `tests/browser/suit-check.js`. Room tests use the existing `scrapper` diagnostic interface and the actual online room service.

Protocol 4 is unchanged. Everyone should use v8 for the rendering and color corrections; the host must use v8 for unique character assignment. Solo play remains available from the standalone file without a server.
