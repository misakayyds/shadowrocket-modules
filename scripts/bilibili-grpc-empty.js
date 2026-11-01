// Replace a gRPC response with an empty message (5-byte frame: uncompressed, length 0).
// Used for PlayPause (暂停广告) / TFInfo / ViewEndPage. Same effect as Sparkle's Map Local,
// but done in the response phase because Shadowrocket logs Map Local as REJECT (404).
const headers = Object.assign({}, $response.headers);
for (const k of Object.keys(headers)) {
  const l = k.toLowerCase();
  if (l === "content-length" || l === "grpc-encoding" || l === "content-encoding") delete headers[k];
}
headers["grpc-status"] = "0";
$done({ status: 200, headers, body: new Uint8Array([0, 0, 0, 0, 0]) });
