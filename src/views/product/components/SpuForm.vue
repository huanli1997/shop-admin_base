<template>
  <el-form ref="form" label-width="100px">
    <el-form-item label="SPU名称">
      <el-input v-model="form.spuName"></el-input>
    </el-form-item>

    <el-form-item label="品牌">
      <el-select v-model="form.region" placeholder="请选择品牌">
        <el-option label="区域一" value="shanghai"></el-option>
      </el-select>
    </el-form-item>

    <el-form-item label="SPU描述">
      <el-input type="textarea" placeholder="SPU描述"></el-input>
    </el-form-item>

    <el-form-item label="SPU图片">
      <el-upload
        action="/dev-api/admin/product/fileUpload"
        list-type="picture-card"
        :on-preview="handlePictureCardPreview"
        :on-remove="handleRemove"
      >
        <i class="el-icon-plus"></i>
      </el-upload>
      <el-dialog :visible.sync="dialogVisible">
        <img width="100%" :src="dialogImageUrl" alt="" />
      </el-dialog>
    </el-form-item>

    <el-form-item label="销售属性">
      <el-select v-model="form.region" placeholder="还有3未选择">
        <el-option label="区域一" value="shanghai"></el-option>
      </el-select>
      <el-button type="primary" class="el-icon-plus">添加销售属性</el-button>
      <el-table border style="width:100%;margin-top:20px">
        <el-table-column
          align="center"
          type="index"
          label="序号"
          width="50"
        ></el-table-column>
        <el-table-column
          prop="prop"
          label="属性名"
          width="150"
        ></el-table-column>
        <el-table-column prop="prop" label="属性名名称列表"></el-table-column>
        <el-table-column prop="prop" label="操作" width="150"></el-table-column>
      </el-table>
    </el-form-item>

    <el-form-item>
      <el-button type="primary">保存</el-button>
      <el-button @click="$emit('update:visible', false)">取消</el-button>
    </el-form-item>
  </el-form>
</template>

<script>
export default {
  name: "SpuForm",
  props: ["visible"],
  data() {
    return {
      form: {},
      dialogImageUrl: "",
      dialogVisible: false
    };
  },
  methods: {
    handleRemove(file, fileList) {
      console.log(file, fileList);
    },
    handlePictureCardPreview(file) {
      this.dialogImageUrl = file.url;
      this.dialogVisible = true;
    }
  }
};
</script>

<style lang="less" scoped></style>
