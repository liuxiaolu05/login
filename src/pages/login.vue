<template>
  <div class="con-bg" @keyup.enter="enterLogin">
    <div class="content">
      <div class="login-bg">
        <div class="out-ring"></div>
        <div class="login-ring"></div>
      </div>
      <div class="inner" :class="{'inner-big' : editUser}">
        <div class="inner-box">
          <!--<h1>智慧国美 · 美数&nbsp;
            <Icon type="plus-round"></Icon>
          </h1>-->
          <div v-if="editUser" class="tip-warning edit-pwd">
            <Icon type="android-alert"></Icon>
            为保证账户安全，请修改初始密码
          </div>
          <div class="form login-tip" v-if="!editUser">
            <div class="form-group input-group">
              <input autocomplete="on" type="text" name="用户名" maxlength="20" placeholder="请输入用户名"
                     v-model="username" v-validate="'required:用户名'"
              >
              <!--<i class="iconfont icon-tubiao211"></i>-->
              <Icon type="person"></Icon>
            </div>
            <div v-show="errors.has('用户名')" class="tip-danger">
              <Icon type="android-warning"></Icon>
              {{ errors.first('用户名') }}
            </div>
            <div class="form-group input-group">
              <input  autocomplete="on" type="password" name="密码" maxlength="20" placeholder="请输入密码"
                     v-model="password" v-validate="'required:密码'"
              >
              <!--<i class="iconfont icon-mima"></i>-->
              <Icon type="locked"></Icon>
            </div>
            <div v-show="errors.has('密码')" class="tip-danger">
              <Icon type="android-warning"></Icon>
              {{ errors.first('密码') }}
            </div>
            <div class="btn-group">
              <button @click="login">登录</button>
            </div>
          </div>
          <!-- 修改密码界面 -->
          <div class="form password-tip" v-if="editUser">
            <div class="form-group input-group">
              <input type="text" name="用户名" maxlength="20" placeholder="请输入用户名"
                     key="uname" v-model="editUser.uname" v-validate="'required:用户名'"
              >
              <!--<i class="iconfont icon-tubiao211"></i>-->
              <Icon type="person"></Icon>
            </div>
            <div v-show="errors.has('用户名')" class="tip-danger">
              <Icon type="android-warning"></Icon>
              {{ errors.first('用户名') }}
            </div>
            <div class="form-group input-group">
              <input type="password" name="旧密码" maxlength="20" placeholder="请输入旧密码"
                     key="opwd" v-model="editUser.opwd" v-validate="'required:旧密码|min:6'"
              >
              <!--<i class="iconfont icon-mima"></i>-->
              <Icon type="locked"></Icon>
            </div>
            <div v-show="errors.has('旧密码')" class="tip-danger">
              <Icon type="android-warning"></Icon>
              {{ errors.first('旧密码') }}
            </div>
            <div class="form-group input-group">
              <input type="password" name="新密码" maxlength="20" placeholder="请输入新密码"
                     v-model="editUser.pwd" v-validate="'required:新密码|min:6'"
              >
              <!--<i class="iconfont icon-mima"></i>-->
              <Icon type="locked"></Icon>
            </div>
            <div v-show="errors.has('新密码')" class="tip-danger">
              <Icon type="android-warning"></Icon>
              {{ errors.first('新密码') }}
            </div>
            <div class="form-group input-group">
              <input type="password" name="确认密码" maxlength="20" placeholder="请确认新密码"
                     v-model="editUser.repwd" v-validate="'required:确认密码|min:6|confirm'"
              >
              <!--<i class="iconfont icon-mima"></i>-->
              <Icon type="locked"></Icon>
            </div>
            <div v-show="errors.has('确认密码')" class="tip-danger">
              <Icon type="android-warning"></Icon>
              {{ errors.first('确认密码') }}
            </div>
            <div class="btn-group">
              <button @click="updatePwd">保存</button>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="bg-font">
      <span>数据科学</span>
      <span>高逼格</span>
      <span>共赢</span>
      <span>人工智能</span>
      <span>独特视角</span>
      <span>战略</span>
      <span>颠覆式创新</span>
      <span>AI+</span>
      <span>产品共鸣</span>
      <span>生态体系</span>
      <span>赋能</span>
      <span>精准</span>
      <span>洞察</span>
      <span>预测</span>
      <span>数据点亮人生</span>
      <span>智能</span>
      <span>大数据</span>
    </div>
  </div>
</template>
<script>
  import "@/assets/css/login.less";
  import Vue from "vue";
  import "@/assets/js/responsive.js";
  import {VeeValidate, config} from "@@/plugin/vee-validate";
  // 校验框架
  Vue.use(VeeValidate, config);
  export default {
    data: function () {
      return {
        username: "",
        password: "",
        editUser: null
      }
    },
    methods: {
      login: function () {
        var _vm = this, $Message = this.$Message;
        this.$validator.validateAll().then(function (valid) {
          if (valid) { // 校验全部通过
            axios.post(getUrl("login"), {username: $.trim(_vm.username), password: _vm.password}).then(function (data) {
              if (data.code == 0) { // 成功
                /**登陆的特殊逻辑
                 * 1、登录成功后返回{token:""}
                 * 2、如果用户密码是初始密码（返回{isDefaultPwd}），跳转到修改密码界面，修改成功后再返回登录
                 * 3、state为3表示已离职员工，无法登陆
                 * */
                var loginMap = data.loginMap || {};
                if(loginMap.state=='3'){
                  $Message.warning('无效用户！');
                  return;
                } else if (loginMap.isDefaultPwd) {
                  _vm.editUser = {};
                } else if (loginMap.token) {
                  // 保存token
                  $.cookie("userRole", loginMap.userRole, {path: "/"});
                  $.cookie("chineseName", encodeURI(encodeURI(loginMap.chineseName)), {path: "/"});
                  $.cookie("appId", 1, {path: "/"});
                  $.cookie("username", $.trim(_vm.username), {path: "/"});
                  // 跳转到应用列表页面
                  top.location.href = "index.html";
                }
              } else {
                 $Message.warning(data.msg);
              }
            })
          }
          else {
            $('.login-tip .tip-danger').css('color', '#e75033');
          }
        });
      },
      updatePwd: function () {
        var _vm = this, $Message = this.$Message;
        this.$validator.validateAll().then(function (valid) {
          if (valid) { // 校验全部通过，调用重置密码的接口
            axios.post(getUrl("resetPwd"), {
              username: _vm.editUser.uname,
              oldPassword: _vm.editUser.opwd,
              password: _vm.editUser.pwd
            }).then(function (data) {
              if (data.code == 0) { // 成功
                $Message.success("操作成功");
                _vm.editUser = null;
                _vm.username = "";
                _vm.password = "";
              } else {
                $Message.warning(data.msg);
              }
            })
          }
          else {
            $('.password-tip .tip-danger').css('color', '#e75033');
          }
        });
      },
      enterLogin: function () {
        if (!this.editUser) {
          this.login();
        } else {
          this.updatePwd();
        }
      }
    },
    // 及早地给校验器绑定配置信息
    beforeCreate: function () {
      var _vm = this, v = this.$validator, rules = {
        "confirm": {
          validate: function (value) {
            return _vm.editUser.pwd == value;
          },
          getMessage: "两次密码不一致"
        }
      };
      for (var i in rules) {
        v.extend(i, rules[i])
      }
    },
    mounted: function () {
      var _this = this;

    }
  };
</script>
