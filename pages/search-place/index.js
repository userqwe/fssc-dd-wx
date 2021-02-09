import {behavior} from "miniprogram-computed"
import request from "../../request";
const app = getApp();

let time = null
const componentOptions = {
  // 组件选项
  options: {
    multipleSlots: true,
  },
  behaviors: [behavior],
  properties: {
    type:{
      type:String,
      value:''
    }
  },
  // 组件数据
  data: {
    title: '',
      defaultWorld: '',
      searchVal: '',
      list: [], // 搜索列表
      address: [], // 历史数据列表
      homePlace: {},
      companyPlace: {},
      showUsualAddress: true,
      setType: '',
  },
  // 数据监听器
  observers: {},
  computed:{
    suggestList(data) {
      if (data.searchVal) {
        return data.list
      } else {
        return [...data.address, ...data.list]
      }
    }
  },
  // 组件方法
  methods: {
    init() {
      this.setData({'searchVal':'','setType':'','showUsualAddress':true})
      // this.type = this.$route.params.type
      // this.title = this.type == 'getOn' ? this.$t('lang.ddConfig.tip13') : this.$t('lang.ddConfig.tip14')
      // this.defaultWorld = this.type == 'getOn' ? this.$t('lang.ddConfig.tip15') : this.$t('lang.ddConfig.tip16')
      this.loadAddress()
    },
    // 获取附近地理位置信息
    async searchText() {
      let city =  getApp().city;
      city = city ? city.cityName : ''
      wx.request({
        url: 'https://apis.map.qq.com/ws/place/v1/search',
        data: {
          keyword: this.data.searchVal,
          boundary: 'region('+city+',0)',
          key: 'BPVBZ-V4JLP-ETKDC-VT3DE-Y63E7-IDFSO'
        },
        header: {'content-type':'application/json'},
        method: 'GET',
        success: (result)=>{
          result = result.data
          if(result.status===0){
            this.setData({
              'list': result.data||[]
            })
          }
        },
        fail: ()=>{},
        complete: ()=>{}
      });
    },
    goSearch(){
      this.$router.push({name: 'choosePlace', params: {type: this.type}})
    },
    // 点击常用地址，设置常用地址或者设置上车地址或下车地址
    async setUsualPlace(setType, flag){
      if (this[setType].name && !flag){// 有值，直接设置上车，下车地址
        let address = await this.matchCity(this.parseAddress(this[setType]))
        this.$store.commit('updateplace', {types: this.type, obj: address})
        this.$router.replace({name: 'index'})
      } else {
        if (setType == 'companyPlace'){
          this.title = this.$t('lang.ddConfig.tip44')
          this.defaultWorld = this.$t('lang.ddConfig.tip46')
        } else {
          this.title = this.$t('lang.ddConfig.tip45')
          this.defaultWorld = this.$t('lang.ddConfig.tip47')
        }
        this.$refs.search.$refs.search.focus()
        this.showUsualAddress = false
        this.setType = setType
      }
    },
    searchData(){
      let self = this
      if (time) clearTimeout(time)
      time = setTimeout(() => {
        self.searchText()
        self.loadAddress()
        time = undefined
      }, 500)
    },
    // 收藏
    collect(e){
      const {item,index} = e.currentTarget.dataset
      item.favorite= item.favorite == '1' ? '0' : '1'
      this.setData({['suggestList['+index+']']:item})
      this.saveAddress(this.parseAddress(item))
    },
    // 点击列表设置为常用地址或是设置上车，下车地址
    async getIndex(e){
      const item =e.currentTarget.dataset.item
      if (this.data.showUsualAddress){
        let address = await this.matchCity(this.parseAddress(item, null))
        app[this.data.type]=address
        wx.redirectTo({url:'pages/index/index'})
      } else {
        let setType = this.parseAddress(item, this.data.setType)
        await this.saveAddress(setType, this.setType)
        this.setData({
          [this.data.setType]: setType,
          showUsualAddress:true,
          searchVal:''
        })
        this.loadAddress(this.searchVal)
      }
      // this.title = this.type == 'getOn' ? this.$t('lang.ddConfig.tip13') : this.$t('lang.ddConfig.tip14')
      // this.defaultWorld = this.type == 'getOn' ? this.$t('lang.ddConfig.tip15') : this.$t('lang.ddConfig.tip16')
    },
    // 获取地址列表
    async loadAddress(){
      const result = await request.request({url:'fssc-flight/didi/loadAddress',method:'post'})
        if (result.rstCode == 0){
          this.address = []
          const data = result.data
          let address = JSON.parse(JSON.stringify(data.address))
          let favoriteList = []
          let notFavoriteList = []
          address.sort((v1, v2) => v1.id - v2.id).forEach(item => {
            if (item.favorite) favoriteList.push(item)
            else notFavoriteList.push(item)
          })
          this.setData({
            'homePlace':data.home||{},
            'companyPlace':data.company||{},
            'address': [...favoriteList, ...notFavoriteList]
          })
        }
    },
    // 存储地址
    async saveAddress(data){
      await request.request({method:'post',url:'fssc-flight/didi/saveAddress',data})
    },
    // 处理存储地址参数
    parseAddress(item){
      console.log('item: ', item);
      let {lat,lng} = item.location
      let data = {
        useAddress: '0',
        cityName: item.cityName || item.ad_info.city,
        mId: item.mId,
        name: item.name||item.title,
        address: item.address,
        longitude: item.longitude || lng,
        latitude: item.latitude || lat,
        favorite: item.favorite || '0',
        home: '0',
        company: '0',
      }
      return data
    },
    // 匹配城市Id
    async matchCity(cityObj){
      const result = await request.request({method:'post',url:'fssc-flight/didi/matchCity',data:{city: cityObj.cityName || cityObj.name},type:'formData'})
      if (result.rstCode == 0){
        cityObj.cityId = result.data.cityId
        return cityObj
      }
    },
  },
  // 组件生命周期
  lifetimes: {
    created() {},
    attached() {
      this.init()
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
     this.init()
    },
    // 页面被隐藏
    hide() {
     
    },
    // 页面尺寸变化时
    resize() {},
  },
}

Component(componentOptions)
