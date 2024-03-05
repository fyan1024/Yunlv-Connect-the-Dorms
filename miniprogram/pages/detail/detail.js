// pages/detail/detail.js
const db = wx.cloud.database();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    user: '',
    imageUrl: '', // 订单图片 URL 空
    recorId: '',
    orderinfo: [],
    bedId: '',
    bedinfo: [],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const orderId = options.id;
    console.log("传递的订单ID是:", orderId);
    // 接下来，您可以使用这个 userId 来进行数据库查询等操作
    this.getPicture(orderId);
  },
  getPicture: function (orderId) {
    // 使用 userId 作为查询条件，这里的示例假设您是根据 userId 来查找对应的订单记录
    // 注意：您需要根据实际数据库的设计来调整查询逻辑
    db.collection('Order').where({
      _id: orderId // 假设您的订单记录中有一个字段是 _id
    }).get().then(res => {
      // 假设图片 URL 存储在第一条记录的 'picture_add' 字段
      const orderinfo = res.data
      this.setData({
        imageUrl: res.data[0].picture_add,
        bedId: res.data[0].Bed_id,
        orderinfo: orderinfo
      });
      console.log("传递的床的id是", this.data.bedId)
      db.collection('Bed').where({
          _id: this.data.bedId // 假设您的订单记录中有一个字段是 _id
        }).get().then(res => {
          // 处理后台返回的商品信息
          const bedinfo = res.data;
          console.log(bedinfo)
          // 在页面中渲染商品信息
          this.setData({
            bedinfo: bedinfo
          });
          console.log(bedinfo)
        })
        .catch(error => {
          console.error('获取商品信息失败', error);
        });
    }).catch(err => {
      console.log("获取数据失败", err);
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