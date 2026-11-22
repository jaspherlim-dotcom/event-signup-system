# 活动报名 + 147 跟进系统

给活动主办人用的报名和跟进系统：参加者用手机报名、拿入场卡；你在后台用 WhatsApp 联系、按 147 法则跟进、记付款和出席；团队成员用自己的推荐链接带人，也在自己的页面跟进。

**在线 Demo**（示范资料，不连真的表）：打开仓库根目录的 `index.html`，或开启 GitHub Pages 后的网址。

## 组成

| 部分 | 文件 | 谁用 |
|---|---|---|
| 报名页、入场卡、扫码签到、会后问卷 | `apps-script/Code.gs` + `apps-script/Index.html` | 参加者、工作人员 |
| 团队成员页（推荐链接、自己的名单、147 跟进、AI 建议） | `apps-script/Team.html` | 团队成员 |
| 后台（今日、名单、活动、数据、设置） | `admin/admin.html`（Claude Artifact） | 主办人 |
| 资料 | Google Sheet：Events、Registrations、Feedback、Team、TeamFollow | 全部共用 |

报名页和团队页是 Google Apps Script 网页应用，免费，跑在你自己的 Google 账号。后台是 Claude Artifact，通过 Google Sheets 连接器读写同一个 Sheet。

## 上线

照 [docs/上线步骤.md](docs/上线步骤.md) 做，大约 10 分钟。

## 网址参数

- `?e=活动ID`：活动报名页；加 `&src=fb` 记录渠道，加 `&r=成员代码` 记录推荐人
- `?t=编号&k=凭证码`：入场卡；`?c=编号&k=凭证码`：工作人员扫码签到（要 STAFF_PIN）
- `?f=活动ID`：会后问卷
- `?team`：团队成员登入

## 147 法则

首次联系那天 = 第 1 天，第 4 天 = 联系后 +3 天，第 7 天 = 联系后 +6 天。

## 重新生成 Demo

改了 `apps-script/` 或 `admin/` 之后：`node demo/src/build.js`，会更新根目录的 `index.html`。

## 注意

- 不要把 API key、STAFF_PIN、团队 PIN 写进这个仓库。AI 用的 `ANTHROPIC_API_KEY` 放在 Apps Script 的「脚本属性」。
- Sheet 的栏位顺序不要改，程序是按位置读的。
