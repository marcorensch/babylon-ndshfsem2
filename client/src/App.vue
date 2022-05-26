<template>
  <Navbar />
  <div class="uk-section uk-section-primary" uk-height-viewport="offset-top:true">
    <div class="uk-container uk-container-small">
      <router-view v-slot="{ Component }">
        <transition name="route" mode="out-in">
          <component :is="Component"></component>
        </transition>
      </router-view>
    </div>
  </div>
</template>

<script>
import UIkit from 'uikit';
import Icons from 'uikit/dist/js/uikit-icons';
import Navbar from "@/components/Navbar";

UIkit.use(Icons);

export default {
  name: 'App',
  components: { Navbar }

};

</script>

<style lang="less">
@import "../node_modules/uikit/src/less/uikit.less";
@import "./src/assets/styles/variables.less";


.nx-icon{
  padding-right: 5px;
}

.sub-title{
  border-bottom: 1px solid #fefefe
}

/** Route Transitions **/
.route-enter-from{
  opacity: 0;
  transform: translateX(100px);
}
.route-enter-active {
  transition: all 0.3s ease-out;
}
.route-leave-to{
  opacity: 0;
  transform: translateX(-100px);
}
.route-leave-active{
 transition: all 0.3s ease-out;
}
</style>
