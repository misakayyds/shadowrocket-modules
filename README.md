# shadowrocket-modules

适配 Shadowrocket（小火箭）的 iOS 模块与脚本，全部在真机上用小火箭日志验证过。社区里很多模块是为 Surge、Loon 写的，放到小火箭上经常因为 Map Local、Body Rewrite 等行为不一致而失效，这里的模块都改写成了小火箭能稳定执行的规则和脚本。

| 模块 | 版本 | 说明 |
| --- | --- | --- |
| [哔哩哔哩增强](#哔哩哔哩增强shadowrocket-适配版) | V11 | 基于 Sparkle，去开屏、去暂停广告、空降助手章节 |
| [百度网盘去广告](#百度网盘去广告shadowrocket-适配版) | 1.3.0 | 去开屏、首页推荐信息流、视频广告和聚合广告 SDK |
| [YouTube 增强](#youtube-增强shadowrocket-适配版) | 2.0.1（测试中） | 基于 Maasea，去广告并修复详情页加载慢 |

安装方式都一样：在小火箭里开启 HTTPS 解密并信任证书，然后在「配置 → 模块」里粘贴安装链接添加。

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

测试环境：iOS 27.2，百度网盘 13.36.0，Shadowrocket 最新版。

### 功能

- 去除开屏广告和视频广告。
- 首页下方的推荐信息流只保留“最近”和产品功能卡片，去掉其余推荐和推广卡片。
- 首页金刚区去掉小说、短剧、打印、求职等推广入口。
- 去掉活动入口、福利列表、游戏中心和会员广告。
- 按域名屏蔽 App 内置的聚合广告 SDK，包括百度 MobAds、腾讯广点通、穿山甲、快手联盟和十余家国内广告交易平台。这些域名规则对其他 App 里的同类广告同样生效。

### 为什么老规则不起作用

新版百度网盘的开屏和首页广告配置主要由 `/api/getsyscfg` 和 `/api/getconfig` 下发，网上流传的老规则只拦了 `pcs/adx` 这类旧接口，所以基本不起作用。此外，网盘的开屏和视频广告位接的是聚合广告：同一个广告位会同时向十几家广告平台竞价，只拦百度自家的接口或一两个 SDK，其他平台照样能把广告填上，所以必须把这些平台的域名一起屏蔽。首页信息流则是由 `feed/cardinfos` 一次性下发的，里面混着正常卡片，不能整体拒绝，只能用响应脚本按卡片类型过滤。

接口规则主体参考了 Kelee 的 BaiduNetDisk_remove_ads 插件（2026-10），并改写成小火箭能稳定执行的 `reject-dict` 和响应脚本；信息流过滤逻辑参考了 ShiinaWong 的清理脚本。

### 安装

1. 停用其他所有百度网盘去广告模块，避免规则互相覆盖。
2. 添加上面的链接，确认模块已启用，并且 MITM 里包含 `pan.baidu.com`。
3. 彻底关闭网盘后重新打开，并在 App 里清一次缓存。已经下载到本地的广告素材可能还会再播一两次，之后就不会再出现。

### 文件说明

| 文件 | 作用 |
| --- | --- |
| `modules/BaiduNetdisk-AdBlock.sgmodule` | 模块本体 |
| `scripts/baidunetdisk-feed.js` | 过滤首页信息流 `feed/cardinfos` |
| `scripts/baidunetdisk-kingkong.js` | 过滤首页金刚区 `feed/kingkongdistrict` |

## YouTube 增强（Shadowrocket 适配版）

安装链接：

```
https://raw.githubusercontent.com/misakayyds/shadowrocket-modules/main/modules/YouTube-Enhance-Shadowrocket.sgmodule
```

基于 [Maasea/sgmodule](https://github.com/Maasea/sgmodule) 的 YouTube Enhance，去除视频、首页、搜索和 Shorts 广告，保留屏蔽上传按钮、字幕翻译等参数。原版在小火箭上点进视频详情页要等好几秒：新版 App 开播时会先发一个 `initplayback` 请求，原版用脚本解析它的加密请求体，处理不了时返回空响应，App 会换节点重试好几次才回退到普通的 `v1/player` 接口，而真正去广告的正是 `v1/player` 的响应脚本。本版直接拒绝 `initplayback`，让 App 立刻回退，同时去掉了每个 `log_event` 上的请求脚本。此外还补上了新版中插广告使用的 `player/ad_break` 接口（原版没有覆盖）。安装前请停用原版 YouTube 模块。

## 致谢与许可

B站模块的核心脚本来自 [kokoryh/Sparkle](https://github.com/kokoryh/Sparkle)，空降数据来自 BilibiliSponsorBlock 社区，开屏处理参考了 Walvez、lalifeier、app2smile 等人的公开方案。百度网盘模块参考了 Kelee、ShiinaWong 等人的公开规则。YouTube 模块的响应脚本来自 [Maasea/sgmodule](https://github.com/Maasea/sgmodule)。

由于包含 Sparkle 的衍生代码，本仓库以 [GPL-3.0](LICENSE) 发布。本项目仅供学习交流使用。
