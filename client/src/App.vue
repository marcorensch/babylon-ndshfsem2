<template>
  <div>
    <Navbar/>
    <div class="uk-section uk-section-primary uk-position-relative uk-section-small" uk-height-viewport="offset-top:true; offset-bottom:true">
      <div class="uk-container uk-container-small">
        <router-view v-slot="{ Component }">
          <transition name="route" mode="out-in" @after-enter="onAfterEnter">
            <component class="uk-margin-large-bottom" :is="Component"></component>
          </transition>
        </router-view>
      </div>
    </div>
    <div class="uk-text-meta uk-text-small uk-section-secondary">
      <div class="uk-padding-small uk-flex uk-flex-middle">
        <div class="uk-width-expand">

          <AboutModal />
        </div>
        <div class="uk-width-auto">
          <div class="uk-text-nowrap">Backend Status<div id="backend-status-indicator" class="backend-status-info"></div> </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import UIkit from 'uikit';
import Icons from 'uikit/dist/js/uikit-icons';
import Navbar from "@/components/Navbar";
import AboutModal from "@/components/AboutModal";
import {host} from "@/modules/defaults.mjs";
UIkit.use(Icons);

export default {
  name: 'App',
  components: {Navbar, AboutModal},
  data() {
    return {
      apiKeyGiven: true,
      onSettingsView: false,
    }
  },
  computed: {
    currentRouteName() {
      return this.$route.name;
    }
  },
  mounted() {
    this.apiKeyGiven = localStorage.getItem('deeplApiKey') !== null
    if(!this.apiKeyGiven){
      this.$toast.open({
        message: 'API Key not set! Open Settings to set one.',
        type: 'warning',
        position: 'bottom',
        duration: 5000,
        dismissible: false
      })
    }
  },
  methods: {
    // Got called on every view switch
    onAfterEnter() {
      this.getBackendStatus()
    },
    getBackendStatus(){
      fetch(host+'/status')
          .then(response => {
            if(response.status === 200){
              document.getElementById('backend-status-indicator').classList.add('status-green')
            } else {
              document.getElementById('backend-status-indicator').classList.add('status-red')
            }
          })
          .catch(error => {
            console.log(error);
            document.getElementById('backend-status-indicator').classList.add('status-red')
      })
    },
    showError(message) {
      this.$toast.open({
        message: message,
        type: 'error',
        duration: 5000,
        dismissible: true
      })
    },

  }
};

</script>

<style lang="less">
@import "../node_modules/uikit/src/less/uikit.less";
@import "@/assets/styles/variables.less";
@import "@/assets/styles/containers.less";
@import "@/assets/styles/buttons.less";

html, body {
  background-color: #111111;
}

.nx-icon {
  padding-right: 5px;
}

.sub-title {
  border-bottom: 1px solid #fefefe
}

.uk-button.uk-disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.uk-modal {
  backdrop-filter: blur(10px);
}

.v-toast__text{
  padding: .5em 1em !important;
}

/** Route Transitions **/
.route-enter-from {
  opacity: 0;
  transform: translateX(100px);
}

.route-enter-active {
  transition: all 0.3s ease-out;
}

.route-leave-to {
  opacity: 0;
  transform: translateX(-100px);
}

.route-leave-active {
  transition: all 0.3s ease-out;
}

.backend-status-info{
  margin-left:.5em;
  display: inline-block;
  width:12px;
  height:12px;
  border-radius:10px;
  background-color: rgba(254, 254, 254, 0.07);
}
.backend-status-info.status-red{
  background-color:#ff0000;
}
.backend-status-info.status-green{
  background-color:green;
}

p{
  margin: 10px 0 20px 0;
}

:not(pre) > code{
  background-color: #eaeaea;
  border-radius: 5px;
  border: 1px solid #e7e7e7;
  padding: .5em;
  color: #606060;
  margin-top: .5em;
  display: block;
}

input.uk-input.uk-form-danger{
  border: 1px solid rgba(255, 0, 0, 0.55);
  background: rgba(255, 0, 0, 0.17) !important;
}

/* Firefox - Chrome / Safari / Edge not affected - use own Select Popup */
.uk-select:not([multiple]):not([size]) option {
  color: #e5e5e5;
}


</style>
