# shadowrocket-modules

适配 Shadowrocket（小火箭）的 iOS 模块与脚本。目前主要维护的是 B站增强模块，它基于 [kokoryh/Sparkle](https://github.com/kokoryh/Sparkle)，针对哔哩哔哩 9.17 之后的版本，修复了上游在小火箭上不生效的部分。

## 哔哩哔哩增强（Shadowrocket 适配版）

安装链接：

```
https://raw.githubusercontent.com/misakayyds/shadowrocket-modules/main/modules/Bilibili-Sparkle-Shadowrocket-Fix.sgmodule
```

测试环境：iOS 27.2，哔哩哔哩 9.17.0（91700100），Shadowrocket 最新版。

### 功能

- 去除开屏广告，包括冷启动和从后台切回时的开屏。
- 去除暂停广告，以及信息流、详情页、动态里的广告，并精简界面元素（沿用 Sparkle 上游脚本）。
- 优化评论区加载，过滤置顶的广告评论。
- 空降助手：根据 [SponsorBlock](https://bsbsb.top) 社区标注的数据，在进度条上插入「广告」章节，点一下就能跳过恰饭片段。

### 安装

1. 在小火箭里打开 HTTPS 解密：安装并信任证书（「设置 → 通用 → 关于本机 → 证书信任设置」里打开完全信任）。
2. 在「配置 → 模块」里点右上角的加号，粘贴上面的链接添加，并确保它是启用状态。
3. **关闭其他所有 B站相关模块**，包括 Sparkle 原版和其他 B站去广告模块。多个模块同时改同一个接口会互相覆盖。
4. 断开再重新连接小火箭，然后彻底关闭 B站，再重新打开。

如果之前已经缓存了开屏广告，模块删不掉 App 本地缓存的广告素材。这种情况在 B站「设置 → 清除缓存」里清一次就行。

### 关于空降助手

B站从 9.17 开始给弹幕数据加了签名校验，以前靠插入「空降弹幕」来自动跳过的做法已经失效。上游 Sparkle 也改成了现在这种方式：在进度条上显示「广告」章节，需要**手动点击**章节跳过，不会自动跳转，这是目前的设计。

只有在 SponsorBlock 里有人标注过的视频才会出现章节，冷门视频通常没有数据。章节只在你打开视频时生成一次，标注是之后才加上的话，需要重新进入视频才能看到。

### 和上游 Sparkle 的区别

Sparkle 官方只支持 Surge、Loon 和 Egern。小火箭的脚本环境只是兼容它们的接口，有不少细节对不上，所以本模块做了以下改动：

- **空降助手**：上游在请求阶段重新发起 gRPC 请求、再伪造一个完整响应，这一套在小火箭上跑不通。本模块改为在请求阶段记录视频的 aid 和 cid，在响应阶段查询 SponsorBlock，然后把章节直接写进 B站返回的真实响应。另外，小火箭的 BigInt 不接受带小数的数字字符串，所以写回之前会先把章节时间统一取整。
- **开屏广告**：小火箭会把 Map Local 当成 REJECT 处理，接口直接返回 404，B站拿不到数据就回退去播本地缓存的广告。所以本模块改用响应脚本，返回结构完整的空开屏列表，同时清理 `peak/download` 里预载的品牌开屏。
- **暂停广告**：`PlayPause`、`TFInfo`、`ViewEndPage` 这三个接口在响应阶段替换成空的 gRPC 消息，同时覆盖 `grpc.biliapi.net` 和 `app.bilibili.com` 两个主机。
- **网络**：拒绝 B站 API 的 UDP/443（QUIC），并删除响应头里的 `Alt-Svc`。这样请求才会走 HTTPS，才能被解密和改写。

### 文件说明

| 文件 | 作用 |
| --- | --- |
| `modules/Bilibili-Sparkle-Shadowrocket-Fix.sgmodule` | 模块本体 |
| `scripts/bilibili-airborne-sr.js` | 空降助手响应脚本，改编自 Sparkle `request.js` |
| `scripts/bilibili-viewprogress-capture.js` | 在请求阶段记录 aid/cid |
| `scripts/bilibili-splash-sr.js` | 开屏和 peak 清理 |
| `scripts/bilibili-grpc-empty.js` | 把指定的 gRPC 响应替换成空消息 |

其余功能直接引用 Sparkle 上游的脚本。

### 常见问题

**更新模块后行为没变化？** 小火箭是按网址缓存远程脚本的，更新模块不一定会重新下载脚本。可以在模块详情里手动更新脚本，或者删掉模块后重新添加。

**进度条没有章节？** 先确认这个视频在 SponsorBlock 里有标注，再确认没有启用其他 B站模块，并且 MITM 里包含 `grpc.biliapi.net` 和 `app.bilibili.com`。

**是否支持 Surge、Loon？** 这几个软件请直接使用 [Sparkle 官方模块](https://github.com/kokoryh/Sparkle)，不需要用这个适配版。

## 百度网盘去广告（Shadowrocket 适配版）

安装链接：

```
https://raw.githubusercontent.com/misakayyds/shadowrocket-modules/main/modules/BaiduNetdisk-AdBlock.sgmodule
```

去掉开屏广告、首页卡片和弹窗、视频广告、活动入口、游戏中心，以及首页金刚区里的小说、短剧等推广入口。除了接口规则，还屏蔽了 App 内置的百度 MobAds 和腾讯广点通两个广告 SDK 的域名（这两条域名规则对其他 App 里的同类广告也生效）。新版 App 的开屏和首页广告主要由 `/api/getsyscfg` 和 `/api/getconfig` 下发，网上流传的老规则只拦了 `pcs/adx` 这类旧接口，所以基本不起作用。本模块的规则主体来自 Kelee 的 BaiduNetDisk_remove_ads 插件（2026-10），并改写成小火箭能稳定执行的 `reject-dict` 和响应脚本。安装前请停用其他百度网盘去广告模块，装好后在 App 里清一次缓存。

## 致谢与许可

核心脚本来自 [kokoryh/Sparkle](https://github.com/kokoryh/Sparkle)，空降数据来自 BilibiliSponsorBlock 社区。开屏处理参考了 Walvez、lalifeier、app2smile 等人的公开方案。

由于包含 Sparkle 的衍生代码，本仓库以 [GPL-3.0](LICENSE) 发布。本项目仅供学习交流使用。
