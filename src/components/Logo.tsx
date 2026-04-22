const sizes = {
  sm: 24,
  md: 32,
  lg: 48,
};

type LogoProps = {
  size?: "sm" | "md" | "lg";
  className?: string;
};

const Logo = ({ size = "md", className }: LogoProps) => {
  const px = sizes[size];

  return (
    <svg
      width={px}
      height={px}
      viewBox="0 0 32 32"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Neon CRM"
      className={className}
    >
      <rect width="32" height="32" rx="6" fill="#0A0A0A" />
      <path d="M14 4L7 18H13L9 28L23 14H16L19 4H14Z" fill="#F5C518" />
    </svg>
  );
};

export default Logo;
