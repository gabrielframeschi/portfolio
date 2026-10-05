// The site's interface icons share one line style, drawn in the text color.
const iconProps = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  className: "size-4",
} as const;

export function SunIcon() {
  return (
    <svg data-icon="sun" {...iconProps}>
      <circle cx="12" cy="12" r="3.5" />
      <path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.64 5.64l1.41 1.41M16.95 16.95l1.41 1.41M5.64 18.36l1.41-1.41M16.95 7.05l1.41-1.41" />
    </svg>
  );
}

export function MoonIcon() {
  return (
    <svg data-icon="moon" {...iconProps}>
      <path d="M20.49 12.49A8.5 8.5 0 1 1 11.51 3.51A6.5 6.5 0 0 0 20.49 12.49Z" />
    </svg>
  );
}

export function ArrowLeftIcon() {
  return (
    <svg aria-hidden="true" {...iconProps}>
      <path d="M19 12H5M12 19l-7-7 7-7" />
    </svg>
  );
}
