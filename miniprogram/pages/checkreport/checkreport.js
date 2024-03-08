// pages/checkreport/checkreport.js
const db = wx.cloud.database()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    dataObj: [],
  },
  onChange(event) {
    let statusText = '';
    if (event.detail.name === 0) {
      statusText = '未被举报';
    } else if (event.detail.name === 1) {
      statusText = '已被举报';
    }
    wx.showToast({
      title: `${statusText}`,
      icon: 'none',
    });
  },

  goToDetail(event) {
    const orderId = event.currentTarget.dataset.orderId;
    console.log(orderId)
    wx.navigateTo({
      url: `/pages/detail/detail?id=${orderId}`,
    });
  },

  viewDetails(event){
    const orderId = event.currentTarget.dataset.orderId;
    console.log(orderId)
      // 查询 Order 表中的 Report 信息
    db.collection('Order').doc(orderId).get({
      success: orderRes => {
        const orderData = orderRes.data;
        const reportInfo = orderData.Report;
        // 弹出显示 Report 信息的弹窗
        wx.showModal({
          title: '订单举报详情',
          content: reportInfo || '暂无举报信息',
          showCancel: false,
          confirmText: '确定'
        });
      },
      fail: orderErr => {
        console.error('查询订单信息失败：', orderErr);
        wx.showToast({
          title: '查询订单信息失败',
          icon: 'none',
          duration: 2000
        });
      }
    });
  },

  reviewReport(event){
    const orderId = event.currentTarget.dataset.orderId;
    console.log(orderId);
  
    // 查询 Order 表中的对应记录
    db.collection('Order').doc(orderId).get({
      success: orderRes => {
        const orderData = orderRes.data;
        const isReviewed = orderData.Is_reviewed;
  
        if (isReviewed) {
          // 如果订单已经被审核
          wx.showToast({
            title: '该订单已被审核',
            icon: 'none',
            duration: 2000
          });
        } else {
          // 如果订单未被审核，弹出选择举报结果的弹窗
          wx.showModal({
            title: '举报结果',
            content: '请选择举报结果',
            showCancel: true,
            cancelText: '不通过',
            confirmText: '成功',
            success: modalRes => {
              if (modalRes.confirm) {
                // 用户选择举报成功
                // db.collection('Order').doc(orderId).update({
                //   data: {
                //     Is_reviewed: true,
                //     Is_success: true
                //   },
                //   success: updateRes => {
                //     console.log('举报成功');
                //     wx.showToast({
                //       title: '举报成功',
                //       icon: 'success',
                //       duration: 2000
                //     });
                //   },
                //   fail: updateErr => {
                //     console.error('举报成功但更新记录失败：', updateErr);
                //     wx.showToast({
                //       title: '更新记录失败',
                //       icon: 'none',
                //       duration: 2000
                //     });
                //   }
                // });
                db.collection('Order').doc(orderId).update({
                  data: {
                      Is_reviewed: true,
                      Is_success: true
                  },
                  success: updateRes => {
                      console.log('举报成功');
                      // 查询订单表，获取用户 ID
                      db.collection('Order').doc(orderId).get({
                          success: orderRes => {
                              const orderData = orderRes.data;
                              const userId = orderData.User_id;
              
                              // 使用用户 ID 查询用户表，获取用户的 Points
                              db.collection('User').where({
                                      _id: userId
                              }).get({
                                  success: userRes => {
                                      const userData = userRes.data[0];
                                      const userPoints = userData.Points;
              
                                      // 将用户的 Points 减去 100
                                      const newPoints = userPoints - 5;
                                      console.log(newPoints)
              
                                      // 更新用户表中对应用户的 Points
                                      db.collection('User').doc(userData._id).update({
                                          data: {
                                              Points: newPoints
                                          },
                                          success: updatePointsRes => {
                                              console.log('用户 Points 更新成功');
                                          },
                                          fail: updatePointsErr => {
                                              console.error('用户 Points 更新失败：', updatePointsErr);
                                          }
                                      });
                                  },
                                  fail: userErr => {
                                      console.error('查询用户信息失败：', userErr);
                                  }
                              });
                          },
                          fail: orderErr => {
                              console.error('查询订单信息失败：', orderErr);
                          }
                      });
              
                      wx.showToast({
                          title: '举报成功',
                          icon: 'success',
                          duration: 2000
                      });
                  },
                  fail: updateErr => {
                      console.error('举报成功但更新记录失败：', updateErr);
                      wx.showToast({
                          title: '更新记录失败',
                          icon: 'none',
                          duration: 2000
                      });
                  }
              });
              } else if (modalRes.cancel) {
                // 用户选择举报不通过
                db.collection('Order').doc(orderId).update({
                  data: {
                    Is_reviewed: true,
                    Is_success: false
                  },
                  success: updateRes => {
                    console.log('举报不通过');
                    wx.showToast({
                      title: '举报不通过',
                      icon: 'none',
                      duration: 2000
                    });
                  },
                  fail: updateErr => {
                    console.error('举报不通过但更新记录失败：', updateErr);
                    wx.showToast({
                      title: '更新记录失败',
                      icon: 'none',
                      duration: 2000
                    });
                  }
                });
              }
            }
          });
          // 监听模态框关闭事件
        }
      },
      fail: orderErr => {
        console.error('查询订单信息失败：', orderErr);
        wx.showToast({
          title: '查询订单信息失败',
          icon: 'none',
          duration: 2000
        });
      }
    });
  },

  getPoints(orderid){
    db.collection('Order').where({
      _id: orderid
    }).get({
      success: (res) => {
        this.setData({
          dataObj: res.data
        });
        console.log('查询成功：', res.data);

      },
      fail: (err) => {
        console.error('查询失败：', err);
      }
    })
},

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    const orderid = options.id;
    console.log(orderid)
    this.getPoints(orderid);
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