const { utils_navigateToReserve } = require('./utils'); // 确保路径正确
const { onClickButton2 } = require('../bedinfo/bedinfo'); // 确保路径正确


describe('bedinfo: navigateToReserve', () => {
  it("should navigate to 'reserve' page with correct id parameter when button is clicked with valid bedId", () => {
    const bedId = '1b9d66de65eab2e90001b3075453c989';

    utils_navigateToReserve(bedId);
    expect(wx.navigateTo).toHaveBeenCalledWith({
      url: `/pages/reserve/reserve?id=${bedId}`,
    });
  });
  

});




