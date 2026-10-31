export function Logo({ size = 34 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 34 34"
      role="img"
      aria-label="Dynamo Feed logo"
      data-testid="logo-mark"
    >
      <rect
        x="1.5"
        y="1.5"
        width="31"
        height="31"
        rx="8"
        fill="#B026FF"
        stroke="#F4F2EC"
        strokeWidth="3"
      />
      <path
        d="M20.5 6.5 L10 19.5 h6 L14.5 27.5 L24.5 14.5 h-6 Z"
        fill="#0B0B10"
        stroke="#F4F2EC"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}
