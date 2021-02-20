import request from '../../request'
const app =  getApp()

const componentOptions = {
  // 组件选项
  options: {
    multipleSlots: true,
  },
  behaviors: [],
  properties: {},
  // 组件数据
  data: {
    city: '',
    cityList: [],
    list: []
  },
  // 数据监听器
  observers: {},
  // 组件方法
  methods: {
    init() {},
    // 获取城市列表
    async loadCity(){
      const res = {
        result: [
          [{
            cidx: [0, 15],
            fullname: "北京市",
            id: "110000",
            location: {
              lat: 39.90469,
              lng: 116.40717
            },
            name: "北京",
            pinyin: ["bei", "jing"]
          }, {
            cidx: [16, 31],
            fullname: "天津市",
            id: "120000",
            location: {
              lat: 39.0851,
              lng: 117.19937
            },
            name: "天津",
            pinyin: ["tian", "jin"]
          }, {
            cidx: [32, 42],
            fullname: "河北省",
            id: "130000",
            location: {
              lat: 38.03599,
              lng: 114.46979
            },
            name: "河北",
            pinyin: ["he", "bei"],
          }, {
            cidx: [43, 53],
            fullname: "山西省",
            id: "140000",
            location: {
              lat: 37.87343,
              lng: 112.56272
            },
            name: "山西",
            pinyin: ["shan", "xi"],
          }]
        ]
      }
      const _this = this
      const cities = res.result[0]
      // 按拼音排序
      cities.sort((c1, c2) => {
        let pinyin1 = c1.pinyin.join('')
        let pinyin2 = c2.pinyin.join('')
        return pinyin1.localeCompare(pinyin2)
      })
      // 添加首字母
      const map = new Map()
      for (const city of cities) {
        const alpha = city.pinyin[0].charAt(0).toUpperCase()
        if (!map.has(alpha)) map.set(alpha, [])
        map.get(alpha).push({
          name: city.fullname
        })
      }

      const keys = []
      for (const key of map.keys()) {
        keys.push(key)
      }
      keys.sort()

      const list = []
      for (const key of keys) {
        list.push({
          alpha: key,
          subItems: map.get(key)
        })
      }
      console.log(list)
      this.setData({list})
      const result = await request.request({url:'fssc-flight/didi/loadCity',method:'post',data:{}})
        if (result.rstCode == 0){
          result.data.list.forEach(listItem=>{
            listItem.alpha = listItem.firstLetter
            listItem.subItems = listItem.citys.map(cityItem => {
              cityItem.name=cityItem.cityName
              return {name:cityItem.cityName}
            })
          })
          this.setData({cityList:result.data.list})
          console.log(this.data.cityList)
        }
    },
    // 选择城市，保存城市信息
    setCity(e){
      console.log('e: ', e);
      const item = e.currentTarget.dataset.item
      app.city = item;
      wx.redirectTo({url:'pages/index/index'})
    },
    // 重新定位
    reloadPos(){
      wx.showLoading({title:'正在定位中'})
      wx.getLocation({
        type: 'gcj02',
        isHighAccuracy: true,
        success: (result) => {
          app.location = {
            latitude: result.latitude,
            longitude: result.longitude
          }
          this.getGeocoder(app.location)
        },
        fail: () => {},
        complete: () => {wx.hideLoading()}
      });
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
				success: async (result)=>{
					result = result.data
					if(result.status===0){
            const {ad_info:{city},pois} = result.result
            this.setData({city})
						const cityObj = await this.matchCity({cityName:city})
            app.city = cityObj
					}
				},
				fail: ()=>{},
				complete: ()=>{}
			});
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
      const city = this.data.city
      this.setData({city:city ? decodeURIComponent(city) : ''})
      this.loadCity()
    },
    // 页面被隐藏
    hide() {
      
    },
    // 页面尺寸变化时
    resize() {},
  },
}

Component(componentOptions)
