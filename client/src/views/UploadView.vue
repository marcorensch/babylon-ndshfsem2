<template>
  <div class="home">
    <FileUpload @file-change="handleChange"/>
  </div>
</template>

<script>
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
  },
  methods: {
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
    changeView(data) {
      // View Change
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
