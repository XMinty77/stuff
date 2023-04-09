# About

This document attempts to explain Seeker states and their behavior.
The explanation is coupled with references to values this [Beta Build of CelesteTAS](https://github.com/EverestAPI/CelesteTAS-EverestInterop/suites/12114543885/artifacts/638447220) displays.
WIP...

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
2. One of three conditions is satisfied:
	- The state is `StSpotted`
	- The center of the seeker $c$ is within the rectangle formed by the camer bounds
	- The distance from the seeker to the player satisfies $||u||<=20$ tiles 
3. Both segments of sight $s_1, s_2$ don't intersect any solids
4. The state is not `StRegenerate`

## `lastSpottedAt`
`lastSpottedAt` is updated every frame `canSeePlayer` is true to the current player position. Meaning, it reflects the last position the player was seen at.
When `lastSpottedAt` changes, the seeker runs the pathfinding algorithm to attempt to generate a movement path towards it.

## `FollowTarget`
`FollowTarget` is always two pixels higher than `lastSpottedAt`.

## `CanAttack`
`CanAttack` is not updated continuously, but can be calculated on any given frame. Its value reflects whether the seeker can begin the attack dash or not.

`CanAttack` is true if and only if:
1. The player is within 3 tiles of the seeker vertically (inclusive)
2. The player is further than 2 tiles of the seeker horizontally (inclusive)
3. The angle between the center of the seeker and `FollowTarget` is less than or equal to 30° degrees from the horizon, as demonstrated in the picture below (blue passes the check, red does not): ![[seekerattackangle.png]]

# States
## `StIdle`

`StIdle` is the initial state for any seeker.
