// Shadowrocket http-request: capture aid/cid from ViewProgressReq for the response-side airborne script.
// Never modifies the request.
(function () {
  function varint(b, p) { let v = 0, m = 1, x; do { x = b[p.i++]; v += (x & 127) * m; m *= 128; } while (x & 128); return v; }
  try {
    let b = $request.body;
    if (!b || typeof b === "string" || b.length < 6) { console.log("[SponsorBlock-capture] no binary body"); return $done({}); }
    let payload = b.subarray(5);
    if (b[0]) {
      if (typeof $utils !== "undefined" && $utils.ungzip) payload = $utils.ungzip(payload);
      else { console.log("[SponsorBlock-capture] compressed body, no ungzip"); return $done({}); }
    }
    let p = { i: 0 }, aid = 0, cid = 0;
    while (p.i < payload.length) {
      let tag = varint(payload, p), no = Math.floor(tag / 8), wt = tag & 7;
      if (wt === 0) { let v = varint(payload, p); if (no === 1) aid = v; else if (no === 2) cid = v; }
      else if (wt === 2) { let l = varint(payload, p); p.i += l; }
      else if (wt === 1) p.i += 8; else if (wt === 5) p.i += 4; else break;
    }
    if (aid) {
      $persistentStore.write(JSON.stringify({ aid: String(aid), cid: String(cid), ts: Date.now() }), "bili_sr_vp");
      console.log(`[SponsorBlock-capture] aid=${aid} cid=${cid}`);
    } else console.log("[SponsorBlock-capture] aid not found");
  } catch (e) { console.log("[SponsorBlock-capture] error " + e); }
  $done({});
})();
