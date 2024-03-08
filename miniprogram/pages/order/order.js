// pages/order/order.js
const db = wx.cloud.database()
const _ = db.command;

Page({
  /**
   * 页面的初始数据
   */
  data: {
    dataObj: [],
    userId: '',
    points: 0,
  },

  onChange(event) {
    let statusText = '';
    if (event.detail.name === 0) {
      statusText = '待归还';
    } else if (event.detail.name === 1) {
      statusText = '待使用';
    } else if (event.detail.name === 2) {
      statusText = '已归还';
    } else if (event.detail.name === 3) {
      statusText = '已使用';
    }
  
    wx.showToast({
      title: `${statusText}`,
      icon: 'none',
    });
  },

  GetOrderData(userid) {
    db.collection('Order').where(_.or([
      {User_id: userid},
      {user_id: userid}
    ])).get({
      success: (res) => {
        this.setData({
          dataObj: res.data
        });
        console.log(dataObj)
        console.log('查询成功：', res.data);

      },
      fail: (err) => {
        console.error('查询失败：', err);
      }
    })
  },

  goToDetail(event) {
    const orderId = event.currentTarget.dataset.orderId;
    console.log(orderId)
    wx.navigateTo({
      url: `/pages/detail/detail?id=${orderId}`,
    });
  },
  comment(event){
    const orderId = event.currentTarget.dataset.orderId;
    console.log(orderId);
    // 弹出填写相关信息的弹窗
    wx.showModal({
      title: '填写评价信息',
      content: '请填写相关信息',
      showCancel: true,
      confirmText: '确定',
      cancelText: '取消',
      editable: true,
      success: modalRes => {
        if (modalRes.confirm) {
          const reportContent = modalRes.content;
          db.collection('Order').doc(orderId).update({
            data: {
              Evaluation: reportContent,
            },
            success: updateRes => {
              console.log('评价成功');
              wx.showToast({
                title: '评价已填写',
                icon: 'success',
                duration: 2000
              });
            },
            fail: updateErr => {
              console.error('评价失败:', updateErr);
              wx.showToast({
                title: '评价失败',
                icon: 'none',
                duration: 2000
              });
            }
          });
        } else if (modalRes.cancel) {
          db.collection('Order').doc(orderId).update({
            data: {
              Evaluation: '',
            },
            success: updateRes => {
              console.log('取消评价');
              wx.showToast({
                title: '已取消评价',
                icon: 'success',
                duration: 2000
              });
            },
            fail: updateErr => {
              console.error('取消评价失败:', updateErr);
              wx.showToast({
                title: '取消评价失败',
                icon: 'none',
                duration: 2000
              });
            }
          });
        }
      }
    });
  },


  // returnOrder(event) {
  //   // const that = this
  //   const orderId = event.currentTarget.dataset.orderId; // 获取订单 ID
  //   console.log(orderId)
  //   db.collection('Order').doc(orderId).update({
  //     data: {
  //       status: 'returned'
  //     },
  //     success: res => {
  //       wx.showToast({
  //         title: '订单已归还',
  //         icon: 'success',
  //         duration: 2000
  //       });
  //       // this.refresh()
  //     },
  //     fail: err => {
  //       console.error('更新订单状态失败：', err);
  //       wx.showToast({
  //         title: '订单归还失败',
  //         icon: 'none',
  //         duration: 2000
  //       });
  //     }
  //   });
  //   return true;
  // },

  completeOrder(event){
    const orderId = event.currentTarget.dataset.orderId; // 获取订单 ID
    console.log(orderId)
    db.collection('Order').doc(orderId).update({
      data: {
        status: 'returned',
        user_status:'used'
      },
      success: res => {
        wx.showToast({
          title: '订单已完成',
          icon: 'success',
          duration: 2000
        });
        // this.refresh()
        db.collection('Order').doc(orderId).get({
          success: orderRes => {
            const userId = orderRes.data.User_id;
            
        // 更新 User 表的 points 值增加10
        db.collection('User').doc(userId).update({
          data: {
            Points: db.command.inc(10)
          },
          success: updateRes => {
            console.log('更新用户积分成功');
          },
          fail: updateErr => {
            console.error('更新用户积分失败:', updateErr);
          }
          });
          },
          fail: orderErr => {
            console.error('查询订单失败：', orderErr);
          }
        });
      },
      fail: err => {
        console.error('更新订单状态失败：', err);
        wx.showToast({
          title: '订单归还失败',
          icon: 'none',
          duration: 2000
        });
      }
    });
    return true;
  },

  cancelOrder(event) {
    const orderId = event.currentTarget.dataset.orderId;
    if (!orderId) {
      console.error('未能获取到订单 ID');
      return;
    }
  
    const orderCollection = db.collection('Order');
    db.collection('Order').doc(orderId).get({
      success: orderRes => {
        const userId = orderRes.data.user_id;
        
        // 更新 User 表的 points 值增加20
        db.collection('User').doc(userId).update({
          data: {
            Points: db.command.inc(20)
          },
          success: updateRes => {
            console.log('更新用户积分成功');
  
            // 更新用户积分成功后，再删除对应的订单
            orderCollection.doc(orderId).remove()
              .then(res => {
                console.log('订单取消成功', res);
                wx.showToast({
                  title: '订单已成功取消',
                  icon: 'success',
                  duration: 2000
                });
                // 删除成功后的操作，如刷新页面或其他逻辑处理
              })
              .catch(err => {
                console.error('订单取消失败', err);
                wx.showToast({
                  title: '订单取消失败',
                  icon: 'none',
                  duration: 2000
                });
              });
          },
          fail: updateErr => {
            console.error('更新用户积分失败:', updateErr);
            wx.showToast({
              title: '更新用户积分失败',
              icon: 'none',
              duration: 2000
            });
          }
        });
      },
      fail: orderErr => {
        console.error('查询订单失败：', orderErr);
      }
    });
  },

  thumbsUp(event){
    const orderId = event.currentTarget.dataset.orderId; // 获取订单 ID
    console.log(orderId)
    // 查询 Order 表中的 Is_liked 信息
    db.collection('Order').doc(orderId).get().then(res => {
      const order = res.data;
      const isLiked = order.Is_liked;
      if (isLiked) {
        // console.log('已点赞');
        wx.showToast({
          title: '已点赞',
          icon: 'none',
          duration: 1000
        });
      } else {
        // 修改 Order 表中的 Is_liked 为 true
        db.collection('Order').doc(orderId).update({
          data: {
            Is_liked: true
          },
          success: res => {
            console.log('Is_liked 修改成功');
            const userId2 = order.User_id;
            const userId = order.user_id;
            console.log('User_id:', userId);
            console.log('user_id:', userId2);
            // 查询 User 表中的数据并打印出来
            db.collection('User').doc(userId).get().then(res => {
              const user = res.data;
              console.log('原始 points:', user.Points);
              // 将 points 值增加2
              user.Points += 2;
              // 更新 User 表中的数据
              db.collection('User').doc(userId).update({
                data: {
                  Points: user.Points
                },
                success: res => {
                  console.log('增加2后的 points:', user.Points);
                },
                fail: err => {
                  console.error('points 更新失败:', err);
                }
              });
            }).catch(err => {
              console.error('查询 User 表失败:', err);
            });

            db.collection('User').doc(userId2).get().then(res => {
              const user1 = res.data;
              console.log('原 points:', user1.Points);
              // 将 points 值增加8
              user1.Points += 8;
              // 更新 User 表中的数据
              db.collection('User').doc(userId2).update({
                data: {
                  Points: user1.Points
                },
                success: res => {
                  console.log('增加8后的 points:', user1.Points);
                },
                fail: err => {
                  console.error('points 更新失败:', err);
                }
              });
            }).catch(err => {
              console.error('查询 User 表失败:', err);
            });
          },
          fail: err => {
            console.error('Is_liked 修改失败:', err);
          }
        });
      }
    }).catch(err => {
      console.error('查询 Order 表失败:', err);
    });
    return true;
  },


  reportOrder(event){
    const orderId = event.currentTarget.dataset.orderId;
    console.log(orderId);
  
    // 查询 Order 表对应订单的 Is_report, Is_reviewed 和 Is_success 字段
    db.collection('Order').doc(orderId).get({
      success: orderRes => {
        const orderData = orderRes.data;
        const isReported = orderData.Is_report;
        const isReviewed = orderData.Is_reviewed;
        const isSuccess = orderData.Is_success;
  
        if (isReported) {
          if (isReviewed) {
            if (isSuccess) {
              wx.showToast({
                title: '订单已举报成功',
                icon: 'success',
                duration: 2000
              });
            } else {
              wx.showToast({
                title: '审核不通过',
                icon: 'none',
                duration: 2000
              });
            }
          } else {
            wx.showToast({
              title: '待审核',
              icon: 'none',
              duration: 2000
            });
          }
        } else {
          // 弹出填写相关信息的弹窗
          wx.showModal({
            title: '填写举报信息',
            content: '请填写相关信息',
            showCancel: true,
            confirmText: '确定',
            cancelText: '取消',
            editable: true,
            success: modalRes => {
              if (modalRes.confirm) {
                // 用户点击确定，更新 Order 表的 Report 字段和 Is_report 字段
                const reportContent = modalRes.content;
                db.collection('Order').doc(orderId).update({
                  data: {
                    Report: reportContent,
                    Is_report: true
                  },
                  success: updateRes => {
                    console.log('举报信息填写成功');
                    wx.showToast({
                      title: '举报信息已填写',
                      icon: 'success',
                      duration: 2000
                    });
                  },
                  fail: updateErr => {
                    console.error('举报信息填写失败:', updateErr);
                    wx.showToast({
                      title: '举报信息填写失败',
                      icon: 'none',
                      duration: 2000
                    });
                  }
                });
              } else if (modalRes.cancel) {
                // 用户点击取消，清空 Report 字段和 Is_report 字段
                db.collection('Order').doc(orderId).update({
                  data: {
                    Report: '',
                    Is_report: false
                  },
                  success: updateRes => {
                    console.log('取消填写举报信息');
                    wx.showToast({
                      title: '已取消填写',
                      icon: 'success',
                      duration: 2000
                    });
                  },
                  fail: updateErr => {
                    console.error('取消填写举报信息失败:', updateErr);
                    wx.showToast({
                      title: '取消填写失败',
                      icon: 'none',
                      duration: 2000
                    });
                  }
                });
              }
            }
          });
        }
      },
      fail: orderErr => {
        console.error('查询订单信息失败：', orderErr);
      }
    });
  },


  // returnOrder(event) {
  //   // const that = this
  //   const orderId = event.currentTarget.dataset.orderId; // 获取订单 ID
  //   console.log(orderId)
  //   db.collection('Order').doc(orderId).update({
  //     data: {
  //       status: 'returned'
  //     },
  //     success: res => {
  //       wx.showToast({
  //         title: '订单已归还',
  //         icon: 'success',
  //         duration: 2000
  //       });
  //       // this.refresh()
  //     },
  //     fail: err => {
  //       console.error('更新订单状态失败：', err);
  //       wx.showToast({
  //         title: '订单归还失败',
  //         icon: 'none',
  //         duration: 2000
  //       });
  //     }
  //   });
  //   return true;
  // },

  completeOrder(event){
    const orderId = event.currentTarget.dataset.orderId; // 获取订单 ID
    console.log(orderId)
    db.collection('Order').doc(orderId).update({
      data: {
        status: 'returned',
        user_status:'used'
      },
      success: res => {
        wx.showToast({
          title: '订单已完成',
          icon: 'success',
          duration: 2000
        });
        // this.refresh()
        db.collection('Order').doc(orderId).get({
          success: orderRes => {
            const userId = orderRes.data.User_id;
            
        // 更新 User 表的 points 值增加10
        db.collection('User').doc(userId).update({
          data: {
            Points: db.command.inc(10)
          },
          success: updateRes => {
            console.log('更新用户积分成功');
          },
          fail: updateErr => {
            console.error('更新用户积分失败:', updateErr);
          }
          });
          },
          fail: orderErr => {
            console.error('查询订单失败：', orderErr);
          }
        });
      },
      fail: err => {
        console.error('更新订单状态失败：', err);
        wx.showToast({
          title: '订单归还失败',
          icon: 'none',
          duration: 2000
        });
      }
    });
    return true;
  },

  cancelOrder(event) {
    const orderId = event.currentTarget.dataset.orderId;
    if (!orderId) {
      console.error('未能获取到订单 ID');
      return;
    }
  
    const orderCollection = db.collection('Order');
    db.collection('Order').doc(orderId).get({
      success: orderRes => {
        const userId = orderRes.data.user_id;
        
        // 更新 User 表的 points 值增加20
        db.collection('User').doc(userId).update({
          data: {
            Points: db.command.inc(20)
          },
          success: updateRes => {
            console.log('更新用户积分成功');
  
            // 更新用户积分成功后，再删除对应的订单
            orderCollection.doc(orderId).remove()
              .then(res => {
                console.log('订单取消成功', res);
                wx.showToast({
                  title: '订单已成功取消',
                  icon: 'success',
                  duration: 2000
                });
                // 删除成功后的操作，如刷新页面或其他逻辑处理
              })
              .catch(err => {
                console.error('订单取消失败', err);
                wx.showToast({
                  title: '订单取消失败',
                  icon: 'none',
                  duration: 2000
                });
              });
          },
          fail: updateErr => {
            console.error('更新用户积分失败:', updateErr);
            wx.showToast({
              title: '更新用户积分失败',
              icon: 'none',
              duration: 2000
            });
          }
        });
      },
      fail: orderErr => {
        console.error('查询订单失败：', orderErr);
      }
    });
  },

  thumbsUp(event){
    const orderId = event.currentTarget.dataset.orderId; // 获取订单 ID
    console.log(orderId)
    // 查询 Order 表中的 Is_liked 信息
    db.collection('Order').doc(orderId).get().then(res => {
      const order = res.data;
      const isLiked = order.Is_liked;
      if (isLiked) {
        // console.log('已点赞');
        wx.showToast({
          title: '已点赞',
          icon: 'none',
          duration: 1000
        });
      } else {
        // 修改 Order 表中的 Is_liked 为 true
        db.collection('Order').doc(orderId).update({
          data: {
            Is_liked: true
          },
          success: res => {
            console.log('Is_liked 修改成功');
            const userId2 = order.User_id;
            const userId = order.user_id;
            console.log('User_id:', userId);
            console.log('user_id:', userId2);
            // 查询 User 表中的数据并打印出来
            db.collection('User').doc(userId).get().then(res => {
              const user = res.data;
              console.log('原始 points:', user.Points);
              // 将 points 值增加2
              user.Points += 2;
              // 更新 User 表中的数据
              db.collection('User').doc(userId).update({
                data: {
                  Points: user.Points
                },
                success: res => {
                  console.log('增加2后的 points:', user.Points);
                },
                fail: err => {
                  console.error('points 更新失败:', err);
                }
              });
            }).catch(err => {
              console.error('查询 User 表失败:', err);
            });

            db.collection('User').doc(userId2).get().then(res => {
              const user1 = res.data;
              console.log('原 points:', user1.Points);
              // 将 points 值增加8
              user1.Points += 8;
              // 更新 User 表中的数据
              db.collection('User').doc(userId2).update({
                data: {
                  Points: user1.Points
                },
                success: res => {
                  console.log('增加8后的 points:', user1.Points);
                },
                fail: err => {
                  console.error('points 更新失败:', err);
                }
              });
            }).catch(err => {
              console.error('查询 User 表失败:', err);
            });
          },
          fail: err => {
            console.error('Is_liked 修改失败:', err);
          }
        });
      }
    }).catch(err => {
      console.error('查询 Order 表失败:', err);
    });
    return true;
  },


  reportOrder(event){
    const orderId = event.currentTarget.dataset.orderId;
    console.log(orderId);
  
    // 查询 Order 表对应订单的 Is_report, Is_reviewed 和 Is_success 字段
    db.collection('Order').doc(orderId).get({
      success: orderRes => {
        const orderData = orderRes.data;
        const isReported = orderData.Is_report;
        const isReviewed = orderData.Is_reviewed;
        const isSuccess = orderData.Is_success;
  
        if (isReported) {
          if (isReviewed) {
            if (isSuccess) {
              wx.showToast({
                title: '订单已举报成功',
                icon: 'success',
                duration: 2000
              });
            } else {
              wx.showToast({
                title: '审核不通过',
                icon: 'none',
                duration: 2000
              });
            }
          } else {
            wx.showToast({
              title: '待审核',
              icon: 'none',
              duration: 2000
            });
          }
        } else {
          // 弹出填写相关信息的弹窗
          wx.showModal({
            title: '填写举报信息',
            content: '请填写相关信息',
            showCancel: true,
            confirmText: '确定',
            cancelText: '取消',
            editable: true,
            success: modalRes => {
              if (modalRes.confirm) {
                // 用户点击确定，更新 Order 表的 Report 字段和 Is_report 字段
                const reportContent = modalRes.content;
                db.collection('Order').doc(orderId).update({
                  data: {
                    Report: reportContent,
                    Is_report: true
                  },
                  success: updateRes => {
                    console.log('举报信息填写成功');
                    wx.showToast({
                      title: '举报信息已填写',
                      icon: 'success',
                      duration: 2000
                    });
                  },
                  fail: updateErr => {
                    console.error('举报信息填写失败:', updateErr);
                    wx.showToast({
                      title: '举报信息填写失败',
                      icon: 'none',
                      duration: 2000
                    });
                  }
                });
              } else if (modalRes.cancel) {
                // 用户点击取消，清空 Report 字段和 Is_report 字段
                db.collection('Order').doc(orderId).update({
                  data: {
                    Report: '',
                    Is_report: false
                  },
                  success: updateRes => {
                    console.log('取消填写举报信息');
                    wx.showToast({
                      title: '已取消填写',
                      icon: 'success',
                      duration: 2000
                    });
                  },
                  fail: updateErr => {
                    console.error('取消填写举报信息失败:', updateErr);
                    wx.showToast({
                      title: '取消填写失败',
                      icon: 'none',
                      duration: 2000
                    });
                  }
                });
              }
            }
          });
        }
      },
      fail: orderErr => {
        console.error('查询订单信息失败：', orderErr);
      }
    });
  },




  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.setData({
      userId: options.id
    });
    console.log(1)
    this.GetOrderData(this.data.userId)
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