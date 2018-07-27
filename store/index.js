import posts from '@/static/data/posts.json'

export const state = () => ({
  menuIsActive: false,
  sidebarOpen: false,
  posts,
  activeColor: {}
})

export const mutations = {
  toggleMenuState(state) {
    state.menuIsActive = !state.menuIsActive
  },

  toggleSidebar(state) {
    state.sidebarOpen = !state.sidebarOpen
  },

  closeSidebar(state) {
    state.sidebarOpen = false
  },

  setMenuState(state, payload) {
    state.menuIsActive = !state.menuIsActive
  },

  setColor(state, payload) {
    state.activeColor = payload
  }
}

export const actions = {
  nuxtServerInit({ commit, state }, { isDev }) {},

  getColorByName({ commit, state }, colorName) {
    const color = state.colors.find(color => color.name === colorName)
    commit('setColor', color)
  }
}

export const getters = {}
