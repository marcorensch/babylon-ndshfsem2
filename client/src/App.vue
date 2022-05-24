<template>
  <nav>
    <router-link to="/">Upload</router-link>
    |
    <router-link to="/checker">Checker</router-link>
    |
    <router-link to="/translator">Translator</router-link>
    |
    <router-link to="/settings">Settings</router-link>
  </nav>
  <router-view/>
</template>

<script>
import UIkit from 'uikit';
import Icons from 'uikit/dist/js/uikit-icons';

UIkit.use(Icons);

export default {
  name: 'App'
};

</script>

<style lang="less">
@import "../node_modules/uikit/src/less/uikit.less";
@import "assets/style/variables.less";

.nx-icon{
  padding-right: 5px;
}
</style>
