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
      - should not show up on in-game leaderboard until they have first spawned into current round
      
    - bullets:
      - the bullets seem to overshoot for a frame before dissappearing (when shooting the corner of a wall, sometimes when shooting clutter) {expected behavior is for them to disappear same frame upon hitting the wall}
      - if switch weapons too quickly, it looks like the gun fires twice (?)

    - notifs/events:
      - hardpoint score updates should probably occur on the server, independent of client socket emits

    - misc:
      - different characters should have different jump strengths
      - fix head clipping through wall when jumping against bottom of wall (though this happened in original too)
      - room player limit of 8 should be enforced
      - make it harder for player to accidentally click out of a game right after dying by clicking on a room in the room browser (maybe have a dedicated "join" button?)
      - players should not be rendered inside walls of new map after game countdown finishes and new round starts
      - (check) should there be bullet holes in non-explosive barrels? need to render them after game objects in that case
        - the walk dust particles in same layer currently should stay behind barrels though

</details>

## How to install and play locally

This will allow you to host vertix locally on your computer, though others will not be able to join the session.

### Windows

- Follow the install instructions for Windows for [nodejs v25 (or greater)](https://nodejs.org/en/download). (Note that v25+ is not necessarily the LTS version, which is v24 as of this README's last update.) The default configurations suggested by the installer are ok to keep.
- Follow the install instructions for Windows for [pnpm](https://pnpm.io/installation). Either the npm command method or the standalone script method should work.
- Do **either one** of the following:
  - Install git by using the [installer](https://git-scm.com/install/windows) or through winget. Then open powershell and run `git clone https://github.com/KrunkerRevivalProject/vertix.git`.
  - Download the repo as a zip (an option available via the green "Code" button here) and extract it in a folder of your choice.
- Open powershell in the vertix folder (the one you cloned or extracted). Run `pnpm i`; after that's done, you won't need to run it again.
- To start the server, run `pnpm dev` in powershell. You should shortly see the game up on http://localhost:5173 in your browser.

### Linux

- If your package manager has nodejs v25 (or greater), you can install everything from there. If not, follow the install instructions for Linux for [nodejs v25 (or greater)](https://nodejs.org/en/download) and [pnpm](https://pnpm.io/installation).
- Install git from your package manager if you haven't already. Run the following in your terminal:

```
git clone https://github.com/KrunkerRevivalProject/vertix.git
cd vertix
pnpm i
```

- To start the server, run `pnpm dev`, then go to http://localhost:5173 in your browser.

## Playing with others

These instructions briefly walk through a setup that uses cloudflared, but alternative options exist and can be similarly used to perform tunneling. As a prerequisite, ensure you have the local setup working first.

- Follow the install instructions for [cloudflared](https://developers.cloudflare.com/cloudflare-one/networks/connectors/cloudflare-tunnel/downloads/).
- Start the local vertix server bu running `pnpm dev` in your terminal.
- Open a new terminal while keeping the existing one running, and run `cloudflared tunnel --url http://localhost:5173`. Within a few seconds, this will give you a URL that you can then share with others.
