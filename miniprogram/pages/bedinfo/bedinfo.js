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
          this.Univ2Location(); 
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

 Univ2Location() {
  var _this = this;
  var allMarkers = [];
  
  // 直接从this.data.bedinfo获取单个位置信息
  var bedinfo = this.data.bedinfo;
  
  console.log("Loading Univ2Location");
  console.log(bedinfo.address + "," + bedinfo.latitude + "," + bedinfo.longitude);
  
  // 创建一个基于bedinfo信息的marker
  const marker = {
    id: 0, // 由于只有一个marker，id设置为0
    latitude: bedinfo.latitude,
    longitude: bedinfo.longitude,
    width: 50,
    height: 50,
    callout: {
      content: bedinfo.address,
      display: 'ALWAYS',
      fontSize: 14,
      bgColor: "#ffffff",
      padding: 10,
      borderRadius: 5,
      borderWidth: 1,
      borderColor: "#cccccc"
    }
  };
  allMarkers.push(marker);

  // 设置地图中心为这个marker的位置，并添加到markers中
  _this.setData({
    latitude: marker.latitude,
    longitude: marker.longitude,
    markers: allMarkers
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