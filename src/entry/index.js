import "@/assets/js/layLib";
import "@/assets/js/lib";
import Vue from 'vue';
import {VeeValidate, config} from '@@/plugin/vee-validate';
import App from '@/pages/App.vue';
import router from '@/router';
// 校验框架
Vue.use(VeeValidate, config);
new Vue({
  el: '#app',
  router,
  template: '<App/>',
  components: { App }
})
