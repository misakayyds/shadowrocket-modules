# V9 变更说明（相对 V8）

日期：2026-11-01（Asia/Shanghai）

## 用户反馈与边界

- V8：冷启动开屏已消失（确认 Walvez/脚本路径有效）；热启动仍有开屏；空降进度条无「广告」章节。
- 用户已清缓存/重装；测试视频确认有 SponsorBlock 数据 → 排除「坏样本/未清缓存」作为主因。
- log2 的 V8 段仅 22:33:56–57 冷启动约 1–2 秒，**无热启动、无播放**；热启动分析仍参考同文件内 V7 段（22:18:29 仅 splash/list；此前有 peak/download；22:19:08 有 bsbsb.top）。

## 空降根因（源码级）

Sparkle `caf42c48`（9.17 改为章节）：

1. **主路径在 request 脚本** `bilibili.protobuf.request.js`：匹配 `ViewProgress`，解析 aid/cid → 并行 `ce()`（$httpClient 重拉 gRPC）+ `dn()`（bsbsb）→ 写入 `videoGuide.videoPoint.points`（文案「广告」）+ `pointPermanent`。
2. **response 脚本不拉 bsbsb**，只在已有 `state.segments` 时注入；单独 http-response 不够。
3. `≥91700000` 时 `isDanmakuAirborneEffective=false`，弹幕 DmSeg 路径会直接 abort。
4. 结束时 `$done({response: ...})`（fakeResponse），属 Surge 式「请求脚本伪造整包响应」。
5. Loon 适配器给 fetch 加了 `alpn=h2`；Surge/SR 用的 G 类**没有**；gRPC 重拉在 SR 上易失败。失败则整链 abort，**dn 即使已打到 bsbsb 也不会注入** — 与 V7 日志「有 bsbsb.top、无章节」一致。

V8 不匹配点：空降仍用 http-request + 原版 request.js（依赖 ce/fakeResponse）；且 `protobuf.response` 也匹配 ViewProgress，在 SR 双 http-response 下可能互相覆盖。

## 热启动开屏根因（证据+推断）

- 证据：热启动至少会打 `splash/list`；同会话常先有 `peak/download`。
- 推断（中等把握）：进程内/预载的 brand_splash 或 list 间隔过短，导致回前台仍能播素材；ColdStart 无可靠空包可抄。
- V8 Walvez：`list:[]` + 86400 间隔；Sparkle 官方 Map Local 用 `list:[{}]` + 31536000。

## V9 改动

1. 新增 `bilibili.protobuf.airborne.sr.js`（Sparkle request 补丁）：http-response、有正文则跳过 ce、unwrap `$done({response})`。
2. `bilibili.airborne` 改为 http-response + 上述本地脚本；去掉 response 脚本对 ViewProgress 的匹配。
3. 新增 `bilibili-splash-sr.js`：四开屏接口返回长间隔 + `list:[{}]`；并处理 peak 清空 brand_splash（jq 双保险）。
4. MITM 增加 `bsbsb.top`；保留 cm/miaozhen REJECT、元素屏蔽脚本。

## 仍不确定

- SR 是否 100% 支持二进制 `$done({body: Uint8Array})` 改 gRPC（binary-body-mode 已开）。
- 本地 script-path 解析是否因导入方式失败。
- ColdStart 是否另有热启广告。
- 本机出口访问 bsbsb 曾测到大量空 `[]`（可能镜像/网络差异）；以用户侧脚本日志 `[SponsorBlock]` 为准。
