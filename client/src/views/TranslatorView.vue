<template>
  <div class="translator uk-light">
    <div uk-scrollspy="target: .animate; cls: uk-animation-slide-bottom-small; delay:300">
      <FilenameContainer :name="name"/>
      <div class="translator-setup-container uk-margin">
        <form id="translator-setup" class="uk-form uk-form-horizontal">

          <input name="name" type="text" :value="name">
          <input name="uuid" type="text" :value="uuid">
          <input name="authKey" type="text" :value="authKey">

          <div class="uk-margin animate">
            <div class="uk-form-label">
              <span>Source Language</span>
            </div>
            <div class="uk-form-controls">
              <select class="uk-select" name="srcLng" v-model="srcLng" required>
                <option value="0">Please Select</option>
                <option value="de">German</option>
              </select>
            </div>
          </div>

          <div class="uk-margin animate">
            <div class="uk-form-label">
              <span>Target Language</span>
            </div>
            <div class="uk-form-controls">
              <select class="uk-select" name="trgLng" v-model="trgLng" required>
                <option value="0">Please Select</option>
                <option value="de">German</option>
              </select>
            </div>
          </div>

          <div class="uk-margin animate">
            <div class="uk-form-label">
              <span>Save as Name</span>
            </div>
            <div class="uk-form-controls">
              <input class="uk-input" name="saveAs" v-model="name" required />
            </div>
          </div>

          <div class="uk-margin uk-flex uk-flex-right animate">
            <button type="submit" class="uk-button nx-button-success" @click="startTranslation">Start Translation</button>
          </div>

        </form>
      </div>
    </div>
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
        authKey: '6d7dc944-6931-db59-b9d3-e5d3a24e44b3:fx',
        srcLng: '',
        trgLng: '',
        saveAs: ''
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
    },
    methods: {
      startTranslation(e) {
        e.preventDefault();
        let data = {
          name: this.name,
          uuid: this.uuid,
          authKey: this.authKey,
          srcLng: this.srcLng,
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
        });
      }
    }
  }
</script>
