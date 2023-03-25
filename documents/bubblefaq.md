# Frequently asked questions for floating point behavior

## What is XNA/FNA/MonoGame?
XNA, FNA and MonoGame are frameworks that provide the game with basic utilities such as graphics card acceleration, interfacing with the operating system and collecting player inputs. You can think of them as game engines, even though do way less than modern game engines.
These frameworks are almost identical providing the exact same functionality and codebase down to the name of the code routines. They are practically different versions of the same framework but developed by different parties. Therefore Celeste only ships with one of these at a time and so any installation of Celeste only uses one of them. This is why there are different "versions" of the game, they are identical copies but they ship with different backends.
XNA was developed by Microsoft for indie game developers and was used by the developers in early development. Although it still functions correctly, XNA has been discontinued by Microsoft in 2013. The XNA version is available for download only on Windows through Steam and itch.io.
FNA is an open source re-implementation of XNA with focus on accuracy and truthfulness to the original XNA, developed by Ethan Lee originally to allow for cross-platform XNA publishing. The FNA version is available for download on any PC platform through every store.
MonoGame is an open source re-implementation of XNA with some changes and innovations, developed by a team of indie developers to keep the spirit of XNA alive while introducing new features. It is available to download on console versions, and as such it is irrelevant to TASing.

## Where is FNA different than XNA?
Almost nowhere, actually. There are very few, very minute differences between the codebase of the two frameworks. FNA was always meant to be as identical to XNA as possible.

## What is .NET, .NET framework, Mono and .NET Core?**
Celeste is built on top of .NET framework (as are XNA and FNA), a proprietary platform created and maintained by Microsoft, officially targeting Windows only. Both Windows versions of the game (XNA/FNA) use Microsoft's original .NET framework runtime, while the Linux and MacOS versions use Mono, an independent cross-platform open source .NET Framework runtime.
*Note: The Linux version of the game ships with a different older version of Mono than the MacOS version. This is relevant to floating point behavior.*
*Note: The Windows version of the game utilizes .NET framework 4.5.2*
*Note: There is also .NET core: An open source platform created and maintained by Microsoft, targeting all PC platforms, but it's not used in any vanilla version of the game. There is however an effort in the community to migrate to it, as it is the more up-to-date better supported successor of .NET framework. More on that can be found in the last paragraph.*

## What is Just-In-Time compilation?
.NET programs (Celeste, XNA/FNA and Everest in this case) are stored in their files in an intermediate form called MSIL (Microsoft Intermediate Language) or IL for short. This format is halfway between raw human-readable programming language code (namely C#) and executable compiled machine code that can be run directly by the host processor.
Of course, processors are only able to run compiled machine code, and so IL code is not executable. The Just-In-Time compiler (JIT for short) which is part of the .NET runtime steps in when code needs to be executed to transform that code from the intermediate IL form to compiled machine code.
JIT compilation applies various tactics to improve code performance. This becomes relevant for some desyncs.

## Why are calculations imprecise/why is precision in calculations lost at all?
Computers carry out calculations through floating-point numbers. These numbers are capped to a certain number of bits and therefore have limited precision. The number type used most often in Celeste (and in all relevant game code) is the 32-bits floating point number - or float for short. This number type and its various operations are defined by the IEEE754 standard.
Due to having only limited precision, performing operations on 32-bit registers (registers are slots in the processor cache memory used to speed calculations) with these numbers can lead to imprecise results, off by a margin of error that gets larger the more you perform operations. This is the main source of imprecision for things like spinner cycles.
However, on some runtimes, calculations are actually performed on 80-bit registers (more on when this is the case in the next paragraph), which have enough precision that the margin of error is negligible, practically zero. The error occurs when the calculations are done: While the calculation registers have 80 bits of precision, floats are *always* stored in memory in 32 bits, and so after calculations are finished, the result is downcast to a 32 bits float, losing precision in the process. The resultant end error is still minute, even if it's very large in comparison to the error in 80 bit calculations.

## Where are there differences in floating-point behavior in different versions of the game?
The differences lie mostly in two points:
- Some (and not all) versions of the game utilize the x87 processor extension, which allows the usage of 80-bit float registers for more precise calculations. The other versions use SIMD operations on 32-bit float registers.
- Among the versions that do use 80-bit registers, each one has its own unique JIT compilation behavior. This, most of the time, creates no issues, but in rare cases, it's possible that two methods with identical MSIL code generate different floating point behavior. This happens because errors in calculations only occur when values are copied through a downcast from 80-bit registers to 32-bit floats in memory, and because of the differences in JIT compilation behavior, this can happen at different times. The size of the resultant error depends a lot on contextual factors such as the magnitude of the numbers, the length of the code, the number of operations done...etc

The following table summarizes which versions use 32-bit float registers (safe ✅) and which versions use 80-bit float registers (unsafe 💥)

|        | .NET Framework | Mono (Old) | Mono (New) | .NET Core |
| ------ | -------------- | ---------- | ---------- | --------- |
| 64-bit | SIMD (✅)      | x87 (💥)   | SIMD ✅    | SIMD ✅    |
| 32-bit | x87 (💥)       | x87 (💥)   | SIMD ✅    | x87 ✅     |

*Note: .NET Core 32-bit uses x87 but always explicitly downcasts, and therefore it's safe.*

## What is inlining?
Inlining is a JIT compilation optimization where, if a small method is called inside another longer method, the JIT compiler borrows the code of the callee method and inserts it into that of the caller method. This allows the compiler to optimize the caller method better for various reasons (that are not of relevance here).
Whether a call is inlined or not depends a lot on the exact code of the caller and callee methods, and is practically impossible to predict without running the code and checking the output machine code.

## Why do bubbles desync between XNA and FNA? Why do XNA bubbles snap to precisely the center pixel of the bubble while FNA bubbles slightly deviate?
The code that handles 2D vector addition in both XNA and FNA is small enough to trigger inlining. Namely, the method gets inlined in `Player.MoveToX, Player.MoveToY`, which are used by the code that handle bubble center snapping. However, through a cascade of JIT optimizations, the XNA version ends up with machine code that performs *all* the relevant calculations in bubble center snapping in one continuous chain on the 80-bit registers (on the versions that do use 80-bit registers), without needing to do any 32 bit downcasting, which gives it the *very* precise end position of the center pixel. FNA's version on the other hand does not receive the same optimization, and suffers from various errors due to 32 bit float imprecision, leading to the snap position deviating from the center pixel for each axis in either direction (positive or negative).
*Note: The subpixels value in 80-bits isn't actually exactly zero, but the small deviation from zero is lost to precision when the value is downcast to 32 bits.*
The actual snap position in FNA is highly dependent on the player's exact position value when touching the bubble, and with less importance the direction held on touch.
This deviation causes some TASes to desynchronize between the XNA and FNA versions of the game. Most of the time, the issue is manageable and the TASer is able to find a set of inputs that produces a desirable snap position.

## Why is all of this relevant?
There are long term plans (in a few months) to move Everest from running on the same .NET runtime the game provides to shipping with a consistent, more up-to-date .NET Core version. Once that is done, Celeste TASing will be coerced into one consistent bubble snapping behavior across every platform. And so before that happens, it is best to bring up the issue now and discuss which of the two behaviors is ultimately the most desirable: XNA's or FNA's?
This is a complicated question, with valid arguments that can be given for both stances. So please, if you have thoughts, concerns, suggestions or arguments, then do share them. We should decide this together, as a community.