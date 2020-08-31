<template>
  <el-form ref="form" label-width="100px" :model="spuInfo">
    <el-form-item label="SPU名称">
      <el-input v-model="spuInfo.spuName"></el-input>
    </el-form-item>

    <el-form-item label="品牌">
      <el-select v-model="spuInfo.tmId" placeholder="请选择品牌">
        <el-option
          :label="trademark.tmName"
          :value="trademark.id"
          v-for="trademark in trademarkList"
          :key="trademark.id"
        ></el-option>
      </el-select>
    </el-form-item>

    <el-form-item label="SPU描述">
      <el-input
        type="textarea"
        placeholder="SPU描述"
        v-model="spuInfo.description"
      ></el-input>
    </el-form-item>

    <!-- 1.收集点击删除只会，剩下的图片列表
      	  - fileList
        2.用户还可能在删除的同时添加图片
          - :on-success = "handleSuccess"  图片上传成功的回调
          - 新上传的图片没有imgName和imgUrl，所有我们在上传之前要进行整理
	   -->
    <el-form-item label="SPU图片">
      <el-upload
        action="/dev-api/admin/product/fileUpload"
        list-type="picture-card"
        :on-preview="handlePictureCardPreview"
        :on-remove="handleRemove"
        :on-success="handleSuccess"
        :file-list="spuImageList"
      >
        <i class="el-icon-plus"></i>
      </el-upload>
      <el-dialog :visible.sync="dialogVisible">
        <img width="100%" :src="dialogImageUrl" alt="" />
      </el-dialog>
    </el-form-item>

    <el-form-item label="销售属性">
      <el-select
        v-model="attrIdattrName"
        :placeholder="
          unUsedSaleAttrList.length > 0
            ? `还有${unUsedSaleAttrList.length}未选择`
            : '没有了！！！'
        "
      >
        <!-- 针对 spu销售属性 还需要收集的是baseSaleAttrId和saleAttrName 它刚好是unUsedSaleAttr.id 和unUsedSaleAttr.name
        所以使用字符串拼接收集：
	      :value="`${unUsedBaseSaleAttr.id}:${unUsedBaseSaleAttr.name}`"
	      -->
        <el-option
          :label="unUsedSaleAttr.name"
          :value="`${unUsedSaleAttr.id}:${unUsedSaleAttr.name}`"
          v-for="unUsedSaleAttr in unUsedSaleAttrList"
          :key="unUsedSaleAttr.id"
        ></el-option>
      </el-select>
      <el-button type="primary" class="el-icon-plus" @click="addSaleAttr"
        >添加销售属性</el-button
      >
      <el-table
        border
        style="width:100%;margin-top:20px"
        :data="spuInfo.spuSaleAttrList"
      >
        <el-table-column
          align="center"
          type="index"
          label="序号"
          width="50"
        ></el-table-column>
        <el-table-column
          prop="saleAttrName"
          label="属性名"
          width="150"
        ></el-table-column>
        <el-table-column prop="prop" label="属性名名称列表">
          <template slot-scope="{ row, $index }">
            <el-tag
              :key="spuSaleAttrValue.id"
              v-for="spuSaleAttrValue in row.spuSaleAttrValueList"
              closable
              :disable-transitions="false"
            >
              <!-- @close="handleClose(tag)" -->
              {{ spuSaleAttrValue.saleAttrValueName }}
            </el-tag>

            <!-- 失去焦点或者回车的时候，我们需要保存这个输入的属性值名称 -->
            <el-input
              class="input-new-tag"
              v-if="row.isEdit"
              v-model="row.saleAttrValueName"
              ref="saveTagInput"
              size="small"
              @keyup.enter.native="handleInputConfirm(row)"
              @blur="handleInputConfirm(row)"
            >
            </el-input>
            <el-button
              v-else
              class="button-new-tag"
              size="small"
              @click="showInput(row)"
              >+添加属性值</el-button
            >
          </template>
        </el-table-column>
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
import { computed } from "v-charts/lib/core";
import { Tag } from "element-ui";
export default {
  name: "SpuForm",
  props: ["visible"],
  data() {
    return {
      dialogImageUrl: "",
      dialogVisible: false,
      spu: "", // 用于保存当前父组件传过来的spu
      spuInfo: {
        // 根据spu id获取spu详情信息
        spuName: "", // spu名称
        description: "", // spu描述
        tmId: "", // spu 品牌
        spuSaleAttrList: [] // 已经确定的销售属性的列表
      },
      spuImageList: [], // 根据spu id获取spu的图片列表
      trademarkList: [], // 所有品牌列表
      baseSaleAttrList: [], // 销售属性列表
      fileList: [],
      // attrId: "", // 暂时这样写，目前也不确定是不是需要收集的是这个名字
      attrIdattrName: "", // 实际是收集 unUsedSaleAttr.id 和unUsedSaleAttr.name 作为 spu 销售属性的baseSaleAttrId和saleAttrName
      imgList: [] // 收集的图片列表（点击删除后，剩下的图片列表）
    };
  },
  methods: {
    // 图片被删除时候调用
    // file：你删除的那个图片对象
    // fileList：剩下的图片对象数组
    handleRemove(file, fileList) {
      this.imgList = fileList; // 把删除后的的图片列表收集起来
    },

    // 放大图片的回调
    handlePictureCardPreview(response, file) {
      this.dialogImageUrl = file.url;
      this.dialogVisible = true;
    },

    // 图片上传成功后候调用
    // response：上传成功服务器返回的信息 对象
    // file：上传成功之后图片的所有消息 对象
    // fileLis：上传成功的图片列表 数组
    handleSuccess(response, file, fileList) {
      this.imgList = fileList; // 把上传成功后的的图片列表收集起来
    },

    //点击父组件当中的修改按钮，父组件需要调用这个函数让子组件发请求获取初始化展示的数据
    initUpdateSpuDate(spu) {
      // 保存父组件传过来的spu
      this.spu = spu;
      //http://localhost:9529/dev-api/admin/product/getSpuById/1122  获取对应id的spu详情
      this.getSpuInfo(spu.id);

      //http://localhost:9529/dev-api/admin/product/spuImageList/1122 获取对应id的spu的图片列表
      this.getSpuImageList(spu.id);

      //http://localhost:9529/dev-api/admin/product/baseTrademark/getTrademarkList 获取所有的品牌列表
      this.getTrademarkList();

      //http://localhost:9529/dev-api/admin/product/baseSaleAttrList  获取所有的基础销售属性列表
      this.getBaseSaleAttrList();
    },

    //点击父组件当中的添加按钮，父组件需要调用这个函数让子组件发请求获取初始化展示的数据
    initAddSpuDate() {
      //http://localhost:9529/dev-api/admin/product/baseTrademark/getTrademarkList 获取所有的品牌列表
      this.getTrademarkList();

      //http://localhost:9529/dev-api/admin/product/baseSaleAttrList  获取所有的基础销售属性列表
      this.getBaseSaleAttrList();
    },

    async getSpuInfo(spuId) {
      const result = await this.$API.spu.get(spuId);
      this.spuInfo = result.data;
    },

    async getSpuImageList(spuId) {
      const result = await this.$API.sku.getSpuImageList(spuId);
      //图片获取到的结构和最终upload要展示的结构不同，我们需要变为upload需要的结构
      /*
        file-list属性：上传的文件列表, 例如: [{name: 'food.jpg', url: 'https://xxx.cdn.com/xxx.jpg'}]
upload要求必须要有name和url
        所以我们要整理获取到的数据，让获取到的数据里面有name和url
        获取到的初始数据里面有imgName和imgUrl，所以可以可以新增name和url属性，让它们的值和获取到的imgName和imgUrl的值相等
      */
      let spuImageList = result.data;

      spuImageList.forEach(item => {
        item.name = item.imgName;
        item.url = item.imgUrl;
      });
      this.spuImageList = spuImageList;
    },

    async getTrademarkList() {
      const result = await this.$API.trademark.getList();
      this.trademarkList = result.data;
    },

    async getBaseSaleAttrList() {
      const result = await this.$API.spu.getSaleList();
      this.baseSaleAttrList = result.data;
    },

    // 收集spu销售属性
    /*
    本质就是往spuInfo.spuSaleAttrList数组当中push一个规定格式的对象
    {
          "baseSaleAttrId": 0,
          "saleAttrName": "string",
          "spuId": 0,
          "spuSaleAttrValueList": []
    }
    */
    addSaleAttr() {
      // 提取 baseSaleAttrId, saleAttrName
      let [baseSaleAttrId, saleAttrName] = this.attrIdattrName.split(":");
      baseSaleAttrId = +baseSaleAttrId; // 收集到的数据是字符串 需要变成数字
      let spuId = this.spu.id;
      let spuSaleAttrValueList = [];
      let attr = {
        baseSaleAttrId,
        saleAttrName,
        spuId,
        spuSaleAttrValueList
      };

      // 添加到 spuSaleAttrList
      this.spuInfo.spuSaleAttrList.push(attr);

      // 添加成功后，清空销售属性值
      this.attrIdattrName = "";
    },

    // 点击button变成编辑模式
    showInput(row) {
      // 给对应的row新增一个isEdit属性
      this.$set(row, "isEdit", true);
      this.$nextTick(_ => {
        this.$refs.saveTagInput.focus();
      });
    },

    // 失去焦点的时候或者回车的时候我们需要保存这个输入的属性值名称
    // 属性值名称我们当时是输入的时候暂存在属性身上（row）
    handleInputConfirm(row) {
      // {
      //  "baseSaleAttrId": 0,
      //  "saleAttrName": "string",
      //  "saleAttrValueName": "string",
      //  "spuId": 0
      // }
      // console.log(row);
      //1\先从row身上把属性值名称等获取到
      let { saleAttrName, saleAttrValueName, baseSaleAttrId } = row;
      let spuId = this.spu.id;

      //2\构造固定格式的对象
      let attrValue = {
        saleAttrValueName,
        baseSaleAttrId,
        saleAttrName,
        spuId
      };

      //添加之前要判断
      //判断 1 属性值是不是为空
      if (saleAttrValueName === undefined || saleAttrValueName.trim() === "") {
        // 清空属性值
        row.isEdit = false;
        row.saleAttrValueName = "";
        return;
      }

      //判断 2 和其它的属性值不能重复
      let repeat = row.spuSaleAttrValueList.some(item => {
        return item.saleAttrValueName === attrValue.saleAttrValueName;
      });
      if (repeat) {
        this.$message.warning("属性值不能重复");
        // 清空属性值
        row.isEdit = false;
        row.saleAttrValueName = "";
        return;
      }

      //3\添加到对应的属性值列表当中
      row.spuSaleAttrValueList.push(attrValue);

      //4\ 再让当前的这个属性的属性值变为查看模式
      row.isEdit = false;

      //5\ 将input清空
      row.saleAttrValueName = "";
    }
  },

  computed: {
    // 动态显示还未使用的销售属性列表
    // 销售属性 = baseSaleAttrList -spuSaleAttrList
    unUsedSaleAttrList() {
      // 从 baseSaleAttrList数组中过滤出不在spuSaleAttrList数组里面的
      return this.baseSaleAttrList.filter(baseSaleAttr =>
        this.spuInfo.spuSaleAttrList.every(
          spuSaleAttr => baseSaleAttr.name !== spuSaleAttr.saleAttrName
        )
      );
    }
  }
};
</script>

<style>
.el-tag + .el-tag {
  margin-left: 10px;
}
.button-new-tag {
  margin-left: 10px;
  height: 32px;
  line-height: 30px;
  padding-top: 0;
  padding-bottom: 0;
}
.input-new-tag {
  width: 90px;
  margin-left: 10px;
  vertical-align: bottom;
}
</style>
