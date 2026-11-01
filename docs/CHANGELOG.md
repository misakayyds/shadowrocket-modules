# 更新日志

## 百度网盘去广告

### 1.3.0（2026-11-02）

- 新增 `baidunetdisk-feed.js`：首页信息流 `feed/cardinfos` 只保留“最近”和产品功能卡片。
- 屏蔽 `membership/advertise` 会员广告接口。

### 1.2.0（2026-11-01）

- 根据真机日志，屏蔽聚合广告平台域名：穿山甲、快手联盟，以及瑞狮、倍孜、章鱼移动、旺脉、Menta 等十余家国内 ADX。
- 广点通扩大为 `e.qq.com`，补充 `afdconf.baidu.com`、`als.baidu.com` 和 `buy/ad/get`。

### 1.1.0（2026-11-01）

- 按 Kelee 2026-10 的接口集重写：`getsyscfg`、`getconfig`、`plugin/get`、`activityentry`、`pcs/adv` 等改用 `reject-dict`。
- 屏蔽百度 MobAds、腾讯广点通 SDK 域名；金刚区改用响应脚本过滤。

## 哔哩哔哩增强

### V11（2026-11-01）

- 正式版：移除调试通知，日志等级恢复为上游默认值 4（ERROR）。
- 空降脚本改名为 `bilibili-airborne-sr.js`（换网址，强制小火箭重新下载脚本）。
- 补充 README、GPL-3.0 许可。

### V10.3

- int64 编码容忍带小数的字符串（先截掉小数部分），修复「Failed to parse String to BigInt」。

### V10.2

- 修复空降章节写回时报错：视频时长是小数，章节时间统一取整。
- 恢复暂停广告屏蔽：`PlayPause` / `TFInfo` / `ViewEndPage` 在响应阶段替换为空 gRPC 消息，覆盖 grpc 和 app 两个主机。

### V10 / V10.1

- 新增请求阶段的 aid/cid 记录脚本；响应阶段读取后查询 SponsorBlock。
- 调试版：每个步骤弹出系统通知，用于在没有脚本日志的小火箭上定位问题。
- `bsbsb.top` 从 MITM 中移除。

### V9 及更早

见 `docs/history/`。
