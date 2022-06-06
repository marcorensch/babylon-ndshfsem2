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
  </div>
</template>

<script>
  import FilenameContainer from '@/components/FilenameContainer.vue'
  import navigationHelper from "@/modules/navigationHelper.mjs";

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
      startTranslation(e) {
        e.preventDefault();
        let data = {
          name: this.name,
          uuid: this.uuid,
          authKey: this.authKey,
          srcLng: this.srcLng === 'auto' ? null : this.srcLng, // Added support for auto detection
          trgLng: this.trgLng,
          saveAs: this.saveAs
        };

        console.log(data);
        const url = 'http://localhost:3000/translator';

        const requestOptions = {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          mode: "cors",
          body: JSON.stringify(data)
        };

        fetch(url, requestOptions).then(response => response.json())
            .catch(error => {
              console.error(error);
            }).then((data) => {
          console.log(data)
          this.downloadLink = data.url
        });
      }
    }
  }
</script>
