const {
  promisify
} = require('util')
const {
  getMarkdownFiles
} = require('./utils')
const fs = require('fs')
const path = require('path')
const chokidar = require('chokidar')
const lru = require('lru-cache')
const fm = require('front-matter')
const ejs = require('ejs')
const md = require('./markdown')
const generateCollectionApi = require('./posts-json')
const generateRss = require('./rss')
var recursive = require("recursive-readdir");
const jetpack = require('fs-jetpack');

const SOURCE_DIR = './source';
const DEST_DIR = './pages/p';

const writeFile = promisify(fs.writeFile)
const readFile = promisify(fs.readFile)
const readDirectory = promisify(fs.readdir)

function mkdir(dir) {
  try {
    fs.statSync(dir)
  } catch (error) {
    fs.mkdirSync(dir)
  }
}

async function getAllCollections() {
  const allCollections = await recursive(SOURCE_DIR)
  console.log('ALL COLLECTIONS: ', allCollections)
  return allCollections
}
getAllCollections()

function getCollectionTypes() {
  let result = jetpack.list(SOURCE_DIR).filter(item => !(/(^|\/)\.[^\/\.]/g).test(item));
  console.log('result: ', result)
  return result
}

function getAllMarkdownFiles(directory) {
  const contentDir = jetpack.cwd(`${SOURCE_DIR}/${directory}`);
  const allMdFiles = contentDir.find({
    matching: ['*.md']
  });
  console.log('allMdFiles: ', allMdFiles)
  return allMdFiles
}

getCollectionTypes().forEach(type => {
  console.log('TYPE: ', type)
  getCollection(type)
});


function getCollections() {}

async function getCollection(type) {
  let collectionFiles = getAllMarkdownFiles(type)
  return Promise.all(
    collectionFiles.map(async fileName => {
      const content = await readFile(path.join(SOURCE_DIR, type, fileName), 'utf-8')
      return parseMarkdown(fileName, content)
    })
  )
}


function getPosts() {

  return Promise.all(
    fs
    .readdirSync(path.join(SOURCE_DIR, 'posts'))
    .filter(name => name.endsWith('.md'))
    .map(async name => {

      console.log('name from getPosts():  ', name)
      const content = await readFile(path.join(SOURCE_DIR, 'posts', name), 'utf-8')
      return parseMarkdown(name, content)
    })
  )
}

mkdir('./static')

ejs.cache = lru(100)
const template = fs.readFileSync('./scaffolds/post.vue', 'utf-8')



module.exports = function () {

  chokidar.watch(`${SOURCE_DIR}/**/*.md`).on('all', async (event, filePath) => {
    if (event === 'add' || event === 'change') {
      let collectionType = path.basename(path.dirname(filePath))
      let collectionData = await getCollection(collectionType)
      generateCollectionApi(collectionData, collectionType)
      console.log('Updating Collection Type: ', collectionType)
    }
  })

  this.nuxt.hook('ready', async () => {
    const posts = await getCollection('posts')
    const projects = await getCollection('projects')
    orderByDate(posts)
    generateCollectionApi(posts, 'posts')
    generateCollectionApi(projects, 'projects')
    generateRss(posts)
  })


  this.nuxt.hook('generate:extendRoutes', async routes => {
    const collectionsRoutes = await generateRoutes()

    for (let route of collectionsRoutes) {
      routes.push({ route });
    }
    // routes.push(...collectionsRoutes)
    // return collectionsRoutes
  })
};


function parseMarkdown(name, content) {
  return {
    name: path.basename(name, '.md'),
    matter: fm(content)
  }
}

async function processCollectionItem(type, filePath) {
  const name = path.basename(filePath, '.md')
  const content = await readFile(filePath, 'utf-8')
  return parseMarkdown(name, content)
}

function orderByDate(posts) {
  return posts.sort(
    (a, b) => b.matter.attributes.date.valueOf() - a.matter.attributes.date.valueOf()
  )
}

async function generateRoutes(routes) {
  const routesArray = []
  const collectionTypes = getCollectionTypes()
  console.log('generateRoutes - collectionTypes:', collectionTypes)
  for (const collection of collectionTypes) {
    
    const collectionData = await getCollection(collection)
    const collectionApi = generateCollectionApiTest(collectionData, collection)
    const collectionRoutes = collectionApi.map(collectionItem => `/${collection}/${collectionItem.slug}`)
    routesArray.push(...collectionRoutes)
  }
  console.log('routesArray: ', routesArray)
  return routesArray
}


function generateCollectionApiTest(data, itemType) {
  const itemsData = data.map(({ name, matter }) => ({
    name,
    slug: name,
    title: matter.attributes.title || titleize(name),
    tags: matter.attributes.tags,
    date: matter.attributes.date
      ? matter.attributes.date.toLocaleDateString()
      : '',
    content: md.render(matter.body)
  }))
  return itemsData
}


