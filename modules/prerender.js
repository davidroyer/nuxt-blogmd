const { promisify } = require('util')
const fs = require('fs')
const path = require('path')
const chokidar = require('chokidar')
const lru = require('lru-cache')
const fm = require('front-matter')
const ejs = require('ejs')
const md = require('./markdown')
const generatePostsData = require('./posts-json')
const generateRss = require('./rss')

const SOURCE_DIR = './source/posts'
const DEST_DIR = './pages/p'

const writeFile = promisify(fs.writeFile)
const readFile = promisify(fs.readFile)

function mkdir(dir) {
  try {
    fs.statSync(dir)
  } catch (error) {
    fs.mkdirSync(dir)
  }
}

function getPosts() {
  return Promise.all(
    fs
      .readdirSync(SOURCE_DIR)
      .filter(name => name.endsWith('.md'))
      .map(async name => {
        const content = await readFile(path.join(SOURCE_DIR, name), 'utf-8')
        return {
          name: path.basename(name, '.md'),
          matter: fm(content)
        }
      })
  )
}

mkdir(DEST_DIR)
mkdir('./static')

ejs.cache = lru(100)
const template = fs.readFileSync('./scaffolds/post.vue', 'utf-8')

chokidar.watch(`${SOURCE_DIR}/*.md`).on('all', async (event, filePath) => {
  if (event === 'add' || event === 'change') {
    const content = await readFile(filePath, 'utf-8')
    const posts = await getPosts() // eslint-disable-line vue/script-indent
    generatePostsData(posts)
  }
})

module.exports = function () {
  this.nuxt.hook('ready', async () => {
    const posts = await getPosts() // eslint-disable-line vue/script-indent
    // posts.sort(
    //   (a, b) => b.matter.attributes.date.valueOf() - a.matter.attributes.date.valueOf()
    // )
    // Promise.all(posts.map(generateFile))
    generatePostsData(posts)
    generateRss(posts)
  })
}
