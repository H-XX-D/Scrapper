# Play Scrapper

**[Download the playable HTML](https://github.com/H-XX-D/Scrapper/releases/latest)** from the latest release's Assets section. Choose `Scrapper-Playable-v*.html`, save it, open it in Chrome or Edge, wait for the art to load, and select **DEPLOY SOLO**.

The standalone game includes its code, pixel art, fonts and sound synthesis. Solo play needs no server. The HTML is about 232 MiB, above GitHub's regular Git file limit, so it is distributed as a release download rather than stored in this folder's Git history. The `.sha256` files here identify the exported builds.

To build the playable files from source, run `npm ci` followed by `npm run export` in the repository root. That creates `exports/Scrapper.html` and the numbered playable HTML locally.
