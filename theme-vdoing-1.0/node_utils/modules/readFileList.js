/**
 *  读取所有md文件数据
 */
const fs = require('fs'); // 文件模块
const path = require('path'); // 路径模块

/**
 * 解析文件名：
 *   '01.Java相关.md'  -> { name: 'Java相关' }   (有序号)
 *   'Java相关.md'     -> { name: 'Java相关' }   (无序号)
 *   '01.阿里开发手册_学习笔记.md' -> { name: '阿里开发手册_学习笔记' }
 * 序号仅用于排序，标题内可含 '.'。
 */
function parseFileName(filename) {
  const ext = path.extname(filename)
  if (ext.toLowerCase() !== '.md') return null
  let name = filename.slice(0, -ext.length)
  const m = name.match(/^\d+\.(.+)$/)
  if (m) name = m[1]
  return { name }
}

function readFileList (dir, filesList = []) {
  const files = fs.readdirSync(dir);
  files.forEach((item) => {
    let filePath = path.join(dir, item);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory() && item !== '.vuepress' && item !== '@pages') {
      readFileList(path.join(dir, item), filesList);  //递归读取文件
    } else {
      if (path.basename(dir) !== 'docs') { // 过滤docs目录级下的文件
        const parsed = parseFileName(item)
        if (!parsed) return // 过滤非md文件
        filesList.push({
          name: parsed.name,
          filePath
        });
      }
    }
  });
  return filesList;
}

module.exports = readFileList;
