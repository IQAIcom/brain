import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";

createRoot(
	document.getElementById("root") || document.createElement("div"),
).render(
	<StrictMode>
		<App />
	</StrictMode>,
);
