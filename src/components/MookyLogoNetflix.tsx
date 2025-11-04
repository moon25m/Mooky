import React from 'react';

type Props = {
  className?: string;
  /**
   * Use a slightly flatter arc and tighter tracking for small header usage.
   * 'default' (splash/hero) or 'compact' (navbar/sidebar)
   */
  variant?: 'default' | 'compact';
  /** Accessible label for the SVG. */
  title?: string;
};

export default function MookyLogoNetflix({ className = '', variant = 'default', title = 'Mooky' }: Props) {
  const letters = ['M', 'O', 'O', 'K', 'Y'] as const;
  // Fine-tuned per-letter kerning to better match Netflix-like proportions
  const dxDefault = [0, -4, -2, -5, -3];
  const dxCompact = [0, -3, -1, -4, -2];
  const dx = variant === 'compact' ? dxCompact : dxDefault;

  return (
    <svg
      className={className}
      role="img"
      aria-label={title}
      viewBox="0 0 780 240"
      xmlns="http://www.w3.org/2000/svg"
      focusable="false"
    >
      <defs>
        <filter id="softShadow" x="-20%" y="-50%" width="140%" height="200%">
          <feDropShadow dx="0" dy="6" stdDeviation="5" floodOpacity="0.45" floodColor="#000" />
        </filter>
        {/* concave arcs */}
        <path id="arcDefault" d="M 40 118 C 220 194, 560 194, 740 118" fill="none" />
        {/* compact arc for small header heights (slightly flatter) */}
        <path id="arcCompact" d="M 40 120 C 220 180, 560 180, 740 120" fill="none" />
        <style>{`
          .word {
            font-family: 'Bebas Neue', 'Anton', 'Impact', 'Helvetica Neue', Arial, sans-serif;
            font-weight: 900;
            font-size: 170px;
            fill: #E50914;
            letter-spacing: 6px;
          }
          .compact { font-size: 150px; letter-spacing: 5px; }
          @media (max-width: 640px) {
            .word { font-size: 135px; letter-spacing: 5px; }
            .compact { font-size: 120px; letter-spacing: 4px; }
          }
        `}</style>
      </defs>

      <g filter="url(#softShadow)">
        <text className={`word ${variant === 'compact' ? 'compact' : ''}`}>
          <textPath
            href={variant === 'compact' ? '#arcCompact' : '#arcDefault'}
            startOffset="50%"
            textAnchor="middle"
          >
            {letters.map((ch, i) => (
              <tspan key={i} dx={i === 0 ? undefined : dx[i]}>{ch}</tspan>
            ))}
          </textPath>
        </text>
      </g>
    </svg>
  );
}
