import request from "@/utils/request";

export default {
  // DELETE /admin/product/baseTrademark/remove/{id}
  // 删除BaseTrademark
  delete(id) {
    return request.delete(`/admin/product/baseTrademark/remove/${id}`);
  },

  // POST /admin/product/baseTrademark/save
  // 新增BaseTrademark
  // PUT /admin/product/baseTrademark/update
  //修改BaseTrademark
  // 如果是添加没有 请求体参数里面 没有 id 由后台自动生成
  addOrUpdate(trademark) {
    if (trademark.id) {
      //修改BaseTrademark
      return request.put("/admin/product/baseTrademark/update", trademark);
    } else {
      // 新增BaseTrademark
      return request.post("/admin/product/baseTrademark/save", trademark);
    }
  },

  // GET  /admin/product/baseTrademark/{page}/{limit}
  // 分页列表
  getPageList(page, limit) {
    return request.get(`/admin/product/baseTrademark/${page}/${limit}`);
  }
};
