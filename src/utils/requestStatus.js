const TONES = {
  // consultations
  Pending: "warn",
  Confirmed: "good",
  Completed: "good",
  Cancelled: "bad",
  // custom designs
  Submitted: "warn",
  "In review": "info",
  Quoted: "good",
  Accepted: "info",
  "In production": "info",
  Declined: "bad",
};

export const statusTone = (status) => TONES[status] ?? "info";