<template>
  <div class="uk-margin">
    <div class="uk-grid-small uk-child-width-1-1 uk-child-width-1-3@s uk-flex-center" uk-grid>

      <div v-if="startChecksBtn">
        <div class="uk-width-1-1">
          <div class="uk-button uk-width-1-1" :class="startChecksBtnCls" @click="$emit('check-clicked')">
            <font-awesome-icon class="icon" icon="play"/>
            <span class="uk-margin-small-left">{{startChecksBtnLbl}}</span>
          </div>
        </div>
      </div>

      <div v-if="uploadRoute">
        <div class="uk-width-1-1">
          <div class="uk-button uk-width-1-1" :class="uploadBtnCls" @click="switchToUpload">
            <font-awesome-icon class="icon" icon="upload"/>
            <span class="uk-margin-small-left">{{uploadRouteLabel}}</span>
          </div>
        </div>
      </div>

      <div v-if="translatorRoute">
        <div class="uk-width-1-1">
          <div class="uk-button uk-width-1-1" :class="translatorBtnCls" @click="switchToTranslation">
            <font-awesome-icon class="icon" icon="language"/>
            <span class="uk-margin-small-left">{{translatorRouteLabel}}</span>
          </div>
        </div>
      </div>


    </div>
  </div>
</template>

<script>
import navigationHelper from "@/modules/navigationHelper.mjs";

export default {
  name: "CheckerNavButtons",
  emits: ["check-clicked"],
  props:{
    uuid: {
      type: String,
      required: true
    },
    name: {
      type: String,
      required: true
    },
    uploadRoute: {
      type: Boolean,
      required: false,
      default: false
    },
    uploadRouteLabel: {
      type: String,
      required: false,
      default: "Check another File"
    },
    uploadBtnCls: {
      type: String,
      required: false,
      default: "uk-button-secondary"
    },
    translatorRoute: {
      type: Boolean,
      required: false,
      default: false
    },
    translatorRouteLabel: {
      type: String,
      required: false,
      default: "Start Translation"
    },
    translatorBtnCls: {
      type: String,
      required: false,
      default: "nx-button-success"
    },
    startChecksBtn: {
      type: Boolean,
      required: false,
      default: false
    },
    startChecksBtnLbl: {
      type: String,
      required: false,
      default: "Start Checks"
    },
    startChecksBtnCls: {
      type: String,
      required: false,
      default: "nx-button-success"
    }
  },
  methods:{
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
  },
}
</script>

<style scoped>

</style>