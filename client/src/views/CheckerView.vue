<template>
  <div class="checker">
    <h1>This is an checker page</h1>
  </div>
</template>
<script>
  export default {
    name: 'CheckerView',
    props: ['data'],
    data() {
      return {

      }
    },
    mounted() {
      console.log('CheckerView mounted')
      if(this.data) {
        console.log('CheckerView data', JSON.parse(this.data))
      }
    }
  }
</script>