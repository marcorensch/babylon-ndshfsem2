<template>
  <div class="settings">
    <form class="uk-form uk-form-horizontal" @submit.prevent="false">
      <div class="uk-margin">
        <h2>Translator Settings</h2>

        <div class="uk-margin">
          <label class="uk-form-label" for="deeplApiKey">Your Deepl API Key</label>
          <div class="uk-form-controls">
            <div class="uk-grid-collapse" uk-grid>
              <div class="uk-width-expand">
                <input name="deeplApiKey" id="deeplApiKey" class="uk-input" v-model="deeplApiKey"/>
              </div>
              <div class="uk-width-auto">
                <div class="uk-button nx-button-tertiary nx-check-button uk-width-small" :class="{'uk-disabled': !deeplApiKey.length || checkOngoing }"
                     @click="checkDeeplApiKey">
                      <span uk-spinner v-if="checkOngoing"></span>
                      <span v-else>Check</span>
                </div>
              </div>
            </div>

            <Transition>
              <div class="uk-margin-small-top" v-if="apiUsage && !apiUsage.status">
                <div class="uk-alert uk-alert-danger">
                  <p><b>Error:</b> Deepl rejected your API Key<br><span class="uk-text-meta uk-text-small">Original Message: <i>{{
                      apiUsage.message
                    }}</i></span>
                  </p>
                </div>
              </div>
            </Transition>

            <div class="uk-margin-small-top">
              <p>
                Learn more: <a href="https://www.deepl.com/api.html" target="_blank">DeepL API</a><br>
                Get your deepl API Key: <a href="https://www.deepl.com/de/pro#developer"
                                           target="_blank">Registration</a><br>
                <strong>Please note: We currently only support the Deepl free API</strong>
              </p>
            </div>
          </div>
        </div>

        <!-- We currently only support deepl FREE plan -->
        <div class="uk-margin uk-hidden">
          <label class="uk-form-label">Deepl API Type</label>
          <div class="uk-form-controls">
            <div class="uk-margin uk-grid-small uk-child-width-auto uk-grid">
              <label><input class="uk-radio" type="radio" name="apiType" value="light" v-model="apiType"> Light</label>
              <label><input class="uk-radio" type="radio" name="apiType" value="pro" v-model="apiType"> Pro</label>
            </div>
          </div>
        </div>
        <!-- We currently only support deepl FREE plan -->

        <div class="uk-margin uk-animation-slide-top-small" v-if="apiUsage.status && apiType === 'light'">
          <label class="uk-form-label"></label>
          <div class="uk-form-controls key-stats-container">
            <div v-if="apiUsage.status">
              <div class="uk-margin-small-top uk-child-width-expand" uk-grid>
                <div>
                  <p>
                    <span class="uk-text-bold">Used:</span> {{ apiUsage.usage.character.count }} characters
                  </p>
                </div>
                <div class="uk-text-right">{{ apiUsage.usage.character.limit }}</div>
              </div>
              <progress class="uk-progress" :value="apiUsage.usage.character.count"
                        :max="apiUsage.usage.character.limit"></progress>
              <p>You have {{ apiUsage.usage.character.limit - apiUsage.usage.character.count }} characters left.</p>
            </div>
          </div>
        </div>

        <!-- Default Languages -->
        <Transition>
          <div v-if="languagesLoaded">
            <div class="uk-margin">
              <label class="uk-form-label" for="sourceLanguage">Default Source Language</label>
              <div class="uk-form-controls">
                <select name="sourceLanguage" id="sourceLanguage" class="uk-select" v-model="sourceLanguage" required>
                  <option value="0">Auto Detect</option>
                  <option v-for="language in languages.srcLng" :key="language.code" :value="language.code">{{ language.name }}</option>
                </select>
              </div>
            </div>
            <div class="uk-margin">
              <label class="uk-form-label" for="targetLanguage">Default Target Language</label>
              <div class="uk-form-controls">
                <select name="targetLanguage" id="targetLanguage" class="uk-select" v-model="targetLanguage" required>
                  <option v-for="language in languages.trgLng" :key="language.code" :value="language.code">{{ language.name }}</option>
                </select>
              </div>
            </div>
          </div>
        </Transition>
        <div class="uk-flex uk-flex-right uk-grid-small">
          <div>
            <button class="uk-button uk-button-default" @click="closeSettings">Close</button>
          </div>
          <div>
            <button class="uk-button nx-button-danger" type="reset" @click="removePresets">Delete Presets</button>
          </div>
          <div :uk-tooltip="saveBtnTooltipText">
            <button class="uk-button nx-button-success" :class="{'uk-disabled':!deeplApiKey || !apiUsage.status}"
                    type="submit" @click="savePresets">Save &amp; Close
            </button>
          </div>
        </div>
      </div>
    </form>

    <div >
      <Notice :showOn="checkOngoing" :position="'bottom'" :message="'Checking your API Key...'"
              uk-scrollspy="cls:uk-animation-slide-bottom; delay:200"/>
    </div>

  </div>
</template>

<script>
import languages from "@/modules/languages.mjs";
import Notice from "@/components/Notice.vue";

export default {
  name: 'SettingsView',
  components: {
    Notice
  },
  props: {},
  data() {
    return {
      languages: [],
      sourceLanguage: localStorage.getItem('sourceLanguage') || '',
      targetLanguage: localStorage.getItem('targetLanguage') || '',
      apiType: localStorage.getItem('apiType') || 'light',
      deeplApiKey: localStorage.getItem('deeplApiKey') || '',
      apiUsage: false,
      languagesLoaded: false,
      checkOngoing: false,
      saveBtnTooltipText: 'Please enter valid API key & do a check first',
    }
  },

  methods: {
    async getSupportedLanguages() {
      // Get supported languages from backend
      fetch('http://localhost:3000/languages', {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': this.deeplApiKey
        }
      }).then((res) => res.json()).then((languages) => {
        this.languages = languages
        this.languagesLoaded = 'srcLng' in languages && 'trgLng' in languages
        if(this.languagesLoaded){
          this.sourceLanguage = this.sourceLanguage ? this.sourceLanguage : languages.srcLng[0].code
          this.targetLanguage = this.targetLanguage ? this.targetLanguage : languages.trgLng[0].code
        }
      }).catch((e) => {
        console.log(e)
      })
    },

    async checkDeeplApiKey() {
      this.apiUsage = false
      if (this.deeplApiKey.length > 0) {
        this.checkOngoing = true;
        // Backend Call to check the API Key
        fetch("http://localhost:3000/usage", {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': this.deeplApiKey
          }
        }).then(res => res.json()).then(res => {
          this.apiUsage = res;
          console.log(res);
          this.setTooltipText();
          // get Languages from deepl
          this.getSupportedLanguages()
        }).catch(err => {
          console.log(err);
        }).finally(() => {
          this.checkOngoing = false;
        });
      }
    },
    savePresets(e) {
      // Save presets to localStorage
      localStorage.setItem('sourceLanguage', this.sourceLanguage);
      localStorage.setItem('targetLanguage', this.targetLanguage);
      localStorage.setItem('apiType', this.apiType);
      localStorage.setItem('deeplApiKey', this.deeplApiKey);

      this.$router.push({name:'Upload'})
    },
    removePresets(e) {
      // Disable save Btn because form is now invalid
      this.apiUsage = false;
      this.setTooltipText()
      // Remove presets from localStorage
      localStorage.removeItem('sourceLanguage');
      localStorage.removeItem('targetLanguage');
      localStorage.removeItem('apiType');
      localStorage.removeItem('deeplApiKey');
    },
    closeSettings(){
      this.$router.push({name:'Upload'})
    },
    setTooltipText() {
      if (this.apiUsage.status) {
        this.saveBtnTooltipText = 'Save';
      } else {
        this.saveBtnTooltipText = 'Please enter valid API key & do a check first';
      }
    }
  },
  mounted() {
    // Get apiKeyStatus if key is available
    this.checkDeeplApiKey();
  }
}
</script>

<style lang="less">
@import "@/assets/styles/variables.less";

.uk-button.uk-disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.nx-check-button {
  border-top-left-radius: 0;
  border-bottom-left-radius: 0;
}

.key-stats-container {
  border: 1px solid @global-color;
  border-radius: @base-border-radius;
  padding: @global-small-gutter;
}

.uk-progress {
  border: 2px solid @global-color;
  border-radius: 2px;
  background: @global-color;

}

.uk-progress::-webkit-progress-value {
  background-color: @global-tertiary-background;
}
</style>
