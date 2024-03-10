// utils.js

function utils_navigateToReserve(bedId) {
  wx.navigateTo({
    url: `/pages/reserve/reserve?id=${bedId}`,
  });
  console.log('navigate to: ', bedId);
}

module.exports = { 
  utils_navigateToReserve

};
