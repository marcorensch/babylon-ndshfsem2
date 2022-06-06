<template>
  <div>
    <Navbar/>
    <div class="uk-section uk-section-primary uk-position-relative" uk-height-viewport="offset-top:true; offset-bottom:true">
      <div class="uk-container uk-container-small">
        <router-view v-slot="{ Component }">
          <transition name="route" mode="out-in" @after-enter="onAfterEnter">
            <component class="uk-margin-large-bottom" :is="Component"></component>
          </transition>
        </router-view>
      </div>
    </div>
    <div class="uk-text-meta uk-text-small uk-section-secondary">
      <div class="uk-padding-small uk-flex uk-flex-middle uk-flex-right">
        <div>Backend Status </div> <div id="backend-status-indicator" class="backend-status-info"></div>
      </div>
    </div>
  </div>


</template>

<script>
import UIkit from 'uikit';
import Icons from 'uikit/dist/js/uikit-icons';
import Navbar from "@/components/Navbar";
import {host} from "@/modules/defaults.mjs";
UIkit.use(Icons);

export default {
  name: 'App',
  components: {Navbar},
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
          .then(response => response.json())
          .then(data => {
            console.log(data);
            document.getElementById('backend-status-indicator').classList.add('status-green')
          }).catch(error => {
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
@import "./src/assets/styles/variables.less";
@import "./src/assets/styles/containers.less";
@import "./src/assets/styles/buttons.less";

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
  margin-left:1em;
  width:12px;
  height:12px;
  border-radius:10px;
  background-color: rgba(254, 254, 254, 0.07);
}
.backend-status-info.status-red{
  background-color:red;
}
.backend-status-info.status-green{
  background-color:green;
}

</style>
