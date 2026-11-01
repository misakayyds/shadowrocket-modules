# Bilibili V9 真机测试清单（小火箭）

## 安装（重要：本地脚本）

V9 依赖与模块**同目录**的两个本地脚本（远程 URL 无法托管补丁）：

1. `Bilibili-Sparkle-Shadowrocket-Fix-v9.sgmodule`
2. `bilibili.protobuf.airborne.sr.js`
3. `bilibili-splash-sr.js`

导入方式任选其一：

- 用「本地模块」导入上述文件所在文件夹；或
- 把两个 `.js` 拷到小火箭配置目录后，保证脚本 URL / 本地脚本能解析到同名文件。

然后：只启用 V9 → **编译配置 / 使用配置** → 打开 **配置 → 脚本 URL**：

- 远程 Sparkle/json 等应为 ✅
- 两个本地脚本若列在脚本 URL 里也应能打开；若显示 ❎，说明路径没放到位。

确认 HTTPS 解密、证书信任、`h2`、MITM 含 `grpc.biliapi.net` / `app.bilibili.com` / `bsbsb.top`。重连 VPN。

## 如何查看脚本是否执行（下一轮证据）

代理日志**通常不显示 SCRIPT**，请按下面抓脚本侧证据：

1. **配置 → 脚本 URL**：确认脚本已下载/可访问（✅）。
2. 系统设置给小火箭 **通知权限**：脚本异常有时会推送。
3. 配置文件 `ⓘ` → **脚本** 列表：部分版本可看到最近执行/错误。
4. V9 `logLevel=1`。测空降后在能看到的脚本控制台/日志里找：
   - `[SponsorBlock]`（拉 bsbsb 的 status/body）
   - `[Argument]`
   - `[bilibili-splash-sr]` / `empty splash` / `peak brand_splash cleared`
   - `[Bilibili] All hosts failed`（若仍出现，说明走了旧 ce 路径，不应再有）
5. 代理日志辅助：打开带空降数据的视频时应出现 `bsbsb.top`；`ViewProgress` 仍为 DIRECT/FINAL 属正常（脚本不改路由名）。

## 测开屏（热启动）

1. 冷启动：应仍无开屏（V8 已验证）。
2. 使用 App 一两分钟（让 `peak/download` 有机会发生）→ 切后台 ≥30s → 回前台：热启动开屏应消失或明显减少。
3. 导出日志：热启动若再请求 `splash/list`，应为 FINAL,DIRECT（不是 REJECT）；可有 peak 且被脚本/jq 清空。

## 测空降（9.17.0）

预期：**进度条出现可点章节，文案为「广告」**（不是自动跳；也不是「空降」二字）。

1. 打开**你已确认有 SponsorBlock 空降数据**的视频。
2. 看进度条章节；点「广告」章节应跳到段末。
3. 同时看是否请求了 `bsbsb.top`，以及脚本日志里 SponsorBlock 的 status 是否 200、body 是否非 `[]`。
4. 注意：脚本只保留 `actionType=skip` 且时长 **≥8 秒** 的段；更短的赞助段不会显示章节。

## 若仍失败请带回

1. 覆盖「热启动 + 打开空降视频」全程的新 log DB（不要只截冷启动 1–2 秒）。
2. 脚本 URL 页截图（含本地脚本状态）。
3. 能拿到的脚本控制台/`[SponsorBlock]` 原文。
4. 测试视频的 BV 号 + cid（可选）。
