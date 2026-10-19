import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";
import { getInitialLanguage } from "./localization";
import "./styles.css";

document.documentElement.lang = getInitialLanguage(
  localStorage.getItem("nexo-language-preference"),
  navigator.languages.length > 0 ? navigator.languages : [navigator.language],
);

createRoot(document.getElementById("root")!).render(<StrictMode><App /></StrictMode>);
