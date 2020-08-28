<template>
  <div>
    <el-card>
      <!-- 三级分类类别 -->
      <CategorySelector @changeCategory="changeCategory"></CategorySelector>
    </el-card>

    <el-card style="margin-top:20px">
      <!-- 三级分类类别数据展示 -->
      <div v-show="isShowList">
        <!-- 按钮 添加属性 -->
        <!-- 当 category3Id 没有值时， 按钮就禁用-->
        <el-button
          type="primary"
          class="el-icon-plus"
          :disabled="!category3Id"
          @click="showAddDiv"
        >
          添加属性
        </el-button>

        <!-- 表格 数据展示 -->
        <el-table border :data="attrInfoList" style="margin-top:20px">
          <el-table-column type="index" label="序号" width="80" align="center">
          </el-table-column>
          <el-table-column prop="attrName" label="属性名称" width="200">
          </el-table-column>
          <el-table-column prop="prop" label="属性值名称" width="width">
            <template slot-scope="{ row, $index }">
              <el-tag
                type="success"
                v-for="attrValue in row.attrValueList"
                :key="attrValue.id"
                style="margin:0 5px"
                >{{ attrValue.valueName }}</el-tag
              >
            </template>
          </el-table-column>
          <el-table-column prop="prop" label="操作" width="300">
            <template slot-scope="{ row, $index }">
              <HintButton
                type="warning"
                icon="el-icon-edit"
                title="修改属性"
                @click="showUpdateDiv(row)"
              ></HintButton>
              <HintButton
                type="danger"
                icon="el-icon-delete"
                title="删除属性"
              ></HintButton>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <!-- 添加 -->
      <div v-show="!isShowList">
        <!-- 表单都会有一个 model 对应的 对象收集数据 -->
        <!-- :inline="true" 横行显示 -->
        <el-form ref="form" :model="form" :inline="true">
          <el-form-item label="属性名">
            <el-input
              v-model="form.attrName"
              placeholder="请输入属性名"
            ></el-input>
          </el-form-item>
        </el-form>

        <el-button
          type="primary"
          class="el-icon-plus"
          :disabled="!form.attrName"
          @click="addAttrValue"
          >添加属性值</el-button
        >
        <el-button type="info" @click="isShowList = true">取消</el-button>

        <!-- 收集属性值 -->
        <el-table
          border
          style="width:100%;margin:20px 0"
          :data="form.attrValueList"
        >
          <el-table-column
            align="center"
            type="index"
            label="序号"
            width="80"
          ></el-table-column>
          <el-table-column prop="valueName" label="属性值名称" width="width"
            ><template slot-scope="{ row, $index }">
              <el-input v-model="row.valueName" placeholder="请输入属性值"
                >></el-input
              >
            </template>
          </el-table-column>
          <el-table-column label="操作" width="width"> </el-table-column>
        </el-table>

        <el-button type="primary">保存</el-button>
        <el-button type="info" @click="isShowList = true">取消</el-button>
      </div>
    </el-card>
  </div>
</template>

<script>
import CategorySelector from "@/components/CategorySelector";
import cloneDeep from "lodash/cloneDeep";
export default {
  name: "Attr",
  components: {
    CategorySelector
  },
  data() {
    return {
      category1Id: "",
      category2Id: "",
      category3Id: "",
      attrInfoList: [],
      isShowList: true, // true:显示展示页面 false：展示添加页面
      // 添加需要的属性
      /*
        {
          "attrName": "string",
          "attrValueList": [
            {
              "attrId": 0,
              "id": 0,
              "valueName": "string"
            }
          ],
          "categoryId": 0,
          "categoryLevel": 0,
        }
        */
      form: {
        attrName: "",
        attrValueList: [],
        categoryId: "",
        categoryLevel: 3 // 添加的时候属性必须已经选好了第三级
      }
    };
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
        this.attrInfoList = [];
      } else if (level === 2) {
        this.category2Id = categoryId;
        this.category3Id = "";
        this.attrInfoList = [];
      } else if (level === 3) {
        this.category3Id = categoryId;
        // 发送请求
        this.getAttrList();
      }
    },

    // 获取Attr列表
    async getAttrList() {
      let { category1Id, category2Id, category3Id } = this;
      const result = await this.$API.attr.getList(
        category1Id,
        category2Id,
        category3Id
      );
      if (result.code === 200) {
        this.attrInfoList = result.data;
      }
    },

    //显示添加属性页面
    showAddDiv() {
      this.isShowList = false;
      // 在显示添加界面的时候切记把数据重置为原来初始的对象
      this.form = {
        attrName: "",
        attrValueList: [],
        categoryId: this.category3Id,
        categoryLevel: 3 // 添加的时候属性必须已经选好了第三级
      };
    },

    // 添加属性
    // 这里仅仅是为了出现那个框，实际的数据要通过input收集
    addAttrValue() {
      this.form.attrValueList.push({
        attrId: this.form.id || [], // 属性值所属属性的id 也就是属性的id
        valueName: ""
      });
    },

    // 修改属性
    showUpdateDiv(row) {
      this.isShowList = false;
      // 因为 row 里面的存在基本数据类型，还存在数组，浅拷贝只能拷贝基本数据类型，
      // 但是数组（对象数据），仍然是拷贝的地址，所以修改一个，还是会影响，所以要用深拷贝
      this.form = cloneDeep(row);
    }
  }
};
</script>
