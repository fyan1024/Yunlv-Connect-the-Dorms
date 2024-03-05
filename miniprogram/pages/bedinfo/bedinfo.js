const db = wx.cloud.database();

Page({
  data: {
    goodsDetail: null,
    bedinfo: []
  },
  onLoad(options) {
    const bedsId = options.id;
    // 发起网络请求，获取商品详情数据
    db.collection('Bed').doc(bedsId).get().then(res => {
        // 处理后台返回的商品信息
        const bedinfo = res.data;

        // 在页面中渲染商品信息
        this.setData({
          bedinfo: bedinfo
        });
        console.log(bedinfo)
      })
      .catch(error => {
        console.error('获取商品信息失败', error);
      });
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