<template>
  <div>
    <el-form ref="form" :model="skuInfo" label-width="80px">
      <el-form-item label="SPU名称">
        <template slot-scope="{ row, $index }">
          <span>{{ spu.spuName }}</span>
        </template>
      </el-form-item>

      <el-form-item label="SKU名称">
        <el-input v-model="skuInfo.skuName" placeholder="SKU 名称"> </el-input>
      </el-form-item>

      <el-form-item label="价格(元)">
        <el-input v-model="skuInfo.price" placeholder="SKU 价格"></el-input>
      </el-form-item>

      <el-form-item label="重量(KG)">
        <el-input v-model="skuInfo.weight" placeholder="SKU 重量"></el-input>
      </el-form-item>

      <el-form-item label="规格描述">
        <el-input
          type="textarea"
          v-model="skuInfo.skuDesc"
          placeholder="SKU 规格描述"
          rows="4"
        ></el-input>
      </el-form-item>

      <el-form-item label="平台属性">
        <el-form label-width="100px" :inline="true">
          <el-form-item
            :label="attrInfo.attrName"
            v-for="(attrInfo, index) in attrInfoList"
            :key="attrInfo.id"
          >
            <!-- 因为还不清楚发请求最后需要什么参数，先写 attrValue.id -->
            <!--  我们要收集的是对应的某个属性的id和这个属性下的某个属性值的id， 直接挂在这个属性身上-->
            <el-select
              v-model="attrInfo.attrIdAttrValueId"
              placeholder="请输入"
            >
              <el-option
                :label="attrValue.valueName"
                :value="`${attrInfo.id}:${attrValue.id}`"
                v-for="(attrValue, index) in attrInfo.attrValueList"
                :key="attrValue.id"
              ></el-option>
            </el-select>
          </el-form-item>
        </el-form>
      </el-form-item>

      <el-form-item label="销售属性">
        <el-form label-width="100px" :inline="true">
          <el-form-item
            :label="spuSaleAttr.saleAttrName"
            v-for="spuSaleAttr in spuSaleAttrList"
            :key="spuSaleAttr.id"
          >
            <!-- 因为还不清楚发请求最后需要什么参数，先写 spuSaleAttrValue.id-->
            <!-- 把收集到是数据先挂在属性上 -->
            <el-select
              v-model="spuSaleAttr.saleAttrValueId"
              placeholder="请输入"
            >
              <el-option
                :label="spuSaleAttrValue.saleAttrValueName"
                :value="spuSaleAttrValue.id"
                v-for="spuSaleAttrValue in spuSaleAttr.spuSaleAttrValueList"
                :key="spuSaleAttrValue.id"
              ></el-option>
            </el-select>
          </el-form-item>
        </el-form>
      </el-form-item>

      <el-form-item label="图片列表">
        <!-- selection-change	当选择项发生变化时会触发该事件 -->
        <el-table
          border
          ref="multipleTable"
          style="width: 100%"
          @selection-change="handleSelectionChange"
          :data="spuImageList"
        >
          <el-table-column type="selection" width="80"> </el-table-column>
          <el-table-column prop="prop" label="图片">
            <template slot-scope="{ row, $index }">
              <img :src="row.imgUrl" alt="" srcset="" style="width:100px" />
            </template>
          </el-table-column>
          <el-table-column prop="imgName" label="名称"> </el-table-column>
          <el-table-column label="操作">
            <template slot-scope="{ row, $index }">
              <el-button
                v-if="row.isDefault === '0'"
                type="primary"
                size="mini"
                @click="setDefault(row)"
                >设置为默认</el-button
              >
              <el-tag type="success" v-else>默认</el-tag>
            </template>
          </el-table-column>
        </el-table>
      </el-form-item>

      <el-form-item>
        <el-button type="primary" @click="save">保存</el-button>
        <el-button @click="back">取消</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
export default {
  name: "SkuForm",
  data() {
    return {
      spu: {}, // 父组件传递过来的row
      attrInfoList: [], // 平台属性
      spuSaleAttrList: [], // 获取指定SPU的id对应的销售属性列表
      spuImageList: [], // 获取指定SPU的id对应的图片列表
      // attrId: "", // 平台属性 暂时收集到attrId里面
      // saleAttrValueId: "", // 销售属性 暂时收集到saleAttrValueId里面
      imgList: [], //选中的图片列表
      skuInfo: {
        // 父组件传递过来了
        category3Id: 0,
        spuId: 0,
        tmId: 0,

        // v-model收集的
        price: "",
        skuDesc: "",
        skuName: "",
        weight: "",

        // 自己整理的
        skuAttrValueList: [
          // {
          //   attrId: 0,
          //   id: 0,
          //   skuId: 0,
          //   valueId: 0
          // }
        ],
        skuDefaultImg: "",
        skuImageList: [],
        skuSaleAttrValueList: [
          // {
          //   id: 0,
          //   saleAttrValueId: 0,
          //   skuId: 0,
          //   spuId: 0
          // }
        ]
      }
    };
  },

  methods: {
    // {
    //     id: 0,
    //     imgName: "",
    //     imgUrl: "",
    //     isDefault: "",
    //     skuId: 0,
    //     spuImgId: 0
    // }
    // 当图片列表发生改变，触发该事件
    handleSelectionChange(val) {
      this.imgList = val;
    },

    // 发请求获取初始数据
    async initAddSkuDate(spu, category1Id, category2Id) {
      // spu 保存在this里面 之后需要spu里面的信息
      this.spu = spu;

      //这里是在获取父组件传递过来的参数整理到skuInfo当中后续用来发请求，也可以放在最后保存的时候去整理
      this.skuInfo.category3Id = spu.category3Id;
      this.skuInfo.spuId = spu.id;
      this.skuInfo.tmId = spu.tmId;

      //http://localhost:9529/dev-api/admin/product/attrInfoList/2/13/61
      const promise1 = this.$API.attr.getList(
        category1Id,
        category2Id,
        spu.category3Id
      );
      //http://localhost:9529/dev-api/admin/product/spuSaleAttrList/1100
      // 获取指定SPU的id对应的销售属性列表
      const promise2 = this.$API.sku.getSpuSaleAttrList(spu.id);

      //http://localhost:9529/dev-api/admin/product/spuImageList/1100
      // 获取指定SPU的id对应的图片列表
      const promise3 = this.$API.sku.getSpuImageList(spu.id);

      // Promise.all返回值也是一个promise
      // 对多个promise一起处理，如果所有的promise都成功返回的promise才成功，如果有失败的那么返回的就是失败的promise
      // 参数必须是一个数组  数组当中全都是promise
      // Promise.all返回的promise是成功的，成功的结果是所有数组当中promise的成功结果组成的数组
      // Promise.all返回的promise是失败的，失败的结果是第一个失败的promise的结果（原因）
      const result = await Promise.all([promise1, promise2, promise3]);
      this.attrInfoList = result[0].data;
      this.spuSaleAttrList = result[1].data;
      let spuImageList = result[2].data;
      // 给图片添加一个默认值的属性
      spuImageList.forEach(item => {
        item.isDefault = "0";
      });
      this.spuImageList = spuImageList;
    },

    // 收集默认图片
    setDefault(row) {
      // 这里要利用排他 默认图片只能有一张
      this.spuImageList.forEach(item => {
        item.isDefault = "0";
      });
      // 设置默认图片
      row.isDefault = "1";

      // 收集默认图片
      this.skuInfo.skuDefaultImg = row.imgUrl;
    },

    // 清除数据
    resetData() {
      this.spu = {};
      this.attrInfoList = [];
      this.spuSaleAttrList = [];
      this.spuImageList = [];
      // attrId: "",
      // saleAttrValueId: "",

      this.imgList = []; //选中的图片列表

      this.skuInfo = {
        //第一大类：父组件传过来的
        category3Id: 0,
        spuId: 0,
        tmId: 0,
        //第二大类： v-model直接收集的
        price: "",
        skuDesc: "",
        skuName: "",
        weight: "",
        //第三大类： 我们需要自己整理的
        skuDefaultImg: "",
        skuAttrValueList: [],
        skuImageList: [],
        skuSaleAttrValueList: []
      };
    },

    // 保存
    async save() {
      // 获取参数数据
      const { attrInfoList, spuSaleAttrList, imgList, skuInfo } = this;
      // 整理图片
      //  目标{
      //   imgName: "string",
      //   imgUrl: "string",
      //   isDefault: "string",
      //   spuImgId: 0,
      // },

      // 现有的
      // id:6159
      // imgName:"rBFUDF7ItQyAeavnAAAKVYl1Jvk512.jpg"
      // imgUrl:"http://182.92.128.115:8080/group1/M00/00/4D/rBFUDF9NM6CAQm82AAAKVYl1Jvk634.jpg"
      // isDefault:"0"
      // spuId:1161
      skuInfo.skuImageList = imgList.map(item => {
        return {
          imgName: item.imgName,
          imgUrl: item.imgUrl,
          isDefault: item.isDefault,
          spuImgId: item.spuId
        };
      });

      // 整理平台属性
      attrInfoList.forEach(item => {
        // 证明你是被选中过，需要收集对应的平台属性值
        if (item.attrIdAttrValueId) {
          let [attrId, valueId] = item.attrIdAttrValueId.split(":");
          skuInfo.skuAttrValueList.push({ attrId, valueId });
        }
      });

      // 	整理销售属性
      // spuSaleAttrList.forEach(item => {
      //   if (item.saleAttrValueId) {
      //     skuInfo.skuSaleAttrValueList.push({
      //       saleAttrValueId: item.saleAttrValueId
      //     });
      //   }
      // });
      skuInfo.skuSaleAttrValueList = spuSaleAttrList.reduce((pre, cur) => {
        if (cur.saleAttrValueId) {
          pre.push({
            saleAttrValueId: cur.saleAttrValueId
          });
        }
        return pre;
      }, []);

      // console.log(skuInfo);

      // 发请求
      const result = await this.$API.sku.addUpdate(skuInfo);

      if (result.code === 200) {
        // 成功
        this.$message.success("保存sku成功");
        // 返回列表页
        this.$emit("update:visible", false);
        // 重置当前列表数据
        this.resetData();
      } else {
        // 失败
        this.$message.error("保存sku失败");
      }
    },
    
    // 取消
    back() {
      // 返回列表
      this.$emit("update:visible", false);
      // 清除当前列表
      this.resetData();
    }
  }
};
</script>

<style lang="less" scoped></style>
