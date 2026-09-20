// Runs after `vite build` (see package.json "build" script). Produces one
// real, crawlable index.html per SEO-important route inside dist/, on top of
// the normal client bundle. Nginx's `try_files $uri $uri/ /index.html` (see
// nginx.conf) already serves a matching directory's index.html first, so
// these prerendered pages are picked up automatically in production with no
// server changes — routes that AREN'T prerendered here still fall through to
// the plain client-rendered dist/index.html exactly as before.
//
// How it works: we SSR-bundle src/entry-server.jsx with Vite, render each
// route's component tree to an HTML string with React's renderToString, and
// splice that string plus route-specific <title>/<meta>/JSON-LD into a copy
// of the already-built dist/index.html. The client bundle is untouched — it
// still does a normal (non-hydrating) client render on top of this markup,
// so behaviour for real visitors doesn't change; only what a crawler or
// "view source" sees does.
import { build } from "vite";
import { fileURLToPath } from "node:url";
import path from "node:path";
import fs from "node:fs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const SITE_URL = "https://roskyro.in";

async function main() {
  // 1. Bundle the SSR entry so we can import a plain Node-runnable module.
  await build({
    root,
    logLevel: "warn",
    build: {
      ssr: "src/entry-server.jsx",
      outDir: "dist-ssr",
      rollupOptions: { output: { format: "es" } },
    },
  });

  // 2. The app touches localStorage (AuthContext, api client) — polyfill a
  // harmless stub since there's no browser here. Nothing else in the render
  // path touches browser-only globals (verified: only admin pages / event
  // handlers use window/document, and those never run during a static render).
  globalThis.localStorage = {
    getItem: () => null,
    setItem: () => {},
    removeItem: () => {},
  };

  const { render } = await import(path.resolve(root, "dist-ssr/entry-server.js"));

  const template = fs.readFileSync(path.resolve(root, "dist/index.html"), "utf-8");

  const staticPages = [
    {
      urlPath: "/",
      title: "ROSKYRO — Healthcare Concierge | Verified Care, On Call",
      description:
        "ROSKYRO is a Healthcare Concierge — a dedicated Relationship Officer for every hospital patient, and annual Concierge memberships for families.",
      jsonLd: {
        "@context": "https://schema.org",
        "@type": "Organization",
        name: "ROSKYRO",
        alternateName: "ROSKYRO Healthcare Concierge",
        url: SITE_URL,
        logo: `${SITE_URL}/brand/logo-og.png`,
        description:
          "ROSKYRO runs the Patient Concierge Program for hospitals — a dedicated Relationship Officer for every enrolled patient — and annual Concierge memberships for patients and families.",
      },
    },
  ];

  for (const p of staticPages) {
    writePage(root, template, p.urlPath, render(p.urlPath), {
      title: p.title,
      description: p.description,
      jsonLd: p.jsonLd,
    });
  }

  fs.rmSync(path.resolve(root, "dist-ssr"), { recursive: true, force: true });
  console.log(`Prerendered ${staticPages.length} page(s).`);
}

function escapeAttr(s = "") {
  return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function writePage(root, template, urlPath, bodyHtml, { title, description, jsonLd }) {
  const url = `${SITE_URL}${urlPath}`;
  let out = template.replace('<div id="root"></div>', `<div id="root">${bodyHtml}</div>`);
  out = out.replace(/<title>.*?<\/title>/, `<title>${escapeAttr(title)}</title>`);
  out = out.replace(
    /<meta name="description" content=".*?"\s*\/?>/,
    `<meta name="description" content="${escapeAttr(description)}" />`
  );
  // index.html ships baseline og:*/twitter:* tags so non-prerendered routes
  // still carry branding — strip those here so this route's page-specific
  // tags (appended below) aren't left as duplicates alongside them.
  out = out.replace(/\s*<meta (?:property="og:|name="twitter:)[^>]*\/>\n?/g, "");

  const extraTags = [
    `<link rel="canonical" href="${url}" />`,
    `<meta property="og:title" content="${escapeAttr(title)}" />`,
    `<meta property="og:description" content="${escapeAttr(description)}" />`,
    `<meta property="og:url" content="${url}" />`,
    `<meta property="og:type" content="website" />`,
    `<meta property="og:site_name" content="ROSKYRO — Healthcare Concierge" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${escapeAttr(title)}" />`,
    `<meta name="twitter:description" content="${escapeAttr(description)}" />`,
    jsonLd ? `<script type="application/ld+json">${JSON.stringify(jsonLd)}</script>` : "",
  ]
    .filter(Boolean)
    .join("\n    ");
  out = out.replace("</head>", `    ${extraTags}\n  </head>`);

  const outDir =
    urlPath === "/" ? path.resolve(root, "dist") : path.resolve(root, "dist", urlPath.replace(/^\//, ""));
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, "index.html"), out);
  console.log("  prerendered", urlPath);
}

main().catch((err) => {
  console.error("Prerender failed:", err);
  process.exit(1);
});
