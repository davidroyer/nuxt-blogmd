const getTags = require('./scripts/tags')

const uniqueArray = originalArray => [...new Set(originalArray)]

const getTagRoutes = posts => {
  const tagsArray = []
  for (let i = 0; i < posts.length; i++) {
    for (let n = 0; n < posts[i].tags.length; n++) {
      tagsArray.push(posts[i].tags[n])
    }
  }
  return uniqueArray(tagsArray)
}

module.exports = {
  css: ['@/assets/common.styl'],
  modules: ['~/modules/prerender'],
  plugins: ['~/plugins/disqus'],
  vendor: [
    'feather-icons',
    'highlight.js/styles/paraiso-light.css',
    'lodash.throttle',
    'vue-disqus'
  ],
  head: {
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { name: 'theme-color', content: '#63BB0A' }
    ],
    link: [
      {
        rel: 'icon',
        href: '/fatpig.png'
      }
    ]
  },
  generate: {
    routes(callback) {
      const posts = require('./static/data/posts.json')
      const postRoutes = posts.map(post => `/posts/${post.name}`)
      const tagRoutes = getTagRoutes(posts).map(tag => `/tag/${tag}`)
      const Routes = [...postRoutes, ...tagRoutes]
      callback(null, Routes)
    }
  },
  loading: {
    color: '#63BB0A'
  },
  render: {
    resourceHints: false
  }
}
