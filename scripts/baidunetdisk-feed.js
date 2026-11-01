// 百度网盘首页信息流（feed/cardinfos）：只保留“最近”和“产品功能”卡片，其余推荐/推广卡片全部去掉。
// 判定逻辑参考 ShiinaWong 的 QX 清理脚本：仅当返回里能识别出正常卡片时才过滤，避免接口改版后误删。
const KEEP = new Set(["product", "recent"]);
let body = $response.body;
try {
  const obj = JSON.parse(body);
  const cards = obj && obj.data && obj.data.cards;
  if (Array.isArray(cards) && cards.some(c => c && KEEP.has(c.source))) {
    const removed = cards.filter(c => c && typeof c.source === "string" && !KEEP.has(c.source));
    obj.data.cards = cards.filter(c => !(c && typeof c.source === "string" && !KEEP.has(c.source)));
    if (removed.length) console.log("[baidunetdisk-feed] removed: " + removed.map(c => c.source).join(","));
    body = JSON.stringify(obj);
  }
} catch (e) {
  console.log("[baidunetdisk-feed] " + e);
}
$done({ body });
