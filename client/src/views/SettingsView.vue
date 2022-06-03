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
            <textarea name="deeplApiKey" id="deeplApiKey" class="uk-textarea" v-model="deeplApiKey">

            </textarea>
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
          <label class="uk-form-label">Check API Key</label>
          <div class="uk-form-controls">
            <p>you can check the status of your API Key by clicking the button below</p>
            <button class="uk-button uk-button-primary" :class="{'uk-disabled': !deeplApiKey.length }" @click="checkDeeplApiKey">Check API Key</button>
          </div>
        </div>
      </div>
      <div class="uk-flex uk-flex-right uk-grid-small">
        <div>
          <button class="uk-button nx-button-danger" type="reset">Cancel</button>
        </div>
        <div>
          <button class="uk-button nx-button-success" type="submit">Save &amp; Close</button>
        </div>
      </div>
    </form>
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
      sourceLanguage: 'en',
      targetLanguage: 'de',
      deeplApiKey: ''
    }
  },
  methods: {
    async getSupportedLanguages(){
      // Get suppqorted languages from backend
    },
    async checkDeeplApiKey(e) {
      e.preventDefault();
      if (this.deeplApiKey.length > 0) {
        // Backend Call to check the API Key
      }
    }
  }
}
</script>

<style lang="less">
.uk-form-label {

}
</style>
