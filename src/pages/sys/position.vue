<template>
  <div class="box user-box position">
    <div v-show="showList">
      <div class="form-condition form-inline">
        <div class="form-group">
          <Input class="input-box" v-model="q.zwbm" placeholder="请输入角色编码" @keyup.enter.native="query"></Input>
          <Input class="input-box" v-model="q.positionName" placeholder="请输入角色名称" @keyup.enter.native="query"></Input>
        </div>
        <div class="form-group">
          <Button type="primary" class="search" @click="query">查询</Button>
          <Upload :action="uploadUrl"
                  :before-upload="progess" :show-upload-list="false" :format="['xls','xlsx','xlsm']"
                  :on-format-error="handleFormatError" :on-success="handleSuccess"
                  :on-error="handleError">
            <Button type="primary" class="upload">{{uploadText}}</Button>
          </Upload>

          <Button type="primary" @click="download">下载模板</Button>
          <iframe src="" id="loadIframe" frameborder="0" style="display:none"></iframe>
        </div>
      </div>
      <div class="table">
        <Table border :no-data-text="noDataText" class="table" :data="tableData" :columns="columns" stripe></Table>
        <div style="margin: 10px;overflow: hidden;margin-bottom: 60px;">
          <div id="page" class="pull-right">
            <Page size="small" :total="totalCount" :current="currPage" :page-size="size" :page-size-opts="sizeopt"
                  show-elevator show-sizer show-total @on-change="changePage($event)"
                  @on-page-size-change="changeSize" placement="top"></Page>
          </div>
        </div>
      </div>
    </div>
    <div v-show="!showList" class="panel panel-default">
      <Card dis-hover>
        <p slot="title">权限设置</p>
        <Form :model="position" :label-width="120">
          <FormItem label="职务ID">
            <span v-text="position.positionId"></span>
          </FormItem>
          <FormItem label="职务名称">
            <span v-text="position.name"></span>
          </FormItem>
          <FormItem label="选择应用">
            <Button v-if="position.appList" v-for="item in position.appList" v-text="item.name" key="item"
                    @click="setApp(item)"
                    :type="position.currentApp&&position.currentApp.appId==item.appId?'primary':''"></Button>
          </FormItem>
          <FormItem label="应用状态">
            <Switch v-if="position.currentApp" size="large" v-model="position.currentApp.checked">
              <span slot="open">启用</span>
              <span slot="close">禁用</span>
            </Switch>
          </FormItem>
          <FormItem label="功能权限">
            <!-- 被禁用的应用菜单权限都是空的 -->
            <div id="menuTree" class="ztree"></div>
          </FormItem>
          <FormItem>
            <Button type="primary" @click="save">保存</Button>
            <Button @click="cancel">取消</Button>
          </FormItem>
        </Form>
      </Card>
    </div>
    <BackTop :bottom="150"></BackTop>
  </div>
</template>
<script>
  import "@/assets/lib/ztree/css/metroStyle/metroStyle.css"
  import "@/assets/lib/ztree/jquery.ztree.all.min.js"
  var setting = {
    data: {
      simpleData: {
        enable: true,
        idKey: "menuId",
        pIdKey: "parentId",
        rootPId: -1
      },
      key: {
        url: "nourl"
      }
    },
    check: {
      enable: true,
      nocheckInherit: true
    },
    callback: {
      // 菜单选中状态变化时，所有节点都没选择，当前应用状态设置为“禁用”状态；反之，只要选择了一个节点，状态变为“启用”
      onCheck: function (e, treeId, node) {
        vm.position.currentApp.checked = !!ztree.getCheckedNodes().length;
      }
    }
  }, ztree;
  var vm = this;
  export default {
    data: function () {
      return {
        formItem: {},
        checked: true,
        q: {
          positionName: '',
          zwbm: ''
        },
        uploadUrl: getUrl("positionUpload"),
        uploadText: '权限导入',
        showList: true,
        title: null,
        position: {},
        tableData: [],
        noDataText: '',
        setShow: false,
        columns: [
          {
            title: '角色编码',
            key: 'zwbm'
          },
          {
            title: '角色名称',
            key: 'name'
          },
          {
            title: '操作',
            render: function (h) {
              var rowData = this.row;
              return h('div', [
                h('a', {
                  attrs: {
                    href: "javascript:;"
                  },
                  style: {
                    marginRight: '10px'
                  },
                  on: {
                    click: function () {
                      vm.update(rowData);
                    }
                  }
                }, '配置功能权限'),
                h('a', {
                  attrs: {
                    href: "javascript:;"
                  },
                  on: {
                    click: function () {
                      vm.$Modal.confirm({
                        content: '是否确定删除此条记录？',
                        cancelText: '取消',
                        onOk: function () {
                          axios.get(getUrl("positionDelete"), {params: {positionId: rowData.positionId}}).then(function (data) {
                            if (data.code == 0) {
                              vm.$Message.success('删除成功');
                              vm.reload();
                            } else {
                              vm.$Message.error('删除失败');
                            }
                          }).catch(function (err) {
                            console.log(err);
                          })
                        }
                      })


                    }
                  }
                }, '删除')
              ])

            }
          }
        ],
        totalCount: 0,
        sizeopt: [10, 20, 50, 100],
        size: 10,
        currPage: 1,
        fixedHeader: false,
        getPage: true,
        getSize: true
      }
    },
    watch: {
      // 如果把应用状态变为“禁用”，所有菜单都变成未选中状态
      "position.currentApp.checked": function (v) {
        v || ztree.checkAllNodes(false);
      }
    },
    methods: {
      query: function () {
        vm.currPage = 1;
        vm.reload();
      },
      update: function (rowData) {
        this.showList = false;
        this.setShow = true;
        this.title = "修改";
        this.getPosition(rowData);
      },
      save: function () {
        // 应用切换和保存的前要记录当前的数据状态
        this.record();
        var appData = this.position.appData, zwbm = this.position.zwbm, arr = [], app, menuList,
          $Message = this.$Message;
        /**权限保存的规则
         * 1、如果某个应用勾选了1到多个权限，每个权限是一条记录，每条记录都必须有职务编码（zwbm）和应用id（appId）
         * 2、如果某个应用没有勾选任何权限，至少要传一条记录，该记录不能有菜单字段（menuId）
         * */
        for (var i in appData) {
          app = appData[i];
          // 规则1
          debugger
          if (app.checked) {
            menuList = app.menuList;
            // 规则2
            if (menuList && menuList.length) {
              app.menuList.forEach(function (item) {
                arr.push({
                  zwbm: zwbm,
                  appId: i,
                  checked: true,
                  menuId: item
                });
              });
            } else {
              arr.push({
                zwbm: zwbm,
                appId: i,
                checked: true
              });
            }
          } else {
            arr.push({zwbm: zwbm, appId: i, checked: false});
          }
        }
        axios.post(getUrl("saveMenu"), {
          menus: arr
        }).then(function (r) {
          if (r.code === 0) {
            $Message.success("操作成功");
            vm.reload();
          } else {
            $Message.warning(r.msg);
          }
        });
      },
      // 取消编辑操作
      cancel: function () {
        this.showList = true;
      },
      reload: function () {
        vm = this;
        vm.showList = true;
        if (vm.q.positionName != '') {
          vm.q.positionName = String(vm.q.positionName).replace(/\s+/g, "");
        }
        axios.get(getUrl("positionList"), {
          params: {
            positionName: vm.q.positionName,
            zwbm: vm.q.zwbm,
            currPage: vm.currPage,
            pageSize: vm.size
          },
          loading: true,
          unload:true
        }).then(function (data) {
          vm.getPage = true;
          vm.getSize = true;
          var page = data.page;
          vm.totalCount = page.totalCount;
          if (page.list && page.list.length > 0) {
            vm.tableData = page.list;
          } else {
            vm.tableData = [];
            vm.noDataText = '暂无数据'
          }
          vm.currPage = page.currPage;
        }).catch(function (err) {
          vm.noDataText = '暂无数据'
          console.log(err);
        })
      },
      getPosition: function (position) {
        var vm = this, zwbm = position.zwbm;
        position = this.position = $.extend({appList: [], currentApp: null, appData: {}}, position);
        /** 获取所有的应用，应用中包含这个应用的启用状态，check字段
         * */
        axios.get(getUrl("positionApps"), {
          params: {
            zwbm: zwbm
          }
        }).then(function (data) {
          vm.setShow = false;
          // 默认选中第一个应用
          var firstApp;
          if ((position.appList = data.apps) && (firstApp = data.apps[0])) {
            vm.setApp(firstApp);
          }
        });
      },
      getCheckedMenu: function () {
        //获取选择的菜单
        var nodes = ztree.getCheckedNodes(true);
        var menuIdList = [];
        for (var i = 0; i < nodes.length; i++) {
          menuIdList.push(nodes[i].menuId);
        }
        return menuIdList;
      },
      /**选择应用，获取职务与之关联的应用菜单
       * */
      setApp: function (item) {
        var position = this.position, appData;
        if (item != position.currentApp) {
          this.record();
          /**注意。
           *切换应用的时候，应用状态改变会触发监听器。
           * 如果应用状态是false，监听器会修改当前树菜单的选中状态。
           * 此时的树菜单还是切换前的应用的，小心会修改切换前应用的菜单状态。
           * */
          ztree && ztree.destroy && ztree.destroy();
          position.currentApp = item;
          // 获取菜单。如果之前获取过菜单，就用缓存中的
          if (appData = position.appData && position.appData[item.appId] && position.appData[item.appId]) {
            ztree = $.fn.zTree.init($("#menuTree"), setting, appData.menuTree);
            //展开所有节点
            ztree.expandAll(true);
          } else {
            axios.get(getUrl("menuList"), {
              params: {
                appId: item.appId,
                zwbm: position.zwbm
              }
            }).then(function (data) {
              // 缓存该应用的菜单
              ztree = $.fn.zTree.init($("#menuTree"), setting, data.menus.map(function (item) {
                // icon字段覆盖ztree节点的原始图标，先暂时保留ztree的图标
                delete item.icon;
                return item;
              }));
              //展开所有节点
              ztree.expandAll(true);
              // 每请求一个新的应用权限，记录下这个应用的权限数据
              vm.record();
            });
          }
        }
      },
      /**记录用户操作的数据变化（应用启用状态，菜单选择状态）
       * 每个应用对象的数据结构如下：
       * appId: 应用id
       * menuList: 选中的菜单（功能）的id集合
       * menuTree: 菜单树结构数据
       * */
      record: function () {
        var position = this.position, currentApp, appData;
        // 选择应用之前先保存当前应用
        if (currentApp = position.currentApp) {
          appData = position.appData;
          /**保存当前蔬菜单点的节点数据
           * menuTree存储ztree生成的树结构数据。数据结构是和树一样的嵌套结构
           * menuList存储选中的菜单的id
           * */
          currentApp.menuList = this.getCheckedMenu();
          currentApp.menuTree = ztree.getNodes();
          currentApp.checked = !!currentApp.menuList.length;
          appData[currentApp.appId] = currentApp;
        }
      },
      // 表格页码切换
      changePage: function (page) {
        this.currPage = page;
        if (this.getPage) {
          this.reload();
        } else {
          this.getPage = false;
        }
      },
      // 表格显示条数切换
      changeSize: function (pageSize) {
        this.size = pageSize;
        this.currPage = 1;
        if (this.getSize) {
          this.reload();
        } else {
          this.getSize = false;
        }
      },
      handleFormatError: function () {
        $('.upload').addClass('ivu-btn-primary');
        vm.uploadText = '导入';
        this.$Message.warning('文件格式不正确，请上传 xls 或 xlsx 格式的文件。');
      },
      progess: function () {
        $('.upload').removeClass('ivu-btn-primary');
        vm.uploadText = '正在导入...'
      },
      handleSuccess: function (res, file, fileList) {
        $('.upload').addClass('ivu-btn-primary');
        vm.uploadText = '权限导入';
        if (res.code == 0) {
          vm.$Message.info({
            //content: file.name+'文件上传成功',
            content: res.msg,
            duration: 2
          });
        } else {
          // vm.$Message.warning(file.name+'文件模板不正确');
          vm.$Message.warning({
            content: res.msg,
            duration: 2
          });
        }

      },
      handleError: function (res, file) {
      },
      download: function () {
        document.getElementById('loadIframe').src = getUrl("positionTemplate");
      }
    },
    mounted: function () {
      this.reload();
    }
  }
</script>
