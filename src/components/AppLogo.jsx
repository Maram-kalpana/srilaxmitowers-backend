import logo from "../assets/logo.png";

const SIZE_CLASSES = {
  sm: "h-9 w-[110px]",
  md: "h-10 w-[140px]",
  lg: "h-12 w-[180px]",
  xl: "h-16 w-[240px]",
  sidebar: "h-11 w-[160px]",
  card: "h-12 w-[150px]",
};

/** Logo without a white wrapper; blend mode hides white in the PNG on dark/light surfaces */
export default function AppLogo({ size = "md", variant = "light", className = "" }) {
  const blend = variant === "dark" ? "mix-blend-screen" : "mix-blend-multiply";

  return (
    <img
      src={logo}
      alt="Towers"
      className={`object-contain object-left shrink-0 ${SIZE_CLASSES[size] ?? SIZE_CLASSES.md} ${blend} ${className}`}
    />
  );
}
