<template>
  <div class="checker">
    <h1>This is an checker page</h1>
    <div uk-scrollspy="target: .animate; cls: uk-animation-slide-bottom-small; delay:300">
      <div v-if="name" class="filename-container animate">
        <span id="filename" class="uk-text-small uk-text-meta">{{name}}</span>
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
    props: ['uuid', 'name', 'type', 'size', 'fieldname' ],
    data() {
      return {
        results: []
      }
    },
    mounted() {
      console.log('CheckerView mounted')
      if(this.fileInfo) {
        this.fileInfo = JSON.parse(this.fileInfo);
        console.log('CheckerView data', this.props )
      }
      this.results.push({type:'KEY',message:'An error',detail:'Detail text'})
    }
  }
</script>
<style lang="less">
.filename-container{
  padding:10px;
  border:1px solid #121212;
  border-radius:5px;
  background-color: #222;
  font-family: Consolas, monospace;
}
</style>