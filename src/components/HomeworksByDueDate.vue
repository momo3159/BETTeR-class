<template>
  <div>
    <v-container>
      <v-row>
        <v-col>
          <v-btn tile color="success" @click="btnHandler" class="reloadBtn">
            <v-icon left> mdi-cached </v-icon>
            課題情報の取得
          </v-btn>
        </v-col>
      </v-row>
      <v-row>
        <v-col>
          <v-btn tile color="success" @click="greet" class="reloadBtn">
            <v-icon left> mdi-file-edit </v-icon>
            課題情報の反映
          </v-btn>
        </v-col>
      </v-row>
    </v-container>
    <v-card class="mx-auto my-12" max-width="300" elevation="4">
      <v-card-title :style="{ backgroundColor: tagColor }">
        <span>{{ category }}</span>
      </v-card-title>

      <v-container>
        <v-row v-for="item in homeworks" :key="item.lectureName" :justify="center">
          <v-col>
            <Class :lectureName="item.lectureName" :homeworks="item.homeworks" @changeProg="changeProgHandler" />
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
      homeworks: [],
    };
  },
  methods: {
    greet: async function(e) {
      const { homeworks } = await browser.storage.local.get('homeworks');
      console.log(homeworks);
      this.homeworks = [];

      this.homeworks = homeworks;

      console.log(this.homeworks);
    },
    btnHandler: async function() {
      await browser.storage.local.set({ canParsed: true });
      const tabs = await browser.tabs.query({ active: true, currentWindow: true });
      await chrome.tabs.update(tabs[0].id, { url: tabs[0].url });
    },
    changeProgHandler: async function(e) {
      for (let i = 0; i < this.homeworks.length; i++) {
        if (this.homeworks[i].lectureName === e.lectureName) {
          for (let j = 0; j < this.homeworks[i].homeworks.length; j++) {
            if (this.homeworks[i].homeworks[j].title === e.homework.title) {
              this.homeworks[i].homeworks[j].isDone = e.homework.isDone;
            }
          }
        }
      }

      let { homeworks } = await browser.storage.local.get('homeworks');
      homeworks = this.homeworks;
      await browser.storage.local.set({ homeworks: homeworks });
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
