<template>
  <div class="attribute-value-manager">
    <div class="header">
      <h4>属性值管理 - {{ attribute?.name }}</h4>
      <el-button type="primary" @click="showAddDialog = true">
        <el-icon><Plus /></el-icon>
        添加值
      </el-button>
    </div>

    <el-table
      :data="values"
      v-loading="loading"
      style="width: 100%"
      row-key="id"
    >
      <el-table-column prop="value" label="属性值" min-width="120" />
      <el-table-column prop="label" label="显示标签" min-width="120" />
      <el-table-column prop="color" label="颜色" width="100" align="center">
        <template #default="{ row }">
          <div v-if="row.color" class="color-preview" :style="{ backgroundColor: row.color }"></div>
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column prop="image" label="图片" width="100" align="center">
        <template #default="{ row }">
          <el-image
            v-if="row.image"
            :src="row.image"
            style="width: 40px; height: 40px"
            fit="cover"
            :preview-src-list="[row.image]"
          />
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column prop="sort_order" label="排序" width="80" align="center" />
      <el-table-column prop="status" label="状态" width="100" align="center">
        <template #default="{ row }">
          <el-tag :type="row.status === 1 ? 'success' : 'danger'">
            {{ row.status === 1 ? '启用' : '禁用' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="150" fixed="right">
        <template #default="{ row }">
          <el-button type="primary" size="small" @click="handleEdit(row)">
            编辑
          </el-button>
          <el-popconfirm
            title="确定要删除这个属性值吗？"
            @confirm="handleDelete(row.id)"
          >
            <template #reference>
              <el-button type="danger" size="small">删除</el-button>
            </template>
          </el-popconfirm>
        </template>
      </el-table-column>
    </el-table>

    <!-- 添加/编辑属性值对话框 -->
    <el-dialog
      v-model="showAddDialog"
      :title="editingValue ? '编辑属性值' : '添加属性值'"
      width="500px"
    >
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="100px"
      >
        <el-form-item label="属性值" prop="value">
          <el-input v-model="form.value" placeholder="请输入属性值" />
        </el-form-item>
        <el-form-item label="显示标签" prop="label">
          <el-input v-model="form.label" placeholder="请输入显示标签" />
        </el-form-item>
        <el-form-item label="颜色" prop="color">
          <el-color-picker v-model="form.color" />
        </el-form-item>
        <el-form-item label="图片" prop="image">
          <el-input v-model="form.image" placeholder="请输入图片URL" />
        </el-form-item>
        <el-form-item label="排序" prop="sort_order">
          <el-input-number v-model="form.sort_order" :min="0" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio :label="1">启用</el-radio>
            <el-radio :label="0">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showAddDialog = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { productAttributeAPI } from '@/services/api'

const props = defineProps({
  attributeId: {
    type: Number,
    required: true
  },
  attribute: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits(['close'])

// 响应式数据
const loading = ref(false)
const values = ref([])
const showAddDialog = ref(false)
const editingValue = ref(null)
const formRef = ref()

// 表单数据
const form = reactive({
  value: '',
  label: '',
  color: '',
  image: '',
  sort_order: 0,
  status: 1
})

// 表单验证规则
const rules = {
  value: [
    { required: true, message: '请输入属性值', trigger: 'blur' },
    { min: 1, max: 255, message: '长度在 1 到 255 个字符', trigger: 'blur' }
  ]
}

// 获取属性值列表
const fetchValues = async () => {
  loading.value = true
  try {
    const response = await productAttributeAPI.getValues(props.attributeId)
    values.value = response.data
  } catch (error) {
    ElMessage.error('获取属性值列表失败：' + error.message)
  } finally {
    loading.value = false
  }
}

// 编辑属性值
const handleEdit = (row) => {
  editingValue.value = row
  Object.assign(form, {
    value: row.value,
    label: row.label || '',
    color: row.color || '',
    image: row.image || '',
    sort_order: row.sort_order || 0,
    status: row.status
  })
  showAddDialog.value = true
}

// 删除属性值
const handleDelete = async (id) => {
  try {
    await productAttributeAPI.deleteValue(id)
    ElMessage.success('删除成功')
    fetchValues()
  } catch (error) {
    ElMessage.error('删除失败：' + error.message)
  }
}

// 提交表单
const handleSubmit = async () => {
  try {
    await formRef.value.validate()
    
    if (editingValue.value) {
      await productAttributeAPI.updateValue(editingValue.value.id, form)
      ElMessage.success('更新成功')
    } else {
      await productAttributeAPI.createValue(props.attributeId, form)
      ElMessage.success('创建成功')
    }
    
    showAddDialog.value = false
    resetForm()
    fetchValues()
  } catch (error) {
    ElMessage.error('操作失败：' + error.message)
  }
}

// 重置表单
const resetForm = () => {
  editingValue.value = null
  Object.assign(form, {
    value: '',
    label: '',
    color: '',
    image: '',
    sort_order: 0,
    status: 1
  })
  formRef.value?.resetFields()
}

// 组件挂载
onMounted(() => {
  fetchValues()
})
</script>

<style scoped>
.attribute-value-manager {
  padding: 20px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.header h4 {
  margin: 0;
}

.color-preview {
  width: 30px;
  height: 30px;
  border-radius: 4px;
  border: 1px solid #dcdfe6;
}
</style>
