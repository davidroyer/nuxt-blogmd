const { promisify } = require('util')
const md = require('./markdown')
const fs = require('fs')
const writeFile = promisify(fs.writeFile)
const readFile = promisify(fs.readFile)
const jetpack = require('fs-jetpack')


module.exports = (data, itemType) => {
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
  
  Promise.all(itemsData.map(
    function(itemData) { return generateJSONFile(itemData, itemType); }
  ));


  // Promise.all(itemsData.map(generateJSONFile))
  return promisify(fs.writeFile)(
    `./static/data/${itemType}.json`,
    JSON.stringify(itemsData)
  )
}

function generateJSONFile(itemData, itemType) {
  return jetpack.write(`./static/data/${itemType}/${itemData.name}.json`, itemData);
}

function titleize(slug) {
  const words = slug.split('-')
  return words
    .map(word => word.charAt(0).toUpperCase() + word.substring(1).toLowerCase())
    .join(' ')
}

