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
  const fontSize = px * 0.3;

  return (
    <svg
      width={px}
      height={px}
      viewBox="0 0 100 100"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="CosmosCRM"
      className={className}
    >
      {/* Hexagon */}
      <polygon
        points="50,4 93,27.5 93,72.5 50,96 7,72.5 7,27.5"
        fill="#00C48E"
      />
      {/* Letters CC */}
      <text
        x="50"
        y="50"
        dominantBaseline="central"
        textAnchor="middle"
        fill="#1A1E29"
        fontFamily="'DM Sans', 'Avenir Next', sans-serif"
        fontWeight="700"
        fontSize={fontSize}
        letterSpacing="-1"
      >
        CC
      </text>
    </svg>
  );
};

export default Logo;
