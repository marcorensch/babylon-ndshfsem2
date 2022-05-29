<template>
  <nav class="uk-navbar-container uk-light" uk-navbar>
    <div class="uk-navbar-left">
      <span class="project-title uk-text-nowrap">Babyl<font-awesome-icon icon="globe" />n</span>
    </div>
    <div class="uk-navbar-right">
      <ul class="uk-navbar-nav">
        <router-link :to="{name:'Upload'}" custom v-slot="{ href, navigate, isActive, isExactActive }">
          <li id="upload-link" :class="{ 'uk-active active': isActive, 'uk-active active': isExactActive }">
            <a :href="href" @click="navigate"><font-awesome-icon icon="upload" /><span>Upload</span></a>
          </li>
        </router-link>
        <router-link :to="{name:'Checker'}" custom v-slot="{ href, navigate, isActive, isExactActive }">
          <li id="checker-link" :class="{ 'uk-active active': isActive, 'uk-active active': isExactActive }">
            <a :href="href" @click="navigate"><font-awesome-icon icon="check" /><span>Checker</span></a>
          </li>
        </router-link>
        <router-link :to="{name:'Translator'}" custom v-slot="{ href, navigate, isActive, isExactActive }">
          <li id="translator-link" :class="{ 'uk-active active': isActive, 'uk-active active': isExactActive }">
            <a :href="href" @click="navigate"><font-awesome-icon icon="language" /><span>Translator</span></a>
          </li>
        </router-link>
        <router-link :to="{name:'Settings'}" custom v-slot="{ href, navigate, isActive, isExactActive }">
          <li id="settings-link" :class="{ 'uk-active active': isActive, 'uk-active active': isExactActive }">
            <a :href="href" @click="navigate"><font-awesome-icon icon="cogs" /><span>Settings</span></a>
          </li>
        </router-link>
      </ul>
    </div>
  </nav>
</template>

<script>
export default {
  name: "Navbar"
}
</script>

<style lang="less" scoped>
@import "src/assets/styles/variables.less";
.active{
  background-color: rgba(101, 99, 99, 0.15);
}
.project-title{
  text-transform:uppercase;
  font-size: 2.5rem;
  font-weight: 700;
  margin: 0.5rem 1rem ;
}

.uk-navbar-container{
  background: #050505 !important;
  border-bottom: 0.01rem solid @global-eyecatcher-color;
}
</style>