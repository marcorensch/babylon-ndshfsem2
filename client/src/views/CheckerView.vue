<template>
  <div class="checker">
    <div>
      <FilenameContainer :name="name"/>

      <div class="uk-margin-large">
        <transition mode="out-in">
          <div v-if="results===null">
            <div class="uk-margin">
              <div class="uk-grid-small uk-child-width-1-1 uk-child-width-1-3@s uk-flex-center" uk-grid>
                <Button :btnLabel="'Back'" :btnIcon="'rotate-left'" :buttonCls="'nx-button-warning'" @button-clicked="switchToUpload" />
                <Button :btnLabel="'Start Checks'" :btnIcon="'check'" :buttonCls="'nx-button-success'" @button-clicked="startChecks" />
                <Button :btnLabel="'Skip Checks & Translate'" :btnIcon="'forward'" :buttonCls="'nx-button-tertiary'" @button-clicked="switchToTranslation" />
              </div>
            </div>
          </div>
          <div v-else-if="results.length > 0" class="uk-margin-large-top">
            <h2 class="sub-title animate">Results</h2>
            <table class="uk-table uk-table-striped uk-table-hover uk-table-middle">
              <thead>
              <tr>
                <th class="uk-table-shrink">Line</th>
                <th class="uk-table-shrink">Type</th>
                <th>Message</th>
              </tr>
              </thead>
              <tbody>
              <tr v-for="(res,index) in results" class="uk-position-relative">
                <td>{{ res.rowNum }}</td>
                <td><span class="uk-label">{{res.check.type}}</span></td>
                <td>
                  <span>{{ res.check.message }}</span>
                  <CheckerDetailModal :res="res" :index="index" />
                </td>
              </tr>
              </tbody>
            </table>
            <div class="uk-margin">
              <div class="uk-grid-small uk-child-width-1-1 uk-child-width-1-3@s uk-flex-center" uk-grid>
                <Button :btnLabel="'Check another File'" :btnIcon="'upload'" :buttonCls="'uk-button-default'" @button-clicked="switchToUpload" />
                <Button :btnLabel="'Start Translation'" :btnIcon="'language'" :buttonCls="'nx-button-tertiary'" @button-clicked="switchToTranslation" />
              </div>
            </div>
          </div>
          <div v-else>
            <div class="uk-margin-large-top">
              <div class="uk-text-lead uk-text-center">
                No Errors found
              </div>
              <div class="uk-margin">
                <div class="uk-grid-small uk-child-width-1-1 uk-child-width-1-3@s uk-flex-center" uk-grid>
                  <Button :btnLabel="'Check another File'" :btnIcon="'upload'" :buttonCls="'nx-button-secondary'" @button-clicked="switchToUpload" />
                  <Button :btnLabel="'Start Translation'" :btnIcon="'language'" :buttonCls="'nx-button-tertiary'" @button-clicked="switchToTranslation" />
                </div>
              </div>
            </div>
          </div>
        </transition>
      </div>
    </div>
  </div>
</template>
<script>
import navigationHelper from "@/modules/navigationHelper.mjs";
import FilenameContainer from "@/components/FilenameContainer";
import Button from "@/components/Button";
import CheckerDetailModal from "@/components/CheckerDetailModal";
import {host} from "@/modules/defaults.mjs"

export default {
  name: 'CheckerView',
  components: {FilenameContainer, Button, CheckerDetailModal},
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
  },
  methods: {
    startChecks() {
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

.v-enter-active,
.v-leave-active {
  transition: opacity 0.5s ease;
}

.v-enter-from,
.v-leave-to {
  opacity: 0;
}

</style>
