// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'; // In Dev
import App from './App';
import router from './router';
import i18n from './i18n/';
import ElementUI from 'element-ui'; // In Dev
import { Message } from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'; // In Dev
import './styles/bootstrap.css';
import 'admin-lte/dist/css/AdminLTE.min.css';
import 'admin-lte/dist/css/skins/skin-blue.min.css';
import 'font-awesome/css/font-awesome.min.css';
import store from './store';
import numbro from 'numbro';
import './utils/initEcharts.js';
import req from '@/utils/http/request';
import api from '@/utils/http/api';
import { getToken } from '@/utils/auth'
/*import { Menu, Submenu, MenuItem, Dialog, 
		 Slider, Select, Option, Table, 
		 TableColumn, DatePicker, Input, Tree,
     OptionGroup, Transfer, Switch } from 'element-ui';*/
     
const whiteList = ['/login', '/auth-redirect', '/bind', '/register']

router.beforeEach((to, from, next) => {
  if (getToken()) {
    /* has token */
    if (to.path === '/login') {
      next({ path: '/' })
    } else {
      if (store.getters.roles.length === 0) {
        // 判断当前用户是否已拉取完user_info信息
        store.dispatch('GetInfo').then(() => {
          // 拉取user_info
          store.dispatch('menu/getCategoryList');
          store.dispatch('menu/getBoardList');
          store.dispatch('menu/getMenuList').then(accessRoutes => {
            // 测试 默认静态页面
            // store.dispatch('permission/generateRoutes', { roles }).then(accessRoutes => {
            // 根据roles权限生成可访问的路由表
            router.addRoutes(accessRoutes) // 动态添加可访问路由表
            next({ ...to, replace: true }) // hack方法 确保addRoutes已完成
          })
        })
          .catch(err => {
            store.dispatch('FedLogOut').then(() => {
              Message.error(err)
              next({ path: '/' })
            })
          })
      } else {
        next()
      }
    }
  } else {
    if (whiteList.indexOf(to.path) !== -1) {
      // 在免登录白名单，直接进入
      next()
    } else {
      next(`/login?redirect=${to.fullPath}`) // 否则全部重定向到登录页
    }
  }
})

Vue.config.productionTip = false;
Vue.prototype.$numbro = numbro;

Vue.use(ElementUI); // In Dev
//Vue.use(ELEMENT); // In Production
/*Vue.use(Menu);
Vue.use(Submenu);
Vue.use(MenuItem);
Vue.use(Dialog);
Vue.use(Slider);
Vue.use(Select);
Vue.use(Option);
Vue.use(Table);
Vue.use(TableColumn);
Vue.use(DatePicker);
Vue.use(Input);
Vue.use(Tree);
Vue.use(OptionGroup);
Vue.use(Transfer);
Vue.use(Switch)*/

Vue.prototype.$req = req;
Vue.prototype.$api = api;

new Vue({
  el: '#app',
  router,
  store,
  i18n,
  components: { App },
  render: h => h(App)
})