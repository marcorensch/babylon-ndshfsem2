<template>
    <div class="uk-position-fixed action-notice-container uk-flex uk-flex-center" :class="positionClass">
      <div class="uk-padding-small">
        <div uk-spinner></div>
        <span class="uk-margin-left">{{ message }}</span>
      </div>
    </div>
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
</style>