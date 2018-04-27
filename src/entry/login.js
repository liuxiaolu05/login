/**
 * Created by zhanghuizhen on 2017/7/31.
 */
import "@/assets/js/layLib";
import "@/assets/js/lib";
import "@/assets/css/login.less";
import Vue from 'vue';
import {VeeValidate, config} from "@@/plugin/vee-validate";
import "@/assets/js/responsive.js";
import router from '@/router/login';

// 校验框架
Vue.use(VeeValidate, config);
new Vue({
  el: "#app",
  router
});
