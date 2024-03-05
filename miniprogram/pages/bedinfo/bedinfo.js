const db = wx.cloud.database();

Page({
  data: {
    goodsDetail: null,
    bedinfo: [],
    
    longitude:undefined,
    latitude:undefined,

    scale:11,
  },
  onLoad(options) {
    // `bedsId` 的值作为URL参数传递给了 `bedinfo`
    // `onLoad` 函数可以通过它的参数 `options` 来访问这个传递过来的 `id` 值。
    const bedsId = options.id;
    db.collection('Bed').doc(bedsId).get().then(res => {
        const bedinfo = res.data;
        this.setData({
          bedinfo: bedinfo
        }, () => {
          // 使用 setData 的回调函数确保数据已被设置
          console.log("bedinfo页面：", this.data.bedinfo);
          console.log("开始查询地点 bedinfo.address：", this.data.bedinfo.address);
          console.log("开始查询大学 bedinfo.university", this.data.bedinfo.university);
          console.log("开始查询城市 bedinfo.city", this.data.bedinfo.city);
          this.Univ2Location(this.data.bedinfo.address, this.data.bedinfo.city); 
        });
      })
      .catch(error => {
        console.error('获取商品信息失败', error);
      }
    );
  },

  /*
  申请 WebServiceAPI Key，开启腾讯位置服务，参考： 
    https://lbs.qq.com/faq/serverFaq/webServiceKey
  分配额度，参考：
    https://blog.csdn.net/m0_52993798/article/details/133647174
  配置域名，参考：
    https://developers.weixin.qq.com/miniprogram/dev/framework/ability/network.html
  参考腾讯位置服务 demo 实现地址转坐标搜索函数, 地图WebserviceAPI地点搜索接口请求路径及参数，参考：
    https://lbs.qq.com/service/webService/webServiceGuide/miniprogram?ref=miniprogram_component_map#5
  例如：
    // url: 'https://apis.map.qq.com/ws/place/v1/search?page_index=1&page_size=20&boundary=region(北京市,0)&keyword=美食&key=PWHBZ-SREKC-AE52A-A3IEA-QDXLQ-CHB5Q',  
  */

  Univ2Location(university, city) {
    var _this = this;
    var allMarkers = []

    // 在wx.request调用之前声明并初始化cityWithSuffix
    const cityWithSuffix = city.endsWith("市") ? city : city + "市";
    
    wx.request({
      url: `https://apis.map.qq.com/ws/place/v1/search?page_index=1&page_size=10&boundary=region(${encodeURIComponent(cityWithSuffix)},0)&keyword=${encodeURIComponent(university)}&key=PWHBZ-SREKC-AE52A-A3IEA-QDXLQ-CHB5Q`,

      // header: {
      //   'content-type': 'application/json' // 默认值
      // },
      
      success(res) {
        console.log("Loading Univ2Location")

        var result = res.data
        var pois = result.data
        console.log(pois)
        for(var i = 0; i< pois.length; i++){
          var title = pois[i].title
          var lat = pois[i].location.lat
          var lng = pois[i].location.lng
          console.log(title+","+lat+","+lng)
          const marker = {
            id: i,
            latitude: lat,
            longitude: lng,
            width: 50,
            height: 50,
            callout: {
              // 点击marker展示title
              content: title,
              display: 'ALWAYS', // 始终显示标题
              // 其他可选的样式调整，如字体大小、背景颜色等
              fontSize: 14,
              bgColor: "#ffffff",
              padding: 10,
              borderRadius: 5,
              borderWidth: 1,
              borderColor: "#cccccc"
            }
          }
          allMarkers.push(marker);
        }
        
        _this.setData({
          latitude: allMarkers[0].latitude,
          longitude: allMarkers[0].longitude,
          markers: allMarkers
        })
      },
      fail(error) {
        console.error('地点搜索失败：', error);
      }
    });
  },

  // 跳转导航APP
  // https://developers.weixin.qq.com/miniprogram/dev/api/location/wx.openLocation.html
  onMarkerTap(e) {
    console.log('Marker ID:', e.markerId);
    const marker = this.data.markers.find(marker => marker.id === e.markerId);
    if (marker) {
      wx.openLocation({
        latitude: marker.latitude,
        longitude: marker.longitude,
        name: marker.callout.content, // 可选，地点名字
        scale: 18 // 可选，缩放级别，默认为18，范围从5~18
      });
    }
  },


  onClickIcon1() {
    wx.showToast({
      title: '点击图标1',
      icon: 'none'
    })
    console.log
  },

  onClickIcon2() {
    wx.showToast({
      title: '点击图标2',
      icon: 'none'
    })
    console.log
  },

  onClickButton1() {
    wx.showToast({
      title: '点击按钮1',
      icon: 'none'
    })
  },

  onClickButton2() {
    wx.showToast({
      title: '点击按钮2',
      icon: 'none'
    })
  },
});