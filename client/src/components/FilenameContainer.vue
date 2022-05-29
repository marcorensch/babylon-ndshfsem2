<template>
  <div v-if="name" class="animate">
    <span>Filename:</span>
    <div class="filename-container">
      <span id="filename" class="uk-text-small uk-text-meta">{{ name }}</span>
    </div>
  </div>
</template>
<script>
export default {
  name: 'FilenameContainer',
  props: {
    name: {}
  }
}
</script>
<style lang="less">
@import '../assets/styles/buttons.less';

.filename-container {
  padding: 10px;
  border: 1px solid #121212;
  border-radius: 5px;
  background-color: #222;
  font-family: Consolas, monospace;
}
</style>