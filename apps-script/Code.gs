/**
 * 活动报名系统 · 前台（报名页）
 * 放在 Google Sheet「活动报名系统（数据库，勿改表头）」的 扩展程序 > Apps Script 里。
 * 部署：部署 > 新部署 > 类型选「网页应用」> 执行身份「我」> 谁可以访问「任何人」。
 */

// ===== 你可以改的设定 =====
const SHEET_ID = '';                 // 留空 = 用这个脚本所在的 Sheet（推荐）。也可以填 Sheet ID
const BRAND = '活动报名';            // 页面顶部显示的名字，例如 'TCC Capital 活动'
const ORGANIZER_WHATSAPP = '';       // 主办方 WhatsApp，例如 '60123456789'，留空就不显示按钮
const STAFF_PIN = '';                // 签到密码（至少 6 位数字），扫码签到时要输入一次。一定要改！
const AI_MODEL = 'claude-sonnet-5-5'; // 团队页 AI 建议用的模型。API key 放在 项目设置 > 脚本属性 ANTHROPIC_API_KEY，不放就用内建建议
// ==========================

const EVENT_COLS = 13;  // ID, 活动名称, 日期, 时间, 地点, 简介, 费用, 封面图片链接, 状态, 创建时间, 人数上限, 地图链接, 联系电话
const REG_COLS = 15;    // 报名编号, 报名时间, 活动ID, 活动名称, 姓名, 公司, 职位, 电话WhatsApp, 邮箱, 行业, 想了解什么, 来源, 签到时间, 凭证码, 推荐人

function doGet(e) {
  const isTeam = !!(e && e.parameter && 'team' in e.parameter);
  const t = HtmlService.createTemplateFromFile(isTeam ? 'Team' : 'Index');
  t.boot = JSON.stringify({
    brand: BRAND,
    organizer: ORGANIZER_WHATSAPP,
    eventId: (e && e.parameter && e.parameter.e) || '',
    feedbackId: (e && e.parameter && e.parameter.f) || '',
    source: (e && e.parameter && e.parameter.src) || '',
    ticket: (e && e.parameter && e.parameter.t) || '',
    checkin: (e && e.parameter && e.parameter.c) || '',
    key: (e && e.parameter && e.parameter.k) || '',
    ref: String((e && e.parameter && e.parameter.r) || '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 12),
    url: ScriptApp.getService().getUrl()
  }).replace(/</g, '\\u003c');
  return t.evaluate()
    .setTitle(isTeam ? BRAND + ' · 团队' : BRAND)
    .addMetaTag('viewport', 'width=device-width, initial-scale=1, viewport-fit=cover')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

/** 有填 SHEET_ID 就用它，没填就用这个脚本所在的 Sheet */
function ss_() {
  return SHEET_ID ? SpreadsheetApp.openById(SHEET_ID) : SpreadsheetApp.getActiveSpreadsheet();
}

function sheet_(name) {
  return ss_().getSheetByName(name);
}

/** 前台读取开放中的活动 */
function getEvents() {
  const sh = sheet_('Events');
  const n = sh.getLastRow() - 1;
  if (n < 1) return [];
  const rows = sh.getRange(2, 1, n, EVENT_COLS).getDisplayValues();
  const counts = regCounts_();
  return rows
    .filter(r => r[0] && String(r[8]).trim() !== '关闭')
    .map(r => {
      const cap = parseInt(r[10], 10) || 0;
      const taken = counts[r[0]] || 0;
      return {
        id: r[0], name: r[1], date: r[2], time: r[3], venue: r[4],
        desc: r[5], fee: r[6], cover: r[7], status: r[8] || '开放',
        cap: cap, taken: taken, left: cap ? Math.max(0, cap - taken) : null, full: cap > 0 && taken >= cap,
        map: /^https:\/\//.test(r[11]) ? r[11] : (r[4] ? 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(r[4]) : ''),
        contact: String(r[12] || '').replace(/[^\d+]/g, '')
      };
    });
}

/** 每个活动目前报名人数 */
function regCounts_() {
  const sh = sheet_('Registrations');
  const n = sh.getLastRow() - 1;
  const out = {};
  if (n < 1) return out;
  sh.getRange(2, 3, n, 1).getValues().forEach(r => { if (r[0]) out[r[0]] = (out[r[0]] || 0) + 1; });
  return out;
}

/** 防止有人在表格里注入公式 */
function clean_(v, max) {
  let s = String(v == null ? '' : v).trim().slice(0, max || 200);
  if (/^[=+\-@]/.test(s)) s = "'" + s;
  return s;
}

/** 前台提交报名 */
function register(form) {
  if (!form || !form.name || !form.phone || !form.eventId) {
    throw new Error('请填写姓名和电话。');
  }
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const ev = getEvents().find(x => x.id === form.eventId);
    if (!ev) throw new Error('这个活动已经截止或不存在。');
    if (ev.full) throw new Error('不好意思，这个活动名额已满。');
    const id = 'R' + Utilities.formatDate(new Date(), 'Asia/Kuala_Lumpur', 'yyMMddHHmmss') +
               Math.floor(Math.random() * 90 + 10);
    const now = Utilities.formatDate(new Date(), 'Asia/Kuala_Lumpur', 'yyyy-MM-dd HH:mm:ss');
    const token = Utilities.getUuid().replace(/-/g, '').slice(0, 12);
    const sh = regSheet_();
    sh.appendRow([
      id, now, ev.id, clean_(ev.name),
      clean_(form.name, 80), clean_(form.company, 120), clean_(form.title, 80),
      "'" + String(form.phone).replace(/[^\d+]/g, '').slice(0, 20),
      clean_(form.email, 120), clean_(form.industry, 80), clean_(form.note, 500),
      clean_(form.source, 60), '', token, validRef_(form.ref)
    ]);
    return { id: id, key: token, event: ev };
  } finally {
    lock.releaseLock();
  }
}

/** 会后问卷用：读取任何活动（包括已关闭的） */
function getEventForFeedback(id) {
  const sh = sheet_('Events');
  const n = sh.getLastRow() - 1;
  if (n < 1) return null;
  const r = sh.getRange(2, 1, n, EVENT_COLS).getDisplayValues().find(x => x[0] === id);
  return r ? { id: r[0], name: r[1], date: r[2], time: r[3], venue: r[4] } : null;
}

/** 会后问卷提交 */
function submitFeedback(form) {
  if (!form || !form.eventId || !form.phone) throw new Error('请填写电话，方便我们对应你的报名资料。');
  const ev = getEventForFeedback(form.eventId);
  if (!ev) throw new Error('找不到这个活动。');
  let sh = sheet_('Feedback');
  if (!sh) {
    sh = ss_().insertSheet('Feedback');
    sh.appendRow(['提交时间','活动ID','活动名称','姓名','电话WhatsApp','评分','最大收获','改进建议','下一步意向']);
  }
  const now = Utilities.formatDate(new Date(), 'Asia/Kuala_Lumpur', 'yyyy-MM-dd HH:mm:ss');
  const rating = Math.max(1, Math.min(5, parseInt(form.rating, 10) || 0));
  sh.appendRow([
    now, ev.id, clean_(ev.name), clean_(form.name, 80),
    "'" + String(form.phone).replace(/[^\d+]/g, '').slice(0, 20),
    rating, clean_(form.gain, 800), clean_(form.improve, 800), clean_(form.next, 80)
  ]);
  return { ok: true };
}

/** 确保报名表有「签到时间」「凭证码」两栏 */
function regSheet_() {
  const sh = sheet_('Registrations');
  if (sh.getMaxColumns() < REG_COLS) sh.insertColumnsAfter(sh.getMaxColumns(), REG_COLS - sh.getMaxColumns());
  if (!sh.getRange(1, 13).getValue()) sh.getRange(1, 13, 1, 2).setValues([['签到时间', '凭证码']]);
  if (!sh.getRange(1, 15).getValue()) sh.getRange(1, 15).setValue('推荐人');
  return sh;
}

/** 找报名记录（编号 + 凭证码都要对） */
function findReg_(id, key) {
  if (!id || !key) return null;
  const sh = regSheet_();
  const n = sh.getLastRow() - 1;
  if (n < 1) return null;
  const rows = sh.getRange(2, 1, n, REG_COLS).getDisplayValues();
  const i = rows.findIndex(r => r[0] === id && r[13] && r[13] === key);
  if (i < 0) return null;
  const r = rows[i];
  return { row: i + 2, id: r[0], eventId: r[2], eventName: r[3], name: r[4], company: r[5], title: r[6],
           phone: r[7], email: r[8], checkin: r[12] };
}

/** 入场卡：参加者自己打开（?t=编号&k=凭证码） */
function getTicket(id, key) {
  const r = findReg_(id, key);
  if (!r) throw new Error('找不到这张入场卡，请确认链接完整。');
  const ev = getEventForFeedback(r.eventId) || {};
  return { id: r.id, key: key, name: r.name, company: r.company, title: r.title, phone: r.phone, email: r.email,
           eventName: r.eventName, date: ev.date || '', time: ev.time || '', venue: ev.venue || '', checkin: r.checkin };
}

/** 扫码签到：工作人员用手机相机扫入场卡（?c=编号&k=凭证码），要签到密码 */
function checkIn(id, key, pin) {
  const cache = CacheService.getScriptCache();
  const fails = +(cache.get('pinfail') || 0);
  if (fails >= 10) throw new Error('密码错误太多次，请 10 分钟后再试。');
  if (!STAFF_PIN || String(STAFF_PIN).length < 6) throw new Error('还没设定签到密码（Code.gs 里的 STAFF_PIN，至少 6 位）。');
  if (String(pin) !== String(STAFF_PIN)) {
    cache.put('pinfail', String(fails + 1), 600);
    return { badPin: true };
  }
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const r = findReg_(id, key);
    if (!r) throw new Error('这张入场卡无效。');
    const ev = getEventForFeedback(r.eventId) || {};
    let already = !!r.checkin, at = r.checkin;
    if (!already) {
      at = Utilities.formatDate(new Date(), 'Asia/Kuala_Lumpur', 'yyyy-MM-dd HH:mm:ss');
      sheet_('Registrations').getRange(r.row, 13).setValue(at);
    }
    return { ok: true, already: already, at: at, name: r.name, company: r.company, title: r.title,
             eventName: r.eventName, eventDate: ev.date || '' };
  } finally {
    lock.releaseLock();
  }
}

// ================= 团队推荐 =================
// Team 表：代码, 姓名, 电话, PIN, 状态(启用/停用), 创建时间
// TeamFollow 表：时间, 报名编号, 成员代码, 类型, 内容
const FOLLOW_KINDS = ['首次联系', '第4天跟进', '第7天跟进', '备忘', 'AI建议'];

function tabOrCreate_(name, header) {
  const ss = ss_();
  let sh = ss.getSheetByName(name);
  if (!sh) { sh = ss.insertSheet(name); sh.appendRow(header); sh.setFrozenRows(1); }
  return sh;
}
function teamList_() {
  const sh = tabOrCreate_('Team', ['代码', '姓名', '电话', 'PIN', '状态', '创建时间']);
  const n = sh.getLastRow() - 1;
  if (n < 1) return [];
  return sh.getRange(2, 1, n, 6).getDisplayValues()
    .map(r => ({ code: String(r[0]).trim().toUpperCase(), name: r[1], phone: r[2], pin: String(r[3]).trim(), active: String(r[4]).trim() !== '停用' }))
    .filter(m => m.code);
}
/** 推荐码要存在而且启用，才记录 */
function validRef_(code) {
  code = String(code || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
  if (!code) return '';
  const m = teamList_().find(x => x.code === code && x.active);
  return m ? m.code : '';
}
/** 团队登入验证（输错 8 次锁 15 分钟） */
function teamAuth_(code, pin) {
  code = String(code || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
  const cache = CacheService.getScriptCache();
  const k = 'tfail_' + code;
  const fails = +(cache.get(k) || 0);
  if (fails >= 8) throw new Error('输错太多次，请 15 分钟后再试。');
  const m = teamList_().find(x => x.code === code);
  if (!m || !m.pin || String(pin) !== m.pin) { cache.put(k, String(fails + 1), 900); throw new Error('代码或 PIN 不对。'); }
  if (!m.active) throw new Error('这个账号已经停用，请联系主办方。');
  return m;
}
function myRegs_(code) {
  const sh = regSheet_();
  const n = sh.getLastRow() - 1;
  if (n < 1) return [];
  return sh.getRange(2, 1, n, REG_COLS).getDisplayValues()
    .filter(r => r[0] && String(r[14]).toUpperCase() === code)
    .map(r => ({ id: r[0], at: r[1], eventId: r[2], eventName: r[3], name: r[4], company: r[5], title: r[6],
                 phone: r[7], email: r[8], industry: r[9], note: r[10], checkin: r[12], key: r[13] }));
}
function myLogs_(code) {
  const sh = tabOrCreate_('TeamFollow', ['时间', '报名编号', '成员代码', '类型', '内容']);
  const n = sh.getLastRow() - 1;
  const out = {};
  if (n < 1) return out;
  sh.getRange(2, 1, n, 5).getDisplayValues().forEach(r => {
    if (String(r[2]).toUpperCase() !== code) return;
    (out[r[1]] = out[r[1]] || []).push({ at: r[0], kind: r[3], text: r[4] });
  });
  return out;
}

/** 团队成员登入后拿资料：只有自己推荐来的报名 */
function teamData(code, pin) {
  const m = teamAuth_(code, pin);
  const counts = {};
  const regs = myRegs_(m.code);
  regs.forEach(r => counts[r.eventId] = (counts[r.eventId] || 0) + 1);
  const events = getEvents().map(e => ({ id: e.id, name: e.name, date: e.date, time: e.time, venue: e.venue, fee: e.fee,
    cap: e.cap, left: e.left, full: e.full, map: e.map, mine: counts[e.id] || 0 }));
  return { me: { code: m.code, name: m.name }, url: ScriptApp.getService().getUrl(), brand: BRAND,
           events: events, regs: regs.reverse(), logs: myLogs_(m.code), ai: !!PropertiesService.getScriptProperties().getProperty('ANTHROPIC_API_KEY') };
}

/** 团队成员记录跟进 / 备忘 */
function teamLog(code, pin, regId, kind, text) {
  const m = teamAuth_(code, pin);
  if (FOLLOW_KINDS.indexOf(kind) < 0) throw new Error('类型不对。');
  if (!myRegs_(m.code).some(r => r.id === regId)) throw new Error('这位不是你推荐的报名者。');
  const now = Utilities.formatDate(new Date(), 'Asia/Kuala_Lumpur', 'yyyy-MM-dd HH:mm:ss');
  tabOrCreate_('TeamFollow', ['时间', '报名编号', '成员代码', '类型', '内容'])
    .appendRow([now, regId, m.code, kind, clean_(text, 1500)]);
  return { at: now, kind: kind, text: clean_(text, 1500) };
}

/** 团队页 AI 下一步建议（要在脚本属性放 ANTHROPIC_API_KEY） */
function teamAI(code, pin, regId) {
  const m = teamAuth_(code, pin);
  const key = PropertiesService.getScriptProperties().getProperty('ANTHROPIC_API_KEY');
  if (!key) throw new Error('还没开通 AI（主办方要在脚本属性放 ANTHROPIC_API_KEY）。');
  const r = myRegs_(m.code).find(x => x.id === regId);
  if (!r) throw new Error('这位不是你推荐的报名者。');
  const logs = (myLogs_(m.code)[regId] || []).filter(l => l.kind !== 'AI建议');
  const ev = getEventForFeedback(r.eventId) || {};
  const prompt = '你是一位马来西亚的资深业务教练，帮团队成员「' + m.name + '」跟进他推荐来的活动报名者。团队用"147法则"：首次联系后第4天、第7天再跟进。\n' +
    '请判断这个人目前的意向，给出具体可执行的下一步。语气用马来西亚华人自然口语，简洁实用，不要夸张。\n\n' +
    '【活动】' + (ev.name || r.eventName) + '｜日期 ' + (ev.date || '-') + '\n' +
    '【报名者】' + r.name + '｜公司 ' + (r.company || '-') + '｜职位 ' + (r.title || '-') + '｜行业 ' + (r.industry || '-') + '\n' +
    '【报名时写的】' + (r.note || '-') + '\n【已签到】' + (r.checkin ? '是' : '否') + '\n' +
    '【跟进记录】\n' + (logs.map(l => '- ' + l.at.slice(0, 10) + ' [' + l.kind + '] ' + (l.text || '(没写)')).join('\n') || '(还没有)') + '\n\n' +
    '只回 JSON：{"summary":"一两句总结","intent":"热/温/冷 + 原因","steps":["下一步1","下一步2","下一步3"],"message":"可以直接发 WhatsApp 的讯息，用对方名字，80字以内"}';
  const res = UrlFetchApp.fetch('https://api.anthropic.com/v1/messages', {
    method: 'post', contentType: 'application/json', muteHttpExceptions: true,
    headers: { 'x-api-key': key, 'anthropic-version': '2023-06-01' },
    payload: JSON.stringify({ model: AI_MODEL, max_tokens: 800, messages: [{ role: 'user', content: prompt }] })
  });
  if (res.getResponseCode() !== 200) throw new Error('AI 暂时用不到，请迟点再试。');
  const txt = (JSON.parse(res.getContentText()).content || []).map(c => c.text || '').join('');
  const j = txt.match(/\{[\s\S]*\}/);
  let out;
  try { out = JSON.parse(j ? j[0] : txt); } catch (_) { throw new Error('AI 回复看不懂，请再按一次。'); }
  const ai = { summary: String(out.summary || ''), intent: String(out.intent || ''), steps: (out.steps || []).slice(0, 5).map(String), message: String(out.message || '') };
  teamLog(code, pin, regId, 'AI建议', JSON.stringify(ai));
  return ai;
}
