const { promisify } = require('util')
const md = require('./markdown')
const fs = require('fs')
const writeFile = promisify(fs.writeFile)
const readFile = promisify(fs.readFile)

module.exports = posts => {
  // console.log('posts from posts-json', posts)
  const data = posts.map(({ name, matter }) => ({
    name,
    title: matter.attributes.title,
    tags: matter.attributes.tags,
    date: matter.attributes.date.toLocaleDateString('zh-Hans-CN', {
      timeZone: 'UTC',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }),
    content: md.render(matter.body)
  }))

  Promise.all(data.map(generateJSONFile))
  return promisify(fs.writeFile)(
    './static/data/posts.json',
    JSON.stringify(data)
  )
}

async function generateJSONFile(postObject) {
  return promisify(fs.writeFile)(
    `./static/data/${postObject.name}.json`,
    JSON.stringify(postObject)
  )
}
