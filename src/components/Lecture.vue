<template>
  <div>
    <v-card elevation="2">
      <p class="card-title">{{ lectureName }}</p>
      <v-list>
        <v-list-item v-for="(info, title) in homeworks" :key="title">
          <template>
            <v-list-item-action>
              <v-checkbox color="success" v-model="info.isDone" @click="clickHandler"> </v-checkbox>
            </v-list-item-action>
            <v-list-item-content>
              <v-list-item-title class="lectureName">{{ title }}</v-list-item-title>
              <v-list-item-subtitle class="subtitle">〜{{ info.deadline }}</v-list-item-subtitle>
            </v-list-item-content>
          </template>
        </v-list-item>
      </v-list>
    </v-card>
  </div>
</template>

<script>
export default {
  name: 'Lecture',
  props: ['lectureName', 'homeworks'],
  methods: {
    clickHandler() {
      this.$emit('changeState');
    },
  },
};
</script>

<style scoped>
.card-title {
  font-size: 0.8rem; /*1.03em */
  letter-spacing: 0.0125em;
  font-weight: bold;
  padding-top: 18px;
  padding-left: 16px;
  margin-bottom: 0px;
}
.lectureName {
  font-size: 0.8rem !important;
}
.subtitle {
  font-size: 0.7rem;
}
</style>
