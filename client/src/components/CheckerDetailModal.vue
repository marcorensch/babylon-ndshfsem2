<template>
<div>
  <a :href="'#modal-'+index" uk-toggle class="uk-position-cover"></a>
  <div :id="'modal-'+index" class="uk-flex-top" uk-modal>
    <div class="uk-modal-dialog uk-margin-auto-vertical">
      <button class="uk-modal-close-default" type="button" uk-close></button>
      <div class="uk-modal-header">
        <h3 class="uk-modal-title uk-margin-remove-bottom"><font-awesome-icon icon="language" /> Error Detail</h3>
        <p class="uk-text-bold uk-margin-remove-top">{{ res.check.message}}</p>
      </div>
      <div class="uk-modal-body">
        <span class="uk-text-large"><font-awesome-icon icon="quote-left" /> String</span>
        <pre class="">{{ res.string }}</pre>
        <span class="uk-text-large"><font-awesome-icon icon="circle-info" /> Description</span>
        <p v-html="res.check.help"></p>
        <span class="uk-text-large"><font-awesome-icon icon="location-crosshairs" /> Where</span>
        <p>Error was found in line {{ res.rowNum }}.</p>
      </div>
      <div class="uk-modal-footer uk-text-right">
        <button class="uk-button nx-button-success uk-modal-close" type="button">Ok, Thanks!</button>
      </div>
    </div>
  </div>
</div>
</template>

<script>
export default {
  name: "CheckerDetailModal",
  props: {
    res: {
      type: Object,
      required: true
    },
    index: {
      type: Number,
      required: true
    }
  }
}
</script>