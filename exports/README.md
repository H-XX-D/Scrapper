# Play Scrapper

**[Download the playable HTML](https://github.com/H-XX-D/Scrapper/releases/latest)** from the latest release's Assets section. Choose `Scrapper-Playable-v*.html`, save it, open it in Chrome or Edge, wait for the art to load, and select **DEPLOY SOLO**.

The standalone game includes its code, pixel art, fonts and sound synthesis. Solo play needs no server. The HTML is about 245 MiB, above GitHub's regular Git file limit, so it is distributed as a release download rather than stored in this folder's Git history. The `.sha256` files here identify the exported builds.

The current source creates V13: `Scrapper-Fast-Load-v13.zip`, `Scrapper-Fast-Load-v13/Scrapper.html`, and `Scrapper-Playable-v13.html`. Extract the whole Fast Load ZIP and keep its `assets` folder beside the launcher. V13 includes AURA browser state deltas, per-player nearby combat replication, smaller encounters and a thirty-monster local budget. Every player needs V13 / room protocol 9. These local outputs become public downloads only after a V13 release is published; the existing release links currently point to V12.

To build the playable files from source, run `npm ci` followed by `npm run export` in the repository root. That creates `exports/Scrapper.html` and the numbered playable HTML locally.

Maintainers can publish a prepared draft from **Actions → Publish playable HTML → Run workflow** on `master`, supplying its version tag. The runner rebuilds the game, verifies the committed SHA-256 checksum, runs the tests, and uploads the real HTML to that draft before making it public. It refuses to overwrite a published release.
