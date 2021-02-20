class Request {
    constructor(params){
        this.baseUrl = params.baseUrl
    }
    request({method='get', url, data={},type,addToken=true}) {
        const that = this
        const header = {'content-type':'application/json'}
        if(type=='formData') header['content-type']='application/x-www-form-urlencoded'
        if(addToken)header['Authorization'] = getApp().userInfo.auth_token;
        
        return new Promise((resolve,reject)=>{
            wx.showLoading({mask:true,title:'加载中'})
            wx.request({
                url:this.baseUrl+url,
                data,
                method,
                header,
                success(res){
                    const data = res.data
                    resolve(data)
                    if(data.rstCode!='0'){
                        wx.showToast({
                            title: data.data.errorMsg,
                            icon: 'none',
                            duration: 1500,
                            mask: true,
                        });
                    }
                },
                fail(res){
                    wx.showToast({
                        title: res.data.rstMsg,
                        icon: 'none',
                        duration: 1500,
                        mask: true,
                    });
                    reject(res)
                },
                complete(){
                    wx.hideLoading()
                }
            })
        })
    }
}

export default  new Request({baseUrl:"http://fsscuat.tclking.com/fssc-api/"})