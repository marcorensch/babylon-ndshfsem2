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
import {host} from "@/modules/defaults.mjs"

export default {
  name: 'HomeView',
  components: {
    FileUpload
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
      linkTo: '',
    };
  },
  mounted() {
    this.apiKeyGiven = localStorage.getItem('deeplApiKey') !== null
    this.getBackendStatus()
  },
  methods: {
    getBackendStatus(){
      fetch(host+'/status')
          .then(response => response.json())
          .then(data => {
            console.log(data);
            this.showToast("Backend available", 'success', 2000);
          }).catch(error => {
        console.log(error);
        this.showError("Backend not reachable")
      })
    },
    handleChange(data) {
      const url = host + '/upload';
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
          .then((data) => {
            console.log(data)
            if (data !== undefined && data.success) {
              this.changeView(data)
            } else if(data === undefined){
              this.showError("Backend not reachable")
            } else {
              this.showError(data.message)
            }
          })
          .catch(error => {
            console.error(error);
            this.showError("Backend not reachable")
          });
    },
    showError(message) {
      this.$toast.open({
        message: message,
        type: 'error',
        duration: 5000,
        dismissible: true
      })
    },
    showToast(message, type, duration) {
      this.$toast.open({
        message: message,
        type: type,
        duration: duration,
        dismissible: true
      })
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
