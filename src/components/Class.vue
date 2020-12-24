<template>
  <div>
    <v-card
      elevation="2"
    >
      <p class="card-title">{{lectureName}}</p>
      <v-list>
        <v-list-item
          v-for="(homework, i) in copiedHomeworks"
          :key="i"
        >
          <template>
            <v-list-item-action>
              <v-checkbox
                color="success"
                v-model="homework.isDone"
                @click="clickHandler(homework)"
              >
              </v-checkbox>  
            </v-list-item-action>
            <v-list-item-content>
              <v-list-item-title class='lectureName'>{{homework.title}}</v-list-item-title>
              <v-list-item-subtitle class='subtitle'>〜{{homework.end}}</v-list-item-subtitle>
            </v-list-item-content>
          </template>
        </v-list-item>
      </v-list>
    </v-card>
  </div>
</template>

<script>
export default {
  name: "Class",
  props: ['lectureName', 'homeworks'],
  data() {
    return {
      copiedHomeworks: this.homeworks
    }
  },
  methods: {
      clickHandler(obj) {
          this.$emit('changeProg', {homework: obj, lectureName: this.lectureName})
      }
  },
  watch: {
    homeworks(newVal) {
      this.copiedHomeworks = newVal
    }
  }

}
</script>

<style scoped>
  .card-title { 
      font-size: 0.8rem; /*1.03em */
      letter-spacing: .0125em;
      font-weight: bold;
      padding-top: 18px;
      padding-left: 16px;
      margin-bottom: 0px;
  }
  .lectureName{
    font-size: .8rem!important;
  }
  .subtitle {
    font-size: .7rem;
  }
</style>