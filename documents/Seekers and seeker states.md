# About

This document attempts to explain Seeker states and their behavior.
The explanation is coupled with references to values a [Beta Build of CelesteTAS](https://github.com/EverestAPI/CelesteTAS-EverestInterop/suites/12114543885/artifacts/638447220) displays.

# Notes

Measurements are given in tiles for ease of interpretation, the game always checks values in pixels.
Exclusive tile distances exclude only the furthest point of the furthest tile, not the entire tile and not the further pixel.
When comparing the position of the seeker to the position of the player (e.g. distance check), the center of the hitbox of both is assumed to be the point of reference unless specified otherwise.
Acceleration is denoted in $\mathrm{px/s^2}$. The value in $\mathrm{px/s/frame}$ changes depending on the time rate as the game multiplies the constant value in $\mathrm{px/s^2}$ by delta time.

# Values

## `canSeePlayer`
`canSeePlayer` is continuously updated on each frame to reflect whether the player is in sight of the seeker or not.

Let:
* $p$ be the center of the player
* $c$ be the center of the seeker
- $u$ be the vector from the center of the seeker to the center of the player: $u=p-c$
- $v$ be the vector perpendicular to $u$ and two pixels long
* Segments of sight $s_1$ and $s_2$ be the line segments between pairs of points $(p+v, c+v)$ and $(p-v, c-v)$ respectively

`canSeePlayer` is true if and only if:
1. The player exists in the level (e.g. not dead)
2. At least one of three conditions is satisfied:
	- The state is `StSpotted`
	- The center of the seeker $c$ is within the rectangle formed by the camera bounds
	- The distance from the seeker to the player satisfies $||u||<=20$ tiles 
3. Both segments of sight $s_1, s_2$ don't intersect any solids
4. The state is not `StRegenerate`

## `lastSpottedAt`
`lastSpottedAt` is updated every frame `canSeePlayer` is true to the current player position. Meaning, it reflects the last position the player was seen at.
When `lastSpottedAt` changes, the seeker runs the pathfinding algorithm to attempt to generate a movement path towards it. If the pathfinding algorithm fails, a flag is stored to indicate that.

## `FollowTarget`
`FollowTarget` is always two pixels higher than `lastSpottedAt`.

## `spotted`
`spotted` is set to true every frame `canSeePlayer` is true, but never reset to false. Meaning, it indicates whether the seeker is aware of the player's of presence or not (having seen the player once before or not).

## `CanAttack`
`CanAttack` is not updated continuously, but can be calculated on any given frame. Its value reflects whether the seeker can begin the attack dash or not.

`CanAttack` is true if and only if:
1. The player is within 3 tiles of the seeker vertically (inclusive)
2. The player is further than 2 tiles of the seeker horizontally (inclusive)
3. The angle between the center of the seeker and `FollowTarget` is less than or equal to 30° degrees from the horizon, as demonstrated in the diagram below (blue passes the check, red does not): ![[seekerattackangle.png]]

## `GetSpeedMagnitude`
`GetSpeedMagnitude` is a routine that can be evaluated to determine the target magnitude of the speed vector. It takes a base magnitude $b$, and returns the first applicable value of the following:
1. If the player does not exist in the scene, return $b$ (the base magnitude as-is)
2. If the player is within 14 tiles (inclusive) of the seeker, return $1.5b$
3. Return $3b$
Note that `GetSpeedMagnitude` operates on the current position of the player, not on `lastSpottedAt` or `FollowTarget`.
This means that for the states that use `GetSpeedMagnitude` to determine the speed, it is possible to manipulate the seeker into moving faster by maintaining a distance greater than 14 tiles from it.

## Patrol Points
Some seekers have nodes placed in their map data. Those nodes act as patrol points of sorts, randomly chosen ones of which the seeker continuously goes to.

# States

## `StIdle`
### About
`StIdle` is the initial state for newly spawned seekers, and the default for when seekers don't know what to do.
While in `StIdle` seekers mostly goof around and don't do anything effective to find the player.
`StIdle` can transition to `StPatrol` and `StSpotted`.

### Update Algorithm
- If `canSeePlayer` is true, change the state to `StSpotted` and stop execution.
- Set the target speed vector per default to a sinewave movement pattern (cosmetic idle animation)
- If `spotted` is true AND `FollowTarget` is more than a tile away:
	- Evaluate `GetSpeedMagnitude` with a base magnitude of 50 and set the result as the target speed magnitude
	- If pathfinding succeeded for `lastSpottedAt`, set the target speed direction tangential to the current segment of the path. Otherwise, set the direction to be directly towards `FollowTarget`.
- Change the speed vector towards the target speed vector by a maximum magnitude of 200 $\mathrm{px/s^2}$ (the maximum change in magnitude for one frame is dependent on delta time).

### Takeaways
- `StSpotted` is entered as soon as the seeker first sees the player.
- While the player isn't in sight, seekers will always move towards the last seen player position while in `StIdle` (they do that if `spotted` is true and it must be if the player has been seen before).
- Seekers can overshoot the segment of the path they're moving on and have to decelerate then accelerate back towards the next segment.
- The optimal way to move seekers while in `StIdle` is to stay more than 14 tiles away to trigger the high speed condition in `GetSpeedMagnitude`. This can achieve a peak speed (if done accelerating) of 150.
- If closer than 14 tiles to the seeker, the peak speed (if done accelerating) is 75.


## `StPatrol`
### About
`StPatrol` is the state that indicates the seeker is aware of the player's presence but cannot find them.
While in `StPatrol`, seekers try to randomly patrol around predetermined points called [Patrol Points](#patrol-points), in an effort to spot the player somewhere in the vicinity. 
`StPatrol` can transition to `StSpotted`.

### Timers
The patrol state has `patrolWaitTimer`, or the patrol delay timer. It is responsible for creating 0.4 seconds of delay between reaching a patrol point and choosing the next patrol point.

### Update Algorithm
- If `canSeePlayer` is true, change the state to `StSpotted` and stop execution.
- Check the patrol delay timer
	- If it is still running, update it to the current frame time (reduce it by one delta time). Then, if it has run out after updating, randomly choose the next patrol point to go to.
	- If it has run out, reset it to 0.4 seconds.
- Set the target speed magnitude to `GetSpeedMagnitude` with a base speed of 25.
- If pathfinding succeeded for the current patrol point, set the target speed tangential to the current segment of the path. Otherwise, set the target speed to be directly towards the current patrol point.
- Change the speed vector towards the target speed vector by a maximum magnitude of 600 $\mathrm{px/s^2}$ (the maximum change in magnitude for one frame is dependent on delta time).

### Takeaways
- Seekers find and move along a path towards randomly chosen patrol points, with 0.4 seconds of delay between reaching one and choosing the next one.
- The optimal way to move seekers while in `StIdle` is to stay more than 14 tiles away to trigger the high speed condition in `GetSpeedMagnitude`. This can achieve a peak speed (if done accelerating) of 75.
- If closer than 14 tiles to the seeker, the peak speed (if done accelerating) is 37.5.

## `StSpotted`
### About
`StSpotted` is the state that indicates the seeker has recently spotted the player.
While in `StSpotted`, seekers try to move fast towards the last spotted player position to try to find them.
`StSpotted` can transition to `StIdle` and `StAttack`.

### Timers
The spotted state has `spottedLosePlayerTimer`, or the losing player timer. It is responsible for keeping track of how much time has passed since the player was last spotted. The timer is set to 0.6 seconds and considered "lost" when this timer runs out.
It also has the attack delay timer, a 0.2 seconds timer that starts running when the state is entered.

## Update Algorithm
- Check `canSeePlayer`
	- If false, update the losing player timer to the current time (reduce it by delta time). If it has run out, change to `StIdle` and stop execution.
	- If true, refresh the losing player timer to 0.6 seconds.
- Set the target speed magnitude to `GetSpeedMagnitude` with a base speed of 60.
- If pathfinding succeeded for `lastSpottedAt`, set the target speed direction tangential to the current segment of the path. Otherwise, set the direction to be directly towards `FollowTarget`.
- If the last seen player position is lower than `FollowTarget`, and it's within 6.25 tiles (50 pixels) of the seeker, run the following sub algorithm:
	- Set the target angle to the angle of the current target speed (as determined by the steps above).
	- If the seeker is higher than four pixels above the last seen player position, set the target angle to halfway between the current target angle and straight downwards.
	- If the seeker is lower than the last seen player position, set the target angle to halfway between the current target angle and straight upwards.
	- Set the target speed to a vector of the target angle and of magnitude 60.
	- If there are no solids within 6 tiles in the horizontal direction (left/right) from the seeker towards the last spotted player position both starting from the seeker position and the last spotted player position, and the last spotted player position is less than 4.5 tiles (36 pixels) away from the seeker position horizontally, set the horizontal component of the target speed vector to 60 in the horizontal direction from the seeker towards the last spotted player position.
- Change the speed vector towards the target speed vector by a maximum magnitude of 600 $\mathrm{px/s^2}$ (the maximum change in magnitude for one frame is dependent on delta time).
- Check the attack delay timer, if it has run out, and `CanAttack` evaluates to true, change to the attack state.

### Takeaways
- If the player stays out of their line of sight, seekers will lose the player and default to `StIdle` after 0.6 seconds of entering this state.
- The last seen player position being within 6.25 tiles (50 pixels) in distance will make the seeker move roughly diagonally towards it.
- The optimal way to move seekers while in `StSpotted` is to stay more than 14 tiles away to trigger the high speed condition in `GetSpeedMagnitude`. This can achieve a peak speed (if done accelerating) of 180.
- If closer than 14 tiles to the seeker, the peak speed (if done accelerating) is 90.
- The high speed of `StSpotted` makes it the ideal state for rapidly manipulating the seeker towards some desired position.