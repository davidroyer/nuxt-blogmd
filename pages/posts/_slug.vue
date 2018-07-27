<template>
  <div class="post">
    <h1 v-text="post.title"></h1>
    <article v-html="post.content">
    </article>
  </div>
</template>


<script>
export default {
  asyncData({ store, params }) {
    let post = require(`@/static/data/${params.slug}.json`)
    let postOriginal = store.state.posts.find(post => post.name === params.slug)
    return { post }
  }
}
</script>
