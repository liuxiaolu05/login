/**所有入口文件公共的api
 * Created by weikaiwei on 2017/10/12.
 */
import "iview/dist/styles/iview.css";
import axios from "@@/plugin/token-axios"
import jCookie from "@@/lib/jquery.cookie";
import Vue from 'vue'
import Iview from "iview";
jCookie(self.$);
Object.assign(self, { Vue, axios,
  getUrl (s) {
    return `/api/${s}`;
  }
});
Vue.use(Iview);
Vue.config.productionTip = false;
