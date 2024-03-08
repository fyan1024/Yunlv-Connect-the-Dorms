// pages/save/save.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    bedinfo: '',
    user: '',
    userId: '',
    bedId: '',
    beds: []
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    const userId = options.id;
    console.log("当前用户id", userId)
    this.setData({
      userId: userId
    })
    this.getBedIds();
  },
  getBedIds: function () {
    const db = wx.cloud.database();
    const that = this
    db.collection('save').get().then(res => {
      if (res.data.length > 0) {
        console.log(res.data)
        const bedIds = res.data.map(item => item.bedId);
        // 获取床铺信息并展示
        console.log("bedIds", bedIds)
        that.setData({
          beds: bedIds
        })
        that.getBedsInfo(bedIds);
      }
    }).catch(err => {
      console.error('获取bedId失败：', err);
    });
  },

  // 根据bedId查询bed表中的床铺信息并展示
  getBedsInfo: function (bedIds) {
    const db = wx.cloud.database();
    db.collection('Bed').where({
      _id: db.command.in(bedIds)
    }).get().then(res => {
      this.setData({
        beds: res.data
      });
    }).catch(err => {
      console.error('查询床铺信息失败：', err);
    });
    console.log("beds",this.data.beds)
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