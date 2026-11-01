# 更新日志（哔哩哔哩增强 · Shadowrocket 适配版）

## V11（2026-11-01）

- 正式版：移除调试通知，日志等级恢复为上游默认值 4（ERROR）。
- 空降脚本改名为 `bilibili-airborne-sr.js`（换网址，强制小火箭重新下载脚本）。
- 补充 README、GPL-3.0 许可。

## V10.3

- int64 编码容忍带小数的字符串（先截掉小数部分），修复「Failed to parse String to BigInt」。

## V10.2

- 修复空降章节写回时报错：视频时长是小数，章节时间统一取整。
- 恢复暂停广告屏蔽：`PlayPause` / `TFInfo` / `ViewEndPage` 在响应阶段替换为空 gRPC 消息，覆盖 grpc 和 app 两个主机。

## V10 / V10.1

- 新增请求阶段的 aid/cid 记录脚本；响应阶段读取后查询 SponsorBlock。
- 调试版：每个步骤弹出系统通知，用于在没有脚本日志的小火箭上定位问题。
- `bsbsb.top` 从 MITM 中移除。

## V9 及更早

见 `docs/history/`。
