<template>
  <div>
    <el-card style="margin-top:20px">
      <!-- 表格 数据展示 -->
      <el-table border :data="skuList" style="margin-top:20px">
        <el-table-column type="index" label="序号" width="80" align="center">
        </el-table-column>
        <el-table-column prop="skuName" label="名称"> </el-table-column>
        <el-table-column prop="skuDesc" label="描述"> </el-table-column>
        <el-table-column label="默认图片">
          <template slot-scope="{ row, $index }">
            <img
              :src="row.skuDefaultImg"
              alt="sku默认图片"
              style="width:150px"
            />
          </template>
        </el-table-column>
        <el-table-column prop="weight" label="重量(KG)"> </el-table-column>
        <el-table-column prop="price" label="价格(元)"> </el-table-column>
        <el-table-column label="操作">
          <template slot-scope="{ row, $index }">
            <HintButton
              slot="reference"
              type="success"
              icon="el-icon-top"
              title="上架SKU"
              size="mini"
              @click="shelves(row)"
            ></HintButton>
            <el-popconfirm
              title="你确认下架该SKU吗?"
              @onConfirm="unShelve(row)"
            >
              <HintButton
                slot="reference"
                type="warning"
                icon="el-icon-bottom"
                title="下架SKU"
                size="mini"
              ></HintButton>
            </el-popconfirm>
            <HintButton
              type="primary"
              icon="el-icon-edit"
              title="编辑"
              size="mini"
            ></HintButton>
            <HintButton
              type="info"
              icon="el-icon-info"
              title="查看详情"
              size="mini"
              @click="getSkuInfo(row)"
            ></HintButton>
            <el-popconfirm
              title="你确认删除该SKU吗？"
              @onConfirm="deleteSku(row)"
            >
              <HintButton
                slot="reference"
                type="danger"
                icon="el-icon-delete"
                title="删除SKU"
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
        @current-change="getSkuList"
        style="text-align:center"
        :current-page="page"
        :page-sizes="[3, 5, 10]"
        :page-size="limit"
        layout=" prev, pager, next, jumper, ->, sizes, total "
        :total="total"
      >
      </el-pagination>
    </el-card>

    <!-- 抽屉 -->
    <!--
      visible：是否显示 Drawer，支持 .sync 修饰符
      direction：Drawer 打开的方向
      :before-close="handleClose"
     -->
    <el-drawer
      class="drawer"
      :visible.sync="isShowDrawer"
      direction="rtl"
      :before-close="handleClose"
    >
      <!-- gutter 属性来指定每一栏之间的间隔，默认间隔为 0 -->
      <el-row :gutter="20">
        <el-col :span="6"><div class="title">名称</div></el-col>
        <el-col :span="14"
          ><div>{{ skuInfoList.skuName }}</div></el-col
        >
      </el-row>
      <el-row :gutter="20">
        <el-col :span="6"><div class="title">描述</div></el-col>
        <el-col :span="14"
          ><div>{{ skuInfoList.skuDesc }}</div></el-col
        >
      </el-row>
      <el-row :gutter="20">
        <el-col :span="6"><div class="title">价格</div></el-col>
        <el-col :span="14"
          ><div>{{ skuInfoList.price }}</div></el-col
        >
      </el-row>
      <el-row :gutter="20">
        <el-col :span="6"><div class="title">平台属性</div></el-col>
        <el-col :span="14"
          ><div>
            <el-tag
              type="success"
              v-for="skuAttrValue in skuInfoList.skuAttrValueList"
              :key="skuAttrValue.id"
              >{{ skuAttrValue.attrId + "-" + skuAttrValue.valueId }}</el-tag
            >
          </div></el-col
        >
      </el-row>
      <el-row :gutter="20">
        <el-col :span="6"><div class="title">销售属性</div></el-col>
        <el-col :span="14"
          ><div>
            <el-tag
              type="success"
              v-for="skuSaleAttrValue in skuInfoList.skuSaleAttrValueList"
              :key="skuSaleAttrValue.id"
              >{{
                skuSaleAttrValue.skuId + "-" + skuSaleAttrValue.saleAttrValueId
              }}</el-tag
            >
          </div></el-col
        >
      </el-row>
      <el-row :gutter="20">
        <el-col :span="6"><div class="title">商品图片</div></el-col>
        <el-col :span="14"
          ><div>
            <!-- 走马灯 -->
            <el-carousel height="400px">
              <el-carousel-item
                v-for="skuImage in skuInfoList.skuImageList"
                :key="skuImage.id"
              >
                <img
                  :src="skuImage.imgUrl"
                  alt="sku图片"
                  style="width: 100%;"
                />
              </el-carousel-item>
            </el-carousel></div
        ></el-col>
      </el-row>
    </el-drawer>
  </div>
</template>

<script>
import { login } from "@/api";
export default {
  name: "Sku",
  data() {
    return {
      page: 1,
      limit: 5,
      total: 10,
      skuList: [], // sku列表
      isShowDrawer: false, // 是否显示抽屉
      skuInfoList: {
        // sku 详情列表
        skuName: " ",
        skuDesc: " ",
        price: " ",
        skuAttrValueList: [],
        skuSaleAttrValueList: [],
        skuImageList: []
      }
    };
  },
  mounted() {
    this.getSkuList();
  },

  methods: {
    // 清除sku详情数据
    resetSkuInfoList() {
      this.skuInfoList = {
        // sku 详情列表
        skuName: " ",
        skuDesc: " ",
        price: " ",
        skuAttrValueList: [],
        skuSaleAttrValueList: [],
        skuImageList: []
      };
    },

    // 获取sku列表
    async getSkuList(pagee = 1) {
      this.page = pagee;
      // 获取sku的分页列表
      const { page, limit } = this;
      const result = await this.$API.sku.getList(page, limit);
      if (result.code === 200) {
        this.skuList = result.data.records;
        this.total = result.data.total;
      }
    },

    // 改变页数当前页数
    handleSizeChange(size) {
      this.limit = size;
      // 重新获取sku列表
      this.getSkuList();
    },

    // 上架sku
    async shelves(row) {
      const result = await this.$API.sku.onSale(row.id);
      if (result.code === 200) {
        // 成功
        this.$message.success("sku上架成功");
        this.getSkuList();
      } else {
        // 失败
        this.$message.error("sku上架失败");
      }
    },

    // 下架sku
    async unShelve(row) {
      const result = await this.$API.sku.cancelSale(row.id);
      if (result.code === 200) {
        // 成功
        this.$message.success("sku下架成功");
        this.getSkuList();
      } else {
        // 失败
        this.$message.error("sku下架失败");
      }
    },

    // sku详情
    async getSkuInfo(row) {
      const result = await this.$API.sku.get(row.id);
      if (result.code === 200) {
        // 成功
        Object.keys(result.data).forEach(key => {
          if (this.skuInfoList[key]) {
            this.skuInfoList[key] = result.data[key];
          }
        });
        // 显示抽屉
        this.isShowDrawer = true;
      } else {
        // 失败
        this.$message.error("获取sku详情失败");
      }
    },

    // 关闭抽屉
    handleClose(done) {
      // 重置数据
      this.resetSkuInfoList();
      // 关闭抽屉
      done();
    },

    // 删除sku
    async deleteSku(row) {
      const result = await this.$API.sku.remove(row.id);
      if (result.code === 200) {
        // 成功
        this.$message.success("sku删除成功");
        this.getSkuList();
      } else {
        // 失败
        this.$message.error("sku删除失败");
      }
    }
  }
};
</script>

<style>
.drawer .el-row {
  line-height: 40px;
}
.drawer .title {
  text-align: right;
  font-weight: 700;
}

.drawer .el-tag {
  margin-right: 5px;
}

.drawer .el-carousel__button {
  width: 10px;
  height: 10px;
  background-color: pink;
  border-radius: 50%;
}
</style>
