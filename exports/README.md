# Play Scrapper

**[Download V13 Fast Load](https://github.com/H-XX-D/Scrapper/releases/download/v13/Scrapper-Fast-Load-v13.zip)** for the recommended playable build. Extract the entire ZIP, then open `Scrapper-Fast-Load-v13/Scrapper.html` in Chrome or Edge. Keep the `assets` folder beside the launcher. The title loads first; choose **DEPLOY SOLO** to load the mission and play.

The Fast Load ZIP is about 185 MiB and includes all code, pixel art, fonts and sound synthesis. Its HTML launcher is about 1.12 MiB. Solo play needs no server or installation.

Prefer one file? Download the [V13 standalone HTML](https://github.com/H-XX-D/Scrapper/releases/download/v13/Scrapper-Playable-v13.html), or its [ZIP](https://github.com/H-XX-D/Scrapper/releases/download/v13/Scrapper-Playable-v13.zip), and open the saved HTML. It is about 245 MiB. Both formats contain the same game and can join the same room. **Every player needs V13 / room protocol 9.** [V13 release notes and all downloads](https://github.com/H-XX-D/Scrapper/releases/tag/v13).

V13 includes AURA browser state deltas, per-player nearby combat replication, smaller encounters and a thirty-monster local budget. The large playable files are distributed as release downloads rather than stored in this folder's Git history. The `.sha256` files here identify the exported standalone HTML builds.

To build the playable files from source, run `npm ci` followed by `npm run export` in the repository root. That creates `exports/Scrapper-Fast-Load-v13.zip`, `exports/Scrapper-Fast-Load-v13/Scrapper.html` with its assets, `exports/Scrapper-Playable-v13.html`, its ZIP, and the standalone alias `exports/Scrapper.html`.

Maintainers can publish a prepared draft from **Actions → Publish playable HTML → Run workflow** on `master`, supplying its version tag. The runner rebuilds the game, verifies the committed SHA-256 checksum, runs the tests, and uploads the real HTML to that draft before making it public. It refuses to overwrite a published release.
