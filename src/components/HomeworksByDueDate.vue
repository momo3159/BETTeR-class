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
            <Class :lectureName="lectureName" :homeworks="lectureInfo.homeworks" @changeProg="changeProgHandler" />
          </v-col>
        </v-row>
      </v-container>
    </v-card>
  </div>
</template>

<script>
import Class from './Class';
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
      console.log(this.lectures);
      const { lectures } = await browser.storage.local.get('lectures');
      // console.log(homeworks);
      Object.keys(lectures).forEach(name => {
        this.$set(this.lectures, name, lectures[name]);
      });
    },
    fetchHomeWorks: async function() {
      await browser.storage.local.set({ state: 'SCRAPE_TIMETABLE' });
      const tabs = await browser.tabs.query({ active: true, currentWindow: true });
      await chrome.tabs.update(tabs[0].id, { url: tabs[0].url });
    },
    changeProgHandler: async function(e) {
      // this.$set(this.lectures[e.lectureNames]['homeworks'][e.title], 'isDone', e.info.isDone)
      // this.lectures[e.lectureNames]['homeworks'][e.title]['isDone'] = e.info.isDone;
      // this.homeworks[i].homeworks[j].isDone = e.homework.isDone;
      await browser.storage.local.set({ lectures: this.lectures });
    },
  },
  components: {
    Class,
  },
};
</script>

<style scoped>
span {
  font-size: 1.15rem;
  font-weight: bolder;
}
</style>
