const cloud = require('wx-server-sdk');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});
const db = cloud.database();

// 更新数据库集合中的数据云函数入口函数
exports.main = async (event, context) => {
  const { id, data, name } = event; // 获取传入的参数，id为要更新的数据的_id，data为更新的数据对象，name为集合名称
  try {
    // 根据_id更新数据
    const res = await db.collection(name).doc(id).update({
      data: data
    });
    return res;
  } catch (error) {
    return error;
  }
};