(function () {
  var dataEl = document.getElementById("appData");

  if (!dataEl) {
    return;
  }

  var appData = JSON.parse(dataEl.textContent);
  var products = appData.products || {};
  var productOrder = appData.productOrder || Object.keys(products);
  var translations = appData.translations || { exact: {}, replace: {} };
  var replaceEntries = Object.entries(translations.replace || {}).sort(function (a, b) {
    return b[0].length - a[0].length;
  });
  var keyAliases = {
    Alt: "Alt",
    "⌥": "Alt",
    Option: "Alt",
    Shift: "Shift",
    "⇧": "Shift",
    Ctrl: "Ctrl",
    "⌃": "Ctrl",
    Control: "Ctrl",
    Enter: "Enter",
    Return: "Enter",
    "↩": "Enter",
    Esc: "Esc",
    Escape: "Esc",
    "⎋": "Esc"
  };
  var keyLabels = {
    mac: {
      Alt: "⌥",
      Shift: "⇧",
      Ctrl: "⌃",
      Enter: "↩",
      Esc: "⎋"
    },
    win: {
      Alt: "Alt",
      Shift: "Shift",
      Ctrl: "Ctrl",
      Enter: "Enter",
      Esc: "Esc"
    }
  };

  var productSwitch = document.getElementById("productSwitch");
  var langSwitch = document.getElementById("langSwitch");
  var osToggle = document.getElementById("osToggle");
  var titleEl = document.getElementById("pageTitle");
  var versionInfoEl = document.getElementById("versionInfo");
  var lastUpdatedEl = document.getElementById("lastUpdated");
  var changelogRoot = document.getElementById("changelogRoot");
  var mainGrid = document.getElementById("mainGrid");
  var footerRoot = document.getElementById("footerRoot");
  var descriptionMeta = document.querySelector('meta[name="description"]');

  var PRODUCT_KEY = "cheatsheet-product";
  var LANG_KEY = "cheatsheet-lang";
  var OS_KEY = "cc-os";
  var OS_MANUAL_KEY = "cc-os-manual";
  var APP_TITLE = "Agent Cheat Sheet";
  var firstProduct = productOrder.find(function (productId) {
    return !!products[productId];
  }) || Object.keys(products)[0];

  function detectOS() {
    var platform = navigator.platform || "";
    var userAgent = navigator.userAgent || "";

    if (/Mac|iPhone|iPod|iPad/.test(platform) || /Mac/.test(userAgent)) {
      return "mac";
    }

    return "win";
  }

  function getInitialProduct() {
    var params = new URLSearchParams(window.location.search);
    var fromQuery = params.get("product");

    if (fromQuery && products[fromQuery]) {
      return fromQuery;
    }

    var saved = localStorage.getItem(PRODUCT_KEY);
    if (saved && products[saved]) {
      return saved;
    }

    var fallback = document.body.dataset.defaultProduct || firstProduct || "claude";
    return products[fallback] ? fallback : (firstProduct || "claude");
  }

  function getInitialLang() {
    var params = new URLSearchParams(window.location.search);
    var fromQuery = params.get("lang");

    if (fromQuery === "en" || fromQuery === "zh") {
      return fromQuery;
    }

    var saved = localStorage.getItem(LANG_KEY);
    return saved === "en" ? "en" : "zh";
  }

  function getInitialOS() {
    if (localStorage.getItem(OS_KEY) && !localStorage.getItem(OS_MANUAL_KEY)) {
      localStorage.removeItem(OS_KEY);
    }

    return localStorage.getItem(OS_KEY) || detectOS();
  }

  var state = {
    product: getInitialProduct(),
    lang: getInitialLang(),
    os: getInitialOS(),
  };

  function localizeValue(value) {
    if (!value || typeof value !== "object" || Array.isArray(value)) {
      return value;
    }

    if (state.lang === "en" && typeof value.en === "string") {
      return value.en;
    }

    if (typeof value.zh === "string") {
      return value.zh;
    }

    return value;
  }

  function translate(value) {
    value = localizeValue(value);

    if (state.lang !== "en" || typeof value !== "string") {
      return value;
    }

    var exact = translations.exact && translations.exact[value];
    if (exact) {
      return exact;
    }

    var output = value;
    replaceEntries.forEach(function (entry) {
      var source = entry[0];
      var target = entry[1];

      if (output.indexOf(source) !== -1) {
        output = output.split(source).join(target);
      }
    });

    return output;
  }

  function renderRow(row) {
    var classes = ["row"];

    if (!row.keyHtml) {
      classes.push("row--desc-only");
    }

    if (!row.descHtml) {
      classes.push("row--key-only");
    }

    if (row.compact) {
      classes.push("row--compact");
    }

    return '<div class="' + classes.join(" ") + '">' +
      (row.keyHtml ? '<span class="key">' + translate(row.keyHtml) + "</span>" : "") +
      (row.descHtml ? '<span class="desc">' + translate(row.descHtml) + "</span>" : "") +
      "</div>";
  }

  function renderGroup(group) {
    return '<div class="sub-header">' + translate(group.title) + "</div>" +
      group.rows.map(renderRow).join("");
  }

  function renderSection(section) {
    return '<section class="section ' + section.className + '">' +
      '<div class="section-header">' + translate(section.header) + "</div>" +
      '<div class="section-content">' + section.groups.map(renderGroup).join("") + "</div>" +
      "</section>";
  }

  function renderColumn(column) {
    return '<div class="' + column.className + '">' +
      column.sections.map(renderSection).join("") +
      "</div>";
  }

  function renderChangelog(page) {
    if (!page.changelog) {
      changelogRoot.innerHTML = "";
      return;
    }

    var items = page.changelog.items.map(function (item) {
      return "<li>" + translate(item) + "</li>";
    }).join("");

    changelogRoot.innerHTML =
      '<div class="changelog">' +
        '<div class="changelog-header">' +
          '<a href="' + page.changelog.href + '" target="_blank" rel="noreferrer">' + translate(page.changelog.label) + "</a>" +
          '<span class="changelog-dismiss" data-action="dismiss-changelog">✕</span>' +
        "</div>" +
        '<ul class="changelog-list">' + items + "</ul>" +
      "</div>";
  }

  function renderFooter(page) {
    var footer = page.footer || { rows: [] };

    footerRoot.innerHTML = footer.rows.map(function (row) {
      return '<div class="footer-row">' + translate(row.html) + "</div>";
    }).join("");
  }

  function updateMeta(page) {
    var description = translate(page.description);

    document.title = APP_TITLE;
    document.documentElement.lang = state.lang === "en" ? "en" : "zh-CN";
    titleEl.textContent = APP_TITLE;
    versionInfoEl.textContent = translate(page.versionInfo);
    lastUpdatedEl.textContent = translate(page.lastUpdated);

    if (descriptionMeta) {
      descriptionMeta.setAttribute("content", description);
    }
  }

  function updateModeButtons() {
    productSwitch.querySelectorAll(".mode-btn").forEach(function (button) {
      var active = button.dataset.product === state.product;
      button.classList.toggle("active", active);
      button.setAttribute("aria-pressed", active ? "true" : "false");
    });

    langSwitch.querySelectorAll(".mode-btn").forEach(function (button) {
      var active = button.dataset.lang === state.lang;
      button.classList.toggle("active", active);
      button.setAttribute("aria-pressed", active ? "true" : "false");
    });
  }

  function applyOS(os) {
    osToggle.querySelectorAll(".os-btn").forEach(function (button) {
      button.classList.toggle("active", button.dataset.os === os);
    });

    document.querySelectorAll(".keycap").forEach(function (keycap) {
      var current = keycap.textContent.trim();

      if (!keycap.dataset.baseKey) {
        keycap.dataset.baseKey = keyAliases[current] || current;
      }

      var baseKey = keycap.dataset.baseKey;
      var label = keyLabels[os] && keyLabels[os][baseKey];
      keycap.textContent = label || baseKey;
    });

    localStorage.setItem(OS_KEY, os);
  }

  function updateNewBadges() {
    var now = new Date();

    document.querySelectorAll(".badge-new[data-added]").forEach(function (badge) {
      var added = new Date(badge.getAttribute("data-added"));
      badge.style.display = (now - added) / 86400000 > 14 ? "none" : "";
    });
  }

  function syncUrl() {
    try {
      var params = new URLSearchParams(window.location.search);
      params.set("product", state.product);

      if (state.lang === "en") {
        params.set("lang", "en");
      } else {
        params.delete("lang");
      }

      var query = params.toString();
      var nextUrl = window.location.pathname + (query ? "?" + query : "") + window.location.hash;
      history.replaceState(null, "", nextUrl);
    } catch (error) {
      // Ignore URL sync failures in stricter file:// environments.
    }
  }

  function persistState() {
    localStorage.setItem(PRODUCT_KEY, state.product);
    localStorage.setItem(LANG_KEY, state.lang);
  }

  function render() {
    var page = products[state.product];

    if (!page) {
      return;
    }

    document.body.dataset.currentProduct = state.product;
    updateMeta(page);
    renderChangelog(page);
    mainGrid.innerHTML = page.columns.map(renderColumn).join("");
    renderFooter(page);
    updateModeButtons();
    applyOS(state.os);
    updateNewBadges();
    persistState();
    syncUrl();
  }

  productSwitch.addEventListener("click", function (event) {
    var button = event.target.closest("[data-product]");

    if (!button || !products[button.dataset.product] || button.dataset.product === state.product) {
      return;
    }

    state.product = button.dataset.product;
    render();
  });

  langSwitch.addEventListener("click", function (event) {
    var button = event.target.closest("[data-lang]");

    if (!button || button.dataset.lang === state.lang) {
      return;
    }

    state.lang = button.dataset.lang === "en" ? "en" : "zh";
    render();
  });

  osToggle.addEventListener("click", function (event) {
    var button = event.target.closest("[data-os]");

    if (!button) {
      return;
    }

    localStorage.setItem(OS_MANUAL_KEY, "1");
    state.os = button.dataset.os;
    applyOS(state.os);
  });

  document.addEventListener("click", function (event) {
    if (!event.target.matches("[data-action='dismiss-changelog']")) {
      return;
    }

    var changelog = event.target.closest(".changelog");
    if (changelog) {
      changelog.remove();
    }
  });

  render();
})();
