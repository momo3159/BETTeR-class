<template>
  <div>
    <v-container>
      <v-row>
        <v-col>
          <v-btn tile color="success" @click="fetchHomeWorks" class="reloadBtn">
            <v-icon left> mdi-cached </v-icon>
            課題情報の取得
          </v-btn>
        </v-col>
      </v-row>
      <v-row>
        <v-col>
          <v-btn tile color="success" @click="displayHomeWorks" class="reloadBtn">
            <v-icon left> mdi-file-edit </v-icon>
            課題情報の表示
          </v-btn>
        </v-col>
      </v-row>
    </v-container>
    <v-card class="mx-auto my-12" max-width="300" elevation="4">
      <v-card-title :style="{ backgroundColor: tagColor }">
        <span>{{ category }}</span>
      </v-card-title>

      <v-container>
        <v-row v-for="(lectureInfo, lectureName) in lectures" :key="lectureName" :justify="center">
          <v-col>
            <Lecture :lectureName="lectureName" :homeworks="lectureInfo.homeworks" @changeState="changeStateOfHomework" />
          </v-col>
        </v-row>
      </v-container>
    </v-card>
  </div>
</template>

<script>
import Lecture from './Lecture';
global.browser = require('webextension-polyfill');

export default {
  name: 'HomeWorksByDueDate',
  props: ['category', 'tagColor'],

  data() {
    return {
      lectures: {},
    };
  },
  methods: {
    displayHomeWorks: async function(e) {
      const { lectures, oldLectures } = await browser.storage.local.get(["lectures", "oldLectures"]);
      Object.keys(oldLectures).forEach(name => {
        this.$delete(this.lectures, name);
      })
      Object.keys(lectures).forEach(name => {
        this.$set(this.lectures, name, lectures[name]);
      });
    },
    fetchHomeWorks: async function() {
      await browser.storage.local.set({ state: 'SCRAPE_TIMETABLE' });
      const tabs = await browser.tabs.query({ active: true, currentWindow: true });
      await chrome.tabs.update(tabs[0].id, { url: tabs[0].url });
    },
    changeStateOfHomework: async function(e) {
      await browser.storage.local.set({ lectures: this.lectures });
    },
  },
  components: {
    Lecture,
  },
};
</script>

<style scoped>
span {
  font-size: 1.15rem;
  font-weight: bolder;
}
</style>
