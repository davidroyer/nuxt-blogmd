<template lang="html">
  <ul class="posts-list">
    <li v-for="post in posts" :key="post.name">
      <span class="post-date">{{ post.date }}</span>
      <nuxt-link :to="`/posts/${post.name}/`" class="post-title">
        {{ post.title }}
      </nuxt-link>
    </li>
  </ul>
</template>

<script>
export default {
  computed: {
    posts() {
      return this.$store.state.posts
    }
  }
}
</script>

<style lang="css">
</style>
