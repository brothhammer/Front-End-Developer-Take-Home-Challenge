import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

async function prepare() {
  if (import.meta.env.DEV) {
    const { worker } = await import("./mocks/browser");
    return worker.start({
      onUnhandledRequest: (request, print) => {
        if (
          request.url.includes("/node_modules/") ||
          request.url.includes("/@vite/") ||
          request.url.includes(".entry-") ||
          request.url.includes("fonts.gstatic.com")
        ) {
          return;
        }
        print.warning();
      },
    });
  }
  return Promise.resolve();
}

prepare().then(() => {
  ReactDOM.createRoot(document.getElementById("root")).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  );
});
