<template>
  <div class="project">
    <h1>Projects</h1>
    <div>
      <!-- <div
        v-for="project in projects"
        :key="project.id"
      >
        <nuxt-link :to="`/projects/${project.id}`">
          <h2 v-text="project.title"></h2>
        </nuxt-link>
      </div> -->
    </div>
  </div>
</template>

<script>

export default {
  // asyncData ({$content}) {
  //   const projects = $content.get('projects')
  //   return { projects }
  // }
}
</script>

<style>
</style>
