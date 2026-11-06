const VIEW_W = 400;
const VIEW_H = 240;
const FLOOR = 192;
const MAX_W = 250;
const MAX_H = 150;

function partsFor(shape, x, y, w, h) {
  switch (shape) {
    case "table":
    case "desk": {
      const top = Math.max(6, h * 0.1);
      const leg = Math.max(7, w * 0.04);
      const inset = w * 0.06;
      const parts = [
        { x, y, w, h: top },
        { x: x + inset, y: y + top, w: leg, h: h - top, shade: 0.12 },
        { x: x + w - inset - leg, y: y + top, w: leg, h: h - top, shade: 0.12 },
        {
          x: x + inset + leg,
          y: y + top,
          w: w - 2 * (inset + leg),
          h: Math.max(5, h * 0.08),
          shade: 0.1,
        },
      ];
      if (shape === "desk") {
        parts.push({
          x: x + w * 0.62,
          y: y + top,
          w: w * 0.32 - leg,
          h: h * 0.42,
          shade: 0.06,
        });
      }
      return parts;
    }

    case "sideboard": {
      const legH = h * 0.2;
      const body = h - legH;
      const leg = Math.max(6, w * 0.03);
      return [
        { x, y, w, h: body },
        { x: x + w * 0.03, y: y + body * 0.1, w: w * 0.3, h: body * 0.8, shade: 0.1 },
        { x: x + w * 0.36, y: y + body * 0.1, w: w * 0.28, h: body * 0.8, shade: 0.2 },
        { x: x + w * 0.67, y: y + body * 0.1, w: w * 0.3, h: body * 0.8, shade: 0.1 },
        { x: x + w * 0.05, y: y + body, w: leg, h: legH, shade: 0.15 },
        { x: x + w * 0.95 - leg, y: y + body, w: leg, h: legH, shade: 0.15 },
      ];
    }

    case "bookcase": {
      const side = Math.max(5, w * 0.07);
      const innerH = h - 2 * side;
      const shelf = Math.max(4, h * 0.02);
      const parts = [
        { x, y, w, h },
        { x: x + side, y: y + side, w: w - 2 * side, h: innerH, shade: 0.5 },
      ];
      for (let i = 1; i <= 3; i += 1) {
        parts.push({
          x: x + side,
          y: y + side + (innerH / 4) * i - shelf / 2,
          w: w - 2 * side,
          h: shelf,
        });
      }
      return parts;
    }

    case "sofa": {
      const legH = h * 0.12;
      const body = h - legH;
      const arm = Math.max(10, w * 0.1);
      const leg = 6;
      return [
        { x: x + arm, y, w: w - 2 * arm, h: body * 0.55, shade: 0.08 },
        { x: x + arm, y: y + body * 0.55, w: w - 2 * arm, h: body * 0.45 },
        { x, y: y + body * 0.3, w: arm, h: body * 0.7, shade: 0.12 },
        { x: x + w - arm, y: y + body * 0.3, w: arm, h: body * 0.7, shade: 0.12 },
        { x: x + arm * 0.5, y: y + body, w: leg, h: legH, shade: 0.2 },
        { x: x + w - arm * 0.5 - leg, y: y + body, w: leg, h: legH, shade: 0.2 },
      ];
    }

    case "bed": {
      const leg = Math.max(6, w * 0.03);
      return [
        { x, y, w, h: h * 0.62, shade: 0.08 },
        { x, y: y + h * 0.5, w, h: h * 0.3 },
        { x: x + w * 0.03, y: y + h * 0.4, w: w * 0.94, h: h * 0.14, fill: "#F3EADB" },
        { x, y: y + h * 0.8, w: leg, h: h * 0.2, shade: 0.15 },
        { x: x + w - leg, y: y + h * 0.8, w: leg, h: h * 0.2, shade: 0.15 },
      ];
    }

    default:
      return [{ x, y, w, h }];
  }
}

// Front view of the piece
export default function PiecePreview({ shape, label, color, width, height }) {
  const w = Number(width) > 0 ? Number(width) : 100;
  const h = Number(height) > 0 ? Number(height) : 100;

  const scale = Math.min(MAX_W / w, MAX_H / h);
  const pw = w * scale;
  const ph = h * scale;
  const x = (VIEW_W - pw) / 2;
  const y = FLOOR - ph;

  const parts = partsFor(shape, x, y, pw, ph);

  return (
    <svg
      viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
      role="img"
      aria-label={`Front view of a ${label.toLowerCase()}, ${w} centimetres wide and ${h} centimetres high`}
      className="h-auto w-full text-secondary"
    >
      <line
        x1="40"
        y1={FLOOR}
        x2="360"
        y2={FLOOR}
        stroke="currentColor"
        strokeOpacity="0.2"
      />
      <ellipse cx={VIEW_W / 2} cy={FLOOR + 2} rx={pw / 2 + 18} ry="6" fill="#2B140C" opacity="0.12" />

      {parts.map((part, index) => (
        <g key={index}>
          <rect
            x={part.x}
            y={part.y}
            width={Math.max(part.w, 1)}
            height={Math.max(part.h, 1)}
            rx="2"
            fill={part.fill ?? color}
            stroke="rgba(43,20,12,0.25)"
            strokeWidth="1"
          />
          {part.shade ? (
            <rect
              x={part.x}
              y={part.y}
              width={Math.max(part.w, 1)}
              height={Math.max(part.h, 1)}
              rx="2"
              fill="#000"
              fillOpacity={part.shade}
            />
          ) : null}
        </g>
      ))}

      {/* Measurements */}
      <g stroke="currentColor" strokeWidth="1" opacity="0.45">
        <line x1={x} y1={FLOOR + 14} x2={x + pw} y2={FLOOR + 14} />
        <line x1={x} y1={FLOOR + 10} x2={x} y2={FLOOR + 18} />
        <line x1={x + pw} y1={FLOOR + 10} x2={x + pw} y2={FLOOR + 18} />
        <line x1={x + pw + 14} y1={y} x2={x + pw + 14} y2={FLOOR} />
        <line x1={x + pw + 10} y1={y} x2={x + pw + 18} y2={y} />
        <line x1={x + pw + 10} y1={FLOOR} x2={x + pw + 18} y2={FLOOR} />
      </g>
      <text
        x={VIEW_W / 2}
        y={FLOOR + 36}
        textAnchor="middle"
        fontSize="12"
        fill="currentColor"
        opacity="0.75"
      >
        {w} cm
      </text>
      <text
        x={x + pw + 24}
        y={(y + FLOOR) / 2 + 4}
        fontSize="12"
        fill="currentColor"
        opacity="0.75"
      >
        {h} cm
      </text>
    </svg>
  );
}