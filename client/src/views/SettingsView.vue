<template>
<div class="settings">
  <form class="uk-form uk-form-horizontal">
    <div class="uk-margin">
      <h2>Translator Settings</h2>

      <div class="uk-margin">
        <label class="uk-form-label" for="sourceLanguage">Default Source Language</label>
        <div class="uk-form-controls">
          <select name="sourceLanguage" id="sourceLanguage" class="uk-select" v-model="sourceLanguage">
            <option value="0">Auto Detect</option>
            <option v-for="language in languages" :value="language.code">{{ language.name }}</option>
          </select>
        </div>
      </div>

      <div class="uk-margin">
        <label class="uk-form-label" for="targetLanguage">Default Target Language</label>
        <div class="uk-form-controls">
          <select name="targetLanguage" id="targetLanguage" class="uk-select" v-model="targetLanguage">
            <option v-for="language in languages" :value="language.code">{{ language.name }}</option>
          </select>
        </div>
      </div>

      <div class="uk-margin">
        <label class="uk-form-label" for="deeplApiKey">Your Deepl API Key</label>
        <div class="uk-form-controls">
          <div class="uk-grid-collapse" uk-grid>
            <div class="uk-width-expand">
              <input name="deeplApiKey" id="deeplApiKey" class="uk-input" v-model="deeplApiKey"/>
            </div>
            <div class="uk-width-auto">
              <div class="uk-button uk-button-primary" :class="{'uk-disabled': !deeplApiKey.length }" @click="checkDeeplApiKey">Check</div>
            </div>
          </div>

          <div class="uk-margin-small-top" v-if="apiUsage && !apiUsage.status">
            <div class="uk-alert uk-alert-danger">
              <p><b>Error</b> Check Authentication Key</p>
            </div>
          </div>
          <div class="uk-margin-small-top">
            <p>
              Learn more: <a href="https://www.deepl.com/api.html" target="_blank">DeepL API</a><br>
              Get your deepl API Key: <a href="https://www.deepl.com/de/pro#developer"
                                         target="_blank">Registration</a>
            </p>
          </div>
        </div>
      </div>
      <div class="uk-margin">
        <label class="uk-form-label">Deepl API Type</label>
        <div class="uk-form-controls">
          <div class="uk-margin uk-grid-small uk-child-width-auto uk-grid">
            <label><input class="uk-radio" type="radio" name="apiType" value="light" v-model="apiType"> Light</label>
            <label><input class="uk-radio" type="radio" name="apiType" value="pro" v-model="apiType"> Pro</label>
          </div>
        </div>
      </div>
      <div class="uk-margin uk-animation-slide-top-small" v-if="apiType === 'light'">
        <label class="uk-form-label"></label>
        <div class="uk-form-controls" v-if="apiUsage">
          <div v-if="apiUsage.status">
            <div class="uk-margin-small-top uk-child-width-expand" uk-grid>
              <div>
                <p>
                  <span class="uk-text-bold">Used:</span> {{ apiUsage.usage.character.count }} characters
                </p>
              </div>
              <div class="uk-text-right">{{ apiUsage.usage.character.limit }}</div>
            </div>
            <progress class="uk-progress" :value="apiUsage.usage.character.count" :max="apiUsage.usage.character.limit"></progress>
            <p>You have {{ apiUsage.usage.character.limit - apiUsage.usage.character.count }} characters left.</p>
          </div>
        </div>
      </div>
    </div>
    <div class="uk-flex uk-flex-right uk-grid-small">
      <div>
        <button class="uk-button nx-button-danger" type="reset">Cancel</button>
      </div>
      <div>
        <button class="uk-button nx-button-success" type="submit" @click="savePresets">Save &amp; Close</button>
      </div>
    </div>
  </form>

  <div id="loader" class="uk-position-cover nx-overlay uk-hidden uk-animation-fade uk-flex uk-flex-middle uk-flex-center">
    <div>
      <div uk-spinner="ratio:5"></div>
      <div class="uk-margin-top" uk-scrollspy="cls:uk-animation-slide-bottom-medium; delay:500; repeat:true">Checking your API Key...</div>
    </div>
  </div>

</div>
</template>

<script>
  import languages from "@/modules/languages.mjs";

  export default {
    name: 'SettingsView',
    components: {},
    props: {},
    data() {
      return {
        languages: languages,
        sourceLanguage: localStorage.getItem('sourceLanguage') || 'en',
        targetLanguage: localStorage.getItem('targetLanguage') || 'en',
        apiType: localStorage.getItem('apiType') || 'light',
        deeplApiKey: localStorage.getItem('deeplApiKey') || '',
        apiUsage: false,
      }
    },
    methods: {
      async getSupportedLanguages() {
        // Get suppqorted languages from backend
      },
      async checkDeeplApiKey() {
        this.apiUsage = false;
        if (this.deeplApiKey.length > 0) {
          document.getElementById('loader').classList.remove('uk-hidden');
          document.getElementById('loader').classList.add('uk-animation-fade');

          // Backend Call to check the API Key
          fetch("http://localhost:3000/usage", {
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
              'Authorization': this.deeplApiKey
            }
          }).then(res => res.json()).then(res => {
            this.apiUsage = res;
            this.hideLoader('loader')
            console.log(res);
          }).catch(err => {
            console.log(err);
            this.hideLoader('loader')
          })
        }
      },
      /**
       * @description: Hides the loader animated
       * @param {string} id - The id of the container to hide
       */
      hideLoader(id){
        console.log(id);
        const itm = document.getElementById(id);
        itm.classList.add('uk-animation-fade','uk-animation-reverse');
        // TimeOut caller to fulfill animation
        setTimeout(() => {
          itm.classList.remove('uk-animation-reverse');
          itm.classList.add('uk-hidden');
        }, 500);
      },
      savePresets(e) {
        e.preventDefault();
        // Save presets to localStorage
        localStorage.setItem('sourceLanguage', this.sourceLanguage);
        localStorage.setItem('targetLanguage', this.targetLanguage);
        localStorage.setItem('apiType', this.apiType);
        localStorage.setItem('deeplApiKey', this.deeplApiKey);
      }
    },
    mounted() {
      // Get supported languages from backend

      // Get apiKeyStatus if key is available
      this.checkDeeplApiKey();
    }
  }
</script>

<style lang="less">
  .uk-form-label {

  }

  .uk-progress {
    border: 2px solid;
    border-radius: 2px;
  }

  .nx-overlay{
    z-index: 500;
    background-color:rgba(0,0,0, .2);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
  }
</style>
