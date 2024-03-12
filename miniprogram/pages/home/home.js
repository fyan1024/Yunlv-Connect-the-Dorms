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
    db.collection('Bed').where({
        Is_busy: false
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