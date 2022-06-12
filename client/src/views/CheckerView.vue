<template>
  <div class="checker">
    <div>
      <FilenameContainer :name="name"/>

      <div class="uk-margin-large">
        <div v-if="results===null">
          <div class="uk-margin">
            <div class="uk-grid-small uk-child-width-1-1 uk-child-width-1-3@s uk-flex-center" uk-grid>
              <div>
                <div class="uk-width-1-1">
                  <div class="uk-button nx-button-warning uk-width-1-1" @click="switchToTranslation">
                    <font-awesome-icon class="icon" icon="forward"/>
                    <span class="uk-margin-small-left">Skip Checks</span>
                  </div>
                </div>
              </div>

              <div class="uk-flex-first@s">
                <div class="uk-width-1-1">
                  <div class="uk-button nx-button-success uk-width-1-1" @click="startChecks">
                    <font-awesome-icon class="icon" icon="play"/>
                    <span class="uk-margin-small-left">Start Checks</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div v-else-if="results.length > 0" class="uk-margin-large-top">
          <h2 class="sub-title animate">Results</h2>
          <table class="uk-table uk-table-striped uk-table-hover">
            <thead>
              <tr>
                <th class="uk-table-shrink">Line</th>
                <th class="uk-table-shrink">Type</th>
                <th>Message</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="res in results">
                <td>{{res.rowNum}}</td>
                <td></td>
                <td>{{res.check.message}}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div v-else>
          <div class="uk-margin-large-top">
            <div class="uk-text-lead uk-text-center">
              No Errors found
            </div>
            <div class="uk-margin">
              <div class="uk-grid-small uk-child-width-1-1 uk-child-width-1-3@s uk-flex-center" uk-grid>
                <div>
                  <div class="uk-width-1-1">
                    <div class="uk-button nx-button-success uk-width-1-1" @click="switchToTranslation">
                      <font-awesome-icon class="icon" icon="language"/>
                      <span class="uk-margin-small-left">Start Translation</span>
                    </div>
                  </div>
                </div>

                <div class="uk-flex-first@s">
                  <div class="uk-width-1-1">
                    <div class="uk-button uk-button-secondary uk-width-1-1" @click="switchToUpload">
                      <font-awesome-icon class="icon" icon="play"/>
                      <span class="uk-margin-small-left">Check another File</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
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
      results: null
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
  },
  methods: {
    startChecks() {
      console.log('startChecksClicked')

      let url = host + '/checker';
      const requestOptions = {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "uuid": this.uuid,
          "name": this.name
        },
        mode: "cors",
      };
      fetch(url, requestOptions).then(response => response.json())
          .catch(error => {
            console.error(error);
          }).then((data) => {
        console.log(data)
        this.results = data
      });
    },
    switchToTranslation() {
      // Set active navbar link
      navigationHelper.setActiveNavbarLink(document.getElementById('translator-link'));
      this.$router.push({
        name: 'Translator',
        params: {
          uuid: this.uuid,
          name: this.name
        },
      });
    },
    switchToUpload() {
      // Set active navbar link
      navigationHelper.setActiveNavbarLink(document.getElementById('upload-link'));
      this.$router.push({
        name: 'Upload',
        replace: true
      });
    },
  }
}
</script>
<style lang="less">
@import './src/assets/styles/buttons.less';

</style>
