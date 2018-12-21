const {
  promisify
} = require('util')
const fs = require('fs')
const path = require('path')
const chokidar = require('chokidar')
const fm = require('front-matter')
const md = require('./markdown')

const generateRss = require('./rss')
const jetpack = require('fs-jetpack');
const SOURCE_DIR = './_CONTENT';

function getCollectionTypes() {
  return jetpack.list(SOURCE_DIR).filter(item => !(/(^|\/)\.[^\/\.]/g).test(item));
}

function getAllMarkdownFiles(directory) {
  const contentDir = jetpack.cwd(`${SOURCE_DIR}/${directory}`);
  return contentDir.find({
    matching: ['*.md']
  });
}

getCollectionTypes().forEach(type => {
  getCollection(type)
});


function getCollections() {}

async function getCollection(type) {
  let collectionFiles = getAllMarkdownFiles(type)
  return Promise.all(
    collectionFiles.map(async fileName => {
      const content = await jetpack.readAsync(path.join(SOURCE_DIR, type, fileName));
      return parseMarkdown(fileName, content)
    })
  )
}

module.exports = function () {

  chokidar.watch(`${SOURCE_DIR}/**/*.md`).on('all', async (event, filePath) => {
    if (event === 'add' || event === 'change') {
      let collectionType = path.basename(path.dirname(filePath))
      let collectionData = await getCollection(collectionType)
      generateApiFiles(collectionData, collectionType)
      console.log('Updating Collection Type: ', collectionType)
    }
  })

  this.nuxt.hook('ready', async () => {
    const posts = await getCollection('posts')
    const projects = await getCollection('projects')
    orderByDate(posts)
    generateApiFiles(posts, 'posts')
    generateApiFiles(projects, 'projects')
    generateRss(posts)
  })


  this.nuxt.hook('generate:extendRoutes', async routes => {
    const collectionRoutes = await generateRoutes()
    for (let route of collectionRoutes) {
      routes.push({
        route
      });
    }
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
  const content = await jetpack.readAsync(filePath);
  return parseMarkdown(name, content)
}

function orderByDate(posts) {
  return posts.sort(
    (a, b) => b.matter.attributes.date.valueOf() - a.matter.attributes.date.valueOf()
  )
}

/**
 * Helper function for generate hook
 * @param {Array} routes 
 */
async function generateRoutes(routes) {
  const routesArray = []
  const collectionTypes = getCollectionTypes()

  for (const collection of collectionTypes) {
    const collectionData = await getCollection(collection)
    const collectionApi = generateCollectionApi(collectionData, collection)
    const collectionRoutes = collectionApi.map(collectionItem => `/${collection}/${collectionItem.slug}`)
    routesArray.push(...collectionRoutes)
  }
  return routesArray
}


/**
 * Generates Schema for `JSON` files
 * @param {Object} data Data for all entries of a single collection
 * @param {String} itemType The collection type
 */
function generateCollectionApi(data, itemType) {
  const itemsData = data.map(({
    name,
    matter
  }) => ({
    name,
    slug: name,
    title: matter.attributes.title || titleize(name),
    tags: matter.attributes.tags,
    date: matter.attributes.date ?
      matter.attributes.date.toLocaleDateString() :
      '',
    content: md.render(matter.body)
  }))
  return itemsData
}

/**
 * Create the `JSON` files for a collection
 * 1. Get the data of all entries
 * 2. Generate a `JSON` file for each entry
 * 3. Generate one that includes all entries
 * @param {Object} data 
 * @param {String} itemType 
 */
function generateApiFiles(data, collectionType) {
  const collectionItemsData = generateCollectionApi(data, collectionType)

  /**
   * Create a seperate `JSON` file for each file belonging to the collection  
   */
  Promise.all(collectionItemsData.map(
    function (itemData) {
      return generateEntryJsonFile(itemData, collectionType);
    }
  ));

  /**
   * Create a `JSON` file that includes the data from all the files belonging to the collection  
   */
  generateCollectionJsonFile(collectionItemsData, collectionType)

  // return promisify(fs.writeFile)(
  //   `./static/data/${itemType}.json`,
  //   JSON.stringify(itemsData)
  // )  
}

function generateEntryJsonFile(itemData, itemType) {
  return jetpack.write(`./static/data/${itemType}/${itemData.name}.json`, itemData);
}

function generateCollectionJsonFile(collectionData, collectionType) {
  return jetpack.write(`./static/data/${collectionType}.json`, collectionData);
}

function titleize(slug) {
  const words = slug.split('-')
  return words
    .map(word => word.charAt(0).toUpperCase() + word.substring(1).toLowerCase())
    .join(' ')
}
