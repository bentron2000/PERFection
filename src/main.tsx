import { createRoot } from "react-dom/client";
import { ThemeProvider } from "./theme/ThemeContext";
import App from "./App";

createRoot(document.getElementById("root")!).render(
  <ThemeProvider>
    <App />
  </ThemeProvider>
);
