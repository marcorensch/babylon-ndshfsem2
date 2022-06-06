import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'

// Toast
import VueToast from 'vue-toast-notification';
import 'vue-toast-notification/dist/theme-sugar.css';

// FontAwesome
import { library } from '@fortawesome/fontawesome-svg-core'
import {
    faUserSecret,
    faBuilding,
    faCogs,
    faUpload,
    faCheck,
    faLanguage,
    faGlobe, faPlay, faForward
} from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

library.add(faUserSecret, faBuilding, faCogs, faUpload, faCheck, faLanguage, faGlobe, faPlay, faForward)

createApp(App).component('font-awesome-icon', FontAwesomeIcon).use(VueToast).use(store).use(router).mount('#app')
