// 从 admin.html（Claude 版后台）生成 Apps Script 版 Admin.html：node tools/build-admin.js <admin.html> <Admin.html 输出>
const fs = require('fs'), path = require('path');
const [src, out] = process.argv.slice(2);
let a = fs.readFileSync(src, 'utf8');
const shim = fs.readFileSync(path.join(__dirname, 'admin-shim.html'), 'utf8');
const R = (x, y) => { if (!a.includes(x)) throw new Error('找不到：' + x.slice(0, 60)); a = a.replace(x, y); };
// 连接设定：网址和 Sheet 自动用部署的那一个
R(/<h2>连接设定<\/h2>[\s\S]*?<\/form>/.exec(a)[0], `<h2>系统网址</h2>
    <div class="box stack">
      <div class="note">报名页（发给参加者）</div><div class="link" style="margin:0">${'${esc(c.webAppUrl||\'\')}'}</div>
      <div class="note">团队登入</div><div class="link" style="margin:0">${'${esc(c.webAppUrl ? c.webAppUrl + \'?team\' : \'\')}'}</div>
      <div class="note">后台（就是这一页，只给自己）</div><div class="link" style="margin:0">${'${esc(c.webAppUrl ? c.webAppUrl + \'?admin\' : \'\')}'}</div>
      ${'${c.sheetId ? `<a class="note" href="https://docs.google.com/spreadsheets/d/${encodeURIComponent(c.sheetId)}/edit" target="_blank" rel="noopener">打开资料表 ↗</a>` : \'\'}'}
      <button type="button" class="btn line" data-logout="1">登出后台</button>
    </div>`);
R(`    $('#cfgForm').onsubmit = async e => { e.preventDefault(); const sheetId = $('#c_sheet').value.trim().replace(/^.*\\/d\\/([^/]+).*$/,'$1'); const webAppUrl = $('#c_url').value.trim();
      await saveCfg({ sheetId, webAppUrl }); toast('已保存'); loadSheet(true); };
`, '');
R(`'<p class="note">这个画面暂时用不到 AI。</p>'`, `'<p class="note">要在 Apps Script 的脚本属性放 ANTHROPIC_API_KEY 才能用 AI。</p>'`);
R(`'你没有允许这页使用 AI。'`, `(err && err.message) || 'AI 暂时用不到。'`);
R(`还没填报名页网址，报名链接、二维码和问卷链接暂时生成不了。去「设置」填入。`, `系统网址读取不到，请刷新。`);
a = a.replace(/^<title>[^<]*<\/title>\n?/, '').replace(/^<meta name="claude:viewport-fit-sides"[^>]*>\n?/m, '');
const html = `<!DOCTYPE html>\n<html lang="zh">\n<head>\n<base target="_top">\n<meta charset="utf-8">\n${shim}\n</head>\n<body>\n${a}\n</body>\n</html>\n`;
fs.writeFileSync(out, html);
console.log('Admin.html', html.length);
