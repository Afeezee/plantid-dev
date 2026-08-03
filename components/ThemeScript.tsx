// No-flash theme boot. Runs before React hydrates and stamps either "light"
// or "dark" onto <html>, so styled surfaces don't repaint on first frame.
// The client toggle (see ThemeToggle.tsx) writes to the same storage key.
export function ThemeScript() {
  const code = `
try {
  var stored = localStorage.getItem("plantid-theme");
  var prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  var theme = stored || (prefersDark ? "dark" : "light");
  document.documentElement.classList.toggle("dark", theme === "dark");
  document.documentElement.classList.toggle("light", theme === "light");
  document.documentElement.style.colorScheme = theme;
} catch (_) {
  document.documentElement.classList.add("dark");
}
`;
  return <script dangerouslySetInnerHTML={{ __html: code }} />;
}
