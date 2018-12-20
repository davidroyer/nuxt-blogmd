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

const SOURCE_DIR = './source/posts';
const DEST_DIR = './pages/p';

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



module.exports = function () {

  chokidar.watch(`${SOURCE_DIR}/*.md`).on('all', async (event, filePath) => {
    if (event === 'add' || event === 'change') {
      const content = await readFile(filePath, 'utf-8')
      const posts = await getPosts() // eslint-disable-line vue/script-indent
      orderByDate(posts)
      generatePostsData(posts)
    }
  })
  
  this.nuxt.hook('ready', async () => {
    const posts = await getPosts()
    orderByDate(posts)
    generatePostsData(posts)
    generateRss(posts)
  })
};

function orderByDate(posts) {
  return posts.sort(
    (a, b) => b.matter.attributes.date.valueOf() - a.matter.attributes.date.valueOf()
  )  
}