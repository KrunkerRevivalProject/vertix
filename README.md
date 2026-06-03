somewhat of a mess

<details>
  <summary>todos</summary>
  
  - input validation
    - is there a way to make this bearable with socket.io or do we find an alternative that has built-in standard schema integration
    - and things beyond (no boss class selection in e.g. ffa)
  - room stuff
    - clearer side effects
    - way to cleanly open and close custom rooms
  - finish moving all ui logic to svelte components, remove jsx-dom
    - the largest part remaining is the game over menu
  - simplify `setupSocket` logic (can we keep the same `io` instance and the same event handlers when reconnecting/switching rooms?)
  - set up database for accounts, clans (probably lower priority)

  - gameplay:

    - player mechanics:
      - player y position is too high in general:
        - likely the root cause for some issues like jump clipping wall, bullet holes too high, collision bounds not matching up right
        - affects both sprite and hitbox, and seemingly can see a thin horizontal line in the character shadow of where the player should really be standing
      - should not show up on in-game leaderboard until they have first spawned into current round
      - respawn algo is a little off
      
    - bullets:
      - the bullets seem to overshoot for a frame before dissappearing (when shooting the corner of a wall) {expected behavior is for them to disappear same frame upon hitting the wall}
      - should not go through barrels when standing right underneath them and shooting upwards
      - arsonist bullets are off
        - probably messed this one up earlier with attempted pierce fixes, but this is likely because bullets should do damage multiple times to same player
      - if switch weapons too quickly, it looks like the gun fires twice (?)

    - notifs/events:
      - game over stats menu sometimes shows first place in second row instead of first
      - hardpoint score updates should probably occur on the server, independent of client socket emits

    - misc:
      - different characters should have different jump strengths
      - nices/likes are broken
      - room player limit of 8 should be enforced
      - fix wall glitch into corners, able to get out of bounds this way
      - make it harder for player to accidentally click out of a game right after dying by clicking on a room in the room browser (maybe have a dedicated "join" button?)

</details>

## How to install and play locally

### Windows

- Go to https://nodejs.org/en/download and follow the install instructions for windows for v25 of nodejs, not the LTS one
- Go to https://pnpm.io/installation and follow the install instructions for windows
- Go to https://git-scm.com/install/windows and download the installer, or use winget to install git, open powershell and run `git clone https://github.com/KrunkerRevivalProject/vertix.git` **OR** download the repo as a zip and extract it somewhere.
- Open powershell in the vertix folder (the one you cloned or extracted), and run `pnpm i`, after that's done you won't need to run it again
- To start the server run `pnpm dev` then go to http://localhost:5173 in your browser.

### Linux

- If your package manager has v25 of nodejs, you can install everything from there, if not go to https://nodejs.org/en/download, https://pnpm.io/installation and follow the install instructions for linux.
- Install git from your package manager if you haven't already, run the following in your terminal

```
git clone https://github.com/KrunkerRevivalProject/vertix.git
cd vertix
pnpm i
```

- To start the server run `pnpm dev` then go to http://localhost:5173 in your browser.
