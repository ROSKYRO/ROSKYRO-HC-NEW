import ReactDOMServer from "react-dom/server";
import { StaticRouter } from "react-router-dom/server";
import App from "./App.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import { LanguageProvider } from "./context/LanguageContext.jsx";

// Called from scripts/prerender.mjs (Node, build time only) — never shipped
// to the browser. Renders the same component tree the client uses, for a
// given path, to plain HTML. Effects (data fetching, etc.) don't run during
// renderToString, so this is just the static shell + known content — the
// client bundle takes over and fetches live data normally after it loads.
//
// LanguageProvider has to be here too: main.jsx wraps the app in it, and
// leaving it out meant every component fell back to useLanguage()'s
// no-provider default, so the prerendered HTML a crawler sees could differ
// from what the browser renders. (Its useEffect never runs during
// renderToString, so there's no document/window access at build time.)
export function render(url) {
  return ReactDOMServer.renderToString(
    <StaticRouter location={url}>
      <AuthProvider>
        <LanguageProvider>
          <App />
        </LanguageProvider>
      </AuthProvider>
    </StaticRouter>
  );
}
