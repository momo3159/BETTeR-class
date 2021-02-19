import Vue from 'vue';
import Vuex from 'vuex';
import createPersistedState from 'vuex-persistedstate';

global.browser = require('webextension-polyfill');
Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    canParsed: false,
    alreadyParsed: false,
    beforeGetHW: true,
    lectures: {},
    lectureCount: 0,
  },
  mutations: {
    updateCanParsed(state, payload) {
      state.canParsed = payload.canParsed;
    },
    updateAlreadyParsed(state, payload) {
      state.alreadyParsed = payload.alreadyParsed;
    },
    updateBeforeGetHomeWorks(state, payload) {
      state.beforeGetHW = payload.beforeGetHW;
    },
    updateLectures(state, payload) {
      state.lectures = payload.lectures;
    },
    updateLectureCount(state, payload) {
      state.lectureCount = payload.lectureCount;
    },
  },
  plugins: [createPersistedState()],
});
