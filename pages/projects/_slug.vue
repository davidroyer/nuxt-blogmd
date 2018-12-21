<template>
  <div class="project">
    <h1 v-text="project.title"></h1>
    <article v-html="project.content"></article>
  </div>
</template>

<script>
export default {
  asyncData ({ route, params }) {
    return {
      project: require(`@/static/data/projects/${params.slug}.json`)
    }
  }
}
</script>
