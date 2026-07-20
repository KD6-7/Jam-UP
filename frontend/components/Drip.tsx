/**
 * The site's signature device, taken from the Jam Up logo mark (a jam blob
 * with a falling drip): a section edge that drips into the section below.
 * Color it with a text-* class; it renders in currentColor.
 */
export default function Drip({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 1440 64"
      preserveAspectRatio="none"
      aria-hidden="true"
      className={`block h-10 w-full md:h-14 ${className}`}
    >
      {/* wavy jam edge */}
      <path
        fill="currentColor"
        d="M0,0 H1440 V14
           C1330,30 1240,10 1140,18
           C1040,26 980,44 880,38
           C780,32 720,12 620,16
           C520,20 460,40 360,36
           C260,32 190,14 100,20
           C60,23 25,26 0,24 Z"
      />
      {/* hanging drips */}
      <path
        fill="currentColor"
        d="M330,34 c0,0 -7,14 -7,20 a7,7 0 0 0 14,0 c0,-6 -7,-20 -7,-20 Z"
      />
      <path
        fill="currentColor"
        d="M872,36 c0,0 -9,16 -9,23 a9,9 0 0 0 18,0 c0,-7 -9,-23 -9,-23 Z"
      />
      <path
        fill="currentColor"
        d="M1150,16 c0,0 -6,12 -6,17 a6,6 0 0 0 12,0 c0,-5 -6,-17 -6,-17 Z"
      />
    </svg>
  );
}
