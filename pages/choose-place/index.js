import request from "../../request";

const componentOptions = {
  // 组件选项
  options: {
    multipleSlots: true,
  },
  behaviors: [],
  properties: {},
  // 组件数据
  data: {
    mapData:{},//地图配置
    nearbyList:[],//选择列表
  },
  // 数据监听器
  observers: {},
  // 组件方法
  methods: {
    init() {},
    goSearch(e){
     wx.navigateTo({
       url: '/pages/search-place/index?type=' + this.data.type
     })
    },
    //视野发生变化
    regionChange(e){
      if(e.type=='end'){
        this.getGeocoder(e.detail.centerLocation)
      }
    },
    //根据定位获取位置信息及附近信息列表
    getGeocoder({latitude:lat,longitude:lng}) {
      wx.request({
        url: 'https://apis.map.qq.com/ws/geocoder/v1/?location=',
        data: {
          location:lat+','+lng,
          get_poi:1,
          key: 'BPVBZ-V4JLP-ETKDC-VT3DE-Y63E7-IDFSO'
        },
        header: {'content-type':'application/json'},
        method: 'GET',
        success: (result)=>{
          result = result.data
          if(result.status===0){
            const {address,pois=[]} = result.result
            this.setData({
              'mapData.markers[0]': {
                latitude:lat,
                longitude:lng,
                title: address,
                id: '1'
              },
              nearbyList:pois
            })
          }
        },
        fail: ()=>{},
        complete: ()=>{}
      });
    },
    // 收藏
    collect(e){
      const {item,index} = e.currentTarget.dataset
      item.favorite= item.favorite == '1' ? '0' : '1'
      this.setData({['nearbyList['+index+']']:item})
      this.saveAddress(this.parseAddress(item))
    },
    async getIndex(e){
      const item = e.currentTarget.dataset.item
      let address = await this.matchCity(this.parseAddress(item))
      getApp().onplace=address
      wx.navigateBack()
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
      const {latitude,longitude} = getApp().location;
      this.getGeocoder(getApp().location)
      this.setData({'mapData.latitude':latitude,'mapData.longitude':longitude,'mapData.markers[0]':{latitude,longitude,title:'1111111111',id:'1'}})
      // wx.createMapContext('#map',this)
      // const query = this.createSelectorQuery()
      // console.log('quer', query.select('#map'));
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
