interface LogoProps {
  size?: number
  className?: string
}

export default function DoltsiteLogo({ size = 40, className = '' }: LogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id="bgGrad" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#a855f7" />
          <stop offset="100%" stopColor="#ec4899" />
        </linearGradient>
        <linearGradient id="shineGrad" x1="0" y1="0" x2="40" y2="20" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Rounded square background */}
      <rect width="40" height="40" rx="10" fill="url(#bgGrad)" />
      {/* Shine overlay */}
      <rect width="40" height="40" rx="10" fill="url(#shineGrad)" />

      {/* Letter D — bold, clean */}
      <text
        x="7"
        y="29"
        fontFamily="'Segoe UI', system-ui, sans-serif"
        fontWeight="800"
        fontSize="24"
        fill="white"
        letterSpacing="-1"
      >
        D
      </text>

      {/* Small lightning bolt accent — top right */}
      <path
        d="M28 6 L24 16 H27.5 L23 26 L32 13 H28 L32 6 Z"
        fill="white"
        opacity="0.9"
      />
    </svg>
  )
}
