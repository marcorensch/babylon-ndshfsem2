<template>
  <div class="home">
    <FileUpload />
  </div>
</template>

<script>
// @ is an alias to /src
import FileUpload from "@/components/FileUpload";

export default {
  name: 'HomeView',
  components: {
    FileUpload,
  }
}
</script>
