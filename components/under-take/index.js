const componentOptions = {
  // 组件选项
  options: {
    multipleSlots: true,
  },
  behaviors: [],
  properties: {
    undertakeModel:{
      type:Object,
      value:{}
    }
  },
  // 组件数据
  data: {
    model:{},//组件数据模型
    dialogShow: false,
    buttons: [{text: '取消'}, { text: '确定'}],
  },
  // 数据监听器
  observers: {
    "undertakeModel.**":function(data){
      this.setData({model:data})
    }
  },
  // 组件方法
  methods: {
    init() {},
    close(e){
      this.setData({'model.visible':false})
      !e&&this.triggerEvent('undertake-callback',{data:this.data.model,flag:true})
    },
    //确认弹窗回调
    tapDialogButton(e) {
      this.setData({dialogShow: false})
      this.close()
    },
    //点击确定按钮，提交信息
    subInfo(){
        if (!this.data.model.costCenter.nodeId){
            wx.showToast({title:'请先选择成本中心',icon:'none'})
            return
        }
        if (this.data.model.channel.retuired && !this.data.model.channel.nodeId){
            wx.showToast({title:'请先选择渠道',icon:'none'})
            return
        }
        this.setData({dialogShow:true})
    },
    // 打开下拉树
    openTree(e){
        const {item, tag:type, itemType} = e.currentTarget.dataset
        const {userId,dept,company,billId} = this.data.model
        this.setData({
          treeModel: {
            selected: item,
            params: {
              url: 'fssc-data/data/ecosystemFormTree',
              itemText: type,
              hideClear: false,
              pmsObj: {
                userId,
                deptId: dept.nodeId,
                companyId: company.nodeId,
                billId,
                itemType,
              }
            },
            name: type,
            visible:true
          }
        })
    },
    // 下拉树回调
    treeCallback(e){
      const {name,selected} = e.detail
      this.setData({['model.'+name]:selected})
    },
  },
  // 组件生命周期
  lifetimes: {
    created() {},
    attached() {
      this.setData({
        "model.visible": false
      })
    },
    ready() {},
    moved() {},
    detached() {},
  },
  definitionFilter() {},
  // 页面生命周期
  pageLifetimes: {
    // 页面被展示
    show() {

      // 重新执行定时器等操作
    },
    // 页面被隐藏
    hide() {
      // 清除定时器等操作
    },
    // 页面尺寸变化时
    resize() {},
  },
}

Component(componentOptions)
