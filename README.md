somewhat of a mess

### Todo

- input validation
  - is there a way to make this bearable with socket.io or do we find an alternative that has built-in standard schema integration
  - and things beyond (no boss class selection in e.g. ffa)
- room stuff
  - clearer side effects
  - way to cleanly open and close custom rooms
- finish moving all ui logic to svelte components, remove jsx-dom
  - the largest part remaining is the leaderboard/game over menu
- simplify `setupSocket` logic (can we keep the same `io` instance and the same event handlers when reconnecting/switching rooms?)

- gameplay:

  - [some reference images](https://docs.google.com/document/d/1MVG3LtUC43gxpqoxGqKq_0YmhUDt0kAWT85CMT4Ojk0/edit?usp=sharing)

  - player mechanics:
    - player y position might be too high in general:
      - likely the root cause for some issues like jump clipping wall, collision bounds not matching up right?
      - affects both sprite and hitbox, and seemingly can see a thin horizontal line in the character shadow of where the player should really be standing
    - player hitboxes should be shorter, narrower; current hitboxes allow bullets to hit in blank spaces outside of the sprite
    - spawn protection should be enabled when a player spawns (~2 seconds)

  - bullets:
    - with pierce should phase through players and continue dealing damage if hit again for up to pierceCount times
    - should not go through barrels when standing right underneath them and shooting upwards
    - explosion damage from oil barrels or explosive bullets should be direction-dependent:
      - wiki claims for rocket:
      > If a rocket directly hits a player from above, the rocket can only hope to deal at most 69 damage. From the sides, that number is increased to 100 damage as long as it hits the legs. The bottom of an enemy is the most vulnerable, notable, as a direct hit from below can deal as much as 110 damage.
      - (more generally, damage reductions for side/above hits should probably be proportions?)
    - need longer trails in general
    - should have the trails persist after hitting wall for much less time in general
    - bullet shots fired into visible walls and non-explosive barrels should create bullet holes occasionally, which persist ~8-10 seconds before fading

  - notifs/events:
    - the "3d" text notifications' extruded effect should use a darkened shade of the notification text color to indicate depth, not be completely black
    - everyone should see small text notifications when anyone kills someone: "GUEST1 KILLED GUEST2"
      - if a player suicides: "GUEST1 COMMITTED SUICIDE"
      - notifications should stack vertically if multiple kills occur at the same time
    - if GUEST1 kills GUEST2, but GUEST3 dealt some damage to GUEST2 just before that was not healed back, then GUEST1 should only get a proportional amount of points for the kill to the damage they dealt, and GUEST3 should receive the remaining points for a kill assist
      - GUEST3 should see a big anim text when the kill occurs: main text "KILL ASSIST", subtext "+XX POINTS"
    - on lootcrate collection, a player should see a big anim text: main text "LOOTCRATE COLLECTED", subtext "+100 POINTS"
    - after reloading finishes for weapon with >1 ammo, a small text notification should show to the player: "AMMO FULL"
    - reloading and associated text notification shouldn't occur if ammo is depleted, but the player just died

  - misc:
    - there should be blood spatters when players are hit by bullets
    - players should have brief particle trails following them when they walk
    - grenades, rockets should have particle trails as well
    - different characters should have different jump strengths
    - on death, a player should continue to see the game progress with players moving around in the background of the main menu
    - duck jump's explosion should cause self-damage (100)
    - spray draw positions should be influenced by where weapon is pointing / influenced slightly by cursor direction, not necessarily placed directly on the player's position

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
