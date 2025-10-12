<template>
  <div class="product-form">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2>{{ isEdit ? '编辑商品' : '添加商品' }}</h2>
      <el-button @click="goBack">
        <el-icon><ArrowLeft /></el-icon>
        返回列表
      </el-button>
    </div>

    <el-card>
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="120px"
        class="product-form-content"
      >
        <el-row :gutter="20">
          <!-- 基本信息 -->
          <el-col :span="24">
            <div class="form-section">
              <h3>基本信息</h3>
            </div>
          </el-col>
          
          <el-col :span="12">
            <el-form-item label="商品名称" prop="name">
              <el-input
                v-model="form.name"
                placeholder="请输入商品名称"
                maxlength="255"
                show-word-limit
              />
            </el-form-item>
          </el-col>
          
          <el-col :span="12">
            <el-form-item label="商品SKU" prop="sku">
              <el-input
                v-model="form.sku"
                placeholder="请输入商品SKU"
                maxlength="100"
              />
            </el-form-item>
          </el-col>
          
          <el-col :span="24">
            <el-form-item label="商品描述" prop="description">
              <el-input
                v-model="form.description"
                type="textarea"
                :rows="3"
                placeholder="请输入商品描述"
                maxlength="1000"
                show-word-limit
              />
            </el-form-item>
          </el-col>
          
          <el-col :span="12">
            <el-form-item label="分类" prop="category_id">
              <el-select
                v-model="form.category_id"
                placeholder="请选择分类"
                style="width: 100%"
              >
                <el-option
                  v-for="category in categories"
                  :key="category.id"
                  :label="category.name"
                  :value="category.id"
                />
              </el-select>
            </el-form-item>
          </el-col>
          
          <el-col :span="12">
            <el-form-item label="品牌" prop="brand_id">
              <el-select
                v-model="form.brand_id"
                placeholder="请选择品牌"
                clearable
                style="width: 100%"
              >
                <el-option
                  v-for="brand in brands"
                  :key="brand.id"
                  :label="brand.name"
                  :value="brand.id"
                />
              </el-select>
            </el-form-item>
          </el-col>
          
          <el-col :span="12">
            <el-form-item label="商品类型" prop="product_type_id">
              <el-select
                v-model="form.product_type_id"
                placeholder="请选择商品类型"
                clearable
                style="width: 100%"
                @change="handleProductTypeChange"
              >
                <el-option
                  v-for="type in productTypes"
                  :key="type.id"
                  :label="type.name"
                  :value="type.id"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <!-- 价格信息 -->
          <el-col :span="24">
            <div class="form-section">
              <h3>价格信息</h3>
            </div>
          </el-col>
          
          <el-col :span="12">
            <el-form-item label="销售价格" prop="price">
              <el-input-number
                v-model="form.price"
                :min="0"
                :precision="2"
                placeholder="请输入销售价格"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          
          <el-col :span="12">
            <el-form-item label="原价" prop="original_price">
              <el-input-number
                v-model="form.original_price"
                :min="0"
                :precision="2"
                placeholder="请输入原价"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <!-- 库存信息 -->
          <el-col :span="24">
            <div class="form-section">
              <h3>库存信息</h3>
            </div>
          </el-col>
          
          <el-col :span="12">
            <el-form-item label="库存数量" prop="stock">
              <el-input-number
                v-model="form.stock"
                :min="0"
                placeholder="请输入库存数量"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          
          <el-col :span="12">
            <el-form-item label="热度分数" prop="heat_score">
              <el-input-number
                v-model="form.heat_score"
                :min="0"
                placeholder="请输入热度分数"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20" v-if="productAttributes.length > 0 || form.product_type_id">
          <!-- 规格信息 -->
          <el-col :span="24">
            <div class="form-section">
              <h3>规格信息</h3>
              <div v-if="productAttributes.length === 0 && form.product_type_id" style="color: #999; font-size: 14px; margin-top: 5px;">
                该商品类型暂无规格属性
              </div>
            </div>
          </el-col>
          
          <el-col :span="24" v-for="attribute in productAttributes" :key="attribute.id">
            <el-form-item 
              :label="attribute.name" 
              :prop="`specifications.${attribute.id}`"
              :rules="attribute.is_required ? [{ required: true, message: `请选择${attribute.name}`, trigger: 'change' }] : []"
            >
              <!-- 单选类型 -->
              <el-select
                v-if="attribute.value_type === 'single'"
                v-model="safeSpecifications[attribute.id]"
                :placeholder="`请选择${attribute.name}`"
                style="width: 100%"
                clearable
                @focus="ensureSpecificationsObject"
                @mounted="ensureSpecificationsObject"
              >
                <el-option
                  v-for="value in attribute.values"
                  :key="value.id"
                  :label="value.label"
                  :value="value.id"
                >
                  <span>{{ value.label }}</span>
                  <span v-if="value.color" class="color-preview" :style="{ backgroundColor: value.color }"></span>
                </el-option>
              </el-select>
              
              <!-- 多选类型 -->
              <el-select
                v-else-if="attribute.value_type === 'multiple'"
                v-model="safeSpecifications[attribute.id]"
                :placeholder="`请选择${attribute.name}`"
                style="width: 100%"
                multiple
                clearable
                @focus="ensureSpecificationsObject"
                @mounted="ensureSpecificationsObject"
              >
                <el-option
                  v-for="value in attribute.values"
                  :key="value.id"
                  :label="value.label"
                  :value="value.id"
                >
                  <span>{{ value.label }}</span>
                  <span v-if="value.color" class="color-preview" :style="{ backgroundColor: value.color }"></span>
                </el-option>
              </el-select>
              
              <!-- 自定义输入类型 -->
              <el-input
                v-else-if="attribute.value_type === 'custom'"
                v-model="safeSpecifications[attribute.id]"
                :placeholder="`请输入${attribute.name}`"
                style="width: 100%"
                @focus="ensureSpecificationsObject"
                @mounted="ensureSpecificationsObject"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <!-- 图片信息 -->
          <el-col :span="24">
            <div class="form-section">
              <h3>图片信息</h3>
            </div>
          </el-col>
          
          <el-col :span="24">
            <el-form-item label="主图" prop="image">
              <el-input
                v-model="form.image"
                placeholder="请输入主图URL"
                style="width: 100%"
              />
              <div v-if="form.image" class="image-preview">
                <el-image
                  :src="form.image"
                  :alt="form.name"
                  style="width: 120px; height: 120px; margin-top: 10px;"
                  fit="cover"
                  :preview-src-list="[form.image]"
                />
              </div>
            </el-form-item>
          </el-col>
          
          <el-col :span="24">
            <el-form-item label="商品图片">
              <div class="image-list">
                <div
                  v-for="(image, index) in imageList"
                  :key="index"
                  class="image-item"
                >
                  <el-input
                    v-model="imageList[index]"
                    placeholder="请输入图片URL"
                    style="width: calc(100% - 40px); margin-right: 10px;"
                  />
                  <el-button
                    type="danger"
                    size="small"
                    @click="removeImage(index)"
                    :disabled="imageList.length <= 1"
                  >
                    <el-icon><Delete /></el-icon>
                  </el-button>
                </div>
                <el-button
                  type="primary"
                  size="small"
                  @click="addImage"
                  style="margin-top: 10px;"
                >
                  <el-icon><Plus /></el-icon>
                  添加图片
                </el-button>
              </div>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <!-- AI推荐信息 -->
          <el-col :span="24">
            <div class="form-section">
              <h3>AI推荐信息</h3>
            </div>
          </el-col>
          
          <el-col :span="12">
            <el-form-item label="AI推荐">
              <el-switch
                v-model="form.is_ai_recommended"
                :active-value="true"
                :inactive-value="false"
              />
            </el-form-item>
          </el-col>
          
          <el-col :span="12">
            <el-form-item label="来源平台" prop="source_platform">
              <el-select
                v-model="form.source_platform"
                placeholder="请选择来源平台"
                clearable
                style="width: 100%"
              >
                <el-option label="B站" value="bilibili" />
                <el-option label="抖音" value="douyin" />
                <el-option label="小红书" value="xiaohongshu" />
              </el-select>
            </el-form-item>
          </el-col>
          
          <el-col :span="24">
            <el-form-item label="AI推荐理由" prop="ai_recommendation">
              <el-input
                v-model="form.ai_recommendation"
                type="textarea"
                :rows="2"
                placeholder="请输入AI推荐理由"
                maxlength="500"
                show-word-limit
              />
            </el-form-item>
          </el-col>
          
          <el-col :span="24">
            <el-form-item label="来源链接" prop="source_url">
              <el-input
                v-model="form.source_url"
                placeholder="请输入来源链接"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <!-- 标签信息 -->
          <el-col :span="24">
            <div class="form-section">
              <h3>标签信息</h3>
            </div>
          </el-col>
          
          <el-col :span="24">
            <el-form-item label="商品标签">
              <div class="tag-list">
                <el-tag
                  v-for="(tag, index) in tagList"
                  :key="index"
                  closable
                  @close="removeTag(index)"
                  style="margin-right: 8px; margin-bottom: 8px;"
                >
                  {{ tag }}
                </el-tag>
                <el-input
                  v-if="tagInputVisible"
                  ref="tagInputRef"
                  v-model="tagInputValue"
                  size="small"
                  style="width: 80px;"
                  @keyup.enter="addTag"
                  @blur="addTag"
                />
                <el-button
                  v-else
                  size="small"
                  @click="showTagInput"
                >
                  <el-icon><Plus /></el-icon>
                </el-button>
              </div>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <!-- 状态设置 -->
          <el-col :span="24">
            <div class="form-section">
              <h3>状态设置</h3>
            </div>
          </el-col>
          
          <el-col :span="12">
            <el-form-item label="商品状态" prop="status">
              <el-radio-group v-model="form.status">
                <el-radio :label="1">上架</el-radio>
                <el-radio :label="0">下架</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 操作按钮 -->
        <el-row>
          <el-col :span="24">
            <div class="form-actions">
              <el-button @click="goBack">取消</el-button>
              <el-button type="primary" @click="handleSubmit" :loading="loading">
                {{ isEdit ? '更新' : '创建' }}
              </el-button>
            </div>
          </el-col>
        </el-row>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { productAPI, categoryAPI, brandAPI, productTypeAPI, productAttributeAPI } from '@/services/api'

const route = useRoute()
const router = useRouter()

// 响应式数据
const loading = ref(false)
const formRef = ref()
const categories = ref([])
const brands = ref([])
const productTypes = ref([])
const productAttributes = ref([])
const imageList = ref([''])
const tagList = ref([])
const tagInputVisible = ref(false)
const tagInputValue = ref('')
const tagInputRef = ref()

// 表单数据
const form = reactive({
  name: '',
  description: '',
  price: null,
  original_price: null,
  image: '',
  category_id: null,
  brand_id: null,
  product_type_id: null,
  specifications: {},
  sku: '',
  stock: 0,
  heat_score: 0,
  is_ai_recommended: false,
  ai_recommendation: '',
  source_platform: '',
  source_url: '',
  status: 1
})

// 强制确保specifications是对象
Object.defineProperty(form, 'specifications', {
  get() {
    return this._specifications || {}
  },
  set(value) {
    this._specifications = value || {}
  }
})

// 确保specifications始终是对象
const ensureSpecificationsObject = () => {
  if (!form.specifications || typeof form.specifications !== 'object') {
    form.specifications = {}
  }
}

// 计算属性：安全的specifications对象
const safeSpecifications = computed({
  get() {
    if (!form.specifications || typeof form.specifications !== 'object') {
      return {}
    }
    return form.specifications
  },
  set(value) {
    form.specifications = value
  }
})

// 表单验证规则
const rules = {
  name: [
    { required: true, message: '请输入商品名称', trigger: 'blur' },
    { min: 1, max: 255, message: '商品名称长度在1到255个字符', trigger: 'blur' }
  ],
  price: [
    { required: true, message: '请输入销售价格', trigger: 'blur' },
    { type: 'number', min: 0, message: '价格必须大于等于0', trigger: 'blur' }
  ],
  image: [
    { required: true, message: '请输入主图URL', trigger: 'blur' },
    { type: 'url', message: '请输入有效的URL', trigger: 'blur' }
  ],
  category_id: [
    { required: true, message: '请选择分类', trigger: 'change' }
  ],
  stock: [
    { type: 'number', min: 0, message: '库存必须大于等于0', trigger: 'blur' }
  ]
}

// 是否为编辑模式
const isEdit = computed(() => !!route.params.id)

// 获取分类列表
async function getCategories() {
  try {
    const response = await categoryAPI.getCategories()
    categories.value = response.data
  } catch (error) {
    console.error('获取分类列表失败:', error)
  }
}

// 获取品牌列表
async function getBrands() {
  try {
    const response = await brandAPI.getBrands()
    brands.value = response.data
  } catch (error) {
    console.error('获取品牌列表失败:', error)
  }
}

// 获取商品类型列表
async function getProductTypes() {
  try {
    console.log('开始获取商品类型列表...')
    const response = await productTypeAPI.getActiveList()
    console.log('商品类型API响应:', response)
    productTypes.value = response.data
    console.log('商品类型数据已设置:', productTypes.value)
  } catch (error) {
    console.error('获取商品类型列表失败:', error)
  }
}

// 获取商品属性列表
async function getProductAttributes(productTypeId) {
  if (!productTypeId) {
    console.log('没有商品类型ID，清空属性列表')
    productAttributes.value = []
    return
  }

  try {
    console.log('开始获取商品属性，类型ID:', productTypeId)
    const response = await productAttributeAPI.getByProductType(productTypeId)
    console.log('商品属性API响应:', response)
    
    if (response && response.data) {
      productAttributes.value = response.data
      console.log('商品属性数据已设置:', productAttributes.value)
      console.log('属性数量:', productAttributes.value.length)
    } else {
      console.log('商品属性API响应格式异常:', response)
      productAttributes.value = []
    }
  } catch (error) {
    console.error('获取商品属性列表失败:', error)
    console.error('错误详情:', error.response?.data || error.message)
    productAttributes.value = []
  }
}

// 处理商品类型变化
async function handleProductTypeChange(productTypeId) {
  console.log('商品类型变化:', productTypeId)
  // 确保specifications是对象
  ensureSpecificationsObject()
  // 清空规格信息
  form.specifications = {}
  
  // 获取该商品类型的属性
  await getProductAttributes(productTypeId)
}

// 获取商品详情（编辑模式）
async function getProductDetail() {
  if (!isEdit.value) return
  
  try {
    const response = await productAPI.getProduct(route.params.id)
    const product = response.data
    
    // 填充表单数据
    Object.keys(form).forEach(key => {
      if (product[key] !== undefined) {
        // 特殊处理布尔值字段
        if (key === 'is_ai_recommended') {
          form[key] = Boolean(product[key])
        } else {
          form[key] = product[key]
        }
      }
    })
    
    // 处理图片列表
    if (product.images) {
      const images = JSON.parse(product.images)
      imageList.value = images.length > 0 ? images : ['']
    }
    
    // 处理商品类型和规格信息
    console.log('编辑模式：商品数据:', product)
    console.log('编辑模式：商品类型ID:', product.product_type_id)
    console.log('编辑模式：规格信息:', product.specifications)
    
    if (product.product_type_id) {
      console.log('编辑模式：加载商品类型属性，类型ID:', product.product_type_id)
      await getProductAttributes(product.product_type_id)
      
      // 确保specifications是对象
      ensureSpecificationsObject()
      
      // 加载商品规格信息
      if (product.specifications) {
        try {
          const specifications = typeof product.specifications === 'string' 
            ? JSON.parse(product.specifications) 
            : product.specifications
          form.specifications = specifications
          console.log('编辑模式：加载商品规格信息:', specifications)
        } catch (error) {
          console.error('解析商品规格信息失败:', error)
          form.specifications = {}
        }
      } else {
        console.log('编辑模式：商品没有规格信息，初始化为空对象')
        form.specifications = {}
      }
    } else {
      console.log('编辑模式：商品没有类型ID，清空规格信息')
      ensureSpecificationsObject()
    }
    
    // 确保在编辑模式下也显示规格信息模块（即使没有规格数据）
    console.log('编辑模式：当前属性数量:', productAttributes.value.length)
    
    // 处理标签列表
    if (product.tags) {
      const tags = JSON.parse(product.tags)
      tagList.value = tags || []
    }
  } catch (error) {
    ElMessage.error('获取商品详情失败')
    console.error(error)
  }
}

// 添加图片
function addImage() {
  imageList.value.push('')
}

// 删除图片
function removeImage(index) {
  if (imageList.value.length > 1) {
    imageList.value.splice(index, 1)
  }
}

// 显示标签输入框
function showTagInput() {
  tagInputVisible.value = true
  nextTick(() => {
    tagInputRef.value?.focus()
  })
}

// 添加标签
function addTag() {
  if (tagInputValue.value && !tagList.value.includes(tagInputValue.value)) {
    tagList.value.push(tagInputValue.value)
  }
  tagInputVisible.value = false
  tagInputValue.value = ''
}

// 删除标签
function removeTag(index) {
  tagList.value.splice(index, 1)
}

// 提交表单
async function handleSubmit() {
  try {
    await formRef.value.validate()
    
    loading.value = true
    
    // 处理图片列表
    const images = imageList.value.filter(img => img.trim())
    
    // 处理标签列表
    const tags = tagList.value
    
    const submitData = {
      ...form,
      images: images.length > 0 ? images : null,
      tags: tags.length > 0 ? tags : null
    }
    
    if (isEdit.value) {
      await productAPI.updateProduct(route.params.id, submitData)
      ElMessage.success('商品更新成功')
    } else {
      await productAPI.createProduct(submitData)
      ElMessage.success('商品创建成功')
    }
    
    goBack()
  } catch (error) {
    if (error === false) { // 表单验证失败
      ElMessage.error('请完整填写表单')
      // 滚动到第一个错误字段
      nextTick(() => {
        const firstError = document.querySelector('.el-form-item.is-error')
        if (firstError) {
          firstError.scrollIntoView({ behavior: 'smooth', block: 'center' })
        }
      })
    } else { // 其他错误
      ElMessage.error(isEdit.value ? '商品更新失败' : '商品创建失败')
      console.error(error)
    }
  } finally {
    loading.value = false
  }
}

// 返回列表
function goBack() {
  router.push('/admin/products/list')
}

// 页面加载时获取数据
onMounted(() => {
  // 确保specifications是对象
  ensureSpecificationsObject()
  
  getCategories()
  getBrands()
  getProductTypes()
  if (isEdit.value) {
    getProductDetail()
  }
})
</script>

<style scoped>
.product-form {
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

.product-form-content {
  max-width: 1200px;
}

.form-section {
  margin: 20px 0;
  padding-bottom: 10px;
  border-bottom: 1px solid #e6e6e6;
}

.form-section h3 {
  margin: 0;
  color: #303133;
  font-size: 16px;
  font-weight: 500;
}

.image-preview {
  margin-top: 10px;
}

.image-list {
  width: 100%;
}

.image-item {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.tag-list {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  min-height: 32px;
}

.form-actions {
  text-align: center;
  padding: 20px 0;
  border-top: 1px solid #e6e6e6;
  margin-top: 20px;
}

.form-actions .el-button {
  margin: 0 10px;
  min-width: 100px;
}

:deep(.el-form-item__label) {
  font-weight: 500;
}

:deep(.el-input-number) {
  width: 100%;
}

.color-preview {
  display: inline-block;
  width: 20px;
  height: 20px;
  border-radius: 3px;
  border: 1px solid #dcdfe6;
  margin-left: 8px;
  vertical-align: middle;
}
</style>
