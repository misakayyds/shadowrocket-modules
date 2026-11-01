// Shadowrocket/Surge Bilibili splash emptier (V9)
// Why not plain [] / reject: client falls back to cached/brand materials.
// Sparkle Map Local uses list:[{}], min/pull_interval=31536000 — keep that shape.
// Walvez uses empty arrays; V8 cold-start OK with Walvez, but hot-start still showed ads
// after cache clear → likely peak/brand materials or list interval too short.
// Also clear brand_splash when URL is peak/download (same script, dual pattern).

const YEAR = 31536000;

const EMPTY_SHOW = {
  code: 0, message: "OK", ttl: 1,
  data: { show: [] },
};

const EMPTY_LIST = {
  code: 0, message: "OK", ttl: 1,
  data: {
    max_time: 0,
    min_interval: YEAR,
    pull_interval: YEAR,
    keep_ids: [],
    // Sparkle uses a single empty object placeholder — not []
    list: [{}],
    show: [],
    splash_request_id: "",
  },
};

const EMPTY_EVENT = {
  code: 0, message: "OK", ttl: 1,
  data: { event_list: [] },
};

const EMPTY_BRAND = {
  code: 0, message: "OK", ttl: 1,
  data: {
    pull_interval: YEAR,
    forcibly: 0,
    rule: 0,
    list: [],
    preload: [],
    has_new_splash_set: 0,
  },
};

function splashBody(url) {
  const u = String(url || "");
  if (u.includes("/splash/show")) return EMPTY_SHOW;
  if (u.includes("/splash/event/list")) return EMPTY_EVENT;
  if (u.includes("/splash/brand/list")) return EMPTY_BRAND;
  if (u.includes("/splash/list")) return EMPTY_LIST;
  return EMPTY_LIST;
}

function clearPeak(bodyText) {
  try {
    const obj = JSON.parse(bodyText);
    if (!(obj && obj.code === 0 && obj.data && Array.isArray(obj.data.resource))) {
      return bodyText;
    }
    let n = 0;
    for (const item of obj.data.resource) {
      if (item && item.type === "brand_splash" && Array.isArray(item.list) && item.list.length) {
        n += item.list.length;
        item.list = [];
      }
      // also clear generic splash-ish preload bags if present
      if (item && item.type && String(item.type).toLowerCase().includes("splash") && Array.isArray(item.list)) {
        n += item.list.length;
        item.list = [];
      }
    }
    console.log(`[bilibili-splash-sr] peak brand_splash cleared items=${n}`);
    return JSON.stringify(obj);
  } catch (e) {
    console.log(`[bilibili-splash-sr] peak parse error ${e}`);
    return bodyText;
  }
}

const url =
  (typeof $request !== "undefined" && $request && ($request.url || $request.URL)) || "";

if (url.includes("/x/resource/peak/download")) {
  const raw = ($response && $response.body) || "";
  $done({ body: clearPeak(raw) });
} else {
  const body = JSON.stringify(splashBody(url));
  console.log(`[bilibili-splash-sr] empty splash ${String(url).split("?")[0]}`);
  $done({ body });
}
