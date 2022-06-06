<template>
  <div>
    <Navbar/>
    <div class="uk-section uk-section-primary uk-position-relative" uk-height-viewport="offset-top:true">
      <div class="uk-container uk-container-small">
        <router-view v-slot="{ Component }">
          <transition name="route" mode="out-in" @after-enter="onAfterEnter">
            <component class="uk-margin-large-bottom" :is="Component"></component>
          </transition>
        </router-view>
      </div>
    </div>
  </div>


</template>

<script>
import UIkit from 'uikit';
import Icons from 'uikit/dist/js/uikit-icons';
import Navbar from "@/components/Navbar";


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

</style>
