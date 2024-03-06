// pages/comment/comment.js
const db = wx.cloud.database();
const _ = db.command;
Page({
  /**
   * 页面的初始数据
   */
  data: {
    comments: [], // 用于存储查询到的留言数据
    userId: '',
    id: '',
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
    this.queryUserBedComments();
  },
  queryUserBedComments: function () {
    // 假设userId是从某处获取的当前用户ID
    const userId = this.data.userId;
    // 首先查询当前用户的床位
    db.collection('Bed').where({
      ownerId: userId // 假设床位记录中有ownerId字段标识所有者
    }).get().then(res => {
      const beds = res.data;
      const bedIds = beds.map(bed => bed._id); // 获取当前用户床位的ID数组
      // 然后查询这些床位的留言
      db.collection('comment').where({
        bedId: db.command.in(bedIds)
      }).get().then(res => {
        this.setData({ comments: res.data });
      });
    }).catch(err => {
      console.error('查询失败', err);
    });
  },
  goToDetail(event) {
    const bedId = event.currentTarget.dataset.idId;
    wx.navigateTo({
      url: `/pages/bedinfo/bedinfo?id=${bedId}`,
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