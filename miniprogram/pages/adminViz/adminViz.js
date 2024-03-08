// pages/adminViz/adminViz.js
const db = wx.cloud.database();

Page({

  data: {
    bedData: [], // 存放床源数据
    


  },

  onChange(event) {
    let statusText = '';
    if (event.detail.name === 0) {
      statusText = '展示用户';
    } else if (event.detail.name === 1) {
      statusText = '展示床源';
    } else if (event.detail.name === 2) {
      statusText = '展示订单';
    }
    wx.showToast({
      title: `${statusText}`,
      icon: 'none',
    });
  },

  onLoad(options) {
    this.GetBedData();
    
  },

  GetBedData(){
    db.collection('Bed').get({
      success: (resBed) => {
        console.log('查询床源成功，所有数据：', resBed.data);
        this.setData({
          bedData: resBed.data,
        });
      },
      fail: (err) => {
        console.error('查询床源失败：', err);
      },
    });
  },

  showBedDetail(event) {
    const that = this;

    const index = event.currentTarget.dataset.index;
    const bedInfo = this.data.bedData[index];
    var cityWithSuffix = bedInfo.city.endsWith("市") ? bedInfo.city : bedInfo.city + "市";

   // 弹出模态框展示床源详细信息
    wx.showModal({
      title: '床源详细信息',
      content: `${cityWithSuffix}-${bedInfo.address}-${bedInfo.dormitory_num}-${bedInfo.bed_num}—房主:${bedInfo.ownerName}`,      
      showCancel: true, 
      confirmText: '导航', 
      confirmColor: '#007AFF',
      cancelText: '关闭', 
      cancelColor: '#333333', 
      contentFontSize: '16px', 
      success: function(res) {
        if (res.confirm) {
          // that.Navigate2Bed(bedInfo.address, bedInfo.latitude, bedInfo.longitude);
            // 检查床源信息是否完整
          if (!bedInfo.address || bedInfo.latitude == null || bedInfo.longitude == null) {
            // 使用wx.showToast显示提示信息
            wx.showToast({
              title: '床源信息不全',
              icon: 'none', // “none”表示不显示图标
              duration: 2000 // 提示的延迟时间，单位毫秒，默认为1500
            });
          } else {
            // 如果信息完整，则进行导航
            that.Navigate2Bed(bedInfo.address, bedInfo.latitude, bedInfo.longitude);
  }
        } else if (res.cancel) {
          // 用户点击关闭操作
        }
      }
    });
  },
  Navigate2Bed(address, lat, lng) {
    var address = address;
    var latitude = lat;
    var longitude =lng;
    wx.openLocation({
        latitude: latitude,
        longitude: longitude,
        name: address,
        scale: 18 // 可选，缩放级别，默认为18，范围从5~18
    });
  },


})