import type { Config } from "tailwindcss";
export default { content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"], theme: { extend: { colors: { ink: "#17202d", muted: "#6b7484", line: "#e6e9ef", brand: "#6759e8" }, boxShadow: { soft: "0 8px 28px rgba(24,32,43,.05)" } } }, plugins: [] } satisfies Config;
