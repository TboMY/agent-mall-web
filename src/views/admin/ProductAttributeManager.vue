<template>
  <div class="product-attribute-manager">
    <div class="header">
      <h3>规格项管理 - {{ productTypeName }}</h3>
      <el-button type="primary" @click="showAddDialog = true">
        <el-icon><Plus /></el-icon>
        添加规格项
      </el-button>
    </div>

    <el-table
      :data="attributes"
      v-loading="loading"
      style="width: 100%"
      row-key="id"
    >
      <el-table-column type="selection" width="55" />
      <el-table-column prop="id" label="编号" width="80" />
      <el-table-column prop="name" label="规格项名称" min-width="120" />
      <el-table-column prop="product_type_name" label="规格模板" min-width="120" />
      <el-table-column prop="value_type" label="值选择方式" width="120" align="center">
        <template #default="{ row }">
          {{ getValueTypeText(row.value_type) }}
        </template>
      </el-table-column>
      <el-table-column prop="values" label="可选值列表" min-width="200">
        <template #default="{ row }">
          <span v-if="row.values && row.values.length > 0">
            {{ row.values.map(v => v.label).join(',') }}
          </span>
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column prop="sort_order" label="排序" width="80" align="center" />
      <el-table-column label="操作" width="150" fixed="right">
        <template #default="{ row }">
          <el-button type="primary" size="small" @click="handleEdit(row)">
            编辑
          </el-button>
          <el-button type="danger" size="small" @click="handleDelete(row.id)">
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 添加/编辑属性对话框 -->
    <el-dialog
      v-model="showAddDialog"
      :title="editingAttribute ? '编辑规格项' : '添加规格项'"
      width="600px"
    >
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="100px"
      >
        <el-form-item label="规格项名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入规格项名称" />
        </el-form-item>
        <el-form-item label="规格键名" prop="attribute_key">
          <el-input v-model="form.attribute_key" placeholder="请输入规格键名" />
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input
            v-model="form.description"
            type="textarea"
            :rows="3"
            placeholder="请输入属性描述"
          />
        </el-form-item>
        <el-form-item label="值类型" prop="value_type">
          <el-radio-group v-model="form.value_type">
            <el-radio value="single">单选</el-radio>
            <el-radio value="multiple">多选</el-radio>
            <el-radio value="custom">自定义输入</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="是否必填" prop="is_required">
          <el-radio-group v-model="form.is_required">
            <el-radio :label="1">是</el-radio>
            <el-radio :label="0">否</el-radio>
          </el-radio-group>
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
        
        <!-- 可选值管理 -->
        <el-form-item label="可选值" v-if="form.value_type !== 'custom'">
          <div class="attribute-values">
            <div 
              v-for="(value, index) in form.values" 
              :key="index" 
              class="value-item"
            >
              <el-input
                v-model="value.label"
                placeholder="请输入可选值"
                style="width: 200px; margin-right: 10px"
              />
              <el-button 
                type="danger" 
                size="small" 
                @click="removeValue(index)"
                :disabled="form.values.length <= 1"
              >
                删除
              </el-button>
            </div>
            <el-button 
              type="primary" 
              size="small" 
              @click="addValue"
              style="margin-top: 10px"
            >
              添加可选值
            </el-button>
          </div>
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
  productTypeId: {
    type: Number,
    required: true
  },
  productTypeName: {
    type: String,
    default: ''
  }
})

// 响应式数据
const loading = ref(false)
const attributes = ref([])
const showAddDialog = ref(false)
const editingAttribute = ref(null)
const formRef = ref()

// 表单数据
const form = reactive({
  name: '',
  attribute_key: '',
  description: '',
  value_type: 'single',
  is_required: 0,
  sort_order: 0,
  status: 1,
  values: [{ label: '' }]
})

// 表单验证规则
const rules = {
  name: [
    { required: true, message: '请输入规格项名称', trigger: 'blur' },
    { min: 1, max: 100, message: '长度在 1 到 100 个字符', trigger: 'blur' }
  ],
  attribute_key: [
    { required: true, message: '请输入规格键名', trigger: 'blur' },
    { min: 1, max: 100, message: '长度在 1 到 100 个字符', trigger: 'blur' }
  ]
}

// 获取属性列表
const fetchAttributes = async () => {
  loading.value = true
  try {
    const response = await productAttributeAPI.getByProductType(props.productTypeId)
    attributes.value = response.data
  } catch (error) {
    ElMessage.error('获取规格项列表失败：' + error.message)
  } finally {
    loading.value = false
  }
}

// 获取值类型文本
const getValueTypeText = (type) => {
  const texts = {
    single: '单选',
    multiple: '多选',
    custom: '自定义'
  }
  return texts[type] || type
}

// 编辑属性
const handleEdit = (row) => {
  editingAttribute.value = row
  Object.assign(form, {
    name: row.name,
    attribute_key: row.attribute_key,
    description: row.description || '',
    value_type: row.value_type,
    is_required: row.is_required,
    sort_order: row.sort_order || 0,
    status: row.status,
    values: row.values && row.values.length > 0 ? row.values.map(v => ({ label: v.label })) : [{ label: '' }]
  })
  showAddDialog.value = true
}


// 删除属性
const handleDelete = async (id) => {
  try {
    await productAttributeAPI.delete(id)
    ElMessage.success('删除成功')
    fetchAttributes()
  } catch (error) {
    ElMessage.error('删除失败：' + error.message)
  }
}

// 提交表单
const handleSubmit = async () => {
  try {
    await formRef.value.validate()
    
    const data = {
      ...form,
      product_type_id: props.productTypeId,
      // 前端提交为字符串数组，后端已兼容两种格式
      values: form.value_type !== 'custom'
        ? form.values
            .map(v => (v && typeof v.label === 'string' ? v.label.trim() : ''))
            .filter(s => s)
        : []
    }
    
    if (editingAttribute.value) {
      await productAttributeAPI.update(editingAttribute.value.id, data)
      ElMessage.success('更新成功')
    } else {
      await productAttributeAPI.create(data)
      ElMessage.success('创建成功')
    }
    
    showAddDialog.value = false
    resetForm()
    fetchAttributes()
  } catch (error) {
    ElMessage.error('操作失败：' + error.message)
  }
}

// 添加属性值
const addValue = () => {
  form.values.push({ label: '' })
}

// 删除属性值
const removeValue = (index) => {
  if (form.values.length > 1) {
    form.values.splice(index, 1)
  }
}

// 重置表单
const resetForm = () => {
  editingAttribute.value = null
  Object.assign(form, {
    name: '',
    attribute_key: '',
    description: '',
    value_type: 'single',
    is_required: 0,
    sort_order: 0,
    status: 1,
    values: [{ label: '' }]
  })
  formRef.value?.resetFields()
}

// 组件挂载
onMounted(() => {
  fetchAttributes()
})
</script>

<style scoped>
.product-attribute-manager {
  padding: 20px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.header h3 {
  margin: 0;
}

.attribute-values {
  width: 100%;
}

.value-item {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}
</style>
