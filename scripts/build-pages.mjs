import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, "..");
const APP_TITLE = "Agent Cheat Sheet";

const FAVICON =
  "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>⌨️</text></svg>";

function renderOsToggle() {
  return `
          <div class="os-toggle" id="osToggle" aria-label="Keyboard layout">
            <button class="os-btn active" data-os="mac" title="Mac shortcuts">
              <svg width="14" height="14" viewBox="0 0 814 1000" fill="currentColor" aria-hidden="true">
                <path d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76.5 0-103.7 40.8-165.9 40.8s-105.6-57.8-155.5-127.4c-58.4-83-106.3-211.5-106.3-334.2 0-196.5 127.8-300.9 253.3-300.9 66.8 0 122.4 43.4 164.1 43.4 39.5 0 101.1-46 176.2-46 28.5 0 130.9 2.6 198.3 99.1zm-169.5-92.8c31.2-37 52.4-88.1 52.4-139.3 0-7.1-.6-14.3-1.9-20.1-50 1.6-109.2 33.3-145 75.1-25.8 29.3-52.4 79.8-52.4 131.6 0 7.8.6 15.6 1.3 18.2 2.6.6 6.4 1.3 10.3 1.3 44.7 0 101.1-30.5 135.3-66.8z"/>
              </svg>
            </button>
            <button class="os-btn" data-os="win" title="Windows shortcuts">
              <svg width="14" height="14" viewBox="0 0 88 88" fill="currentColor" aria-hidden="true">
                <path d="M0 12.402l35.687-4.86.016 34.423-35.67.203zm35.67 33.529l.028 34.453L.028 71.48l-.026-25.55zm4.326-39.025L87.314 0v41.527l-47.318.376zm47.329 39.349l-.011 41.34-47.318-6.678-.066-34.739z"/>
              </svg>
            </button>
          </div>`;
}

function serializeForScript(value) {
  return JSON.stringify(value).replace(/<\//g, "<\\/");
}

function getStaticText(value) {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    if (typeof value.zh === "string") {
      return value.zh;
    }

    if (typeof value.en === "string") {
      return value.en;
    }
  }

  return typeof value === "string" ? value : "";
}

function renderProductSwitch(appData) {
  return appData.productOrder.map((productId) => {
    const product = appData.products[productId];
    const label = getStaticText(product?.navLabel || product?.title || productId);
    return `<button class="mode-btn" data-product="${productId}">${label}</button>`;
  }).join("");
}

function renderShell({ defaultProduct, appData }) {
  const initialPage = appData.products[defaultProduct];
  const initialDescription = getStaticText(initialPage.description);

  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="${initialDescription}">
  <title>${APP_TITLE}</title>
  <link rel="icon" href="${FAVICON}">
  <link rel="stylesheet" href="./styles.css">
</head>
  <body class="app-shell" data-default-product="${defaultProduct}">
    <div class="toolbar-shell">
      <div class="header-toolbar">
        <div class="mode-switch product-switch" id="productSwitch" aria-label="Cheat sheet">
          ${renderProductSwitch(appData)}
        </div>
        <div class="toolbar-actions">
          <div class="mode-switch lang-switch" id="langSwitch" aria-label="Language">
            <button class="mode-btn active" data-lang="zh">中文</button>
            <button class="mode-btn" data-lang="en">EN</button>
          </div>
${renderOsToggle()}
        </div>
      </div>
    </div>

    <div class="page">
      <header class="header header-app">
        <div class="header-body">
          <div class="title-stack">
            <h1 id="pageTitle">${APP_TITLE}</h1>
          </div>
          <div class="header-meta">
            <span class="version-info" id="versionInfo">${getStaticText(initialPage.versionInfo)}</span>
            <span class="last-updated" id="lastUpdated">${getStaticText(initialPage.lastUpdated)}</span>
          </div>
        </div>
      </header>

    <div id="changelogRoot"></div>
    <main class="main-grid" id="mainGrid"></main>
    <footer class="footer" id="footerRoot"></footer>
  </div>

  <script id="appData" type="application/json">${serializeForScript(appData)}</script>
  <script src="./script.js"></script>
</body>
</html>
`;
}

async function loadJson(relativePath) {
  const fullPath = path.join(ROOT, relativePath);
  return JSON.parse(await readFile(fullPath, "utf8"));
}

async function build() {
  const [catalog, translations] = await Promise.all([
    loadJson("data/catalog.json"),
    loadJson("data/translations.en.json"),
  ]);

  const productRecords = await Promise.all(
    catalog.products.map(async (entry) => {
      const product = await loadJson(entry.file);

      if (product.id !== entry.id) {
        throw new Error(`Catalog id "${entry.id}" does not match product file id "${product.id}"`);
      }

      return [entry.id, product];
    })
  );

  const appData = {
    productOrder: catalog.products.map((entry) => entry.id),
    products: Object.fromEntries(productRecords),
    translations,
  };

  for (const entry of catalog.entries) {
    const html = renderShell({ defaultProduct: entry.product, appData });
    await writeFile(path.join(ROOT, entry.output), html, "utf8");
  }
}

build().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
