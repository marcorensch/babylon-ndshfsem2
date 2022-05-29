<template>
  <div class="checker">
    <div uk-scrollspy="target: .animate; cls: uk-animation-slide-bottom-small; delay:300">
      <div v-if="name" class=" animate">
        <span>Filename:</span>
        <div class="filename-container">
          <span id="filename" class="uk-text-small uk-text-meta">{{ name }}</span>
        </div>
      </div>
      <div class="animate uk-margin">
        <div class="uk-grid-small uk-child-width-1-1 uk-child-width-1-3@s uk-flex-center" uk-grid>
          <div>
            <div class="uk-width-1-1">
              <div class="uk-button nx-button-warning uk-width-1-1">
                <font-awesome-icon class="icon" icon="forward"/>
                <span class="uk-margin-small-left">Skip Checks</span>
              </div>
            </div>
          </div>

          <div class="uk-flex-first@s">
            <div class="uk-width-1-1">
              <div class="uk-button nx-button-success uk-width-1-1">
                <font-awesome-icon class="icon" icon="play"/>
                <span class="uk-margin-small-left">Start Checks</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-if="results.length" class="uk-margin-large-top">
        <h2 class="sub-title animate">Results</h2>
      </div>
    </div>


  </div>
</template>
<script>
export default {
  name: 'CheckerView',
  props: ['uuid', 'name', 'type', 'size', 'fieldname'],
  data() {
    return {
      results: []
    }
  },
  mounted() {
    console.log('CheckerView mounted')
    if (this.fileInfo) {
      this.fileInfo = JSON.parse(this.fileInfo);
      console.log('CheckerView data', this.props)
    }
    this.results.push({type: 'KEY', message: 'An error', detail: 'Detail text'})
  }
}
</script>
<style lang="less">
@import './src/assets/styles/buttons.less';

.filename-container {
  padding: 10px;
  border: 1px solid #121212;
  border-radius: 5px;
  background-color: #222;
  font-family: Consolas, monospace;
}
</style>