<template>
  <div v-if="name" class="">
    <span class="uk-text-lead"><font-awesome-icon icon="file" /> Source File</span>
    <div class="filename-container">
      <span id="filename" class="uk-text-small uk-text-meta">{{ name }}</span>
    </div>
  </div>
</template>
<script>
export default {
  name: 'FilenameContainer',
  props: {
    name: {
      type:String,
      required: true
    }
  }
}
</script>
<style lang="less" scoped>

.filename-container {
  padding: 10px;
  border: 1px solid #121212;
  border-radius: 5px;
  background-color: #222;
  font-family: Consolas, monospace;
}
</style>