// 重新生成 Demo：node demo/src/build.js  →  输出到仓库根目录 index.html（GitHub Pages 首页）
const fs = require('fs'), path = require('path');
const root = path.join(__dirname, '..', '..');
const rd = p => fs.readFileSync(path.join(root, p), 'utf8');
const src = { Index: rd('apps-script/Index.html'), Team: rd('apps-script/Team.html'), admin: rd('admin/admin.html') };
const j = JSON.stringify(src).replace(/<\/script/gi, '<\\/script').replace(/<!--/g, '<\\!--');
let shell = fs.readFileSync(path.join(__dirname, 'shell.html'), 'utf8');
shell = shell.replace('/*__MOCK__*/', () => fs.readFileSync(path.join(__dirname, 'mock.js'), 'utf8')).replace('/*__SRC__*/', () => j);
// Pages 需要完整的 HTML 外壳
fs.writeFileSync(path.join(root, 'index.html'), '<!doctype html>\n<html lang="zh"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n' + shell.replace(/<\/style>/, '</style></head><body>') + '\n</body></html>\n');
console.log('index.html written');
