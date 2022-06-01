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
      uuid: {
        type: String,
        default: "",
      },
    },
  data() {
    return {};
  },
  methods: {
    handleChange(data) {
      const url = 'http://localhost:3000/upload';

      data.uuid = this.uuid;
      //Build FormData Object
      let formData = new FormData()
      formData.append('uploadFile', data.file)
      formData.append('uuid', data.uuid)

      const requestOptions = {
        method: "POST",
        headers: {  },
        body: formData
      };

      fetch(url, requestOptions).then(response => response.json())
          .catch(error => {
        console.error(error);
      }).then((data) => {
        console.log(data)
        this.changeView(data)
      });




    },
    changeView(data) {
      // View Wechsel
      console.log(data);
      // Set active navbar link
      navigationHelper.setActiveNavbarLink(document.getElementById('checker-link'));

      this.$router.push({
        name: 'Checker',
        params: {
          uuid: data.uuid,
          name: data.filename,
        },
      });
    },
  },
}
</script>
