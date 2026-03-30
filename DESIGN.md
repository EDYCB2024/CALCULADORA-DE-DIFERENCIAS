# Design System Specification: The Architectural Ledger

This design system is a high-end, editorial approach to financial interfaces. It moves away from the "data-heavy dashboard" cliché, instead treating financial information with the reverence of a premium broadsheet or a private banking suite. We prioritize **Tonal Layering** over rigid containment, ensuring the user feels a sense of precision, calm, and absolute trust.

---

### 1. Overview & Creative North Star: "The Digital Private Office"

The Creative North Star for this system is **The Digital Private Office**. Unlike standard retail banking apps that rely on heavy borders and loud alerts, this system uses "soft power"—achieving authority through expansive white space, intentional asymmetry, and sophisticated depth.

**Key Principles:**
*   **Intentional Asymmetry:** Break the 12-column monotony. Use wide margins (e.g., `spacing-24`) for primary content and tighter, offset clusters for secondary data to create a rhythmic, editorial flow.
*   **Bespoke Precision:** Financial data isn't just "text"; it’s the hero. We use high-contrast typography scales to make numbers feel like architectural elements.
*   **The "Breathing" Interface:** Avoid clutter at all costs. If a data point doesn't serve a direct decision, it is relegated to a lower surface tier.

---

### 2. Colors & Surface Philosophy

We define depth through light and pigment, not lines. Our palette utilizes deep, "Midnight" blues (`primary`) contrasted against "Mist" greys (`surface`) and "Vital" emeralds (`tertiary`).

#### The "No-Line" Rule
**Explicit Instruction:** 1px solid borders are prohibited for sectioning. To separate content, use background shifts. A `surface-container-low` section sitting on a `surface` background provides all the definition needed without the "grid-trap" feel of standard UI.

#### Surface Hierarchy & Nesting
Treat the UI as a series of stacked, premium materials:
*   **Base Layer:** `surface` (#f7f9fc) – The canvas.
*   **Secondary Content:** `surface-container-low` (#f2f4f7) – Used for grouping related minor elements.
*   **Primary Focus:** `surface-container-lowest` (#ffffff) – Used for high-importance cards to provide a "lifted" feel.
*   **Interactive Overlays:** Use **Glassmorphism**. Floating menus or modals must use `surface_variant` at 80% opacity with a `24px` backdrop-blur to allow the financial data beneath to bleed through softly.

#### Signature Textures
Apply a subtle linear gradient to main CTAs (from `primary` to `primary_container`) or Hero sections. This adds "soul" and a sense of three-dimensional quality that flat hex codes cannot replicate.

---

### 3. Typography: Editorial Authority

We pair the technical precision of **Inter** with the expressive, high-fashion personality of **Manrope**.

*   **Display & Headlines (Manrope):** Use these for high-level summaries and "Big Numbers." The geometric nature of Manrope conveys modernism and growth.
    *   *Example:* `display-lg` for total portfolio balance.
*   **Titles & Body (Inter):** Use Inter for all functional data. Its high x-height ensures readability at small sizes (`body-sm`) which is critical for transaction histories.
*   **The Power Ratio:** Use a significant jump between `display-md` (2.75rem) and `title-sm` (1rem). This contrast creates a clear hierarchy where the user knows exactly where the "truth" of the data lies.

---

### 4. Elevation & Depth

We convey hierarchy through **Tonal Layering** rather than traditional structural lines.

*   **The Layering Principle:** Stack `surface-container` tiers. A `surface-container-lowest` card placed on a `surface-container-low` background creates a natural, soft lift.
*   **Ambient Shadows:** For floating elements (like a FAB or a detached navigation bar), use a multi-layered shadow:
    *   `box-shadow: 0 4px 20px rgba(0, 23, 54, 0.04), 0 10px 40px rgba(0, 23, 54, 0.08);`
    *   *Note:* The shadow color is a tinted version of `primary`, never pure black.
*   **The Ghost Border Fallback:** If a border is required for accessibility, use `outline-variant` at **15% opacity**. It should be felt, not seen.

---

### 5. Components

#### Buttons (The Action Points)
*   **Primary:** Solid `primary` background with `on_primary` text. Use `rounded-lg` (0.5rem). On hover, transition to a subtle gradient involving `primary_container`.
*   **Accent (The "Emerald" CTA):** For "Growth" actions (e.g., *Invest Now*), use `tertiary_fixed_dim` with `on_tertiary_fixed`. This vibrant green signals prosperity.

#### Input Fields
*   **Style:** Minimalist. No bottom line. Use `surface-container-highest` as a subtle background fill with `rounded-md`. 
*   **States:** On focus, the background remains, but a 2px "Ghost Border" of `primary` at 40% opacity appears.

#### Cards & Lists
*   **Forbid Dividers:** Do not use lines between list items. Use a `spacing-4` vertical gap.
*   **Transaction Lists:** Use `surface-container-lowest` for the overall container. Individual items are separated by whitespace. High-value transactions should use `title-md` for the amount, emphasizing the financial impact.

#### Chips (Data Tags)
*   **Selection:** Use `secondary_container` with `on_secondary_container`. Use `rounded-full` for a soft, pill-shaped aesthetic that contrasts against the more structured cards.

---

### 6. Do's and Don'ts

**Do:**
*   **Use Whitespace as a Tool:** If two elements feel too close, don't add a line; add `spacing-8`.
*   **Layer Surfaces:** Think of the UI as a physical desk. Important papers go on the white "lowest" surface; the desk itself is the "surface" grey.
*   **Prioritize the "Primary" Blue:** Use the deep `primary` (#001736) for text where you want to convey ultimate authority and stability.

**Don't:**
*   **Don't use 100% Opaque Borders:** This shatters the premium, editorial feel and makes the tool look like a generic template.
*   **Don't use Default Shadows:** Standard "Drop Shadows" are too heavy. Always use the "Ambient" tinted approach.
*   **Don't Overuse the Accent:** The Emerald Green (`tertiary`) is a "surgical" tool. Use it only for success states or primary growth-oriented CTAs. If everything is green, nothing is important.

---

### 7. Spacing & Rhythm
This system operates on a **4px baseline grid**. All containers and component heights must be multiples of the spacing scale.
*   **Standard Padding:** `spacing-6` (1.5rem) for card internals.
*   **Section Gaps:** `spacing-12` (3rem) to allow the "Editorial" feel to take hold.