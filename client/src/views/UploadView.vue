<template>
  <div class="home">
    <FileUpload @file-change="handleChange" />
  </div>
</template>

<script>
// @ is an alias to /src
import FileUpload from "@/components/FileUpload";

export default {
  name: 'HomeView',
  components: {
    FileUpload,
  },
  data() {
    return {

    };
  },
  methods: {
    handleChange(data) {
      // Upload der Datei kommt hier rein

      // View Wechsel
      console.log(data);
      // Set active navbar link
      document.querySelectorAll('.uk-navbar-nav > li').forEach(item => {
        item.classList.remove('uk-active','active');
      });
      document.getElementById('checker-link').classList.add('uk-active','active');
      this.$router.push({
        name: 'Checker',
        params: {
          uuid: 12345678,
          name: data.file.name,
          type: data.file.type,
          size: data.file.size,
          fieldname: data.fieldname
        },
      });
    },
  },
}
</script>
