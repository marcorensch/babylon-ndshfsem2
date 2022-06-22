<template>
  <div class="checker">
    <div>
      <FilenameContainer :name="name"/>
      <div class="uk-margin-top">
        <ul uk-accordion>
          <li>
            <a class="uk-accordion-title" href="#"><font-awesome-icon icon="circle-question" /> Show valid file content example</a>
            <div class="uk-accordion-content uk-dark">
              <p><code style="color:#333">MY_KEY="My Value"<br>MY_HTML="{{ htmlExample }}"<br>;This is a comment</code>
              </p>
            </div>
          </li>
        </ul>
        <span>See <a href="https://docs.joomla.org/Creating_a_language_definition_file" target="_blank"
                     title="Joomla Docs">Joomla! Docs</a> for more Information about Language Files for Joomla! and it's structure.</span>
      </div>
      <div class="uk-margin-large">
        <transition mode="out-in">
          <div v-if="results===null">
            <div class="uk-margin">
              <div class="uk-grid-small uk-child-width-1-1 uk-child-width-1-3@s uk-flex-center" uk-grid>
                <Button :btnLabel="'Back'" :btnIcon="'rotate-left'" :buttonCls="'nx-button-warning'"
                        @button-clicked="switchToUpload"/>
                <Button :btnLabel="'Start Checks'" :btnIcon="'check'" :buttonCls="'nx-button-success'"
                        @button-clicked="startChecks"/>
                <Button :btnLabel="'Skip Checks & Translate'" :btnIcon="'forward'" :buttonCls="'nx-button-tertiary'"
                        @button-clicked="switchToTranslation"/>
              </div>
            </div>
          </div>
          <div v-else-if="results.length > 0" class="uk-margin-large-top">
            <div v-if="rowsCount>4000">
              <div class="uk-alert uk-alert-warning" uk-alert>
                <p>
                  <strong>Warning: Your file is quite large, it contains {{ rowsCount }} Rows.</strong><br>
                  <span>The translation process may took long time and could fail. It is recommended to translate no more than <b>4000</b> lines.</span>
                </p>
              </div>
            </div>
            <h2 class="sub-title">Checker Results</h2>
            <div>

              <div class="uk-position-relative uk-grid-small uk-padding-small uk-padding-remove-vertical" uk-grid>
                <div class="uk-width-small">Line</div>
                <div class="uk-width-small">Type</div>
                <div>Message</div>
              </div>

              <ul class="uk-list uk-list-striped nx-list-hover">
                <li v-for="(res,index) in results" :key="index">
                  <div class="uk-position-relative uk-grid-small" uk-grid>
                    <div class="uk-width-small">
                      <div>{{ res.rowNum }}</div>
                    </div>
                    <div class="uk-width-small">
                      <span class="uk-label uk-text-uppercase" :class="'check-type-label-'+res.check.type">{{ res.check.type }}</span>
                    </div>
                    <div class="uk-width-expand">
                      <span>{{ res.check.message }}</span>
                      <CheckerDetailModal :res="res" :index="index"/>
                    </div>
                  </div>
                </li>
              </ul>

            </div>
            <div class="uk-margin">
              <div class="uk-grid-small uk-child-width-1-1 uk-child-width-1-3@s uk-flex-center" uk-grid>
                <Button :btnLabel="'Check again / another File'" :btnIcon="'upload'" :buttonCls="'uk-button-default'"
                        @button-clicked="switchToUpload"/>
                <Button :btnLabel="'Start Translation'" :btnIcon="'language'" :buttonCls="'nx-button-tertiary'"
                        @button-clicked="switchToTranslation"/>
              </div>
            </div>
          </div>
          <div v-else>
            <div>
              <div class="uk-text-center uk-margin-large-top uk-margin-large-bottom uk-text-success" style="font-size:30px">
                <div class="">
                  <font-awesome-icon icon="circle-check" style="font-size: 80px"/>
                </div>
                <div>
                  No Errors found
                </div>
              </div>
              <div class="uk-margin">
                <div class="uk-grid-small uk-child-width-1-1 uk-child-width-1-3@s uk-flex-center" uk-grid>
                  <Button :btnLabel="'Check again / another File'" :btnIcon="'upload'"
                          :buttonCls="'uk-button-default'" @button-clicked="switchToUpload"/>
                  <Button :btnLabel="'Start Translation'" :btnIcon="'language'" :buttonCls="'nx-button-tertiary'"
                          @button-clicked="switchToTranslation"/>
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
      default: ''
    },
    name: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      results: null,
      rowsCount: 0,
      htmlExample: '<div class=\\"my-class\\">My HTML</div>'
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
        this.results = data.checkerResults;
        this.rowsCount = data.count;
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
        replace: true,
      });
    },
  }
}
</script>
<style lang="less" scoped>
@import '@/assets/styles/buttons.less';

.uk-label {
  border-radius: 3px;
  min-width: 50px;
  border-left-width: 3px;
  border-left-style: solid;
  text-align: center;
}
ul.nx-list-hover li{
  transition: all 0.2s ease-in-out;
}
ul.nx-list-hover li:hover{
  background-color: rgba(255, 255, 255, 0.41) !important;
  transition: all 0.2s ease-in-out;
}

.check-type-label-key {
  border-left-color: #2eeca4;
}

.check-type-label-value {
  border-left-color: #b907ff;
}

.check-type-label-line {
  border-left-color: #07c5ff;
}

.v-enter-active,
.v-leave-active {
  transition: opacity 0.5s ease;
}

.v-enter-from,
.v-leave-to {
  opacity: 0;
}

</style>
