<template>
  <v-app>
    <v-main>
      <v-toolbar color="deep-purple accent-4" dark>
        <v-toolbar-title>BETTeR-class</v-toolbar-title>
        <v-spacer></v-spacer>
        <template v-slot:extension>
          <v-tabs v-model="tab" align-with-title grow>
            <v-tabs-slider></v-tabs-slider>

            <v-tab v-for="tabName in tabNames" :key="tabName">
              {{ tabName }}
            </v-tab>
          </v-tabs>
        </template>
      </v-toolbar>
      <v-tabs-items v-model="tab">
        <v-tab-item>
          <HomeworksByDueDate category="課題" tagColor="red" />
        </v-tab-item>
        <!-- <v-tab-item>
          <v-btn tile color="success">
            <v-icon left> mdi-cached </v-icon>
            RELOAD
          </v-btn>
          e-classの資料を表示
        </v-tab-item>
        <v-tab-item>
          <v-btn tile color="success">
            <v-icon left> mdi-cached </v-icon>
            RELOAD
          </v-btn>
          duetのメッセージを表示
        </v-tab-item> -->
        <v-tab-item>
          <v-btn tile color="success">
            <v-icon left> mdi-cached </v-icon>
            RELOAD
          </v-btn>
          <br />
          期末情報を表示
          <br />
          期末情報が発表され次第、機能を追加していきます
        </v-tab-item>
      </v-tabs-items>
    </v-main>
  </v-app>
</template>

<script>
import HomeworksByDueDate from '../components/HomeworksByDueDate.vue';
global.browser = require('webextension-polyfill');

export default {
  name: 'App',
  components: {
    HomeworksByDueDate,
  },

  data: () => ({
    tabNames: ['課題', '期末'],
    tab: null,
  }),
  methods: {},
};
</script>

<style scoped></style>
