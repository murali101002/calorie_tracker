---
name: Vitality Core
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
  on-surface-variant: '#3d4a3d'
  inverse-surface: '#213145'
  inverse-on-surface: '#eaf1ff'
  outline: '#6d7b6c'
  outline-variant: '#bccbb9'
  surface-tint: '#006e2f'
  primary: '#006e2f'
  on-primary: '#ffffff'
  primary-container: '#22c55e'
  on-primary-container: '#004b1e'
  inverse-primary: '#4ae176'
  secondary: '#006c49'
  on-secondary: '#ffffff'
  secondary-container: '#6cf8bb'
  on-secondary-container: '#00714d'
  tertiary: '#005ac2'
  on-tertiary: '#ffffff'
  tertiary-container: '#82abff'
  on-tertiary-container: '#003d88'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#6bff8f'
  primary-fixed-dim: '#4ae176'
  on-primary-fixed: '#002109'
  on-primary-fixed-variant: '#005321'
  secondary-fixed: '#6ffbbe'
  secondary-fixed-dim: '#4edea3'
  on-secondary-fixed: '#002113'
  on-secondary-fixed-variant: '#005236'
  tertiary-fixed: '#d8e2ff'
  tertiary-fixed-dim: '#adc6ff'
  on-tertiary-fixed: '#001a42'
  on-tertiary-fixed-variant: '#004395'
  background: '#f8f9ff'
  on-background: '#0b1c30'
  surface-variant: '#d3e4fe'
typography:
  headline-lg:
    fontFamily: Lexend
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Lexend
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  body-lg:
    fontFamily: Lexend
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
    letterSpacing: '0'
  body-md:
    fontFamily: Lexend
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
    letterSpacing: '0'
  label-lg:
    fontFamily: Lexend
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Lexend
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.04em
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
  margin-mobile: 16px
  gutter-mobile: 16px
---

## Brand & Style

The brand personality of this design system is encouraging, frictionless, and disciplined. It is designed for health-conscious individuals who value efficiency and clarity in their daily routines. By stripping away visual clutter, the system reduces the cognitive load associated with calorie tracking, transforming a chore into a seamless habit.

The design style is **Minimalism** infused with **Modern Android** conventions. It leverages heavy whitespace to prioritize data visualization—specifically macro-nutrient progress—ensuring that the user's focus remains on their goals. The interface feels light and breathable, using subtle motion and clear hierarchy to guide the user through logging tasks without unnecessary friction.

## Colors

The palette is anchored by a vibrant, "Active Green" (#22c55e) that symbolizes health, growth, and positive reinforcement. This primary color is used for success states, progress rings, and primary actions. 

- **Primary:** Used for the main brand touchpoints and completed progress states.
- **Secondary:** A slightly deeper emerald for interactive elements and accents.
- **Tertiary:** A calm blue reserved for hydration tracking or secondary metrics.
- **Neutrals:** A range of Slate grays provide high-contrast legibility for typography while maintaining a soft, modern feel against the pure white background.
- **Semantic Colors:** Soft reds (#ef4444) are used sparingly for "exceeding limit" warnings to maintain the system's encouraging tone.

## Typography

The design system utilizes **Lexend**, a typeface specifically engineered to reduce visual stress and improve reading throughput. Given the data-heavy nature of calorie tracking, Lexend provides the necessary clarity for numerical data and food labels.

- **Headlines:** Use SemiBold (600) weights to establish clear hierarchy on dashboard summaries.
- **Body Text:** Standard weight (400) ensures long lists of food entries remain legible.
- **Labels:** Medium (500) weight is used for macro-nutrient categories (Carbs, Protein, Fat) and button text to differentiate them from standard body content.

## Layout & Spacing

This design system follows a **Fluid Grid** model optimized for Android mobile devices. It utilizes a 4-column grid with 16dp outer margins and 16dp gutters. 

All spatial relationships are governed by a **4dp baseline grid**. 
- Elements within a card (e.g., food name to calorie count) use 4dp or 8dp spacing.
- Vertical spacing between cards on the timeline uses 16dp to maintain a clean, rhythmic flow.
- Padding inside cards is consistently 16dp to ensure touch targets for food items are generous and accessible.

## Elevation & Depth

To maintain a minimal aesthetic, depth is conveyed through **Ambient Shadows** and **Tonal Layers** rather than heavy gradients. 

- **Level 0 (Background):** Pure White (#FFFFFF).
- **Level 1 (Cards):** Surface White with a very soft, diffused shadow (Blur: 12px, Y: 4px, Color: 4% Black). This makes cards appear to float slightly above the background without creating harsh visual breaks.
- **Level 2 (Active/Modals):** Increased shadow spread (Blur: 20px, Y: 8px, Color: 8% Black) to focus user attention during data entry.
- **Secondary Depth:** Non-interactive background elements, such as progress ring tracks, use a subtle grey-wash (#F1F5F9) to indicate a recessed state.

## Shapes

The design system uses a **Rounded** shape language to evoke a friendly and approachable feeling. 

- **Standard Cards:** 16px (rounded-lg) corner radius to create a soft, containerized look for food entries.
- **Buttons & Chips:** Fully rounded (pill-shaped) to clearly distinguish them as interactive, tappable elements.
- **Progress Rings:** Use rounded stroke caps for macro-nutrient visualization to align with the overall softness of the UI.
- **Inputs:** 12px corner radius to balance the squareness of the screen with the roundness of the buttons.

## Components

### Buttons
Primary buttons use the Active Green background with White text. They are pill-shaped with a minimum height of 48dp to follow Android accessibility standards. Secondary buttons use a subtle green tint background (#f0fdf4) with green text.

### Progress Rings
The central dashboard feature. Rings use a 12dp stroke width. The "track" is a light gray (#f1f5f9), and the "indicator" is the Primary Green. For macros (P/C/F), use smaller nested rings or a horizontal bar variant with 8dp rounded corners.

### Food Cards
Cards feature a 16px corner radius and a subtle shadow. Content is structured with the food name in Body-LG (SemiBold) and calories in Headline-MD. Icons for "Add" or "Edit" should be simple, 24dp stroke-based icons.

### Inputs
Search bars for food entry should be pill-shaped with a subtle 1px border (#e2e8f0) or a soft grey background. Icons should be placed at the leading edge with a 12dp inset.

### Chips
Used for meal categories (Breakfast, Lunch, Dinner). Use a "Filter Chip" style: 32dp height, 8dp padding, and a subtle border that fills with the Primary Green when selected.

### Floating Action Button (FAB)
Following Android conventions, a Primary Green FAB with a "+" icon is positioned in the bottom right for quick food logging.