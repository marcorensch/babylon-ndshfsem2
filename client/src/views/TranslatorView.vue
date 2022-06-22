<template>
  <div class="translator uk-light">
    <div>
      <FilenameContainer :name="name"/>
      <div class="translator-setup-container uk-margin">
        <form id="translator-setup" class="uk-form uk-form-horizontal">
          <div class="uk-hidden">
            <input name="name" type="text" :value="name">
            <input name="uuid" type="text" :value="uuid">
            <input name="authKey" type="text" :value="authKey">
          </div>

          <div class="uk-margin" v-if="languages.srcLng">
            <div class="uk-form-label">
              <span>Source Language</span>
            </div>
            <div class="uk-form-controls">
              <select class="uk-select" id="srcLng" name="srcLng" @change="onChangeSource($event)" v-model="srcLng" required>
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
              <select class="uk-select" id="trgLng" name="trgLng" @change="onChangeTarget($event)" v-model="trgLng" required>
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
                <div v-if="formValid===false">
                  <div class="uk-margin-small-top uk-alert uk-alert-warning uk-text-small uk-padding-small">Please enter
                    a valid filename, allowed are only characters a-z, numbers aswell as _ or -. Spaces are not allowed.
                    Filename must contain a supported file extension (ini / txt).<br> e.g. filename.ini or filename.txt
                  </div>
                </div>
              </Transition>
            </div>
          </div>
          <div class="uk-margin uk-flex uk-flex-right uk-grid-small ">
            <div v-if="firstTime">
              <Button :buttonCls="'nx-button-warning'" :btnIcon="'rotate-left'" :btnLabel="'Cancel'" @click="switchToUpload"/>
            </div>
            <div v-else>
              <Button :buttonCls="'nx-button-tertiary'" :btnIcon="'file'" :btnLabel="'Load different file'" @click="switchToUpload"/>
            </div>
            <div :uk-tooltip="tootipMessage">
              <Button :buttonCls="'nx-button-success'" :btnIcon="'language'" :disabled="!authKey || formValid===false || keyUsedUp" :btnLabel="firstTime ? 'Start Translation':'Do another Translation'" @click="startTranslation"/>
            </div>
          </div>
        </form>
      </div>
    </div>
    <div  class="translator-modal uk-flex-top uk-modal-container" uk-modal="bg-close:false">
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
              <span>Rows:</span>&nbsp;<span>{{ translationRows }}</span>
            </div>
            <div>
              <span>Done:</span>&nbsp;<span>{{ translationsDone }}</span>
            </div>
          </div>

          <div class="uk-margin-small">
            <progress class="uk-progress" :value="translationsDone" :max="translationRows"></progress>
          </div>
          <div class="uk-margin-small uk-height-small uk-flex uk-flex-middle uk-flex-center uk-grid-small">
            <div>
              <div v-if="!downloadLink" class="uk-button nx-button-warning uk-modal-close">Cancel</div>
              <div v-else class="uk-button uk-button-default uk-modal-close">Close</div>
            </div>
            <transition name="fade">
              <div>
                <a :href="downloadLink" target="_self" class="uk-button uk-button-primary"
                   :class="{'uk-disabled' : !downloadLink && (translationsDone !== translationRows)}"
                   title="Download translated file" download @click="modalClose">
                  <font-awesome-icon icon="download"/>
                  Download</a>
              </div>
            </transition>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import UIkit from "uikit";
import FilenameContainer from '@/components/FilenameContainer.vue'
import navigationHelper from "@/modules/navigationHelper.mjs"
import {host} from "@/modules/defaults.mjs"
import io from 'socket.io-client';
import Button from "@/components/Button";

export default {
  name: 'TranslatorView',
  components: {
    Button,
    FilenameContainer
  },
  props: {
    uuid: {
      type: String,
      default: ''
    },
    name: {
      type: String,
      default: ''
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
      downloadLink: '',
      tootipMessage: '',
      socket: null,
      translationRows: 0,
      translationsDone: 0,
      firstTime: true,
      publishDownloadLink: (data) => {
        this.downloadLink = data.url
      },
      updateTranslatorStatus: (data) => {
        console.log(data)
        this.translationRows = data.rows
        this.translationsDone = data.done
      },
      formValid: null,
      apiUsage:false,
      keyUsedUp:false,
    }
  },
  updated() {
    if (this.authKey && this.languages.srcLng && this.languages.trgLng) {
      // Set current selected languages
      let srclngSelect = document.getElementById('srcLng');
      let trglngSelect = document.getElementById('trgLng');
      this.sourceLanguage = srclngSelect.options[srclngSelect.options.selectedIndex].text;
      this.targetLanguage = trglngSelect.options[trglngSelect.options.selectedIndex].text;
    }
  },
  mounted() {
    // Fixed a bug where UIkit.modal & Vue.js not working together when switching views
    let modals = document.querySelectorAll('body > .translator-modal');
    if(modals.length > 0) {
      for (const modalElement of modals) {
        modalElement.parentNode.removeChild(modalElement);
      }
    }

    this.resetTranslationStatus(true)
    // handle routing exception ==> redirect to home if no uuid is given
    if (!this.uuid) {
      navigationHelper.setActiveNavbarLink(document.getElementById('upload-link'));
      this.$router.push({
        name: 'Upload',
        replace: true
      });
    }
    if (this.authKey === null || this.authKey === '') {
      this.showToast('You have to enter a Deepl API key in the settings to use this feature.', true, 'warning')
    }

    // Get Key Status
    this.checkDeeplApiKey()

    // Languages
    // Set predefined languages from settings
    this.srcLng = localStorage.getItem('sourceLanguage') !== null ? localStorage.getItem('sourceLanguage') : 'auto'
    this.trgLng = localStorage.getItem('targetLanguage') !== null ? localStorage.getItem('targetLanguage') : ''

    if (localStorage.getItem('availableLanguages') !== null) {
      this.languages = JSON.parse(localStorage.getItem('availableLanguages'))
    } else {
      this.getSupportedLanguages()
    }
    // check valid save as filename on init
    let saveAsField = document.getElementById('saveAs');
    this.formValid = this.checkValidFileName(saveAsField.value, saveAsField)
  },
  methods: {
    // Reset download link & Stats
    resetTranslationStatus(initial) {
      this.translationRows= 0
      this.translationsDone= 0
      this.downloadLink = '';
      this.firstTime = initial;
    },
    fieldValueUpdated(ev) {
      this.formValid = this.checkValidFileName(ev.target.value, ev.target)
    },
    checkValidFileName(string, target) {
      let check = /[a-z\d_\-]+\.(ini|txt)$/i.test(string)
      if (target) {
        if (check) {
          target.classList.remove('uk-form-danger')
        } else {
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
    async checkDeeplApiKey() {
      this.apiUsage = false
      if (this.authKey && this.authKey.length > 0) {
        // Backend Call to check the API Key
        fetch(host+"/usage", {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': this.authKey.trim()
          }
        }).then(res => res.json()).then(res => {
          this.apiUsage = res;
          if(res.hasOwnProperty("usage")){
            let count = res.usage.character.count;
            let limit = res.usage.character.limit;
            let percent = Math.round((count / limit) * 100)
            if(percent > 80 && percent < 90){
              this.showToast('You have used '+percent+'% of your API key quota. Please consider to increase your quota or switch your key.',true,'warning')
            }else if(percent >= 90 && percent <= 99){
              this.showToast('You have used '+percent+'% of your API key quota. Please consider to switch your key.',true, 'error')
            }else if(percent >= 100){
              this.showToast('You have used up your API key quota. Please change your key in Settings.',false, 'error')
              this.keyUsedUp = true
            }
          }
        }).catch(err => {
          console.error(err);
          this.showToast('Error: No connection to backend')
        }).finally(() => {
        });
      }
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
        console.error(e)
      })
    },
    async startTranslation() {
      if(!this.authKey || this.formValid===false || this.keyUsedUp ){
        return
      }
      // Reset download link & Stats
      this.resetTranslationStatus(false)
      this.socket = io(host, {forceNew: true});
      //websocket events
      this.socket.on('translator-status', this.updateTranslatorStatus);
      this.socket.on('file-created', this.publishDownloadLink);
      this.socket.on('translator-error',(data)=>{
        console.error(data)
        this.showToast('Translation error, please check your Deepl API key & Key Limits.',false,'error')
      })
      // Styling for modal title while running
      document.getElementById('translation-title').classList.add('translation-running');
      UIkit.modal('.translator-modal').show();
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
      }
      fetch(url, requestOptions).then((response) => response.json())
          .then((data) => {
            if (data && data.success && data.hasOwnProperty('url')) {
              // Delayed visibility of download button (style) (2nd variant / fallback if websockets fail)
              setTimeout(() => {
                this.downloadLink = data.url
              }, 800)
            } else {
              const msg = data.hasOwnProperty('message') && data.message ? data.message : 'Something went wrong. Please try again.'
              this.showToast(msg)
            }
          }).catch((e) => {
        console.error(e)
        this.showToast('Something went wrong. Please try again.')
      }).finally(() => {
        // Styling for modal title while running
        document.getElementById('translation-title').classList.remove('translation-running');
        //remove all websocket listeners for all events
        this.socket.off()
      })
    },
    showToast(message, dismissible = true, type = 'error') {
      let duration = dismissible ? 0 : 10000
      this.$toast.open({
        message: message,
        type: type,
        duration: duration,
        dismissible: dismissible
      })
    },
    switchToUpload() {
      // Set active navbar link
      navigationHelper.setActiveNavbarLink(document.getElementById('upload-link'));
      this.$router.push({
        name: 'Upload',
        replace: false
      });
    },
    modalClose() {
      UIkit.modal('.translator-modal').hide();
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
