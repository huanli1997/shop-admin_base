<template>
  <el-form :inline="true" :model="form" class="demo-form-inline">
    <el-form-item label="一级分类">
      <!-- 显示二级分类的数据  它需要在选择一级分类列表的时候（change）去发请求获取数据 -->
      <el-select
        v-model="form.category1Id"
        placeholder="请选择分类"
        @change="handlerCategory1"
      >
        <!-- v-model自动收集的是value的值 -->
        <el-option
          :label="c1.name"
          :value="c1.id"
          v-for="c1 in category1List"
          :key="c1.id"
        ></el-option>
      </el-select>
    </el-form-item>
    <el-form-item label="二级分类">
      <el-select
        v-model="form.category2Id"
        placeholder="请选择分类"
        @change="handlerCategory2"
      >
        <el-option
          :label="c2.name"
          :value="c2.id"
          v-for="c2 in category2List"
          :key="c2.id"
        ></el-option>
      </el-select>
    </el-form-item>
    <el-form-item label="三级分类">
      <el-select
        v-model="form.category3Id"
        placeholder="请选择分类"
        @change="handlerCategory3"
      >
        <el-option
          :label="c3.name"
          :value="c3.id"
          v-for="c3 in category3List"
          :key="c3.id"
        ></el-option>
      </el-select>
    </el-form-item>
  </el-form>
</template>

<script>
import { methods } from "v-charts/lib/core";
export default {
  name: "CategorySelector",
  data() {
    return {
      form: {
        category1Id: "",
        category2Id: "",
        category3Id: ""
      },
      category1List: {},
      category2List: {},
      category3List: {}
    };
  },
  mounted() {
    // 获取一级分类列表
    this.getCategorys1();
  },
  methods: {
    // 查找一级分类列表
    async getCategorys1() {
      const result = await this.$API.category.getCategorys1();
      if (result.code === 200) {
        this.category1List = result.data;
      }
    },

    // 查找二级分类列表
    async handlerCategory1(category1Id) {
      /*
        先正常选择一遍，然后再去选中2级的时候，三级不变  （需要去重置三级列表的数据和选中的id数据）
        同理：重新选择1级的时候，2级和3级的数据也得重置
        在发请求前得加上
      */
      // 重置二、三级数据
      this.form.category2Id = "";
      this.form.category3Id = "";
      this.category2List = {};
      this.category3List = {};

      const result = await this.$API.category.getCategorys2(category1Id);
      if (result.code === 200) {
        this.category2List = result.data;
      }

      // 选择任意的分类，需要给父组件通信发请求获取attr数据
      this.$emit("changeCategory", { categoryId: category1Id, level: 1 });
    },

    // 查找三级分类列表
    async handlerCategory2(category2Id) {
      // 重置三级数据
      this.form.category3Id = "";
      this.category3List = {};

      const result = await this.$API.category.getCategorys3(category2Id);
      if (result.code === 200) {
        this.category3List = result.data;
      }

      this.$emit("changeCategory", { categoryId: category2Id, level: 2 });
    },

    handlerCategory3(category3Id) {
      //通知父组件请求attr列表数据
      // 选择任意的分类，需要给父组件通信发请求获取attr数据
      this.$emit("changeCategory", { categoryId: category3Id, level: 3 });
    }
  }
};
</script>
