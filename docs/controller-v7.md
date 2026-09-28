# Controller support / v7

`controller.js` polls fresh standard-layout Gamepad objects each frame, tolerates null slots, and retains one active pad. Radial dead zones rescale stick travel; look uses a curved response and elapsed time. Press edges trigger reload/use/wipe/choices/weapon changes once. A 120 ms jump buffer survives the room input cadence without repeating on a held button. Connection, focus and UI state transitions require neutral before rearming.

`controller-menu.js` focuses the existing title, pause and result elements, skips hidden/disabled items, repeats directional navigation, adjusts selects/ranges and edits six-character room codes. Focus uses the existing amber/steel palette. Settings persist independently of campaign saves; unavailable storage is tolerated. The browser or OS may require a click for audio and native file dialogs.

The app merges analog and keyboard movement before the shared traversal function. Both guest prediction and host simulation now preserve partial-stick speed. Reliable room action counters carry controller interactions, reload, wipe and choices. Room protocol 4 is unchanged. Controller play does not request mouse lock, while mouse aiming retains it.

Validation: seven focused tests plus the prior seventy pass. The exact standalone file passes simulated Gamepad API browser interaction checks, including actual firing, reload, case pickup, choice, wipe, pause/disconnect and menu settings. Test traversal uses debug teleports only to reach the case and archive quickly. This is automated input verification, not a human campaign playthrough or physical-controller certification. No new art or extra gameplay HUD panel is added.
