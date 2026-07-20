# Prototype Instructions

Run the local server yourself and open the preview in the browser available to this environment. Do not give the user server-start instructions when you can run it.

Before making substantial visual changes, use the Product Design plugin's `get-context` skill when the visual source is unclear or no longer matches the current goal. When the user gives durable prototype-specific design feedback, preferences, or decisions, record them in `AGENTS.md`.

When implementing from a selected generated mock, treat that image as the source of truth for layout, component anatomy, density, spacing, color, typography, visible content, and hierarchy.

## Active design direction

- Project and category selectors use a single rounded indicator that slides horizontally between options; do not show reading-progress lines in either control.
- Switching a project or FlexClip category returns the fullscreen reader to the beginning.
- Folder artwork sits 16px higher inside each project card, while card edge glow follows the same quiet white perimeter and restrained cobalt halo used elsewhere.
- Contact uses an interactive LiquidEther WebGL field instead of a bitmap background, leads with “感谢您的查看 / Thank you for viewing,” has no left CTA button, and gives phone, WeChat, email, and Chengdu details stronger emphasis.
- The Contact phone label includes “（微信同号）” in Chinese, and its return-home link is centered at the bottom.

- The entire left/right project case card is the pointer and keyboard activation target; Folder remains a visual cue only and carries no visible “open project” helper text.
- Fullscreen project scrolling uses the homepage inertia values (`lerp: 0.075`, `wheelMultiplier: 0.82`) and drives a live white reading-progress line in the project switcher.
- The project switcher always has a rounded selected pill; its progress line is separate from the selection treatment.
- Fullscreen back and close controls keep equal 7px perimeter spacing inside the navigation bar and use fully rounded Liquid Glass shapes.
- FlexClip single-column imagery has no exterior border or corner radius; image captions are centered.

- Fullscreen project navigation and category controls visually match the homepage Liquid Glass navigation, including its 64px desktop height, quiet underline selection, and vertically centered labels.
- FlexClip AI Web Tools and Mobile use a centered single-column image story with captions; Web Pages uses a tight two-column masonry layout without captions.
- Bean Tennis has no category headings or descriptions between image groups; all source images remain one uninterrupted zero-gap vertical sequence.
- The project overlay remains slightly translucent with background blur, and its internal scroll container must accept ordinary mouse-wheel scrolling independently from the locked homepage.

- Projects use a balanced two-column case-study introduction on the homepage; the project switcher belongs only inside the fullscreen project reader and must never appear in the persistent site navigation.
- Closing the fullscreen project reader resets both Folder components to their original closed state.
- FlexClip project imagery carries a visible title for every image, including all five mobile design assets; Bean Tennis displays all 29 source images as one seamless vertical sequence with zero gaps.
- Fullscreen project layouts remain centered and use reversible scroll reveals consistent with the homepage motion language.

- About and Advantages keep their existing matte layout; BorderGlow may affect only the perimeter line and its outer halo, never the card fill.
- Projects begin with a full-width cobalt/white Strands transition field after Advantages.
- Selected projects use a restrained matte CardSwap stack with text, metadata, and tags only; do not use bitmap project surfaces until the user supplies high-resolution project images.
- The user selected the third generated direction: a restrained, editorial noir portfolio with one cobalt accent.
- Preserve its asymmetrical full-screen hero, biography plus timeline, two oversized project cards, and cinematic contact finale; the previous outcomes band has been intentionally removed.
- Place Personal Advantages immediately after About, before Projects, using a five-card MagicBento layout with restrained cobalt spotlight, edge glow, particles, tilt, magnetism, and ripple feedback.
- The user wants to judge the real scroll motion and interaction flow before providing detailed refinement feedback.
- Improve beauty through typography, spacing, material depth, and motion polish without drifting into cyberpunk, generic templates, excessive glow, or dashboard styling.
- Keep project imagery intentionally abstract until the user provides separate high-resolution project assets.
- Motion is a primary deliverable: use Lenis-style inertial scrolling, reversible intersection reveals, section depth shifts, project-media parallax, numeric count-up, and fluid menu/dialog transitions.
- The persistent navigation and interactive UI kit should use a restrained Liquid Glass treatment informed by Apple: glass belongs to the floating functional layer, while content surfaces remain mostly matte; avoid glass-on-glass stacking.
- The hero title is locked to “王海帆 VibeCoding 设计作品集” in Chinese and “Wang Haifan VibeCoding Design Portfolio” in English.
- Use the React Bits Prism shader as the hero background with `animationType="hover"`; it should respond smoothly to the pointer and feel generated, spectral, dark, and alive rather than image-based.
- The navigation wordmark is “Whaifan” in the same Cormorant Garamond italic voice as the hero signature line.
- Liquid Glass should follow Apple’s functional-layer principle: highly translucent, optically edged, adaptive to background, pointer-responsive, and never a heavy gray frosted slab.
- The user explicitly wants the portfolio motion preview to remain visible in the current browser even when its environment reports reduced-motion.
- The full hero stack is center-aligned: eyebrow, title, serif subtitle, and scroll cue share one vertical axis in both languages and across responsive sizes.
- Persistent navigation labels should be close to white and immediately legible over the animated LiquidChrome background, while secondary metadata may remain muted.
- Center the complete hero copy group exactly against the full hero background/viewport; do not add a downward navigation compensation offset.
- The desktop navigation uses a very thin live progress line under the currently viewed section; keep labels generously spaced and the progress treatment quiet.
- The language control spells the English option as `English`, with the active language rendered clearly rather than overly muted.
- The centered scroll cue retains a brighter, high-contrast glass button over animated hero backgrounds.
- Render the Prism hero at its native viewport size without CSS overscan, scale-up, or canvas filters; keep shader noise disabled to avoid moire and preserve a clean high-resolution surface.
- Prism hover interaction must be captured across the entire hero, including overlaid title and navigation regions.
- Navigation section progress is solid white, never gradient-tinted.
- The About section is a two-card ScrollStack: personal information and education first, formal work history second; preserve the resume wording and place additional part-time experience in a quieter but readable tier.
- Apply proximity grouping inside resume cards: identity facts, contact methods, biography, education, formal roles, and additional experience each form a distinct nearby cluster.
- Use the same near-black matte surface for both About cards; do not tint the second card differently.
- In the Chinese profile heading, render the greeting prefix in gray and keep the name white; keep the English heading fully white.
- Resume body copy uses one consistent readable white text style, while labels and metadata carry the secondary gray hierarchy.
- Center fact labels over their values; keep duration numerals prominent and make Chinese year/month units smaller and quieter.
- The four profile facts always use equal-width columns; separators are centered at half the fact row height, and English duration units are subdued like Chinese units.
- Center the hero scroll-cue label on the hero axis and position its circular arrow independently to the label's left.
- Phone/email values, school names, degree names, and biography copy share one white body-text size; work role names match their company names in size.
- Additional-experience titles and descriptions remain secondary but are never undersized.
- Animate every additional-experience item individually when the work card becomes active.
- Keep work dates close to their corresponding company and description, and never use tiny low-contrast gray copy for substantive work content.
- On screens at or below 900px, disable card pinning and allow the full resume content to scroll naturally without horizontal overflow.
- Keep the optical gap between the hero name and `VibeCoding` at approximately 6px.
- Treat the hero scroll cue as one centered button-and-label group and keep it about 14px above its earlier bottom position.
- Resume contact cards and the persistent back-to-top control use the same pointer-responsive Liquid Glass hover language as the floating navigation and hero cue.
- Work-history dates remain secondary metadata but use a readable 13px size.
- Keep the `Whaifan` navigation wordmark optically small and refined at roughly 22–28px.
- The hero title uses two rows: name plus the optically enlarged italic “VibeCoding” on the first row, and the portfolio descriptor on the second row, in both languages.
