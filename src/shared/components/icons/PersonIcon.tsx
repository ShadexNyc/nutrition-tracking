/**
 * Avatar placeholder icon — head circle and shoulders silhouette.
 */
interface PersonIconProps {
  className?: string
  style?: React.CSSProperties
}

export function PersonIcon({ className = 'w-5 h-5', style }: PersonIconProps) {
  return (
    <svg
      className={className}
      style={style}
      width="31"
      height="29"
      viewBox="0 0 31 29"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M22.1012 6.6C22.1012 10.2451 19.1463 13.2 15.5012 13.2C11.8562 13.2 8.90125 10.2451 8.90125 6.6C8.90125 2.95492 11.8562 0 15.5012 0C19.1463 0 22.1012 2.95492 22.1012 6.6ZM19.9012 6.6C19.9012 9.03005 17.9313 11 15.5012 11C13.0712 11 11.1012 9.03005 11.1012 6.6C11.1012 4.16995 13.0712 2.2 15.5012 2.2C17.9313 2.2 19.9012 4.16995 19.9012 6.6Z"
        fill="currentColor"
      />
      <path
        d="M15.5012 16.5C8.37942 16.5 2.31145 20.7113 0 26.6112C0.563085 27.1704 1.15625 27.6993 1.77686 28.1953C3.49808 22.7785 8.89763 18.7 15.5012 18.7C22.1049 18.7 27.5044 22.7785 29.2256 28.1953C29.8462 27.6993 30.4394 27.1704 31.0025 26.6113C28.6911 20.7113 22.6231 16.5 15.5012 16.5Z"
        fill="currentColor"
      />
    </svg>
  )
}
