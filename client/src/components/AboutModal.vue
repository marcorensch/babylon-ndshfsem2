<template>
<div>
  <a href="#about-modal" uk-toggle>About</a>
  <div id="about-modal" class="uk-flex-top" uk-modal>
    <div class="uk-modal-dialog uk-margin-auto-vertical">
      <button class="uk-modal-close-default" type="button" uk-close></button>
      <div class="uk-modal-header">
        <h3 class="uk-modal-title uk-margin-remove-bottom"><font-awesome-icon icon="language" /> About</h3>
        <p class="uk-text-bold uk-margin-remove-top">Semesterarbeit 2 NDS HF Applikationsentwickler (2021/23)</p>
      </div>
      <div class="uk-modal-body">
        <div class="uk-text-large">Credits</div>
        <span>Created by Claudia Martinez, Marco Rensch &amp; John Schmidt</span>
        <div class="uk-margin">
          <a class="uk-button nx-button-tertiary" href="https://github.com/marcorensch/babylon-ndshfsem2" title="Project Babylon on GitHub" target="_blank"><font-awesome-icon icon="code-branch" /> Source code on GitHub</a>
        </div>
      </div>
    </div>
  </div>
</div>
</template>

<script>
export default {
  name: "AboutView"
}
</script>