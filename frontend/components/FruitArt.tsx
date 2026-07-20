/**
 * Flat-vector fruit illustrations for the flavor plates — playful, packaging-
 * style shapes in the brand's fruit accents. Sized by the parent via className.
 */

export function MangoArt({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" aria-hidden="true" className={className}>
      <path
        d="M22 62 C10 44 24 20 48 18 C74 16 92 34 88 56 C84 80 58 92 40 84 C28 79 28 71 22 62 Z"
        fill="#FFB020"
      />
      <path
        d="M48 18 C52 12 60 8 68 10 C64 16 58 19 48 18 Z"
        fill="#7A1E0C"
      />
      <ellipse cx="42" cy="46" rx="12" ry="8" fill="#FDF6E9" opacity="0.35" transform="rotate(-24 42 46)" />
    </svg>
  );
}

export function ChilliArt({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" aria-hidden="true" className={className}>
      <path
        d="M28 30 C20 58 40 84 72 86 C82 87 88 80 82 76 C58 72 38 54 36 30 Z"
        fill="#E4340C"
      />
      <path d="M30 30 C28 20 36 12 46 14 C42 22 38 27 36 30 Z" fill="#2E7D32" />
      <path d="M38 40 C40 54 50 66 62 72" stroke="#FDF6E9" strokeWidth="4" strokeLinecap="round" fill="none" opacity="0.35" />
    </svg>
  );
}

export function StrawberryArt({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" aria-hidden="true" className={className}>
      <path
        d="M50 90 C26 74 14 52 22 38 C28 27 42 24 50 32 C58 24 72 27 78 38 C86 52 74 74 50 90 Z"
        fill="#F2617A"
      />
      <path d="M42 26 L50 14 L58 26 L50 32 Z" fill="#2E7D32" />
      {[
        [38, 48], [50, 44], [62, 48], [44, 62], [56, 62], [50, 74],
      ].map(([x, y]) => (
        <ellipse key={`${x}-${y}`} cx={x} cy={y} rx="2.5" ry="3.5" fill="#FDF6E9" opacity="0.7" />
      ))}
    </svg>
  );
}

export function FigArt({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" aria-hidden="true" className={className}>
      <path
        d="M50 16 C54 30 82 34 82 58 C82 76 68 88 50 88 C32 88 18 76 18 58 C18 34 46 30 50 16 Z"
        fill="#6C3FA0"
      />
      <circle cx="50" cy="60" r="18" fill="#F2617A" />
      <circle cx="50" cy="60" r="9" fill="#FDF6E9" opacity="0.8" />
    </svg>
  );
}

export function OrangeSliceArt({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" aria-hidden="true" className={className}>
      <circle cx="50" cy="50" r="40" fill="#F59300" />
      <circle cx="50" cy="50" r="33" fill="#FDF6E9" />
      {[0, 60, 120, 180, 240, 300].map((deg) => (
        <path
          key={deg}
          d="M50 50 L50 22 A28 28 0 0 1 74 36 Z"
          fill="#FFB020"
          transform={`rotate(${deg} 50 50)`}
        />
      ))}
    </svg>
  );
}
