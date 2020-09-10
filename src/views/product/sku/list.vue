<template>
  <div>
    <el-card style="margin-top:20px">
      <!-- 表格 数据展示 -->
      <el-table border :data="spuList" style="margin-top:20px">
        <el-table-column type="index" label="序号" width="80" align="center">
        </el-table-column>
        <el-table-column prop="prop" label="名称"> </el-table-column>
        <el-table-column prop="prop" label="描述"> </el-table-column>
        <el-table-column prop="prop" label="默认图片"> </el-table-column>
        <el-table-column prop="prop" label="重量(KG)"> </el-table-column>
        <el-table-column prop="prop" label="价格(元)"> </el-table-column>
        <el-table-column prop="prop" label="描述"> </el-table-column>
        <el-table-column label="操作">
          <template slot-scope="{ row, $index }">
            <el-popconfirm
              title="你确认下架该SKU吗？"
              @onConfirm="deleteSpu(row)"
            >
              <HintButton
                slot="reference"
                type="success"
                icon="el-icon-bottom"
                title="下架SKU"
                size="mini"
              ></HintButton>
            </el-popconfirm>
            <HintButton
              type="danger"
              icon="el-icon-primary"
              title="编辑"
              size="mini"
            ></HintButton>
            <HintButton
              type="danger"
              icon="el-icon-info"
              title="查看详情"
              size="mini"
            ></HintButton>
            <el-popconfirm
              title="你确认删除该SKU吗？"
              @onConfirm="deleteSpu(row)"
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
    </el-card>
  </div>
</template>

<script>
export default {
  name: 'Sku',
}
</script>


