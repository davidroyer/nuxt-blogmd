<template>
  <div class="post">
    <h1>{{ post.title }}</h1>
    <article v-html="post.content"></article>
  </div>
</template>

<script>
// let postAlternate = require(`@/static/data/${params.slug}.json`)
export default {
  asyncData({ store, params, payload }) {
    if (payload) {
      return { post: payload }
    } else {
      return { post: store.state.posts.find(post => post.name === params.slug) }
    }
  }
}
</script>
