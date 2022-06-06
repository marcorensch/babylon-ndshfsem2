<template>
  <div class="translator uk-light">
    <div uk-scrollspy="target: .animate; cls: uk-animation-slide-bottom-small; delay:300">
      <FilenameContainer :name="name"/>
      <div class="translator-setup-container uk-margin">
        <form id="translator-setup" class="uk-form uk-form-horizontal">

          <input name="name" type="text" :value="name">
          <input name="uuid" type="text" :value="uuid">
          <input name="authKey" type="text" :value="authKey">

          <div class="uk-margin animate" v-if="languages.srcLng">
            <div class="uk-form-label">
              <span>Source Language</span>
            </div>
            <div class="uk-form-controls">
              <select class="uk-select" name="srcLng" v-model="srcLng" required>
                <option value="auto">Auto Detect</option>
                <option v-for="lang of languages.srcLng" :key="lang.code" :value="lang.code">{{ lang.name }}</option>
              </select>
            </div>
          </div>

          <div class="uk-margin animate" v-if="languages.trgLng">
            <div class="uk-form-label">
              <span>Target Language</span>
            </div>
            <div class="uk-form-controls">
              <select class="uk-select" name="trgLng" v-model="trgLng"  required>
                <option v-for="lang of languages.trgLng" :key="lang.code" :value="lang.code">{{ lang.name }}</option>
              </select>
            </div>
          </div>

          <div class="uk-margin animate">
            <div class="uk-form-label">
              <span>Save as Name</span>
            </div>
            <div class="uk-form-controls">
              <input class="uk-input" name="saveAs" v-model="saveAs" required />
            </div>
          </div>

          <div class="uk-margin uk-flex uk-flex-right animate">
            <div :uk-tooltip="tootipMessage">
            <button id="translateBtn" type="submit" class="uk-button nx-button-success"  @click="startTranslation">Start Translation</button>
            </div>
          </div>

        </form>
      </div>
    </div>
    <div v-if="downloadLink"><a :href="downloadLink">download</a></div>

    <!-- This is the modal -->
    <div id="translator-modal" class="uk-flex-top" uk-modal>
      <div class="uk-modal-dialog uk-margin-auto-vertical">
        <div class="uk-modal-header">
          <h2 class="uk-modal-title translation-title">Translation in progress</h2>
        </div>
        <div class="uk-modal-body">
          <div>
            <span>Rows: </span><span>n</span>
          </div>
          <div>
            <span>Done: </span><span>n</span>
          </div>
        </div>
        <button class="uk-modal-close-default" type="button" uk-close></button>
      </div>
    </div>
    <a href="" uk-toggle="target: #translator-modal">Toggle</a>

  </div>
</template>

<script>
  import FilenameContainer from '@/components/FilenameContainer.vue'
  import navigationHelper from "@/modules/navigationHelper.mjs"
  import {host} from "@/modules/defaults.mjs"
  import UIkit from "uikit";
  import io from 'socket.io-client';

  export default {
    name: 'TranslatorView',
    components: {
      FilenameContainer
    },
    props: {
      uuid: {
        type: String,
        required: true,
        default: null
      },
      name: {
        type: String,
        required: true,
        default: null
      }
    },
    data() {
      return {
        languages: {},
        authKey: localStorage.getItem('deeplApiKey'),
        srcLng: 'auto',
        trgLng: '',
        saveAs: this.name,
        downloadLink: false,
        tootipMessage: '',
        socket : io('localhost:3000')
      }
    },
    mounted() {
      // UIkit.modal(document.getElementById('translator-modal')).show();

      //socket communication
      this.socket.on('translator-status', (data) => {
        console.log(data);
      });

      // handle routing exception ==> redirect to home if no uuid is given
      if (!this.uuid) {
        navigationHelper.setActiveNavbarLink(document.getElementById('upload-link'));
        this.$router.push({
          name: 'Upload',
          replace: true
        });
      }
      if(this.authKey === null) {
        this.tootipMessage = 'You have to enter a Deepl API key in the settings to use this feature.';
        document.getElementById('translateBtn').classList.add('uk-disabled');
      }

      if(localStorage.getItem('availableLanguages') !== null){
        this.languages = JSON.parse(localStorage.getItem('availableLanguages'))
        console.log(this.languages)
      }else{
        this.getSupportedLanguages()
      }

      // Set predefined languages from settings
      this.srcLng = localStorage.getItem('sourceLanguage') !== null ? localStorage.getItem('sourceLanguage') : 'auto'
      this.trgLng = localStorage.getItem('targetLanguage') !== null ? localStorage.getItem('targetLanguage') : ''

    },
    methods: {
      async getSupportedLanguages() {
        // Get supported languages from backend
        fetch('http://localhost:3000/languages', {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': this.authKey
          }
        }).then((res) => res.json()).then((languages) => {
          this.languages = languages
          if ('srcLng' in languages && 'trgLng' in languages) {
            this.srcLng = this.srcLng ? this.srcLng : languages.srcLng[0].code
            this.trgLng = this.trgLng ? this.trgLng : languages.trgLng[0].code

            localStorage.setItem('availableLanguages',JSON.stringify(languages))
          }
        }).catch((e) => {
          console.log(e)
        })
      },
      async startTranslation(e) {
        e.preventDefault();
        this.srcLng = this.srcLng === 'auto' ? '' : this.srcLng // Added support for auto detection

        const url = host+'/translator';

        const requestOptions = {
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
            "authorization": this.authKey,
            "srclng": this.srcLng,
            "trglng": this.trgLng,
            "saveas": this.saveAs,
            "uuid": this.uuid,
            "name": this.name
          }
        };

        fetch(url,requestOptions).then((res)=>res.json()).then((data)=>{
          console.log(data)
          UIkit.modal(document.getElementById('translator-modal')).show();
        }).catch((e)=>{
          console.log(e)
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
  }
</script>
<style>
.translation-title:after {
  overflow: hidden;
  display: inline-block;
  vertical-align: bottom;
  animation: ellipsis steps(20,end) 1200ms infinite;
  content: "...."; /* ascii code for the ellipsis character */
  width: 0;
}

@keyframes ellipsis {
  to {
    width: 1.25em;
  }
}
</style>
