// Validated against this app's dark card surface (#1A1A24) via the dataviz
// skill's palette validator — see references/palette.md for methodology.

// Status palette — fixed roles, never reused as generic categorical fill.
// Always paired with an icon + label (never color alone) since red/green
// sit at CVD ΔE 4.1 (below the 8 floor) for the Completed/Overdue pair.
export const STATUS_COLOR = {
  'Not Started':  '#71717a',
  'In Progress':  '#3987e5',
  'Under Review': '#fab219',
  'Completed':    '#0ca30c',
  'Overdue':      '#d03b3b',
}

// Categorical order — validated 8-slot set, fixed order (never cycled/reassigned).
export const CATEGORICAL = ['#3987e5', '#008300', '#d55181', '#c98500', '#199e70', '#d95926', '#9085e9', '#e66767']

// Platform gets a fixed dict so a platform keeps its color regardless of
// which other platforms are present in the filtered set.
export const PLATFORM_COLOR = {
  'TikTok':      CATEGORICAL[0],
  'Instagram':   CATEGORICAL[1],
  'YouTube':     CATEGORICAL[2],
  'X / Twitter': CATEGORICAL[3],
  'LinkedIn':    CATEGORICAL[4],
}

export const OTHER_COLOR = '#52525b'

export function categoricalColor(index) {
  return CATEGORICAL[index % CATEGORICAL.length]
}
