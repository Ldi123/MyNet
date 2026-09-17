/**
 *  读取所有md文件数据
 */
const fs = require('fs'); // 文件模块
const path = require('path'); // 路径模块
const docsRoot = path.join(__dirname, '..', '..', 'docs'); // docs文件路径

/**
 * 解析文件名：
 *   '01.Java相关.md' -> 'Java相关' (有序号)
 *   'Java相关.md'    -> 'Java相关' (无序号)
 */
function parseFileName(filename) {
  const ext = path.extname(filename)
  if (ext.toLowerCase() !== '.md') return null
  let name = filename.slice(0, -ext.length)
  const m = name.match(/^\d+\.(.+)$/)
  if (m) name = m[1]
  return name
}

function readFileList(dir = docsRoot, filesList = []) {
  const files = fs.readdirSync(dir);
  files.forEach((item) => {
    let filePath = path.join(dir, item);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory() && item !== '.vuepress' && item !== '@pages') {
      readFileList(path.join(dir, item), filesList);  //递归读取文件
    } else {
      if (path.basename(dir) !== 'docs') { // 过滤docs目录级下的文件
        const name = parseFileName(item)
        if (name === null) return // 过滤非md文件
        filesList.push({
          name,
          filePath
        });
      }
    }
  });
  return filesList;
}

module.exports = readFileList;
