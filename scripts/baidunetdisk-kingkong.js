// 百度网盘首页金刚区：去掉小说、短剧、打印、求职等推广入口（对应 Kelee 插件里的 jq 规则）
const DROP = new Set(["novel", "shortplay", "print", "job_hunt"]);
let body = $response.body;
try {
  const obj = JSON.parse(body);
  if (obj && obj.data && Array.isArray(obj.data.data)) {
    obj.data.data = obj.data.data.filter(i => !(i && DROP.has(i.type)));
    body = JSON.stringify(obj);
  }
} catch (e) {
  console.log("[baidunetdisk-kingkong] " + e);
}
$done({ body });
