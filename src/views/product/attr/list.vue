<template>
  <div>
    <el-card>
      <!-- 三级分类类别 -->
      <CategorySelector @changeCategory="changeCategory" :isShowList='isShowList'></CategorySelector>
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
              <el-popconfirm
                title="你确认删除该属性吗？"
                @onConfirm="deleteAttr(row)"
              >
                <HintButton
                  slot="reference"
                  type="danger"
                  icon="el-icon-delete"
                  title="删除属性"
                ></HintButton>
              </el-popconfirm>
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
              <!-- input上面我们失去焦点和按回车都要切换为查看模式 -->
              <!-- el-input 没有封装键盘事件，使用要加 .native 变成原生事件 -->
              <!-- ref 标识 添加和点击的时候切换Edit模式的时候需要找到相关的input 去focus（） -->
              <el-input
                :ref="$index"
                v-if="row.isEdit"
                v-model="row.valueName"
                placeholder="请输入属性值"
                size="mini"
                @blur="toLook(row)"
                @keyup.enter.native="toLook(row)"
              ></el-input>
              <!--给span增加宽度，方便点击 -->
              <span
                v-else
                @click="toEdit(row, $index)"
                style="display:inline-block;height:100%;width:100%"
                >{{ row.valueName }}</span
              >
            </template>
          </el-table-column>
          <el-table-column label="操作" width="width">
            <template slot-scope="{ row, $index }">
              <!-- onConfirm	点击确认按钮时触发 -->
              <el-popconfirm
                title="你确认删除该属性值吗？"
                @onConfirm="form.attrValueList.splice($index, 1)"
              >
                <HintButton
                  slot="reference"
                  type="danger"
                  icon="el-icon-delete"
                  title="删除属性"
                ></HintButton>
              </el-popconfirm>
            </template>
          </el-table-column>
        </el-table>
        <!-- 添加属性值页面，保存按钮默认禁止，需要输入属性和属性值才能保存 -->
        <el-button
          type="primary"
          @click="save"
          :disabled="form.attrValueList.length === 0"
          >保存</el-button
        >
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
        attrId: this.form.id, //form当中有id就拿form的id  没有就是undefined
        valueName: "",
        isEdit: true // 当前为什么模式
      });

      // 自动获取焦点
      // 最后一个输入框获取焦点
      this.$nextTick(() => {
        this.$refs[this.form.attrValueList.length - 1].focus();
      });
    },

    // 修改属性
    showUpdateDiv(row) {
      this.isShowList = false;
      // 因为 row 里面的存在基本数据类型，还存在数组，浅拷贝只能拷贝基本数据类型，
      // 但是数组（对象数据），仍然是拷贝的地址，所以修改一个，还是会影响，所以要用深拷贝
      this.form = cloneDeep(row);

      // 修改属性 给每个属性值对象添加isEdit属性标识
      this.form.attrValueList.forEach(item => {
        // 错的，直接添加新的属性不是响应式数据，因为这个时候数据代理和数据劫持早就完成了，所以要用$set
        // item.isEdit = true;
        // 后期添加一个属性，如果想要它是响应式，就需要用$set 或者 Vue.set
        // 刚刚进来时，不是编辑模式
        this.$set(item, "isEdit", false);
      });
    },

    // 点击span 变成编辑模式
    toEdit(row, index) {
      row.isEdit = true;

      // 自动获取焦点 让目前点击的这个span所对应的input获取焦点
      // this.$refs[index] // 拿的就是点击的span对应的下标标识的ref获取的input
      // nextTick() 在页面最近一次更新的时候，调用里面的回调
      this.$nextTick(() => {
        console.log(this.$refs);
        this.$refs[index].focus();
      });
    },

    // input上面我们失去焦点和按回车都要切换为查看模式
    toLook(row) {
      // 数据必须有值
      if (row.valueName.trim() === "") {
        this.$message.warning("属性值必须有值");
        // 清空
        row.valueName = "";
        return;
      }

      // 如果是修改，除了是自身以外，不能有相同的数据
      // some() 方法测试数组中是不是至少有1个元素通过了被提供的函数测试
      const repeate = this.form.attrValueList.some(item => {
        // 先排除自身
        if (row !== item) {
          // 去除空格影响
          return row.valueName.trim() === item.valueName.trim();
        }
      });

      if (repeate) {
        this.$message.warning("属性值不能重复");
        // 清空
        row.valueName = "";
        return;
      }

      row.isEdit = false;
    },

    // 保存
    async save() {
      // 获取参数数据
      let attr = this.form;
      // 对数据进行过滤
      //filter() 方法创建一个新数组, 其包含通过所提供函数实现的测试的所有元素。
      attr.attrValueList = attr.attrValueList.filter(item => {
        // 1、如果属性值没有值 那就是空串，删除这个对象
        // 2、去除参数中多余的参数，比如自己加的isEdit
        if (item.valueName !== "") {
          delete item.isEdit;
          // item.isEdit 后，然后把这个 item 作为true 返回出去
          return true;
        }
      });

      // 3、如果属性当中属性值列表没有属性值对象 不发请求
      if (attr.attrValueList.length === 0) {
        // 提示
        this.$message.warning("属性中必须有属性值");
        return;
      }
      // 发送请求
      const result = await this.$API.attr.addOrUpdate(attr);
      if (result.code === 200) {
        // 成功
        this.$message.success("保存属性成功");
        // 重新获取列表
        this.getAttrList();
        // 显示列表页面
        this.isShowList = true;
      } else {
        // 失败
        this.$message.error("保存属性失败");
      }
    },

    // 删除属性值
    async deleteAttr(row) {
      const result = await this.$API.attr.delete(row.id);
      console.log(result);
      if (result.code === 200) {
        // 成功
        this.$message.success("删除属性成功");
        // 重新获取列表
        this.getAttrList();
      } else {
        // 失败
        this.$message.error("删除属性失败");
      }
    }
  }
};
</script>
