<template>
  <Transition>
    <div class="uk-position-fixed action-container uk-flex uk-flex-center" :class="[positionClass,styleClass]" v-if="showOn">
      <div class="uk-padding-small">
        <div v-if="spinner" uk-spinner></div>
        <span class="uk-margin-left">{{ message }}</span>
      </div>
    </div>
  </Transition>
</template>

<script>
export default {
  name: "Notice",
  props: {
    message: {
      type: String,
      required: true
    },
    position: {
      type: String,
      default: "bottom",
    },
    spinner:{
      type:Boolean,
      default: true
    },
    showOn:{
      type:Boolean,
      default: false,
      required: true
    },
    type:{
      type: String,
      default: "notice",
    }
  },
  data() {
    return {
      positionClass: 'uk-position-' + this.position,
      styleClass: this.type + '-container'
    }
  },
  methods: {}
}
</script>

<style lang="less" scoped>
.notice-container{
  background-color: rgba(33, 55, 124, .8);
  color: white;
}
.error-container{
  background-color: rgba(255, 0, 0, .8);
  color: white;
}
.warning-container{
  background-color: rgba(197, 197, 79, 0.8);
  color: white;
}
.action-container {
  z-index: 500;
  width: 100%;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}

/* Animation */
.v-enter-active,
.v-leave-active {
  transition: opacity 0.5s ease;
}

.v-enter-from,
.v-leave-to {
  opacity: 0;
}

</style>