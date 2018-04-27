<template>
  <div class="box user-box user">
    <div v-show="showList">
      <div class="form-condition form-inline">
        <div class="form-group">
          <Input class="input-box"  v-model="q.username" placeholder="请输入用户账号" @keyup.enter.native="query"></Input>
        </div>
        <div class="form-group">
          <Button type="primary" class="search" @click="query" >查询</Button>
        </div>
        <div class="form-group">
          <Button type="primary" class="search" @click="downLoad" >导出</Button>
          <iframe src="" id="loadIframe" frameborder="0" style="display:none"></iframe>
        </div>
      </div>
      <div class="table">
        <div class="table-wrap">
          <Table border :width="tableWidth_"  :no-data-text="noDataText" class="table" :data="tableData" :columns="columns" stripe></Table>
        </div>
        <div style="margin: 10px;overflow: hidden;margin-bottom: 60px;">
          <div id="page" class="pull-right">
            <Page size="small" :total="totalCount" :current="currPage" :page-size="size" :page-size-opts="sizeopt" show-elevator show-sizer show-total @on-change="changePage($event)"
                  @on-page-size-change="changeSize" placement="top"></Page>
          </div>
        </div>
      </div>
    </div>
    <div v-show="!showList" class="panel panel-default">
      <Card dis-hover>
        <p slot="title">修改密码</p>
        <Form :model="editUser" :label-width="120">
          <FormItem label="用户账号">
            <span v-text="editUser.appAccount"></span>
          </FormItem>
          <FormItem label="用户名称">
            <span v-text="editUser.displayName"></span>
          </FormItem>
          <FormItem label="职务名称">
            <span v-text="editUser.zwbmName"></span>
          </FormItem>
          <FormItem label="手机号">
            <span v-text="editUser.mobile"></span>
          </FormItem>
          <FormItem label="邮箱">
            <span v-text="editUser.email"></span>
          </FormItem>
          <FormItem label="新密码">
            <input type="password"   class="user-password" name="新密码" maxlength="20" placeholder="请输入新密码"
                   autocomplete="off"  v-model="editUser.password" v-validate="'required:新密码|min:6'"
            >
            <div v-show="errors.has('新密码')" class="tip-danger">
              <Icon type="android-warning"></Icon>
              {{ errors.first('新密码') }}
            </div>
          </FormItem>
          <FormItem label="确认新密码">
            <input type="password"  class="user-password" name="确认密码" maxlength="20" placeholder="请确认新密码"
                   @focus="cleartip" autocomplete="off" v-model="editUser.repassword" v-validate="'required:确认密码|min:6|confirm'"
            />
            <div v-show="errors.has('确认密码')" class="tip-danger">
              <Icon type="android-warning"></Icon>
              {{ errors.first('确认密码') }}
            </div>
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
  var vm = this;
  if (!!window.ActiveXObject || "ActiveXObject" in window) {
    $('.tip-danger').css('color','transparent');

  }
  export default {
    data: function(){
        return {
          formItem: {},
          q:{
            username: '',
          },
          showList: true,
          title:null,
          editUser:{},
          tableData:[],
          tableWidth_:'',
          noDataText:'',
          spinShow:true,
          columns: [
            {
              title: '用户账号',
              key: 'appAccount',
              width:'120'
            },
            {
              title: '用户名称',
              key: 'displayName',
              width:'90'
            },
            {
              title: '主岗/兼职',
              key: 'tPrimary',
              width:'80'
            },
            {
              title: '岗位编码',
              key: 'positionCode',
              width:'150'
            },
            {
              title: '岗位名称',
              key: 'positionDesc'
            },
            {
              title: '公司代码',
              key: 'companyCode',
              width:'90'
            },
            {
              title: '角色编码',
              key: 'zwbm',
              width:'100'
            },
            {
              title: '角色名称',
              key: 'zwbmName',
              width:'100'
              // 一个用户可能身兼多职，返回的是一个数组，显示上拼接成字符串
              //render=>function(h, params){
              //    var zwbms = params.row.zwbms;
              //    return h("span", null, zwbms && zwbms.join && zwbms.join("，") || zwbms);
              //}
            },
            {
              title: '状态',// 1，新增；4：解锁；5：锁定。改变用户状态只需要给接口传入4或5
              key: "state",
              width:'90',
              render: function(h, params){
                var rowData = params.row, employeeId = rowData.employeeId;
                return h("i-switch",
                  {
                    props: {
                      size: "large",
                      disabled:rowData.state=="3",
                      value: rowData.state=='1'// 只有1的时候是启用
                    },
                    on: {
                      // 启用状态改变的时候，发送请求同步变化
                      "on-change": function(state){
                        axios.post(getUrl("updateUserStatus"), {employeeId: employeeId, state: state ? 1 : 5}
                        ).then(function(data){
                          if(data.code === 0){ // 操作成功
                            vm.$Message.success("操作成功");
                            vm.reload();
                          }else{
                            vm.$Message.warning(data.msg);
                          }
                        });
                      }
                    }
                  },
                  [
                    h("span", {slot: "open"}, "启用"),
                    h("span", {slot: "close"}, "禁用")
                  ]
                )
              }
            },
            {
              title: '管理员',// 1，新增；4：解锁；5：锁定。改变用户状态只需要给接口传入4或5
              key: "userRole",
              width:'90',
              render: function(h, params){
                var rowData = params.row, employeeId = rowData.employeeId;
                return h("i-switch",
                  {
                    props: {
                      size: "large",
                      disabled:rowData.state=='3',
                      value: rowData.userRole == "1"// 只有为1的时候 是管理员状态
                    },
                    on: {
                      // 启用状态改变的时候，发送请求同步变化
                      "on-change": function(userRole){
                        axios.post(getUrl("updateUserRole"), {employeeId: employeeId, userRole: userRole ? 1 : 0}).then(function(data){
                          console.log(data);
                          if(data.code === 0){ // 操作成功
                            vm.$Message.success("操作成功");
                            vm.reload();
                          }else{
                            vm.$Message.warning(data.msg);
                          }
                        })
                      }
                    }
                  },
                  [
                    h("span", {slot: "open"}, "是"),
                    h("span", {slot: "close"}, "否")
                  ]
                )
              }
            },
            {
              title: '起始日期',
              key: 'startDate',
              width:'90'
            },
            {
              title: '截止日期',
              key: 'endDate',
              width:'90'
            },
            {
              title: '操作',
              width:'120',
              render: function(h, params){
                var rowData = params.row;
                if(rowData.state!='3'){
                  return h("a", {
                    attrs: {
                      href: "javascript:;"
                    },
                    on: {
                      click: function(){
                        vm.update(rowData);
                      }
                    }
                  }, '修改密码')
                }else {
                  return h("span", {
                  }, '修改密码')
                }


              }
            }
          ],
          totalCount:0,
          sizeopt:[10,20,50,100],
          size:10,
          currPage:1,
          fixedHeader:false,
          getPage:true,
          getSize:true,
          fileName:''
        }
    },
    methods: {
      query: function () {
        vm.spinShow=true;
        vm.currPage=1;
        vm.reload();
      },
      update: function (userData) {
        var employeeId = userData.employeeId;
        if(employeeId == null){
          return ;
        }
        vm.showList = false;
        vm.title = "修改";
        vm.getUser(userData);
        //每次进入修改密码前先清空上一次的错误提示
        this.$validator.errors.clear();
        vm.editUser.password='';
        vm.editUser.repassword='';
      },
      save: function () {
        var editUser = this.editUser, $Message = this.$Message;
        this.$validator.validateAll().then(function(valid){
          if(valid){
            axios.post(getUrl("updatePwd"), {
              employeeId: editUser.employeeId,
              appAccountPwd: editUser.password
            }).then(function(data){
              if(data.code === 0){ // 操作成功
                $Message.success("操作成功");
                vm.reload();
              }else{
                $Message.warning(data.msg);
              }
            });
          }else {
            $('.tip-danger').css('color','#e75033');
          }
        });
      },
      // 取消编辑操作
      cancel: function(){
        this.showList = true;
        this.editUser = {};
      },
      reload: function () {
        vm = this;
        vm.showList = true;
        if(vm.q.username!=''){
          vm.q.username=String(vm.q.username).replace(/\s+/g,"").toUpperCase();
        }
        axios.get(getUrl("userList"), {
          params: {
            userName: vm.q.username,
            currPage: vm.currPage,
            pageSize: vm.size
          },
          loading: true,
          unload: true,
        }).then(function(data){
          vm.spinShow=false;
          var page = data.page;
          vm.getPage=true;
          vm.getSize=true;
          vm.totalCount = page.totalCount;
          if(page.list && page.list.length>0){
            page.list.forEach(function(v,i){
              if(v.tPrimary==1){
                v.tPrimary='主岗';
              }else {
                v.tPrimary='兼职';
              }

            });
            vm.tableData = page.list;
          }else {
            vm.tableData=[];
            vm.noDataText='暂无数据';
          }

          vm.currPage = page.currPage;
        }).catch(function(err){
          vm.spinShow=false;
          vm.noDataText='暂无数据';
          console.log(err);
        })
      },
      getUser: function(userData){
        this.editUser = $.extend({}, userData);
      },
      // 表格页码切换
      changePage: function (page) {
        vm.spinShow=true;
        this.currPage = page;
        if(this.getPage){
          this.reload();
        }else {
          this.getPage=false;
        }
      },
      // 表格显示条数切换
      changeSize: function (pageSize) {
        vm.spinShow=true;
        this.size = pageSize;
        this.currPage=1;
        if(this.getSize){
          this.reload();
        }else {
          this.getSize=false;
        }
      },
      tableWidth:function(){
        if(document.body.clientWidth<=1400){
          // vm.tableWidth_=1600;
          //$('.table-wrap').css({'overflowX':'scroll','minWidth':'800px'})
          vm.columns.forEach(function(v,i){
            v.width='';
          })
          vm.columns[0].width='100'
        }

      },
      cleartip:function(){
        if (!!window.ActiveXObject || "ActiveXObject" in window) {
          $('.tip-danger').css('color','transparent');

        }
      },
      downLoad:function(){
        var url=getUrl("userdownLoad")+"?userName="+vm.q.username
        document.getElementById('loadIframe').src=url;
      }

    },
    // 及早地给校验器绑定配置信息
    beforeCreate: function(){
      var vm = this, v = this.$validator, rules = {
        "confirm": {
          validate: function(value){
            return vm.editUser.password == value;
          },
          getMessage: "两次密码不一致"
        }
      };
      for(var i in rules){
        v.extend(i, rules[i])
      }
    },
    mounted:function(){
      $(window).on('resize',function(){
        vm.tableWidth();
      });
      this.reload();
      this.tableWidth();
    }
  }
</script>
