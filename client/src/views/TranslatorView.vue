<template>
  <div class="translator uk-light">
    <div>
      <FilenameContainer :name="name"/>
      <div class="translator-setup-container uk-margin">
        <form id="translator-setup" class="uk-form uk-form-horizontal">

          <input name="name" type="text" :value="name">
          <input name="uuid" type="text" :value="uuid">
          <input name="authKey" type="text" :value="authKey">

          <div class="uk-margin" v-if="languages.srcLng">
            <div class="uk-form-label">
              <span>Source Language</span>
            </div>
            <div class="uk-form-controls">
              <select class="uk-select" id="srcLng" name="srcLng" @change="onChangeSource($event)" v-model="srcLng"
                      required>
                <option value="auto">Auto Detect</option>
                <option v-for="lang of languages.srcLng" :key="lang.code" :value="lang.code">{{ lang.name }}</option>
              </select>
            </div>
          </div>

          <div class="uk-margin" v-if="languages.trgLng">
            <div class="uk-form-label">
              <span>Target Language</span>
            </div>
            <div class="uk-form-controls">
              <select class="uk-select" id="trgLng" name="trgLng" @change="onChangeTarget($event)" v-model="trgLng"
                      required>
                <option v-for="lang of languages.trgLng" :key="lang.code" :value="lang.code">{{ lang.name }}</option>
              </select>
            </div>
          </div>

          <div class="uk-margin">
            <div class="uk-form-label">
              <span>Save as Name</span>
            </div>
            <div class="uk-form-controls">
              <input id="saveAs" class="uk-input" name="saveAs" v-model="saveAs" @keyup="fieldValueUpdated" required/>
              <Transition>
              <div v-if="!formValid">
                <div class="uk-margin-small-top uk-alert uk-alert-warning">Please enter a valid filename, allowed are only characters a-z, numbers aswell as _ or -.<br>Spaces are not allowed. Filename must contain a supported file extension (ini / txt).</div>
              </div>
              </Transition>
            </div>
          </div>
          <div class="uk-margin uk-flex uk-flex-right">
            <div :uk-tooltip="tootipMessage">
              <button id="translateBtn" type="submit" class="uk-button nx-button-success" :class="{'uk-disabled': !formValid}" @click="startTranslation">
                Start Translation
              </button>
            </div>
          </div>

        </form>
      </div>
    </div>

    <!-- This is the modal -->
    <div id="translator-modal" class="uk-flex-top uk-modal-container" uk-modal="bg-close:false">
      <div class="uk-modal-dialog uk-margin-auto-vertical">
        <div class="uk-modal-header">
          <h2 id="translation-title" class="uk-modal-title translation-title">Translation in progress</h2>
        </div>
        <div class="uk-modal-body">
          <div class="uk-margin-small">
            <div class="uk-text-center uk-flex uk-flex-middle uk-flex-center">
              <div>Translating <b>{{ name }}</b> from</div>
              <div class="uk-margin-small-left uk-label">
                <font-awesome-icon icon="language"/>
                {{ sourceLanguage }}
              </div>
              <div class="uk-margin-small-left">to</div>
              <div class=" uk-margin-small-left uk-label">
                <font-awesome-icon icon="language"/>
                {{ targetLanguage }}
              </div>
            </div>
          </div>
          <div class="uk-margin-small">
            <div>
              <span>Rows:</span>&nbsp;<span>{{ translatorStatus.rows }}</span>
            </div>
            <div>
              <span>Done:</span>&nbsp;<span>{{ translatorStatus.done }}</span>
            </div>
          </div>

          <div class="uk-margin-small">
            <progress class="uk-progress" :value="translatorStatus.done" :max="translatorStatus.rows"></progress>
          </div>
          <div class="uk-margin-small uk-height-small uk-flex uk-flex-middle uk-flex-center">
            <transition name="fade">
              <div v-if="downloadLink && (translatorStatus.done === translatorStatus.rows)">
                <a :href="downloadLink" class="uk-button uk-button-large uk-button-primary"
                   title="Download translated file" @click="closeModal()" download>
                  <font-awesome-icon icon="download"/>
                  Download {{ saveAs }}</a>
              </div>
            </transition>
          </div>
        </div>
      </div>
    </div>
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
      sourceLanguage: '',
      trgLng: '',
      targetLanguage: '',
      saveAs: this.name,
      downloadLink: false,
      tootipMessage: '',
      socket: null,
      translatorStatus: {
        rows: 0,
        done: 0
      },
      publishDownloadLink: (data) => {
        console.log(data);
        this.downloadLink = data.url
      },
      updateTranslatorStatus: (data) => {
        console.log(data);
        this.translatorStatus = data
      },
      formValid: false
    }
  },
  updated() {
    if (this.languages.srcLng && this.languages.trgLng) {
      // Set current selected languages
      let srclngSelect = document.getElementById('srcLng');
      let trglngSelect = document.getElementById('trgLng');
      this.sourceLanguage = srclngSelect.options[srclngSelect.options.selectedIndex].text;
      this.targetLanguage = trglngSelect.options[trglngSelect.options.selectedIndex].text;
    }
  },
  mounted() {
    // handle routing exception ==> redirect to home if no uuid is given
    if (!this.uuid) {
      navigationHelper.setActiveNavbarLink(document.getElementById('upload-link'));
      this.$router.push({
        name: 'Upload',
        replace: true
      });
    }
    if (this.authKey === null) {
      this.tootipMessage = 'You have to enter a Deepl API key in the settings to use this feature.';
      document.getElementById('translateBtn').classList.add('uk-disabled');
    }

    // Languages
    // Set predefined languages from settings
    this.srcLng = localStorage.getItem('sourceLanguage') !== null ? localStorage.getItem('sourceLanguage') : 'auto'
    this.trgLng = localStorage.getItem('targetLanguage') !== null ? localStorage.getItem('targetLanguage') : ''

    if (localStorage.getItem('availableLanguages') !== null) {
      this.languages = JSON.parse(localStorage.getItem('availableLanguages'))
      console.log(this.languages)
    } else {
      this.getSupportedLanguages()
    }
  },
  methods: {
    fieldValueUpdated(ev) {
      this.formValid = this.checkValidFileName(ev.target.value, ev.target)
    },
    checkValidFileName(string, target) {
      let check = /[a-z\d_\-]+\.(ini|txt)$/i.test(string)
      if(target) {
        if(check) {
          target.classList.remove('uk-form-danger')
          target.classList.add('uk-form-success')
        } else {
          target.classList.remove('uk-form-success')
          target.classList.add('uk-form-danger')
        }
      }
      return check
    },
    onChangeSource(event) {
      this.sourceLanguage = event.target.options[event.target.options.selectedIndex].text;
    },
    onChangeTarget(event) {
      this.targetLanguage = event.target.options[event.target.options.selectedIndex].text;
    },
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

          localStorage.setItem('availableLanguages', JSON.stringify(languages))
        }
      }).catch((e) => {
        console.log(e)
      })
    },


    async startTranslation(e) {
      e.preventDefault();
      this.socket = io(host, {forceNew: true});
      //websocket events
      this.socket.on('translator-status', this.updateTranslatorStatus);
      this.socket.on('file-created', this.publishDownloadLink);

      // Styling for modal title while running
      document.getElementById('translation-title').classList.add('translation-running');
      UIkit.modal(document.getElementById('translator-modal')).show();

      const url = host + '/translator';

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

      fetch(url, requestOptions).then((response) => response.json())
          .then((data) => {
            if (data && data.success && data.hasOwnProperty('url')) {
              // Delayed visibility of download button (style) (2nd variant / fallback if websockets fail)
              setTimeout(() => {
                this.downloadLink = data.url
              }, 800)
            } else {
              this.closeModal()
              const msg = data.hasOwnProperty('message') && data.message ? data.message : 'Something went wrong. Please try again.'
              this.showError(msg)
            }
          }).catch((e) => {
              this.closeModal()
              console.error(e)
              this.showError('Something went wrong. Please try again.')
      }).finally(() => {
        // Styling for modal title while running
        document.getElementById('translation-title').classList.remove('translation-running');
        //remove all websocket listeners for all events
        this.socket.off()
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
    closeModal() {
      UIkit.modal(document.getElementById('translator-modal')).hide();
      // Reset data for next translation
      this.downloadLink = false;
      this.translatorStatus = {
        rows: 0,
        done: 0
      }

    }
  }
}
</script>
<style>
.translation-running:after {
  overflow: hidden;
  display: inline-block;
  vertical-align: bottom;
  animation: ellipsis steps(20, end) 1200ms infinite;
  content: "...."; /* ascii code for the ellipsis character */
  width: 0;
}

.uk-modal {
  backdrop-filter: blur(10px);
}

.uk-label {
  border-radius: 4px;
}

@keyframes ellipsis {
  to {
    width: 1.25em;
  }
}

@keyframes fade {
  0% {
    transform: translateX(-15px);
    opacity: 0
  }

  50% {
    opacity: 1
  }
  100% {
    opacity: 0;
    transform: translateX(15px);
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
