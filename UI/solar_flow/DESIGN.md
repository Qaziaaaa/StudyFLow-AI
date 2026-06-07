---
name: Solar Flow
colors:
  surface: '#f8f9ff'
  surface-dim: '#cbdbf5'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4ff'
  surface-container: '#e5eeff'
  surface-container-high: '#dce9ff'
  surface-container-highest: '#d3e4fe'
  on-surface: '#0b1c30'
  on-surface-variant: '#584237'
  inverse-surface: '#213145'
  inverse-on-surface: '#eaf1ff'
  outline: '#8c7164'
  outline-variant: '#e0c0b1'
  surface-tint: '#9d4300'
  primary: '#9d4300'
  on-primary: '#ffffff'
  primary-container: '#f97316'
  on-primary-container: '#582200'
  inverse-primary: '#ffb690'
  secondary: '#855300'
  on-secondary: '#ffffff'
  secondary-container: '#fea619'
  on-secondary-container: '#684000'
  tertiary: '#9b4427'
  on-tertiary: '#ffffff'
  tertiary-container: '#e77e5c'
  on-tertiary-container: '#611901'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffdbca'
  primary-fixed-dim: '#ffb690'
  on-primary-fixed: '#341100'
  on-primary-fixed-variant: '#783200'
  secondary-fixed: '#ffddb8'
  secondary-fixed-dim: '#ffb95f'
  on-secondary-fixed: '#2a1700'
  on-secondary-fixed-variant: '#653e00'
  tertiary-fixed: '#ffdbd0'
  tertiary-fixed-dim: '#ffb59e'
  on-tertiary-fixed: '#3a0b00'
  on-tertiary-fixed-variant: '#7c2d12'
  background: '#f8f9ff'
  on-background: '#0b1c30'
  surface-variant: '#d3e4fe'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: '700'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '600'
    lineHeight: '1.2'
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 28px
    fontWeight: '600'
    lineHeight: '1.2'
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.3'
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.5'
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '500'
    lineHeight: '1.4'
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: '1.2'
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  2xl: 48px
  3xl: 64px
  container-max: 1280px
  gutter: 24px
---

## Brand & Style
The design system is built on a "Solar Neumorphic" aesthetic—a sophisticated evolution of neomorphism that prioritizes usability and accessibility while maintaining deep physical presence. The brand personality is energetic, professional, and tactile. It is designed to evoke a sense of high-performance hardware, where every digital surface feels like a precision-engineered physical control. 

The visual language utilizes "soft-surface" physics: elements appear to emerge from or float just above the background through multi-layered, diffused shadows rather than harsh outlines. The target audience includes professionals in renewable energy, industrial tech, and high-end productivity sectors who value a UI that feels substantial, reliable, and premium.

## Colors
The palette is centered around a high-energy "Solar Orange" that commands attention for primary actions. The background remains a pure, crisp white to provide the necessary contrast for the complex shadow structures that define the neumorphic style.

- **Primary (#F97316):** Used for critical call-to-actions and active states.
- **Secondary (#F59E0B):** Used for accent elements and secondary highlights.
- **Tertiary (#7C2D12):** Used for high-contrast text or deep accents within the solar spectrum.
- **Neutral (#64748B):** A slate-tinted grey used for body text and inactive icons to maintain a clean, professional atmosphere.
- **Surface (#F8FAFC):** A subtle off-white used for recessed or secondary containers to differentiate from the base background.

## Typography
This design system utilizes **Inter** exclusively to maintain a systematic, utilitarian feel that balances the highly expressive shadow work of the UI. 

The type hierarchy is characterized by tight tracking and generous line heights in body text to ensure legibility against light backgrounds. Headlines use a Bold or SemiBold weight to anchor the page, acting as visual "weights" that contrast with the airy, shadowed containers. Labels and small metadata should utilize Medium or SemiBold weights to ensure they don't get lost in the depth effects of the components.

## Layout & Spacing
The layout follows a strict 8px grid system to maintain mathematical harmony. Because the neumorphic shadows require significant "breathing room" to avoid visual muddying, generous margins are prioritized.

- **Desktop:** 12-column fluid grid with 24px gutters and 64px side margins.
- **Tablet:** 8-column fluid grid with 16px gutters and 32px side margins.
- **Mobile:** 4-column fluid grid with 16px gutters and 16px side margins.

Components should utilize "internal padding" that is at least one step larger than the "external margin" to reinforce the feeling of a container with physical thickness.

## Elevation & Depth
Elevation is the core identifier of this design system. We use a "Light-Source-Top-Left" model. Depth is achieved via two primary methods:

1.  **Lifted (Extruded):** For cards and primary buttons. This uses two shadows:
    *   **Light Side:** A white highlight shadow (-5px -5px 10px #FFFFFF) on the top-left.
    *   **Dark Side:** A soft, warm-grey shadow (5px 5px 15px rgba(249, 115, 22, 0.08)) on the bottom-right.
2.  **Recessed (In-set):** For input fields and toggles. This uses `box-shadow: inset` with similar light/dark coordinates to make the element appear carved into the surface.

Avoid using borders where shadows can define the edge. Surface-to-surface transitions should be handled by color shifts (White background to Surface #F8FAFC) combined with these shadow techniques.

## Shapes
In alignment with the "ROUND_TWELVE" requirement, the standard corner radius is 12px (0.75rem). 

- **Small Components (Chips, Tags):** 8px radius.
- **Standard Components (Buttons, Inputs, Cards):** 12px radius.
- **Large Containers (Modals, Section Hero):** 24px radius.

The rounded corners are essential to the neumorphic look, as they allow shadows to "wrap" around the edges naturally, simulating a molded plastic or soft-milled aluminum finish.

## Components

### Buttons
Primary buttons use the Solar Orange background with a subtle "lifted" shadow state. On hover, the shadow spread increases to simulate the button moving closer to the user. On click (active), the button transforms into a "recessed" inset shadow state.

### Cards
Cards are the primary content vehicles. They should have a background color of #FFFFFF and use the multi-layered elevation shadows defined in the Elevation section. Padding should be a minimum of 24px (md) to allow the content to feel airy.

### Input Fields
Inputs are "recessed" by default. Use a 2px inset shadow to create a sense of depth. Upon focus, the inset shadow remains, but the border gains a subtle Solar Orange glow to indicate activity.

### Chips & Tags
Chips are flat or slightly lifted (1px shadow). Use the Secondary Amber color for highlights or status indicators, ensuring the text remains high-contrast.

### Toggles & Switches
The track of the switch is "recessed," while the handle (the thumb) is "lifted." This creates a strong physical metaphor of a mechanical slider sitting within a groove.

### Lists
List items should be separated by whitespace rather than dividers where possible. If dividers are necessary, use a 1px soft gradient that mimics a tiny physical groove in the surface.