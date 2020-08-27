<template>
  <div>
    <!-- 添加按钮 -->
    <el-row>
      <el-button type="primary" class="el-icon-plus" @click="showAddDiglog">
        添加</el-button
      >
    </el-row>

    <!-- 数据表格 -->
    <el-table :data="trademarkList" border style="width: 100%;margin:20px 0">
      <el-table-column type="index" width="80" label="序号" align="center">
      </el-table-column>
      <el-table-column prop="tmName" label="品牌名称"> </el-table-column>
      <el-table-column prop="logoUrl" label="品牌LOGO">
        <template slot-scope="{ row, $index }">
          <img :src="row.logoUrl" style="width:120px" />
        </template>
      </el-table-column>
      <el-table-column label="操作">
        <template slot-scope="{ row, $index }">
          <el-button type="warning" @click="showUpdataDialog(row)"
            >修改</el-button
          >
          <!-- 弹出的是messagebox组件 这个组件不需要写静态页面  都是js代码 关键是逻辑 -->
          <el-button type="danger" @click="deleteTrademark(row)"
            >删除</el-button
          >
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <!-- size-change	pageSize 改变时会触发	每页条数 -->
    <!-- current-change	currentPage 改变时会触发	当前页 -->
    <el-pagination
      @size-change="handleSizeChange"
      @current-change="getTrademarkList"
      style="text-align:center"
      :current-page="page"
      :page-sizes="[3, 5, 10]"
      :page-size="limit"
      layout=" prev, pager, next, jumper, ->, sizes, total "
      :total="total"
    >
    </el-pagination>

    <!-- 弹框 -->
    <!--  出现form 就需要指定一个对象去收集数据 -->
    <el-dialog
      :title="`${form.id ? '修改' : '添加'}品牌`"
      :visible.sync="isShowDialog"
    >
      <el-form :model="form" style="width:80%">
        <el-form-item label="品牌名称" :label-width="`100px`">
          <el-input v-model="form.tmName" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="品牌LOGO" :label-width="`100px`">
          <!-- 上传 -->
          <!-- action：上传地址  /admin/product/fileUpload -->
          <el-upload
            class="avatar-uploader"
            action="/dev-api/admin/product/fileUpload"
            :show-file-list="false"
            :on-success="handleAvatarSuccess"
            :before-upload="beforeAvatarUpload"
          >
            <img v-if="form.logoUrl" :src="form.logoUrl" class="avatar" />
            <i v-else class="el-icon-plus avatar-uploader-icon"></i>
            <div class="el-upload__tip" slot="tip">
              只能上传jpeg/jpg/png文件，且不超过1Mb
            </div>
          </el-upload>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="isShowDialog = false">取 消</el-button>
        <el-button type="primary" @click="save">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: "Trademark",
  data() {
    return {
      page: 1,
      limit: 3,
      trademarkList: [], // 每页的商品列表
      total: 0,
      isShowDialog: false, // 弹框是否显示
      form: {
        logoUrl: "", // 品牌图片
        tmName: "" // 品牌名
      }
    };
  },
  mounted() {
    this.getTrademarkList();
  },
  methods: {
    async getTrademarkList(page = 1) {
      this.page = page;
      const result = await this.$API.trademark.getPageList(
        this.page,
        this.limit
      );
      if (result.code === 200) {
        // 请求成功后，获取品牌列表和总数
        this.trademarkList = result.data.records;
        this.total = result.data.total;
      }
    },

    // 改变每页显示条数
    handleSizeChange(size) {
      this.limit = size;
      // 发送请求
      this.getTrademarkList();
    },

    //点击添加按钮，弹出对话框
    showAddDiglog() {
      this.isShowDialog = true;
      // 每次打开的对话框的时候，清空上一次的数据(解决添加还留有上一次数据的bug)
      this.form = {
        logoUrl: "",
        tmName: ""
      };
    },

    // 上传图片成功后的处理
    handleAvatarSuccess(res, file) {
      // res.data 获取到图片上传成功后，存储在服务器的地址
      // file 图片上传成功后的详情
      this.form.logoUrl = res.data;
    },

    // 上传图片之前的处理
    beforeAvatarUpload(file) {
      const fileTypes = ["image/jpeg", "image/png", "image/jpg"];

      const isJPGOrPNG = fileTypes.indexOf(file.type) !== -1;
      const isLt2M = file.size / 1024 / 1024 < 1;

      if (!isJPGOrPNG) {
        this.$message.error("上传头像图片只能是 jpeg/jpg/png 文件!");
      }
      if (!isLt2M) {
        this.$message.error("上传头像图片大小不能超过 1MB!");
      }
      return isJPGOrPNG && isLt2M;
    },

    // 图片上传完成后，点击确定，取出数据发送请求到后台，添加品牌
    async save() {
      // 1. 获取参数
      let trademark = this.form;
      // console.log(trademark);
      try {
        const result = await this.$API.trademark.addOrUpdate(trademark);
        if (result.code === 200) {
          // 2.成功
          // 关闭dialog
          this.isShowDialog = false;
          // 重新发请求，获取列表数据
          // this.getTrademarkList();
          // 判断当时是修改/添加，修改->当前页，添加->1 页
          this.getTrademarkList(trademark.id ? this.page : 1);

          // 弹出提示
          this.$message.success(`${this.form.id ? "修改" : "添加"}品牌成功`);
        } else {
          // 3.失败
          // 弹出提示
          this.$message.warning(`${this.form.id ? "修改" : "添加"}品牌失败`);
        }
      } catch (error) {
        this.$message.error("请求发送失败：" + error.message);
      }
    },

    // 修改品牌
    showUpdataDialog(row) {
      //打开ddialog
      this.isShowDialog = true;
      // console.log(row); // 拿到的就是对应行的trademark
      /*
        bug:修改后取消，列表当中显示的是修改的数据
	      因为你修改的是form内部的数据  而显示的数据和form的数据是同一个对象,所以使用浅拷贝，拷贝row里面的数据
      */
      this.form = { ...row };
    },

    // 删除品牌
    deleteTrademark(row) {
      this.$confirm("是否确认删除品牌?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      })
        .then(async () => {
          // 点击 确定按钮 逻辑
          try {
            // 发请求 删除数据
            const result = await this.$API.trademark.delete(row.id);
            if (result.code === 200) {
              // 重新获取商品列表
              this.getTrademarkList();
              this.$message.success("删除成功!");
            } else {
              // 删除失败 请求发送成功 当时响应码可能为201...
              this.$message.warning("删除失败");
            }
          } catch (error) {
            // 请求发送失败
            this.$message.error("请求发送失败：" + error.message);
          }
        })
        .catch(() => {
          // 点击 取消按钮 逻辑
          this.$message.warning("已取消删除");
        });
    }
  }
};
</script>

<style>
/* 上传 */
.avatar-uploader .el-upload {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}
.avatar-uploader .el-upload:hover {
  border-color: #409eff;
}
.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 178px;
  height: 178px;
  line-height: 178px;
  text-align: center;
}
.avatar {
  width: 178px;
  height: 178px;
  display: block;
}
</style>
