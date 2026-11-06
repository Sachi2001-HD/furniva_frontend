export const PIECES = [
  {
    key: "dining-table",
    label: "Dining table",
    shape: "table",
    defaults: { w: 180, d: 90, h: 75 },
    ranges: { w: [100, 400], d: [60, 150], h: [65, 85] },
  },
  {
    key: "sofa",
    label: "Sofa",
    shape: "sofa",
    defaults: { w: 210, d: 95, h: 85 },
    ranges: { w: [120, 400], d: [70, 130], h: [60, 110] },
  },
  {
    key: "bookcase",
    label: "Bookcase",
    shape: "bookcase",
    defaults: { w: 100, d: 35, h: 200 },
    ranges: { w: [40, 300], d: [20, 60], h: [80, 260] },
  },
  {
    key: "bed-frame",
    label: "Bed frame",
    shape: "bed",
    defaults: { w: 160, d: 210, h: 100 },
    ranges: { w: [90, 220], d: [180, 230], h: [60, 160] },
  },
  {
    key: "sideboard",
    label: "Sideboard",
    shape: "sideboard",
    defaults: { w: 160, d: 45, h: 80 },
    ranges: { w: [80, 300], d: [30, 70], h: [50, 110] },
  },
  {
    key: "desk",
    label: "Desk",
    shape: "desk",
    defaults: { w: 140, d: 70, h: 75 },
    ranges: { w: [80, 260], d: [45, 100], h: [65, 85] },
  },
];

export const WOODS = [
  { key: "walnut", label: "Walnut", color: "#5E3B24", note: "Rich, dark and calm" },
  { key: "white-oak", label: "White Oak", color: "#C9A97C", note: "Light, soft and airy" },
  { key: "teak", label: "Teak", color: "#A86F42", note: "Warm golden brown" },
];

export const FINISHES = [
  {
    key: "natural-oil",
    label: "Natural oil",
    note: "Soaks into the grain for a soft, natural look.",
  },
  {
    key: "matte-lacquer",
    label: "Matte lacquer",
    note: "A smooth protective coat with a flat, quiet sheen.",
  },
  {
    key: "hand-waxed",
    label: "Hand-waxed",
    note: "A warm, hand-rubbed finish with a gentle glow.",
  },
];

export const SIZE_FIELDS = [
  { key: "w", label: "Width" },
  { key: "d", label: "Depth" },
  { key: "h", label: "Height" },
];