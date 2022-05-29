<template>
  <div class="translator uk-light">
    <div uk-scrollspy="target: .animate; cls: uk-animation-slide-bottom-small; delay:300">
      <FilenameContainer :name="name"/>
      <div class="translator-setup-container uk-margin">
        <form class="uk-form uk-form-horizontal">

          <div class="uk-margin animate">
            <div class="uk-form-label">
              <span>Source Language</span>
            </div>
            <div class="uk-form-controls">
              <select class="uk-select" name="src-lang" required>
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
              <select class="uk-select" name="trg-lang" required>
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
              <input class="uk-input" name="save-as" :value="name" required />
            </div>
          </div>

          <div class="uk-margin uk-flex uk-flex-right animate">
            <button type="submit" class="uk-button nx-button-success">Start Translation</button>
          </div>

        </form>
      </div>
    </div>
  </div>
</template>

<script>
  import FilenameContainer from '@/components/FilenameContainer.vue'

  export default {
    name: 'TranslatorView',
    components: {
      FilenameContainer
    },
    props: {
      name: {
        type: String,
        required: true
      }
    }
  }
</script>
