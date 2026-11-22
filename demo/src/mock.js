// ===== 示范资料 + 模拟 Google Apps Script / Google Sheets / Claude 资料库 =====
(function(){
const pad = n => String(n).padStart(2,'0');
const ymd = d => `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
const ts = d => `${ymd(d)} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
const ago = (days, h) => { const d = new Date(); d.setDate(d.getDate() - days); if (h !== undefined) d.setHours(h, 15, 0); return d; };
const tok = () => Math.random().toString(36).slice(2, 8) + Math.random().toString(36).slice(2, 8);
const URL0 = 'https://script.google.com/macros/s/DEMO/exec';
const PIN = '123456';

const E = [['ID','活动名称','日期','时间','地点','简介','费用','封面图片链接','状态','创建时间','人数上限','地图链接','联系电话'],
  ['E0','老板早餐会 · AI 工具实操', ymd(ago(0)), '9am - 11am', 'Bangsar South', '带你的手机来，现场教你用 AI 写文案、做报价单、回客户讯息。', 'RM49', '', '开放', ts(ago(10)), '20', '', '0123456789'],
  ['E1','SME 老板 AI 实战分享会', ymd(ago(-7)), '2pm - 5pm', 'KL Sentral', '3 小时实战：怎样用 AI 帮你的生意省时间、多赚钱。适合公司老板和管理层。', 'RM199', '', '开放', ts(ago(14)), '50', '', '0123456789'],
  ['E2','小企业融资与上市入门', ymd(ago(-15)), '7:30pm - 10pm', 'Petaling Jaya', '银行贷款、政府配套、LEAP Market，一个晚上讲清楚。', '免费', '', '开放', ts(ago(6)), '30', '', '0123456789'],
  ['E3','年终老板交流晚宴', ymd(ago(7)), '7pm - 10pm', 'Puchong', '', 'RM120', '', '关闭', ts(ago(30)), '40', '', '0123456789']];
const regs = [
  // id, 天前, 活动, 姓名, 公司, 职位, 电话, 电邮, 行业, 想了解, 来源, 签到, 推荐人
  ['R01',5,'E1','Lim Wei Ming','明丰贸易','董事','012-338 1290','weiming@mingfeng.my','批发贸易','想知道 AI 能不能帮忙处理报价单','', '', 'AMY01'],
  ['R02',1,'E1','Tan Mei Ling','美玲烘焙坊','老板','016-772 4410','','餐饮','社交媒体文案','fb','', 'AMY01'],
  ['R03',2,'E2','Raj Kumar','RK Logistics','General Manager','019-221 8876','raj@rklog.my','物流','想扩充车队，看看有什么融资','', '', 'KEN02'],
  ['R04',6,'E0','Chong Kah Wai','嘉伟装修','老板','011-2345 6621','','装修','','', '', 'KEN02'],
  ['R05',4,'E0','Siti Aisyah','Aisyah Modest Wear','Founder','013-998 0012','siti@aisyah.my','零售','网店客服','ig','', ''],
  ['R06',12,'E3','Ng Boon Huat','文发五金','经理','012-605 7733','','五金','','', 'x', 'JOY03'],
  ['R07',13,'E3','Wong Li Ying','LY 美容中心','老板','017-880 3321','liying@lybeauty.my','美容','','', 'x', 'AMY01'],
  ['R08',14,'E3','Lee Chee Keong','CK 会计事务所','合伙人','012-311 0098','ck@ckaudit.my','会计','','ref', 'x', ''],
  ['R09',0,'E1','Kelly Ho','和记餐饮','营运总监','016-450 2287','kelly@wohkee.my','餐饮','员工培训','', '', 'JOY03'],
  ['R10',3,'E2','Ahmad Faiz','Faiz Tech','CEO','011-1098 7766','faiz@faiztech.my','科技','LEAP Market 上市条件','', '', 'AMY01']
];
const R = [['报名编号','报名时间','活动ID','活动名称','姓名','公司','职位','电话WhatsApp','邮箱','行业','想了解什么','来源','签到时间','凭证码','推荐人']];
regs.forEach(x => { const ev = E.find(e => e[0] === x[2]); const at = ago(x[1], 10);
  R.push([x[0], ts(at), x[2], ev[1], x[3], x[4], x[5], x[6], x[7], x[8], x[9], x[10], x[11] ? ev[2] + ' 19:' + pad(5 + Math.floor(Math.random()*40)) + ':00' : '', tok(), x[12]]); });
const TM = [['代码','姓名','电话','PIN','状态','创建时间'],
  ['AMY01','Amy Tan','012-777 1122','111111','启用', ts(ago(20))],
  ['KEN02','Ken Wong','016-888 3344','222222','启用', ts(ago(20))],
  ['JOY03','Joyce Lim','019-555 6677','333333','启用', ts(ago(18))]];
const TF = [['时间','报名编号','成员代码','类型','内容'],
  [ts(ago(3,11)),'R01','AMY01','首次联系','有兴趣，但想知道有没有分期，下个月才决定。'],
  [ts(ago(1,15)),'R02','AMY01','备忘','今天先发了活动介绍，她说晚上看。'],
  [ts(ago(2,16)),'R03','KEN02','首次联系','他车队有 12 辆罗里，想再加 5 辆，问了政府配套。'],
  [ts(ago(6,10)),'R04','KEN02','首次联系','确认会来，带太太一起。'],
  [ts(ago(3,10)),'R04','KEN02','第4天跟进','问他要不要多加一个名额，他说再看。'],
  [ts(ago(11,10)),'R06','JOY03','首次联系','老客户介绍来的，对数码化有兴趣。'],
  [ts(ago(8,10)),'R06','JOY03','第4天跟进','确认出席。'],
  [ts(ago(5,10)),'R06','JOY03','第7天跟进','晚宴后很有兴趣，想约一对一谈系统。'],
  [ts(ago(12,10)),'R07','AMY01','首次联系','确认出席。']];
const FB = [['提交时间','活动ID','活动名称','姓名','电话WhatsApp','评分','最大收获','改进建议','下一步意向'],
  [ts(ago(7,22)),'E3','年终老板交流晚宴','Ng Boon Huat','012-605 7733','5','认识了几位同行，也看到别人怎样用系统管库存。','','想约一对一详谈'],
  [ts(ago(7,22)),'E3','年终老板交流晚宴','Wong Li Ying','017-880 3321','4','分享很实在。','停车有点难找','想参加进阶课程/下一场活动']];
const SH = { Events:E, Registrations:R, Team:TM, TeamFollow:TF, Feedback:FB };
const rid = id => R.find(r => r[0] === id);
const crm = {
  R05:{ firstAt:ago(4,11).getTime(), memos:[{ at:ago(4,11).getTime(), kind:'首次联系', text:'自己在 IG 看到的，想了解网店客服自动回复。' }] },
  R07:{ firstAt:ago(12,10).getTime(), paid:true, paidAt:ago(10).getTime(), payAmount:'120', payMethod:'DuitNow', memos:[{ at:ago(10).getTime(), kind:'备忘录', text:'已转账。' }] },
  R08:{ firstAt:ago(13,10).getTime(), fu4At:ago(10).getTime(), fu7At:ago(7).getTime(), paid:true, paidAt:ago(12).getTime(), payAmount:'120', payMethod:'银行转账', heat:'热', deal:'已成交', dealValue:'5000', dealWhat:'年度教练配套', memos:[{ at:ago(6).getTime(), kind:'成交阶段', text:'改为「已成交」' }] },
  R06:{ deal:'洽谈中', dealValue:'3000', dealWhat:'库存系统顾问', heat:'热', memos:[] }
};
const db = { 'config/main':{ sheetId:'DEMO', webAppUrl:URL0, teamNotes:{ AMY01:'人脉在餐饮和零售，跟进很快，收尾要多帮她。' } } };

// ===== 模拟 Code.gs =====
const disp = v => String(v == null ? '' : v);
function regCounts(){ const o = {}; R.slice(1).forEach(r => o[r[2]] = (o[r[2]] || 0) + 1); return o; }
const api = {
  getEvents(){ const c = regCounts(); return E.slice(1).filter(r => r[0] && r[8] !== '关闭').map(r => { const cap = parseInt(r[10],10) || 0, taken = c[r[0]] || 0;
    return { id:r[0], name:r[1], date:r[2], time:r[3], venue:r[4], desc:r[5], fee:r[6], cover:r[7], status:r[8] || '开放', cap, taken, left:cap ? Math.max(0, cap-taken) : null, full:cap > 0 && taken >= cap,
      map:/^https:\/\//.test(r[11]) ? r[11] : (r[4] ? 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(r[4]) : ''), contact:disp(r[12]).replace(/[^\d+]/g,'') }; }); },
  register(f){ if (!f || !f.name || !f.phone || !f.eventId) throw new Error('请填写姓名和电话。');
    const ev = api.getEvents().find(x => x.id === f.eventId); if (!ev) throw new Error('这个活动已经截止或不存在。'); if (ev.full) throw new Error('不好意思，这个活动名额已满。');
    const id = 'R' + Date.now().toString().slice(-8), token = tok();
    const ref = TM.slice(1).find(m => m[0] === String(f.ref||'').toUpperCase() && m[4] !== '停用');
    R.push([id, ts(new Date()), ev.id, ev.name, f.name, f.company||'', f.title||'', f.phone, f.email||'', f.industry||'', f.note||'', f.source||'', '', token, ref ? ref[0] : '']);
    window.DEMO.lastReg = id; return { id, key:token, event:ev }; },
  getEventForFeedback(id){ const r = E.slice(1).find(x => x[0] === id); return r ? { id:r[0], name:r[1], date:r[2], time:r[3], venue:r[4] } : null; },
  submitFeedback(f){ const ev = api.getEventForFeedback(f.eventId); FB.push([ts(new Date()), ev.id, ev.name, f.name||'', f.phone, String(f.rating), f.gain||'', f.improve||'', f.next||'']); return { ok:true }; },
  getTicket(id, key){ const r = rid(id); if (!r || r[13] !== key) throw new Error('找不到这张入场卡，请确认链接完整。'); const ev = api.getEventForFeedback(r[2]) || {};
    return { id:r[0], key, name:r[4], company:r[5], title:r[6], phone:r[7], email:r[8], eventName:r[3], date:ev.date, time:ev.time, venue:ev.venue, checkin:r[12] }; },
  checkIn(id, key, pin){ if (String(pin) !== PIN) return { badPin:true }; const r = rid(id); if (!r || r[13] !== key) throw new Error('这张入场卡无效。');
    const ev = api.getEventForFeedback(r[2]) || {}; const already = !!r[12]; if (!already) r[12] = ts(new Date());
    return { ok:true, already, at:r[12], name:r[4], company:r[5], title:r[6], eventName:r[3], eventDate:ev.date }; },
  _auth(code, pin){ const m = TM.slice(1).find(x => x[0] === String(code).toUpperCase()); if (!m || m[3] !== String(pin)) throw new Error('代码或 PIN 不对。'); if (m[4] === '停用') throw new Error('这个账号已经停用，请联系主办方。'); return { code:m[0], name:m[1] }; },
  _mine(code){ return R.slice(1).filter(r => r[14] === code).map(r => ({ id:r[0], at:r[1], eventId:r[2], eventName:r[3], name:r[4], company:r[5], title:r[6], phone:r[7], email:r[8], industry:r[9], note:r[10], checkin:r[12], key:r[13] })); },
  teamData(code, pin){ const m = api._auth(code, pin), regs = api._mine(m.code), c = {}; regs.forEach(r => c[r.eventId] = (c[r.eventId] || 0) + 1);
    const logs = {}; TF.slice(1).filter(l => l[2] === m.code).forEach(l => (logs[l[1]] = logs[l[1]] || []).push({ at:l[0], kind:l[3], text:l[4] }));
    return { me:m, url:URL0, brand:'TCC 活动', events:api.getEvents().map(e => Object.assign({}, e, { mine:c[e.id] || 0 })), regs:regs.reverse(), logs, ai:true }; },
  teamLog(code, pin, regId, kind, text){ const m = api._auth(code, pin); if (!api._mine(m.code).some(r => r.id === regId)) throw new Error('这位不是你推荐的报名者。');
    const l = [ts(new Date()), regId, m.code, kind, text || '']; TF.push(l); return { at:l[0], kind, text:l[4] }; },
  teamAI(code, pin, regId){ const m = api._auth(code, pin), r = api._mine(m.code).find(x => x.id === regId); const logs = TF.slice(1).filter(l => l[1] === regId && l[3] !== 'AI建议');
    const last = logs[logs.length-1]; const first = r.name.split(' ')[0];
    const ai = logs.length ? { summary:`${r.name} 已经联系过 ${logs.length} 次。最近一次：「${last[4] || last[3]}」。`, intent:/兴趣|一对一|确认/.test(logs.map(l => l[4]).join('')) ? '温偏热：有回应，也有具体问题' : '温：有回应但还没表态',
        steps:['先回应他上次提的问题，给一个具体答案或例子', r.checkin ? '趁他刚出席，约 15 分钟线上聊' : '提醒活动日期，问他要不要带同事一起来', '聊完把重点记下来，方便第7天跟进'],
        message:`Hi ${first}，我是 ${m.name}。上次你提到的问题我帮你问清楚了，有几个方案可以参考，方便这两天花 10 分钟跟你讲一下吗？` }
      : { summary:`${r.name} 刚报名，还没联系。`, intent:'未知：还没聊过', steps:['今天 WhatsApp 打招呼，确认出席', '问他这次最想了解什么' + (r.note ? `（他写了：${r.note}）` : ''), '记录他的回应'],
        message:`你好 ${first}，我是 ${m.name}，谢谢你报名「${r.eventName}」！想确认一下你会出席吗？这次你最想了解哪方面？` };
    TF.push([ts(new Date()), regId, m.code, 'AI建议', JSON.stringify(ai)]); return ai; }
};

// ===== 模拟 Google Sheets 连接器（后台用）=====
const colN = s => s.split('').reduce((n,c) => n*26 + c.charCodeAt(0) - 64, 0) - 1;
function parseRange(a1){ const m = a1.match(/^(\w+)!([A-Z]+)(\d+)(?::([A-Z]+)(\d+)?)?$/); return { sh:m[1], c0:colN(m[2]), r0:+m[3]-1, c1:m[4] ? colN(m[4]) : colN(m[2]), r1:m[5] ? +m[5]-1 : (m[4] ? Infinity : +m[3]-1) }; }
const clone = x => JSON.parse(JSON.stringify(x));
const mcp = { async callTool(server, tool, i){ await new Promise(r => setTimeout(r, 150)); const g = parseRange(i.range), sh = SH[g.sh]; if (!sh) throw { code:'not_found' };
  if (tool === 'get_values') return { payload:{ values: clone(sh.slice(g.r0, g.r1 === Infinity ? undefined : g.r1 + 1).map(r => r.slice(g.c0, g.c1 + 1).map(v => disp(v).replace(/^'/,'')))) } };
  if (tool === 'append_values'){ i.values.forEach(v => sh.push(v.map(x => disp(x).replace(/^'/,'')))); return { payload:{ ok:true } }; }
  if (tool === 'update_values'){ i.values.forEach((row, k) => row.forEach((v, j) => { const rr = sh[g.r0 + k] || (sh[g.r0 + k] = []); rr[g.c0 + j] = disp(v); })); return { payload:{ ok:true } }; }
  throw { code:'unknown_tool' }; } };

// ===== 模拟 Claude 资料库 =====
let L = [];
const notify = () => L.forEach(l => { try { l(); } catch(_) {} });
const dbApi = {
  doc: p => ({ onSnapshot(cb){ const f = () => cb({ exists: !!(p.startsWith('crm/') ? crm[p.slice(4)] : db[p]), data: () => clone(p.startsWith('crm/') ? crm[p.slice(4)] : db[p]) }); L.push(f); setTimeout(f, 30); return () => {}; },
    async set(d){ if (p.startsWith('crm/')) crm[p.slice(4)] = clone(d); else db[p] = clone(d); setTimeout(notify, 30); } }),
  collection: p => ({ onSnapshot(cb){ const f = () => cb({ docs: Object.keys(crm).map(id => ({ id, data: () => clone(crm[id]) })) }); L.push(f); setTimeout(f, 30); return () => {}; } })
};
const sample = { async json(prompt){ await new Promise(r => setTimeout(r, 900));
  if (/"members"/.test(prompt)) { const names = TM.slice(1).map(m => m[1]);
    return { summary:'（示范回复）Amy 带来最多报名，Joyce 的跟进最完整，已有一位进入洽谈。Ken 的报名少一点，但每位都有跟进记录。',
      steps:['每周一花 15 分钟跟团队对一次名单，先看逾期的跟进', '让 Joyce 分享她第7天怎样约到一对一', '给 Amy 一个收尾话术模板，帮她把有兴趣的人推进到付款'],
      members:names.map((n,i) => ({ name:n, advice:['报名多，接下来把重点放在第4天、第7天的跟进。','车队、装修这类客户周期长，多用案例跟进。','跟进很稳，可以试着带一位新成员。'][i] || '保持节奏。' })) }; }
  const nm = (prompt.match(/姓名 ([^｜]+)/) || [,'对方'])[1].trim().split(' ')[0];
  return { summary:`（示范回复）${nm} 有报名也有回应，但还没表态付款或下一步。`, intent:'温：有兴趣，在比较或等时机',
    steps:['先回答他上次问的问题，给具体例子', '提出一个小的下一步，例如 15 分钟线上聊', '把他的顾虑记进备忘录，第7天再跟进'],
    message:`Hi ${nm}，我是 Jaspher。上次你问的我整理好了，有两个方案适合你的情况，这两天方便花 10 分钟聊一下吗？` }; } };

window.DEMO = { api, SH, URL:URL0, PIN, claude:{ db:dbApi, mcp, sample }, resetListeners(){ L = []; }, lastReg:'' };
})();
