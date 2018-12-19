const { promisify } = require('util')
const md = require('./markdown')
const fs = require('fs')
const writeFile = promisify(fs.writeFile)
const readFile = promisify(fs.readFile)

module.exports = posts => {
  const data = posts.map(({ name, matter }) => ({
    name,
    title: matter.attributes.title || titleize(name),
    tags: matter.attributes.tags,
    date: matter.attributes.date
      ? matter.attributes.date.toLocaleDateString()
      : '',
    content: md.render(matter.body)
  }))
  
  Promise.all(data.map(generateJSONFile))
  return promisify(fs.writeFile)(
    './static/data/posts.json',
    JSON.stringify(data)
  )
}

function generateJSONFile(postObject) {
  return promisify(fs.writeFile)(
    `./static/data/${postObject.name}.json`,
    JSON.stringify(postObject)
  )
}

function titleize(slug) {
  const words = slug.split('-')
  return words
    .map(word => word.charAt(0).toUpperCase() + word.substring(1).toLowerCase())
    .join(' ')
}

