<template>
  <div class="project">
    <h1>Projects</h1>
    <div>
      <div
        v-for="project in projects"
        :key="project.slug"
      >
        <nuxt-link :to="`/projects/${project.slug}`">
          <h2 v-text="project.title"></h2>
        </nuxt-link>
      </div>
    </div>
  </div>
</template>

<script>

export default {
  asyncData () {
    const projects = require('@/static/data/projects.json')
    return { projects }
  }
}
</script>

<style>
</style>
