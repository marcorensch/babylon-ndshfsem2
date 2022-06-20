<template>
  <nav class="uk-navbar-container uk-light" uk-navbar>
    <div class="uk-navbar-left">
      <div class="uk-position-relative">
        <div>
          <span class="project-title uk-text-nowrap">Babyl<font-awesome-icon icon="globe" />n</span>
        </div>
        <ul class="uk-navbar-nav nx-nav-container nx-nav-steps uk-flex-center">
          <router-link :to="{name:'Upload'}" custom v-slot="{ href, navigate, isActive, isExactActive }">
            <li id="upload-link" :class="{ 'uk-active active': isActive, 'uk-active active': isExactActive }">
              <a :href="href" @click="navigate"><font-awesome-icon icon="upload" /></a>
            </li>
          </router-link>
          <router-link :to="{name:'Checker'}" custom v-slot="{ href, navigate, isActive, isExactActive }">
            <li id="checker-link" :class="{ 'uk-active active': isActive, 'uk-active active': isExactActive }">
              <a :href="href" @click="navigate"><font-awesome-icon icon="check" /></a>
            </li>
          </router-link>
          <router-link :to="{name:'Translator'}" custom v-slot="{ href, navigate, isActive, isExactActive }">
            <li id="translator-link" :class="{ 'uk-active active': isActive, 'uk-active active': isExactActive }">
              <a :href="href" @click="navigate"><font-awesome-icon icon="language" /></a>
            </li>
          </router-link>
        </ul>
        <div class="uk-position-cover"></div>
      </div>
    </div>
    <div class="uk-navbar-right">
      <ul class="uk-navbar-nav">
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
@import "@/assets/styles/variables.less";
.uk-active{
  color: #fff;
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

.nx-nav-steps li a{
  min-height: 30px !important;
}
.nx-nav-steps{
  margin-bottom:10px;
}
.uk-navbar-container{
  padding: 0 20px;
}
.nx-nav-container{
  padding:2px;
  border-radius: 3px;
  border: 1px solid #202020;
  background: #0f0f0f;
}
</style>