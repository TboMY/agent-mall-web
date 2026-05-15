<template>
  <div class="category-list">
    <div class="page-header">
      <h2>分类管理</h2>
      <el-button type="primary" @click="showCreateDialog()">
        <el-icon><Plus /></el-icon>
        新增分类
      </el-button>
    </div>

    <el-card class="search-card">
      <div class="search-bar">
        <el-input
          v-model="searchKeyword"
          placeholder="搜索分类名称"
          style="width: 320px"
          clearable
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
        <el-alert
          v-if="searchKeyword"
          class="search-tip"
          type="info"
          :closable="false"
          title="搜索模式下仅支持查看和编辑，拖拽排序会暂时关闭。"
        />
      </div>
    </el-card>

    <el-card class="table-card" v-loading="loading">
      <template v-if="filteredCategories.length > 0">
        <div
          class="category-groups"
          @dragover.prevent
        >
          <div
            v-for="topCategory in filteredCategories"
            :key="topCategory.id"
            class="category-group"
            :class="{ 'is-drag-target': dragTargetParentId === topCategory.parent_id && dragTargetId === topCategory.id }"
            draggable="true"
            @dragstart="handleDragStart($event, topCategory)"
            @dragenter.prevent="handleDragEnter($event, topCategory)"
            @dragend="handleDragEnd"
            @drop.prevent="handleDrop($event, topCategory)"
          >
            <div class="category-group-header">
              <button
                v-if="topCategory.children?.length"
                type="button"
                class="expand-toggle"
                @click.stop="toggleExpand(topCategory.id)"
              >
                <el-icon :class="{ expanded: isExpanded(topCategory.id) }"><ArrowRight /></el-icon>
              </button>
              <span v-else class="expand-placeholder"></span>
              <div class="drag-handle" :class="{ disabled: Boolean(searchKeyword) }">
                <el-icon><Rank /></el-icon>
              </div>
              <div class="category-info">
                <div class="category-title-line">
                  <span class="category-name">{{ topCategory.name }}</span>
                  <el-tag size="small" type="primary" effect="plain">一级分类</el-tag>
                </div>
                <div class="category-desc">
                  {{ topCategory.description || '顶级导航分类' }}
                </div>
              </div>
              <div class="category-actions">
                <el-button size="small" text type="primary" @click="showCreateDialog(topCategory)">
                  新增子分类
                </el-button>
                <el-tag :type="topCategory.status === 1 ? 'success' : 'danger'">
                  {{ topCategory.status === 1 ? '启用' : '禁用' }}
                </el-tag>
                <el-button size="small" @click="editCategory(topCategory)">编辑</el-button>
                <el-button
                  size="small"
                  type="danger"
                  :disabled="topCategory.children?.length > 0"
                  @click="deleteCategory(topCategory)"
                >
                  删除
                </el-button>
              </div>
            </div>

            <div v-if="topCategory.children?.length && isExpanded(topCategory.id)" class="children-list">
              <div
                v-for="child in topCategory.children"
                :key="child.id"
                class="child-row"
                :class="{ 'is-drag-target': dragTargetParentId === child.parent_id && dragTargetId === child.id }"
                draggable="true"
                @dragstart="handleDragStart($event, child)"
                @dragenter.prevent="handleDragEnter($event, child)"
                @dragend="handleDragEnd"
                @drop.prevent="handleDrop($event, child)"
              >
                <div class="child-indent">
                  <span class="indent-line"></span>
                  <span class="indent-line horizontal"></span>
                </div>
                <div class="drag-handle" :class="{ disabled: Boolean(searchKeyword) }">
                  <el-icon><Rank /></el-icon>
                </div>
                <div class="category-info">
                  <div class="category-title-line">
                    <span class="category-name">{{ child.name }}</span>
                    <el-tag size="small" type="success" effect="plain">二级分类</el-tag>
                  </div>
                  <div class="category-desc">
                    {{ child.description || `归属上级分类 ID：${child.parent_id}` }}
                  </div>
                </div>
                <div class="category-actions">
                  <el-tag :type="child.status === 1 ? 'success' : 'danger'">
                    {{ child.status === 1 ? '启用' : '禁用' }}
                  </el-tag>
                  <el-button size="small" @click="editCategory(child)">编辑</el-button>
                  <el-button size="small" type="danger" @click="deleteCategory(child)">
                    删除
                  </el-button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>

      <el-empty v-else description="暂无分类数据" />
    </el-card>

    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑分类' : '新增分类'"
      width="560px"
      @close="resetForm"
    >
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="100px"
      >
        <el-form-item label="分类名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入分类名称" />
        </el-form-item>
        <el-form-item label="父分类" prop="parent_id">
          <el-select v-model="form.parent_id" placeholder="请选择父分类" style="width: 100%">
            <el-option label="顶级分类" :value="0" />
            <el-option
              v-for="category in topLevelCategories"
              :key="category.id"
              :label="category.name"
              :value="category.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="当前层级">
          <el-input :model-value="form.parent_id === 0 ? '一级分类' : '二级分类'" disabled />
        </el-form-item>
        <el-form-item label="分类图标" prop="icon">
          <el-input v-model="form.icon" placeholder="请输入图标URL" />
        </el-form-item>
        <el-form-item label="分类描述" prop="description">
          <el-input
            v-model="form.description"
            type="textarea"
            :rows="3"
            placeholder="请输入分类描述"
          />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio :label="1">启用</el-radio>
            <el-radio :label="0">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitForm" :loading="submitting">
            {{ isEdit ? '更新' : '创建' }}
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { ArrowRight, Plus, Rank, Search } from '@element-plus/icons-vue'
import { categoryAPI } from '@/services/api'

const loading = ref(false)
const submitting = ref(false)
const dialogVisible = ref(false)
const isEdit = ref(false)
const searchKeyword = ref('')
const categories = ref([])
const formRef = ref()
const draggingId = ref(null)
const dragSourceParentId = ref(null)
const dragTargetId = ref(null)
const dragTargetParentId = ref(null)
const expandedIds = ref([])
const temporarilyCollapsedId = ref(null)

const form = reactive({
  id: null,
  name: '',
  parent_id: 0,
  icon: '',
  description: '',
  status: 1
})

const rules = {
  name: [
    { required: true, message: '请输入分类名称', trigger: 'blur' },
    { min: 1, max: 100, message: '分类名称长度在1到100个字符', trigger: 'blur' }
  ],
  icon: [
    { type: 'url', message: '请输入有效的URL', trigger: 'blur' }
  ]
}

const filteredCategories = computed(() => {
  const keyword = searchKeyword.value.trim().toLowerCase()
  if (!keyword) {
    return categories.value
  }
  return filterTreeByKeyword(categories.value, keyword)
})

const topLevelCategories = computed(() => categories.value.map((item) => ({ id: item.id, name: item.name })))

async function loadCategories() {
  loading.value = true
  try {
    const response = await categoryAPI.getCategoryTree()
    if (response.success) {
      categories.value = response.data || []
      expandedIds.value = (response.data || []).map((item) => item.id)
    } else {
      ElMessage.error(response.message || '获取分类列表失败')
    }
  } catch (error) {
    console.error('获取分类列表失败:', error)
    ElMessage.error('获取分类列表失败')
  } finally {
    loading.value = false
  }
}

function filterTreeByKeyword(items, keyword) {
  return items
    .map((item) => {
      const children = item.children?.length ? filterTreeByKeyword(item.children, keyword) : []
      const matched = item.name.toLowerCase().includes(keyword)
      if (matched || children.length > 0) {
        return {
          ...item,
          children
        }
      }
      return null
    })
    .filter(Boolean)
}

function showCreateDialog(parent = null) {
  isEdit.value = false
  resetForm()
  if (parent) {
    form.parent_id = parent.id
  }
  dialogVisible.value = true
}

function editCategory(category) {
  isEdit.value = true
  Object.assign(form, {
    id: category.id,
    name: category.name,
    parent_id: category.parent_id,
    icon: category.icon || '',
    description: category.description || '',
    status: category.status
  })
  dialogVisible.value = true
}

async function deleteCategory(category) {
  try {
    await ElMessageBox.confirm(
      `确定要删除分类“${category.name}”吗？`,
      '确认删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    const response = await categoryAPI.deleteCategory(category.id)
    if (response.success) {
      ElMessage.success('删除成功')
      loadCategories()
    } else {
      ElMessage.error(response.message || '删除失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除分类失败:', error)
      ElMessage.error(error.response?.data?.message || '删除失败')
    }
  }
}

async function submitForm() {
  if (!formRef.value) return

  try {
    await formRef.value.validate()
    submitting.value = true

    const payload = {
      name: form.name,
      parent_id: form.parent_id,
      icon: form.icon,
      description: form.description,
      status: form.status
    }

    let response
    if (isEdit.value) {
      response = await categoryAPI.updateCategory(form.id, payload)
    } else {
      response = await categoryAPI.createCategory(payload)
    }

    if (response.success) {
      ElMessage.success(isEdit.value ? '更新成功' : '创建成功')
      dialogVisible.value = false
      loadCategories()
    } else {
      ElMessage.error(response.message || (isEdit.value ? '更新失败' : '创建失败'))
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('提交分类失败:', error)
      ElMessage.error(error.response?.data?.message || (isEdit.value ? '更新失败' : '创建失败'))
    }
  } finally {
    submitting.value = false
  }
}

function resetForm() {
  formRef.value?.resetFields()
  Object.assign(form, {
    id: null,
    name: '',
    parent_id: 0,
    icon: '',
    description: '',
    status: 1
  })
}

function isExpanded(id) {
  return expandedIds.value.includes(id)
}

function toggleExpand(id) {
  if (isExpanded(id)) {
    expandedIds.value = expandedIds.value.filter((item) => item !== id)
  } else {
    expandedIds.value = [...expandedIds.value, id]
  }
}

function handleDragStart(event, category) {
  event.stopPropagation()
  if (searchKeyword.value) {
    event.preventDefault()
    return
  }
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'move'
    event.dataTransfer.dropEffect = 'move'
    event.dataTransfer.setData('text/plain', String(category.id))
  }
  draggingId.value = category.id
  dragSourceParentId.value = Number(category.parent_id)
  if (Number(category.level) === 1 && category.children?.length && isExpanded(category.id)) {
    temporarilyCollapsedId.value = category.id
    expandedIds.value = expandedIds.value.filter((item) => item !== category.id)
  }
}

function handleDragEnter(event, category) {
  event.stopPropagation()
  if (!draggingId.value || searchKeyword.value) {
    return
  }
  dragTargetId.value = category.id
  dragTargetParentId.value = Number(category.parent_id)
}

function handleDragEnd() {
  draggingId.value = null
  dragSourceParentId.value = null
  dragTargetId.value = null
  dragTargetParentId.value = null
  if (temporarilyCollapsedId.value && !isExpanded(temporarilyCollapsedId.value)) {
    expandedIds.value = [...expandedIds.value, temporarilyCollapsedId.value]
  }
  temporarilyCollapsedId.value = null
}

async function handleDrop(event, category) {
  event.stopPropagation()
  if (!draggingId.value || searchKeyword.value) {
    handleDragEnd()
    return
  }

  if (draggingId.value === category.id) {
    handleDragEnd()
    return
  }

  if (Number(dragSourceParentId.value) !== Number(category.parent_id)) {
    ElMessage.warning('只能拖拽排序同级分类')
    handleDragEnd()
    return
  }

  const siblingParentId = Number(category.parent_id)
  const siblingList = siblingParentId === 0
    ? [...categories.value]
    : [...(findTopCategoryById(siblingParentId)?.children || [])]

  const sourceIndex = siblingList.findIndex((item) => item.id === draggingId.value)
  const targetIndex = siblingList.findIndex((item) => item.id === category.id)

  if (sourceIndex === -1 || targetIndex === -1) {
    handleDragEnd()
    return
  }

  const [moved] = siblingList.splice(sourceIndex, 1)
  siblingList.splice(targetIndex, 0, moved)

  try {
    await categoryAPI.reorderCategories({
      parent_id: siblingParentId,
      ordered_ids: siblingList.map((item) => item.id)
    })
    ElMessage.success('排序已更新')
    await loadCategories()
  } catch (error) {
    ElMessage.error(error.response?.data?.message || '排序更新失败')
  } finally {
    handleDragEnd()
  }
}

function findTopCategoryById(id) {
  return categories.value.find((item) => item.id === id) || null
}

onMounted(() => {
  loadCategories()
})
</script>

<style scoped>
.category-list {
  background-color: #f5f7fa;
  min-height: 100vh;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.page-header h2 {
  margin: 0;
  color: #303133;
}

.search-card {
  margin-bottom: 20px;
}

.search-bar {
  display: flex;
  align-items: center;
  gap: 12px;
}

.search-tip {
  width: auto;
  flex: 1;
}

.table-card {
  margin-bottom: 20px;
}

.category-groups {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.category-group {
  border: 1px solid #ebeef5;
  border-radius: 10px;
  overflow: hidden;
  background: #fff;
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04);
  transition: border-color 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease;
}

.category-group.is-drag-target,
.child-row.is-drag-target {
  border-color: #409eff;
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.12);
}

.category-group-header,
.child-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 18px;
}

.category-group-header {
  background: #fcfcfd;
  min-height: 86px;
}

.children-list {
  padding: 8px 0 12px;
  border-top: 1px solid #f0f2f5;
}

.child-row {
  position: relative;
  margin-left: 24px;
  padding-left: 54px;
  min-height: 76px;
  background: linear-gradient(90deg, rgba(245, 247, 250, 0.75) 0, rgba(255, 255, 255, 0) 68px);
}

.child-indent {
  position: absolute;
  left: 18px;
  top: 0;
  bottom: 0;
  width: 30px;
}

.indent-line {
  position: absolute;
  left: 13px;
  top: -1px;
  bottom: 50%;
  width: 1px;
  background: #d6dbe6;
}

.indent-line.horizontal {
  top: 50%;
  bottom: auto;
  width: 18px;
  height: 1px;
}

.expand-toggle,
.expand-placeholder {
  width: 24px;
  height: 24px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.expand-toggle {
  border: 0;
  background: transparent;
  color: #606266;
  cursor: pointer;
  padding: 0;
}

.expand-toggle .el-icon {
  transition: transform 0.2s ease;
}

.expand-toggle .el-icon.expanded {
  transform: rotate(90deg);
}

.drag-handle {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 8px;
  background: #f4f6f8;
  color: #909399;
  cursor: grab;
  flex-shrink: 0;
}

.drag-handle.disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.category-info {
  flex: 1;
  min-width: 0;
  padding-right: 12px;
}

.category-title-line {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
  flex-wrap: wrap;
}

.category-name {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
  white-space: nowrap;
  line-height: 1.4;
}

.category-desc {
  font-size: 12px;
  color: #909399;
  line-height: 1.5;
  word-break: break-word;
}

.category-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
  justify-content: flex-end;
  flex-wrap: wrap;
  max-width: 260px;
  margin-left: auto;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

@media (max-width: 1100px) {
  .category-group-header,
  .child-row {
    align-items: flex-start;
  }

  .category-actions {
    justify-content: flex-start;
    max-width: none;
    margin-left: 0;
  }
}
</style>
