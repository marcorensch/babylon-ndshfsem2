<template>
  <div class="home">
    <FileUpload @file-change="handleChange"/>
    <Notice :show-on="uploadError" :position="'bottom'" :spinner="false" :message="errorMessage"
            :type="[uploadError ? 'notice':'error']"/>
  </div>
</template>

<script>

// ToDo: Wenn ich eine Datei hochlade wird eine UUID erstellt - diese soll im NICHT localStorage gespeichert werden
// ToDo: UUID darf nicht im LocalStorage gespeichert werden sondern über die Route mitgegeben werden! (Damit keine alten überschrieben werden)
// @ is an alias to /src
import FileUpload from "@/components/FileUpload";
import navigationHelper from "@/modules/navigationHelper.mjs";
import Notice from "@/components/Notice";

export default {
  name: 'HomeView',
  components: {
    FileUpload, Notice
  },
  props:
      {
        uuid: {
          type: String,
          default: "",
        },
        animationDone: {
          type: Boolean,
          default: false
        }
      },
  data() {
    return {
      apiKeyGiven: false,
      errorMessage: '',
      uploadError: false,
    };
  },
  mounted() {
    this.apiKeyGiven = localStorage.getItem('deeplApiKey') !== null
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
        headers: {},
        body: formData
      };
      fetch(url, requestOptions)
          .then(response => response.json())
          .catch(error => {
            console.error(error);
            this.showError("Backend not reachable")
          })
          .then((data) => {
            if (data.success) {
              this.changeView(data)
            } else {
              this.showError(data.message)
            }
          });
    },
    showError(message) {
      this.errorMessage = message;
      this.uploadError = true;
    },
    changeView(data) {
      // View Wechsel
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
