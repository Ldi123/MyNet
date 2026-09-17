const fs = require('fs'); // 文件模块
const matter = require('gray-matter'); // FrontMatter解析器 https://github.com/jonschlinkert/gray-matter
const yaml = require('js-yaml') // yaml序列化，替代原 json2yaml + 正则去引号（后者会破坏含冒号的值）
const chalk = require('chalk') // 命令行打印美化
// const arg = process.argv.splice(2)[0]; // 获取命令行传入的参数
const readFileList = require('./modules/readFileList');
const { type, repairDate, dateFormat } = require('./modules/fn');
const log = console.log
const path = require('path');
const os = require('os');
const { execFileSync } = require('child_process');

const PREFIX = '/pages/'

/**
 * 给.md文件设置frontmatter(标题、日期、永久链接等数据)
 *
 * 日期来源：优先取 git 首次提交日期（本地/CI 一致、可复现），
 * 未跟踪的新文件回退到文件修改时间 mtime。不再使用 atime/birthtime，
 * 避免在 CI 全新 checkout 时把已有文章日期刷成“今天”。
 */
function setFrontmatter(sourceDir, themeConfig) {

  const isCategory = themeConfig.category
  const isTag = themeConfig.tag
  const categoryText = themeConfig.categoryText || '随笔'

  // 预取 git 首次提交日期（只调用一次 git，避免逐文件调用）
  const gitRoot = getGitRoot(sourceDir)
  const gitAddDates = gitRoot ? getGitAddDates(gitRoot) : {}

  const files = readFileList(sourceDir); // 读取所有md文件数据

  files.forEach(file => {
    let dataStr = fs.readFileSync(file.filePath, 'utf8');// 读取每个md文件内容

    // fileMatterObj => {content:'剔除frontmatter后的文件内容字符串', data:{<frontmatter对象>}, ...}
    const fileMatterObj = matter(dataStr, {});

    if (Object.keys(fileMatterObj.data).length === 0) { // 未定义FrontMatter数据
      const dateStr = getFileDate(file.filePath, gitRoot, gitAddDates); // git首次提交时间，未跟踪时取mtime
      const categories = getCategories(
        file,
        categoryText
      );

      const fmData = {
        title: file.name,
        date: dateStr,
        permalink: getPermalink()
      };
      if (file.filePath.indexOf('_posts') > -1) {
        fmData.sidebar = 'auto'
      }
      if (isCategory !== false) {
        fmData.categories = categories
      }
      if (isTag !== false) {
        fmData.tags = ['']
      }

      const newData = `---${os.EOL}${dumpYaml(fmData)}---${os.EOL}${fileMatterObj.content}`;
      fs.writeFileSync(file.filePath, newData); // 写入
      log(chalk.blue('tip ') + chalk.green(`write frontmatter(写入frontmatter)：${file.filePath} `))

    } else { // 已有FrontMatter
      const matterData = fileMatterObj.data;
      let mark = false;

      // 已有FrontMatter，但是没有title、date、permalink、categories、tags数据的
      if (!matterData.hasOwnProperty('title')) { // 标题
        matterData.title = file.name;
        mark = true;
      }

      if (!matterData.hasOwnProperty('date')) { // 日期
        matterData.date = getFileDate(file.filePath, gitRoot, gitAddDates);
        mark = true;
      }

      if (!matterData.hasOwnProperty('permalink')) { // 永久链接
        matterData.permalink = getPermalink();
        mark = true;
      }

      if (file.filePath.indexOf('_posts') > -1 && !matterData.hasOwnProperty('sidebar')) { // auto侧边栏，_posts文件夹特有
        matterData.sidebar = "auto";
        mark = true;
      }

      if (!matterData.hasOwnProperty('pageComponent') && matterData.article !== false) { // 是文章页才添加分类和标签
        if (isCategory !== false && !matterData.hasOwnProperty('categories')) { // 分类
          matterData.categories = getCategories(file, categoryText)
          mark = true;
        }

        if (isTag !== false && !matterData.hasOwnProperty('tags')) { // 标签
          matterData.tags = [''];
          mark = true;
        }
      }

      if (mark) {
        if (matterData.date && type(matterData.date) === 'date') {
          matterData.date = repairDate(matterData.date) // 修复时间格式
        }
        const newData = `---${os.EOL}${dumpYaml(matterData)}---${os.EOL}${fileMatterObj.content}`;
        fs.writeFileSync(file.filePath, newData); // 写入
        log(chalk.blue('tip ') + chalk.green(`write frontmatter(写入frontmatter)：${file.filePath} `))
      }

    }
  })
}

// 序列化 frontmatter（兼容 js-yaml v3 safeDump / v4 dump）
function dumpYaml(obj) {
  const dump = yaml.safeDump || yaml.dump
  return dump(obj, { lineWidth: -1 })
}

// 获取 git 仓库根目录（sourceDir 一般为 docs）
function getGitRoot(sourceDir) {
  try {
    return execFileSync('git', ['-C', sourceDir, 'rev-parse', '--show-toplevel'], { encoding: 'utf8' }).trim()
  } catch (e) {
    return ''
  }
}

// 批量获取每个文件的“首次提交日期”，返回 { 'docs/xx.md': '2021-08-01T12:00:00+08:00' }
function getGitAddDates(gitRoot) {
  const map = {}
  try {
    const output = execFileSync(
      'git',
      ['-C', gitRoot, '-c', 'core.quotepath=false', 'log', '--reverse', '--diff-filter=A', '--no-merges', '--name-only', '--format=@@@%aI'],
      { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 }
    )
    let currentDate = ''
    output.split(/\r?\n/).forEach(line => {
      if (!line) return
      if (line.indexOf('@@@') === 0) {
        currentDate = line.slice(3).trim()
      } else if (currentDate && !map[line]) {
        map[line] = currentDate // --reverse 保证首次出现即为“首次提交”
      }
    })
  } catch (e) {
    // git 不可用（非 git 环境 / 浅克隆）时静默降级到 mtime
  }
  return map
}

// 获取文件日期：优先 git 首次提交时间，否则回退文件修改时间 mtime
function getFileDate(filePath, gitRoot, gitAddDates) {
  if (gitRoot) {
    const rel = path.relative(gitRoot, filePath).split(path.sep).join('/')
    if (gitAddDates[rel]) {
      return formatGitDate(gitAddDates[rel])
    }
  }
  const stat = fs.statSync(filePath)
  return dateFormat(stat.mtime)
}

// 把 git 的 ISO 时间(带时区)格式化为 YYYY-MM-DD HH:mm:ss，保留提交时的本地时间，做到跨机器一致
function formatGitDate(iso) {
  const m = String(iso).match(/^(\d{4}-\d{2}-\d{2})T(\d{2}:\d{2}:\d{2})/)
  return m ? `${m[1]} ${m[2]}` : String(iso)
}

// 获取分类数据
function getCategories(file, categoryText) {
  let categories = []

  if (file.filePath.indexOf('_posts') === -1) {
    // 不在_posts文件夹
    let filePathArr = file.filePath.split(path.sep) // path.sep用于兼容不同系统下的路径斜杠
    filePathArr.pop()

    let ind = filePathArr.indexOf('docs')
    if (ind !== -1) {
      while (filePathArr[++ind] !== undefined) {
        categories.push(filePathArr[ind].split('.').pop()) // 获取分类
      }
    }
  } else {
    categories.push(categoryText)
  }
  return categories
}

// 定义永久链接数据
function getPermalink() {
  return `${PREFIX + (Math.random() + Math.random()).toString(16).slice(2, 8)}/`
}


module.exports = setFrontmatter;
