<template>
  <div class="home">
    <FileUpload @file-change="handleChange"/>
  </div>
</template>

<script>

// ToDo: Wenn ich eine Datei hochlade wird eine UUID erstellt - diese soll im NICHT localStorage gespeichert werden
// ToDo: UUID darf nicht im LocalStorage gespeichert werden sondern über die Route mitgegeben werden! (Damit keine alten überschrieben werden)
// @ is an alias to /src
import FileUpload from "@/components/FileUpload";
import navigationHelper from "@/modules/navigationHelper.mjs";

export default {
  name: 'HomeView',
  components: {
    FileUpload,
  },
  props:
    {
      uuid: String
    },
  data() {
    return {};
  },
  methods: {
    handleChange(data) {
      // Upload der Datei kommt hier rein

      data.uuid = this.uuid;

      this.uploadFile(data, 'http://localhost:3000/upload');


      // // View Wechsel
      // console.log(data);
      // // Set active navbar link
      // navigationHelper.setActiveNavbarLink(document.getElementById('checker-link'));
      //
      // this.$router.push({
      //   name: 'Checker',
      //   params: {
      //     uuid: 12345678,
      //     name: data.file.name,
      //     type: data.file.type,
      //     size: data.file.size,
      //     fieldname: data.fieldname
      //   },
      // });
    },
    async uploadFile(data, url) {
      // set up the request data
      let formData = new FormData()
      formData.append('uploadFile', data.file)
      formData.append('uuid', data.uuid)

      // track status and upload file
      let response = await fetch(url, {method: 'POST', mode: 'no-cors', body: formData})
      console.log(response)
    },
  },
}
</script>
