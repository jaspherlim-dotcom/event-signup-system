# 活动报名 + 147 跟进系统

给活动主办人用的报名和跟进系统：参加者用手机报名、拿入场卡；你在后台用 WhatsApp 联系、按 147 法则跟进、记付款和出席；团队成员用自己的推荐链接带人，也在自己的页面跟进。

- **真正的系统**：跑在你的 Google Apps Script 上，照 [docs/上线步骤.md](docs/上线步骤.md) 部署。
- **Demo**（示范资料，不连真的表）：https://jaspherlim-dotcom.github.io/event-signup-system/demo/

## 组成

| 部分 | 文件 | 谁用 |
|---|---|---|
| 报名页、入场卡、扫码签到、会后问卷 | `apps-script/Code.gs` + `apps-script/Index.html` | 参加者、工作人员 |
| 团队成员页（推荐链接、自己的名单、147 跟进、AI 建议） | `apps-script/Team.html` | 团队成员 |
| 后台（今日、名单、活动、数据、设置），`?admin` 加密码 | `apps-script/Admin.html` | 主办人 |
| 资料 | Google Sheet：Events、Registrations、Feedback、Team、TeamFollow、CRM、Config | 全部共用 |

全部是一个 Google Apps Script 网页应用，免费，跑在你自己的 Google 账号。
`admin/admin.html` 是同一个后台的 Claude Artifact 版本；`apps-script/Admin.html` 由它生成：`node tools/build-admin.js admin/admin.html apps-script/Admin.html`。

## 上线

照 [docs/上线步骤.md](docs/上线步骤.md) 做，大约 10 分钟。

## 网址参数

- `?e=活动ID`：活动报名页；加 `&src=fb` 记录渠道，加 `&r=成员代码` 记录推荐人
- `?t=编号&k=凭证码`：入场卡；`?c=编号&k=凭证码`：工作人员扫码签到（要 STAFF_PIN）
- `?f=活动ID`：会后问卷
- `?team`：团队成员登入；`?admin`：后台（ADMIN_PIN）

## 147 法则

首次联系那天 = 第 1 天，第 4 天 = 联系后 +3 天，第 7 天 = 联系后 +6 天。

## 重新生成 Demo

改了 `apps-script/` 或 `admin/` 之后：`node demo/src/build.js`，会更新 `demo/index.html`。

## 注意

- 不要把 API key、STAFF_PIN、ADMIN_PIN、团队 PIN 写进这个仓库（贴进 Apps Script 之后再改）。AI 用的 `ANTHROPIC_API_KEY` 放在 Apps Script 的「脚本属性」。
- Sheet 的栏位顺序不要改，程序是按位置读的。
