import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'

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

createApp(App).component('font-awesome-icon', FontAwesomeIcon).use(store).use(router).mount('#app')
