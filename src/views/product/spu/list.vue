<template>
  <div>
    <el-card>
      <!-- 三级分类类别 -->
      <CategorySelector
        @changeCategory="changeCategory"
        :isShowList="isShowList"
      ></CategorySelector>
    </el-card>

    <el-card style="margin-top:20px">
      <!-- 三级分类类别数据展示 -->
      <div v-show="!isShowSkuForm && !isShowSpuForm">
        <!-- 按钮 添加SPU -->
        <el-button
          type="primary"
          class="el-icon-plus"
          :disabled="!category3Id"
          @click="showAddSpuForm"
        >
          添加SPU
        </el-button>

        <!-- 表格 数据展示 -->
        <el-table border :data="spuList" style="margin-top:20px">
          <el-table-column type="index" label="序号" width="80" align="center">
          </el-table-column>
          <el-table-column prop="spuName" label="SPU名称"> </el-table-column>
          <el-table-column prop="description" label="SPU描述">
          </el-table-column>
          <el-table-column label="操作">
            <template slot-scope="{ row, $index }">
              <HintButton
                type="primary"
                icon="el-icon-plus"
                title="增加SPU"
                size="mini"
                @click="showAddSkuForm(row)"
              ></HintButton>
              <HintButton
                type="warning"
                icon="el-icon-edit"
                title="修改SPU"
                size="mini"
                @click="showUpdateSpuForm(row)"
              ></HintButton>
              <HintButton
                type="info"
                icon="el-icon-info"
                title="查看SPU的所有SKU"
                size="mini"
              ></HintButton>
              <el-popconfirm title="你确认删除该属性吗？">
                <HintButton
                  slot="reference"
                  type="danger"
                  icon="el-icon-delete"
                  title="删除SPU"
                  size="mini"
                ></HintButton>
              </el-popconfirm>
            </template>
          </el-table-column>
        </el-table>
        <!-- 分页 -->
        <!-- size-change	pageSize 改变时会触发	每页条数 -->
        <!-- current-change	currentPage 改变时会触发	当前页 -->
        <el-pagination
          @size-change="handleSizeChange"
          @current-change="getSpuList"
          style="text-align:center"
          :current-page="page"
          :page-sizes="[3, 5, 10]"
          :page-size="limit"
          layout=" prev, pager, next, jumper, ->, sizes, total "
          :total="total"
        >
        </el-pagination>
      </div>
      <!-- 复杂写法 -->
      <!-- <SpuForm
        v-show="isShowSpuForm"
        :visible="isShowSpuForm"
        @update:visible="isShowSpuForm = $event"
      ></SpuForm> -->
      <!-- 简单写法 -->
      <SpuForm
        v-show="isShowSpuForm"
        :visible.sync="isShowSpuForm"
        ref="spu"
      ></SpuForm>

      <SkuForm v-show="isShowSkuForm"></SkuForm>
    </el-card>
  </div>
</template>

<script>
import SpuForm from "../components/SpuForm";
import SkuForm from "../components/SkuForm";
export default {
  name: "Spu",
  data() {
    return {
      category1Id: "",
      category2Id: "",
      category3Id: "",
      spuList: [], // 每页的spu
      //只是为了传递给三级分类来控制三级分类的可操作性
      isShowList: true,
      page: 1,
      limit: 3,
      total: 0,
      //这两个数据是正儿八经的控制三个页面的切换
      isShowSkuForm: false,
      isShowSpuForm: false
    };
  },
  components: {
    SpuForm,
    SkuForm
  },
  methods: {
    // 获取getAttrList请求参数
    changeCategory({ categoryId, level }) {
      if (level === 1) {
        // 说明一级分类列表改变，所以要清空其他的数据，但是把当前的categoryId存下来
        // 并且只有当三级分类列表被选中时，才发送请求
        this.category1Id = categoryId;
        this.category2Id = "";
        this.category3Id = "";
        this.spuList = [];
      } else if (level === 2) {
        this.category2Id = categoryId;
        this.category3Id = "";
        this.spuList = [];
      } else if (level === 3) {
        this.category3Id = categoryId;
        // 发送请求
        this.getSpuList();
      }
    },

    // 获取Spu列表
    async getSpuList(pagee = 1) {
      this.page = pagee;
      let { page, limit, category3Id } = this;
      const result = await this.$API.spu.getList(page, limit, category3Id);
      if (result.code === 200) {
        this.spuList = result.data.records;
        this.total = result.data.total;
      }
    },

    // 改变每页显示条数
    handleSizeChange(size) {
      this.limit = size;
      // 发送请求
      this.getSpuList();
    },

    // 添加spu
    showAddSpuForm() {
      this.isShowSpuForm = true;
      // 父组件当中点击按钮显示的时候发请求
      this.$refs.spu.initAddSpuDate();
    },

    // 添加sku
    showAddSkuForm() {
      this.isShowSkuForm = true;
    },

    // 修改spu
    showUpdateSpuForm(row) {
      this.isShowSpuForm = true;
      // 父组件当中点击按钮显示的时候发请求
      this.$refs.spu.initUpdateSpuDate(row);
    }
  }
};
</script>
