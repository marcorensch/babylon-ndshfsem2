<template>
  <div class="checker">
    <div>
      <FilenameContainer :name="name"/>
      <div class="uk-margin">
        <div class="uk-grid-small uk-child-width-1-1 uk-child-width-1-3@s uk-flex-center" uk-grid>
          <div>
            <div class="uk-width-1-1">
              <div class="uk-button nx-button-warning uk-width-1-1" @click="skipChecksClicked">
                <font-awesome-icon class="icon" icon="forward"/>
                <span class="uk-margin-small-left">Skip Checks</span>
              </div>
            </div>
          </div>

          <div class="uk-flex-first@s">
            <div class="uk-width-1-1">
              <div class="uk-button nx-button-success uk-width-1-1" @click="startChecksClicked">
                <font-awesome-icon class="icon" icon="play"/>
                <span class="uk-margin-small-left">Start Checks</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-if="results.length" class="uk-margin-large-top">
        <h2 class="sub-title animate">Results</h2>
      </div>
    </div>


  </div>
</template>
<script>
import navigationHelper from "@/modules/navigationHelper.mjs";
import FilenameContainer from "@/components/FilenameContainer";
import {host} from "@/modules/defaults.mjs"

export default {
  name: 'CheckerView',
  components: {FilenameContainer},
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
      results: []
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
    console.log('CheckerView mounted')
    console.log('CheckerView data', this.uuid, this.name)
    this.results.push({type: 'KEY', message: 'An error', detail: 'Detail text'})
  },
  methods: {
    startChecksClicked() {
      console.log('startChecksClicked')

      let url = host+'/checker';
      const data = {
        uuid: this.uuid,
        name: this.name
      };
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
        console.log('response from checker:')
        console.log(data)
      });
    },
    skipChecksClicked() {
      console.log('skip checks clicked');
      // Set active navbar link
      navigationHelper.setActiveNavbarLink(document.getElementById('translator-link'));
      this.$router.push({
        name: 'Translator',
        params: {
          uuid: this.uuid,
          name: this.name
        },
      });
    }
  }
}
</script>
<style lang="less">
@import './src/assets/styles/buttons.less';

</style>