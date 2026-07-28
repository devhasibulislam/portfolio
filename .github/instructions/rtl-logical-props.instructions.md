---
applyTo: "src/**/*.{ts,tsx,css}"
---

# RTL-safe styling

PROJECT_CONTEXT §10 requires full RTL mirroring across every page — including the dashboard and the 3D scene's DOM overlays. Enforce systematically, not per-component patchwork.

## Rule

Do not use directional physical properties. Use **logical** properties instead.

| ❌ Banned (physical)          | ✅ Use (logical)                 |
| ----------------------------- | -------------------------------- |
| `margin-left` / `ml-*`        | `margin-inline-start` / `ms-*`   |
| `margin-right` / `mr-*`       | `margin-inline-end` / `me-*`     |
| `padding-left` / `pl-*`       | `padding-inline-start` / `ps-*`  |
| `padding-right` / `pr-*`      | `padding-inline-end` / `pe-*`    |
| `left` / `left-*`             | `inset-inline-start` / `start-*` |
| `right` / `right-*`           | `inset-inline-end` / `end-*`     |
| `border-l-*`                  | `border-s-*`                     |
| `border-r-*`                  | `border-e-*`                     |
| `text-left`                   | `text-start`                     |
| `text-right`                  | `text-end`                       |
| `rounded-l-*` / `rounded-r-*` | `rounded-s-*` / `rounded-e-*`    |

Icons that visually indicate direction (chevrons, arrows) should flip via CSS `[dir="rtl"] &` selector or Tailwind's `rtl:` variant.

## Rule

When Tailwind offers no logical equivalent, wrap the physical property in a `rtl:` variant so both directions are covered explicitly. Example: `left-4 rtl:left-auto rtl:right-4` is acceptable if `start-4` isn't sufficient.
