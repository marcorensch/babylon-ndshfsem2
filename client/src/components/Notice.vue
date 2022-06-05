<template>
  <Transition>
    <div class="uk-position-fixed action-notice-container uk-flex uk-flex-center" :class="positionClass" v-if="showOn">
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
    }
  },
  data() {
    return {
      positionClass: 'uk-position-' + this.position
    }
  },
  methods: {}
}
</script>

<style lang="less" scoped>
.action-notice-container {
  z-index: 500;
  width: 100%;
  background-color: rgba(33, 55, 124, .8);
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