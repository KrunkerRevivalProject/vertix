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

    - [some reference images](https://docs.google.com/document/d/1MVG3LtUC43gxpqoxGqKq_0YmhUDt0kAWT85CMT4Ojk0/edit?usp=sharing)

    - player mechanics:
      - player y position is too high in general:
        - likely the root cause for some issues like jump clipping wall, bullet holes too high, collision bounds not matching up right
        - affects both sprite and hitbox, and seemingly can see a thin horizontal line in the character shadow of where the player should really be standing

    - bullets:
      - should not go through barrels when standing right underneath them and shooting upwards
      - grenade particle trails should cease on nade explosion on opponent screens, but currently keep going through the hit player

    - notifs/events:
      - if GUEST1 kills GUEST2, but GUEST3 dealt some damage to GUEST2 just before that was not healed back, then GUEST1 should only get a proportional amount of points for the kill to the damage they dealt, and GUEST3 should receive the remaining points for a kill assist
        - GUEST3 should see a big anim text when the kill occurs: main text "KILL ASSIST", subtext "+XX POINTS"
      - "Kill", "Double Kill", ..., "Godlike" notifs are not working for consecutive kills
      - reloading and associated text notification shouldn't occur if ammo is depleted, but the player just died prior

    - misc:
      - different characters should have different jump strengths
      - points in notifications should accumulate when player in hardpoint ("+10", "+20", "+30")
        - actual point increment is still +10 per second, points stack just in the notification
        - if kills made while in hardpoint, those should add to to the notification's displayed increment ("+10", "+110")
      - nices/likes are broken
      - room player limit of 8 should be enforced

</details>

## How to install and play locally

### Windows

- Go to https://nodejs.org/en/download and follow the install instructions for windows for the current version of nodejs, not the LTS one
- Go to https://pnpm.io/installation and follow the install instructions for windows
- Go to https://git-scm.com/install/windows and download the installer, or use winget to install git, open powershell and run `git clone https://github.com/KrunkerRevivalProject/vertix.git` **OR** download the repo as a zip and extract it somewhere.
- Open powershell in the vertix folder (the one you cloned or extracted), and run `pnpm i`, after that's done you won't need to run it again
- To start the server run `pnpm dev` then go to http://localhost:5173 in your browser.

### Linux

- If your package manager has the current version of nodejs, you can install everything from there, if not go to https://nodejs.org/en/download, https://pnpm.io/installation and follow the install instructions for linux.
- Install git from your package manager if you haven't already, run the following in your terminal

```
git clone https://github.com/KrunkerRevivalProject/vertix.git
cd vertix
pnpm i
```

- To start the server run `pnpm dev` then go to http://localhost:5173 in your browser.
