// pages/home/home.js

const db = wx.cloud.database();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    topProducts: [],
    active: 'home',
    beds: []
  },

  onChange(event) {
    this.setData({
      active: event.detail
    });
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.getTopProducts();
  },

  getTopProducts: function () {
    // 获取点赞量最多的5条商品信息
    db.collection('Bed')
      .orderBy('likes_num', 'desc')
      .limit(8)
      .get()
      .then(res => {
        // 处理后台返回的商品信息
        const topProducts = res.data;
        console.log(topProducts)

        // 在页面中渲染商品信息
        this.setData({
          topProducts: topProducts
        });
      })
      .catch(error => {
        console.error('获取商品信息失败', error);
      });
  },

  goToUploadBedPage() {//上传床位
    wx.navigateTo({
      url: '/pages/upload1/upload1' // 替换为你的床位上传页面路径
    });
  },

  goToSearch() {
    wx.navigateTo({
      url: '/pages/search/search'
    });
  },

  goToDetail(event) {
    const bedsId = event.currentTarget.dataset.bedsId;
    console.log(bedsId)
    wx.navigateTo({
      url: `/pages/bedinfo/bedinfo?id=${bedsId}`,
    });
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

  }
})