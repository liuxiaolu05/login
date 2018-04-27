<template>
  <div class="full-height">
    <div class="header ivu-row-flex">
      <div class="layout-menu-left" :class="{'bg-color':menuList.length>0}"
           :style="{width: (navTitle.length + 2) + 'em'}">
        <div class="layout-logo-left">
          <span v-text="navTitle"></span>
        </div>
      </div>
      <div class="layout-menu-right">
        <div class="layout-header">
          <Button type="text" @click="toggleClick" class="header-switch pull-left">
            <i class="iconfont icon-quanbushangpin"></i>
          </Button>
          <Menu ref="navMenu" id="layoutNav" class="layout-nav pull-left" mode="horizontal"
                :active-name="activeName" @on-select="navMenuSeleted">
            <MenuItem v-for="item in navMenuList" :name="item.menuId" :key="item.menuId">
              <i class="iconfont" :class="item.icon"></i>
              <span v-text="item.name"></span>
            </MenuItem>
          </Menu>
          <div class="more-action">
            <!--<Icon type="ios-help-outline" title="帮助"></Icon>-->
            <Dropdown>
              <Icon type="android-arrow-dropdown"></Icon>
              <DropdownMenu class="more-drop" slot="list">
                <DropdownItem>
                  <div @click="passwordShow">修改密码</div>
                </DropdownItem>
                <DropdownItem>
                  <div @click="logout">退出登录</div>
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </div>
        </div>
      </div>
    </div>
    <div class="content ivu-row-flex">
      <div class="layout-menu-left" :class="{'bg-color':menuList.length>0, hide:!leftMenuStatus_}"
           :style="{width: (navTitle.length + 2) + 'em'}">
        <tree-menu ref="menu" key-field="menuId" children="list" :value="menuList" @select="menuSeleted"
                   :class="{'mini-icon': this.menuStatus==2}"
        >
        </tree-menu>
      </div>
      <div class="layout-menu-right">
        <div class="layout-content">
          <div class="layout-content-main">
            <router-view ref="myiframe"></router-view>
          </div>
        </div>
      </div>
    </div>
    <!--修改密码-->
    <Modal title="修改密码" v-model="showList" :mask-closable="false" :closable="false">
      <Form v-if="editUser" :model="editUser" :label-width="120" autocomplete="off">
        <div @keyup.enter="save">
          <FormItem label="用户名">
            <input type="text" name="用户名" disabled maxlength="20" autocomplete="off" placeholder="请输入用户名"
                   key="uname" v-model="editUser.uname" v-validate="'required:用户名'"
            >
            <div v-show="errors.has('用户名')" class="tip-danger">
              <Icon type="android-warning"></Icon>
              <span v-text="errors.first('用户名')"></span>
            </div>
          </FormItem>
          <FormItem label="旧密码">
            <input type="password" autocomplete="off" name="旧密码" maxlength="20"
                   placeholder="请输入旧密码"
                   key="opwd" v-model="editUser.opwd" v-validate="'required:旧密码|min:6'"
            >
            <div v-show="errors.has('旧密码')" class="tip-danger">
              <Icon type="android-warning"></Icon>
              <span v-text="errors.first('旧密码') "></span>
            </div>
          </FormItem>
          <FormItem label="新密码">
            <input type="password" name="新密码" maxlength="20" placeholder="请输入新密码"
                   v-model="editUser.pwd" v-validate="'required:新密码|min:6'"
            >
            <div v-show="errors.has('新密码')" class="tip-danger">
              <Icon type="android-warning"></Icon>
              <span v-text="errors.first('新密码')"></span>
            </div>
          </FormItem>
          <FormItem label="确认新密码">
            <input type="password" name="确认密码" maxlength="20" placeholder="请确认新密码"
                   @focus="cleartip" v-model="editUser.repwd"
                   v-validate="'required:确认密码|min:6|confirm_'"
            >
            <div v-show="errors.has('确认密码')" class="tip-danger">
              <Icon type="android-warning"></Icon>
              <span v-text="errors.first('确认密码') "></span>
            </div>
          </FormItem>

        </div>
      </Form>
      <div slot="footer">
        <Button type="text" @click="cancel">取消</Button>
        <Button type="primary" @click="save">保存</Button>
      </div>
    </Modal>
  </div>
</template>
<script>
  import "@/assets/css/style"
  import "treeMenu/style.less"
  import Vue from "vue"
  import TreeMenu from "treeMenu"
  // 树组件
  Vue.component(TreeMenu.name, TreeMenu);
  // 格式化菜单列表数据。支持扁平化和嵌套混合模式的数据
  function routerList(menuList, handler) {
    var keyField = "menuId", parentField = "parentId", subField = "list", urlField = "url";

    function serialize(menuList, handler) {
      var rootList = [], map = {}, temp = {}, key, node, parentKey, parentNode, subNodes;
      for (var i in menuList) {
        node = menuList[i];
        key = node[keyField];
        parentKey = node[parentField];
        // 绑定路由事件
        if (node.hasOwnProperty(urlField) && handler) {
          handler(node[urlField]);
        }
        /**数据有[parentField]，把数据挂到[parentField]对应数据的[subField]中。
         * 如果对应的[parentField]数据还没有生成，把当前数据挂到临时区域内。等待父节点初始化的时候合并。
         * 没有parentKey的数据是一级节点
         * */
        if (parentKey) {
          // 映射区中查找父节点
          if (parentNode = map[parentKey]) {
            /**父节点的[sub]已存在当前节点
             * true：在该节点本来的位置上替换掉该节点
             * false：添加该节点
             * */
            subNodes = parentNode[subField];
            if (!subNodes.some(function (item, i) {
                if (item[keyField] == key) {
                  subNodes[i] = node;
                  return true;
                }
              })
            ) {
              subNodes.push(node);
            }
          } else {
            temp[parentKey] = node;
          }
        } else {
          rootList.push(node);
        }

        /**1、把数据挂到映射区域
         * 2、如果当前数据本身具有[sub]（嵌套子级结构），使用相同的逻辑注册这些子节点
         * 3、在临时区域查找同名[key]数据，把该数据（数组格式）合并到当前数据的[sub]中
         * */
          // 1
        map[key] = node;

        // 2
        if (Object.prototype.toString.call(node[subField]) == "[object Object]") {
          node[subField] = [node[subField]];
        } else if (Object.prototype.toString.call(node[subField]) != "[object Array]") {
          node[subField] = []
        }
        serialize(node[subField], handler);
        // 3
        if (temp[key]) {
          node[subField].concat(temp[key]);
          delete temp[key];
        }
      }
      return rootList;
    }

    return serialize(menuList, handler);
  }
  export default {
    data: function () {
      return {
        showList: false,
        user: {
          appAccount: "",
          positionName: "",
          imgSrc: '../static/image/main/persional.png'
        },
        editUser: {},
        navMenuList_: null,
        menuList: [],
        menuStatus: 1, // 1，展开；2最小化
        leftMenuStatus_: 1, // 1|true，展开（默认）；0|false关闭
        activeName_: '',
        password: '',
        newPassword: '',
        navTitle: "智慧国美·美数+"
      }
    },
    computed: {
      activeName: {
        get: function () {
          return this.activeName_;
        },
        set: function (v) {
          var navMenu = this.$refs.navMenu;
          this.activeName_ = v;
          this.$nextTick(function () {
            navMenu.updateActiveName()
          });
        }
      },
      navMenuList: {
        get: function () {
          return this.navMenuList_
        },
        set: function (v) {
          this.navMenuList_ = routerList(v);
          // 默认选中第一个
          this.selectFirstMenu();
        }
      }
    },
    // 及早地给校验器绑定配置信息
    beforeCreate: function () {
      var _vm = this, v = this.$validator, rules = {
        "confirm_": {
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
    methods: {
      // 默认选中第一个一级菜单下的第一个叶节点
      selectFirstMenu: function () {
        var menu = this.navMenuList || [];

        function getLeaf(node) {
          if (node.list) {
            // 没有子节点，自身就是叶节点
            return node.list[0] ? getLeaf(node.list[0]) : node;
          } else {
            return node;
          }
        }

        this.activeName = "";
        if (menu = menu[0]) {
          this.navMenuSeleted(this.activeName = menu.menuId);
          // 寻找第一个叶节点
          this.menuSeleted(getLeaf(menu));
        }
      },
      navMenuSeleted: function (name) {
        var _vm = this;
        this.navMenuList.some(function (item) {
          if (item.menuId == name) {
            _vm.menuList = item.list;
            _vm.menuSeleted(item);
            return true;
          }
        });
      },
      menuSeleted: function (node) {
        if (node.url) {
          $('.tree-menu').find('li:eq(0)').removeClass('select-node');
          this.toggleLeftMenu(node.url != "applist.html");
          this.$router.push("/" + node.url);
        } else if (node.list[0].url) { //如果有二级菜单默认选中二级菜单第一项
          this.$nextTick(function () {
            $('.tree-menu').find('li:eq(0)').addClass('select-node');
          });
          this.menuSeleted(node.list[0]);
        }
      },
      getUser: function () {
        this.user = {username: "管理员"};
      },
      // 左侧菜单模式切换的方法
      toggleClick: function () {
        if (this.menuStatus === 1) {
          this.menuStatus = 2;
          this.navTitle = "美数+";
        } else {
          this.menuStatus = 1;
          this.navTitle = '智慧国美·美数+';
        }
      },
      /**展开/关闭左侧菜单
       * @param mode 1|true: 展开, 0|false: 关闭
       * */
      toggleLeftMenu(mode){
        this.leftMenuStatus_ = arguments.length ? mode : !this.leftMenuStatus_
      },
      logout: function () {
        axios.post(getUrl("logout")).then(function (data) {
          location.href = getUrl('login.html');
        }).catch(function () {
          location.href = getUrl('login.html');
        })
      },
      passwordShow: function () {
        var _vm = this;
        //每次进入修改密码前先清空上一次的错误提示
        this.$validator.errors.clear();
        this.showList = true;
        this.editUser.uname = $.cookie('username');

      },
      save: function () {
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
                _vm.editUser = {};
                _vm.password = "";
                _vm.showList = false;
              } else {
                $Message.warning(data.msg);
                _vm.showList = true;
              }
            })
          }
          else {
            _vm.showList = true;
            $('.tip-danger').css('color', '#e75033');
          }
        });
      },
      // 取消编辑操作
      cancel: function () {
        this.showList = false;
        this.editUser = {};
      },
      cleartip: function () {
        if (!!window.ActiveXObject || "ActiveXObject" in window) {
          $('.tip-danger').css('color', 'transparent');

        }
      }
    },
    mounted: function () {
      var arr = [
        {
          menuId: "0",
          name: "应用列表",
          url: "applist.html",
          icon: "icon-yingyongliebiao"
        }
      ];
      if ($.cookie('userRole') == 1) {
        arr.push({
          menuId: "1",
          name: "系统管理",
          icon: "icon-xitongguanli",
          list: [
            {menuId: "1_1", parentId: "1", name: "用户管理", url: "sys/user.html", icon: "iconfont icon-yonghuguanli"},
            {menuId: "1_2", parentId: "1", name: "职务管理", url: "sys/position.html", icon: "iconfont icon-zhiwuguanli"},
            {menuId: "1_3", parentId: "1", name: "操作记录", url: "sys/operation.html", icon: "iconfont icon-caozuojilu"}
          ]
        });
      }
      this.navMenuList = arr;
      this.getUser();
    }
  }
</script>
<style>
  html, body {
    height: 100%;
  }
</style>
