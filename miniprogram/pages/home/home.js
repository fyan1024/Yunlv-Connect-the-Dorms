// pages/home/home.js

const db = wx.cloud.database();

Page({

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

  onLoad(options) {
    this.getTopProducts();
  },

  getTopProducts: function () {
    const currentDate = new Date().toDateString();

    db.collection('Bed')
      .where({
        Is_busy: false,
        Is_checked: true,
        Is_pass: true
      })
      .get()
      .then(res => {
        res.data.forEach(doc => {
          const bedDate = doc.deadline; // 假设日期属性为 Date
          if (this.compareDates(currentDate, bedDate) === 2) {
            wx.cloud.database().collection('Bed').doc(doc._id).remove({
              success: function (res) {
                console.log("Document successfully deleted!");
              },
              fail: function (error) {
                console.error("Error removing document: ", error);
              }
            });
          }
        });
      })
      .catch(error => {
        console.error("Error getting documents: ", error);
      });

    db.collection('Bed').where({
        Is_busy: false,
        Is_checked: true,
        Is_pass: true
      })
      .get()
      .then(res => {
        // 处理后台返回的商品信息
        const allProducts = res.data;
        // console.log("allProducts: ", allProducts);
        // 2. 查询收藏表中每个商品被收藏的数量
        const promises = allProducts.map(bed => {
          return db.collection('save')
            .where({
              bedId: bed._id
            })
            .count()
            .then(res => {
              // console.log("res", res);
              bed.collect_num = res.total;
              // console.log(bed)
              return bed;
            });
        });

        // 3. 对所有商品按照收藏数量进行排序
        Promise.all(promises)
          .then(products => {
            products.sort((a, b) => b.collect_num - a.collect_num);

            // 4. 获取收藏数量最多的前6条商品信息
            const topProducts = products.slice(0, 6);

            // 在页面中渲染商品信息
            this.setData({
              topProducts: topProducts
            });
            // console.log(topProducts);
          })
          .catch(error => {
            console.error('获取商品收藏数失败', error);
          });
      })
      .catch(error => {
        console.error('获取商品信息失败', error);
      });
  },

  compareDates(date1, date2) {
    // 将字符串日期转换为 Date 对象
    var parts1 = date1.split(" ");
    var monthAndDay1 = parts1[1] + " " + parts1[2];
    switch (parts1[1]) {
      case "Jan":
        monthAndDay1 = '1' + " " + parts1[2];
        break;
      case "Feb":
        monthAndDay1 = '2' + " " + parts1[2];
        break;
      case 'Mar':
        monthAndDay1 = '3' + " " + parts1[2];
        break;
      case "Apr":
        monthAndDay1 = '4' + " " + parts1[2];
        break;
      case "May":
        monthAndDay1 = '5' + " " + parts1[2];
        break;
      case "Jun":
        monthAndDay1 = '6' + " " + parts1[2];
        break;
      case "Jul":
        monthAndDay1 = '7' + " " + parts1[2];
        break;
      case "Aug":
        monthAndDay1 = '8' + " " + parts1[2];
        break;
      case "Sep":
        monthAndDay1 = '9' + " " + parts1[2];
        break;
      case "Oct":
        monthAndDay1 = '10' + " " + parts1[2];
        break;
      case "Nov":
        monthAndDay1 = '11' + " " + parts1[2];
        break;
      case "Dec":
        monthAndDay1 = '12' + " " + parts1[2];
        break;
      default:
        monthAndDay1 = '5' + " " + parts1[2];
        break;
    }

    var parts2 = date2.split("/");
    var monthAndDay2 = parts2[0] + " " + parts2[1];

    console.log('m1', monthAndDay1)
    console.log('m2', monthAndDay2)

    // 检查日期是否相等
    var date1Value = parseInt(monthAndDay1.replace(/\D/g, ''));
    var date2Value = parseInt(monthAndDay2.replace(/\D/g, ''));

    // 比较日期
    if (date2Value < date1Value) {
      return 2; // 第二个日期早于第一个日期
    } else {
      return 0; // 第二个日期晚于或等于第一个日期
    }
  },

  goToUploadBedPage() { //上传床位
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
    // console.log(bedsId)
    wx.navigateTo({
      url: `/pages/bedinfo/bedinfo?id=${bedsId}`,
    });
  },
  onShow() {
    this.getTopProducts()
  }

})