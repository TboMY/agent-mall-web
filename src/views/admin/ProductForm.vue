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
          
          <!-- 图片信息（移动到基本信息） -->
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
          
          <el-col :span="12">
            <el-form-item label="分类" prop="category_id">
              <el-select
                v-model="form.category_id"
                placeholder="请选择分类"
                style="width: 100%"
                @change="handleCategoryChange"
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
            <el-form-item label="规格模板" prop="product_type_id">
              <el-select
                v-model="form.product_type_id"
                placeholder="请选择规格模板"
                clearable
                style="width: 100%"
                @change="handleProductTypeChange"
                :disabled="!form.category_id"
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
          <!-- SKU管理 -->
          <el-col :span="24">
            <div class="form-section">
              <div class="section-header">
                <h3>SKU管理</h3>
                <el-button type="primary" plain size="small" @click="addSkuRow">
                  <el-icon><Plus /></el-icon>
                  添加SKU
                </el-button>
              </div>
              <div class="section-tip">
                商品价格和总库存会根据下面的 SKU 自动汇总，不再单独手填。
              </div>
            </div>
          </el-col>

          <el-col :span="24">
            <div class="sku-summary">
              <div class="summary-card">
                <div class="summary-label">最低售价</div>
                <div class="summary-value">¥{{ skuSummary.price }}</div>
              </div>
              <div class="summary-card">
                <div class="summary-label">参考原价</div>
                <div class="summary-value">¥{{ skuSummary.originalPrice }}</div>
              </div>
              <div class="summary-card">
                <div class="summary-label">总库存</div>
                <div class="summary-value">{{ skuSummary.stock }}</div>
              </div>
            </div>
          </el-col>

          <el-col :span="24">
              <div
                v-for="(sku, index) in skuList"
                :key="sku.localId"
                class="sku-card"
              >
              <div class="sku-card-header">
                <div class="sku-card-title">SKU {{ index + 1 }}</div>
                <div class="sku-card-actions">
                  <el-button plain size="small" @click="fillSkuNameFromSpecs(sku)">
                    生成名称
                  </el-button>
                  <el-button
                    type="danger"
                    plain
                    size="small"
                    :disabled="skuList.length <= 1"
                    @click="removeSkuRow(index)"
                  >
                    删除
                  </el-button>
                </div>
              </div>

              <el-row :gutter="16">
                <el-col :span="8">
                  <el-form-item :label="`SKU名称 ${index + 1}`" :required="true">
                    <el-input v-model="sku.sku_name" placeholder="例如：128G 黑色 / 50ml" />
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item label="SKU编码">
                    <el-input v-model="sku.sku_code" placeholder="为空则自动生成" />
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item label="SKU图片">
                    <el-input v-model="sku.image" placeholder="可选，不填则沿用商品主图" />
                  </el-form-item>
                </el-col>
                <el-col :span="6">
                  <el-form-item label="售价" :required="true">
                    <el-input-number
                      v-model="sku.price"
                      :min="0"
                      :precision="2"
                      style="width: 100%"
                    />
                  </el-form-item>
                </el-col>
                <el-col :span="6">
                  <el-form-item label="原价">
                    <el-input-number
                      v-model="sku.original_price"
                      :min="0"
                      :precision="2"
                      style="width: 100%"
                    />
                  </el-form-item>
                </el-col>
                <el-col :span="6">
                  <el-form-item label="库存" :required="true">
                    <el-input-number
                      v-model="sku.stock"
                      :min="0"
                      style="width: 100%"
                    />
                  </el-form-item>
                </el-col>
                <el-col :span="3">
                  <el-form-item label="默认">
                    <el-radio
                      :model-value="sku.is_default === 1"
                      @change="setDefaultSku(index)"
                    >
                      默认
                    </el-radio>
                  </el-form-item>
                </el-col>
                <el-col :span="3">
                  <el-form-item label="状态">
                    <el-switch
                      v-model="sku.status"
                      :active-value="1"
                      :inactive-value="0"
                    />
                  </el-form-item>
                </el-col>
              </el-row>

              <div v-if="productAttributes.length" class="sku-spec-editor">
                <div class="sku-spec-editor__title">SKU规格绑定</div>
                <el-row :gutter="16">
                  <el-col
                    v-for="attribute in productAttributes"
                    :key="`${sku.localId}-${attribute.id}`"
                    :span="8"
                  >
                    <el-form-item :label="attribute.name" :required="attribute.is_required === 1">
                      <el-select
                        v-if="attribute.value_type === 'single'"
                        :model-value="getSkuAttributeValue(sku, attribute)"
                        :placeholder="`请选择${attribute.name}`"
                        clearable
                        style="width: 100%"
                        @change="setSkuAttributeValue(sku, attribute, $event)"
                      >
                        <el-option
                          v-for="value in attribute.values"
                          :key="value.id"
                          :label="value.label"
                          :value="value.id"
                        />
                      </el-select>

                      <el-select
                        v-else-if="attribute.value_type === 'multiple'"
                        :model-value="getSkuAttributeValue(sku, attribute)"
                        :placeholder="`请选择${attribute.name}`"
                        multiple
                        clearable
                        style="width: 100%"
                        @change="setSkuAttributeValue(sku, attribute, $event)"
                      >
                        <el-option
                          v-for="value in attribute.values"
                          :key="value.id"
                          :label="value.label"
                          :value="value.id"
                        />
                      </el-select>

                      <el-input
                        v-else
                        :model-value="getSkuAttributeValue(sku, attribute)"
                        :placeholder="`请输入${attribute.name}`"
                        @input="setSkuAttributeValue(sku, attribute, $event)"
                      />
                    </el-form-item>
                  </el-col>
                </el-row>

                <div v-if="getSkuSpecPreview(sku)" class="sku-spec-editor__preview">
                  当前规格：{{ getSkuSpecPreview(sku) }}
                </div>
              </div>
            </div>
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
const skuList = ref([])
const imageList = ref([''])
const tagList = ref([])
const tagInputVisible = ref(false)
const tagInputValue = ref('')
const tagInputRef = ref()

// 表单数据
const form = reactive({
  name: '',
  description: '',
  price: 0,
  original_price: null,
  image: '',
  category_id: null,
  brand_id: null,
  product_type_id: null,
  stock: 0,
  heat_score: 0,
  is_ai_recommended: false,
  ai_recommendation: '',
  source_platform: '',
  source_url: '',
  status: 1,
  ai_candidate_id: null // 新增：AI候选商品ID
})

// 表单验证规则
const rules = {
  name: [
    { required: true, message: '请输入商品名称', trigger: 'blur' },
    { min: 1, max: 255, message: '商品名称长度在1到255个字符', trigger: 'blur' }
  ],
  image: [
    { required: true, message: '请输入主图URL', trigger: 'blur' },
    { type: 'url', message: '请输入有效的URL', trigger: 'blur' }
  ],
  category_id: [
    { required: true, message: '请选择分类', trigger: 'change' }
  ]
}

// 是否为编辑模式
const isEdit = computed(() => !!route.params.id)

const createEmptySku = () => ({
  localId: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
  sku_code: '',
  sku_name: '',
  price: 0,
  original_price: null,
  stock: 0,
  image: '',
  status: 1,
  is_default: skuList.value.length === 0 ? 1 : 0,
  sort_order: (skuList.value.length + 1) * 10,
  specs: []
})

function normalizeSkuSpecs(specs = []) {
  if (!Array.isArray(specs)) return []
  return specs
    .map((spec) => ({
      attribute_id: Number(spec.attribute_id),
      attribute_value_id: spec.attribute_value_id ? Number(spec.attribute_value_id) : null,
      custom_value: spec.custom_value || null
    }))
    .filter((spec) => Number.isFinite(spec.attribute_id))
}

function getAttributeOptionLabel(attribute, valueId) {
  const target = (attribute.values || []).find((item) => Number(item.id) === Number(valueId))
  return target?.label || target?.value || ''
}

function getSkuAttributeValue(sku, attribute) {
  const specs = normalizeSkuSpecs(sku.specs)
  const matched = specs.filter((item) => Number(item.attribute_id) === Number(attribute.id))

  if (attribute.value_type === 'multiple') {
    return matched.map((item) => item.attribute_value_id).filter(Boolean)
  }

  if (attribute.value_type === 'custom') {
    return matched[0]?.custom_value || ''
  }

  return matched[0]?.attribute_value_id || null
}

function setSkuAttributeValue(sku, attribute, value) {
  const retained = normalizeSkuSpecs(sku.specs).filter((item) => Number(item.attribute_id) !== Number(attribute.id))

  if (attribute.value_type === 'multiple') {
    const nextValues = Array.isArray(value) ? value : []
    sku.specs = [
      ...retained,
      ...nextValues
        .filter(Boolean)
        .map((item) => ({
          attribute_id: Number(attribute.id),
          attribute_value_id: Number(item),
          custom_value: null
        }))
    ]
    return
  }

  if (attribute.value_type === 'custom') {
    const nextValue = String(value || '').trim()
    sku.specs = nextValue
      ? [
          ...retained,
          {
            attribute_id: Number(attribute.id),
            attribute_value_id: null,
            custom_value: nextValue
          }
        ]
      : retained
    return
  }

  sku.specs = value
    ? [
        ...retained,
        {
          attribute_id: Number(attribute.id),
          attribute_value_id: Number(value),
          custom_value: null
        }
      ]
    : retained
}

function getSkuSpecPreview(sku) {
  const specs = normalizeSkuSpecs(sku.specs)
  if (!specs.length) return ''

  return specs
    .map((spec) => {
      const attribute = productAttributes.value.find((item) => Number(item.id) === Number(spec.attribute_id))
      if (!attribute) return ''
      const label = spec.attribute_value_id
        ? getAttributeOptionLabel(attribute, spec.attribute_value_id)
        : (spec.custom_value || '')
      return label ? `${attribute.name}：${label}` : ''
    })
    .filter(Boolean)
    .join(' / ')
}

function fillSkuNameFromSpecs(sku) {
  const preview = getSkuSpecPreview(sku)
  if (!preview) {
    ElMessage.warning('请先为该 SKU 选择规格')
    return
  }
  sku.sku_name = preview
}

const skuSummary = computed(() => {
  if (!skuList.value.length) {
    return { price: '0.00', originalPrice: '0.00', stock: 0 }
  }

  const prices = skuList.value.map((item) => Number(item.price || 0))
  const originalPrices = skuList.value
    .map((item) => item.original_price == null || item.original_price === '' ? null : Number(item.original_price))
    .filter((item) => item != null)

  return {
    price: Math.min(...prices).toFixed(2),
    originalPrice: (originalPrices.length ? Math.min(...originalPrices) : Math.min(...prices)).toFixed(2),
    stock: skuList.value.reduce((sum, item) => sum + Number(item.stock || 0), 0)
  }
})

function addSkuRow() {
  skuList.value.push(createEmptySku())
}

function removeSkuRow(index) {
  skuList.value.splice(index, 1)
  if (skuList.value.length && !skuList.value.some((item) => item.is_default === 1)) {
    skuList.value[0].is_default = 1
  }
  skuList.value.forEach((item, idx) => {
    item.sort_order = (idx + 1) * 10
  })
}

function setDefaultSku(index) {
  skuList.value.forEach((item, idx) => {
    item.is_default = idx === index ? 1 : 0
  })
}

function validateSkuList() {
  if (!skuList.value.length) {
    throw new Error('请至少添加一个SKU')
  }

  const seenCodes = new Set()
  skuList.value.forEach((sku, index) => {
    if (!sku.sku_name?.trim()) {
      throw new Error(`请填写第 ${index + 1} 个SKU名称`)
    }
    if (Number(sku.price) < 0 || Number.isNaN(Number(sku.price))) {
      throw new Error(`第 ${index + 1} 个SKU售价无效`)
    }
    if (Number(sku.stock) < 0 || Number.isNaN(Number(sku.stock))) {
      throw new Error(`第 ${index + 1} 个SKU库存无效`)
    }
    if (sku.sku_code?.trim()) {
      const code = sku.sku_code.trim()
      if (seenCodes.has(code)) {
        throw new Error(`SKU编码重复：${code}`)
      }
      seenCodes.add(code)
    }

    productAttributes.value.forEach((attribute) => {
      if (Number(attribute.is_required) !== 1) return
      const value = getSkuAttributeValue(sku, attribute)
      const valid = Array.isArray(value) ? value.length > 0 : String(value ?? '').trim() !== ''
      if (!valid) {
        throw new Error(`请为第 ${index + 1} 个SKU选择 ${attribute.name}`)
      }
    })
  })

  if (!skuList.value.some((item) => item.is_default === 1)) {
    skuList.value[0].is_default = 1
  }
}

function buildSubmitSkus() {
  return skuList.value.map((sku, index) => ({
    sku_code: sku.sku_code?.trim() || '',
    sku_name: sku.sku_name?.trim() || '',
    price: Number(sku.price || 0),
    original_price: sku.original_price === '' || sku.original_price == null ? null : Number(sku.original_price),
    stock: Number(sku.stock || 0),
    image: sku.image?.trim() || '',
    status: Number(sku.status ?? 1),
    is_default: Number(sku.is_default ?? (index === 0 ? 1 : 0)),
    sort_order: (index + 1) * 10,
    specs: normalizeSkuSpecs(sku.specs)
  }))
}

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
    const params = form.category_id ? { category_id: form.category_id } : {}
    console.log('开始获取规格模板列表...', params)
    const response = await productTypeAPI.getActiveList(params)
    console.log('规格模板API响应:', response)
    productTypes.value = response.data
    console.log('规格模板数据已设置:', productTypes.value)

    if (form.product_type_id && !productTypes.value.some(item => item.id === form.product_type_id)) {
      form.product_type_id = null
      productAttributes.value = []
      skuList.value.forEach((sku) => {
        sku.specs = []
      })
    }
  } catch (error) {
    console.error('获取规格模板列表失败:', error)
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
  console.log('规格模板变化:', productTypeId)
  // 获取该商品类型的属性
  await getProductAttributes(productTypeId)
  skuList.value.forEach((sku) => {
    sku.specs = []
  })
}

async function handleCategoryChange() {
  form.product_type_id = null
  productAttributes.value = []
  skuList.value.forEach((sku) => {
    sku.specs = []
  })
  await getProductTypes()
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

    // 规范化数字字段（后端可能返回字符串）
    normalizeNumberFields()
    
    // 处理图片列表（兼容数组/JSON字符串）
    if (product.images) {
      let images = []
      if (Array.isArray(product.images)) {
        images = product.images
      } else if (typeof product.images === 'string') {
        try { images = JSON.parse(product.images) || [] } catch (_) { images = [] }
      }
      imageList.value = images.length > 0 ? images : ['']
    }
    
    // 处理商品类型与 SKU 规格配置
    console.log('编辑模式：商品数据:', product)
    console.log('编辑模式：商品类型ID:', product.product_type_id)

    await getProductTypes()
    
    if (product.product_type_id) {
      console.log('编辑模式：加载规格模板属性，模板ID:', product.product_type_id)
      await getProductAttributes(product.product_type_id)
    }
    
    // 处理标签列表（兼容数组/JSON字符串/逗号分隔）
    if (product.tags) {
      let tags = []
      if (Array.isArray(product.tags)) {
        tags = product.tags
      } else if (typeof product.tags === 'string') {
        try {
          const parsed = JSON.parse(product.tags)
          tags = Array.isArray(parsed) ? parsed : String(product.tags).split(',').map(s=>s.trim()).filter(Boolean)
        } catch (_) {
          tags = String(product.tags).split(',').map(s=>s.trim()).filter(Boolean)
        }
      }
      tagList.value = tags || []
    }

    if (Array.isArray(product.skus) && product.skus.length > 0) {
      skuList.value = product.skus.map((sku, index) => ({
        localId: `${sku.id || 'sku'}-${index}`,
        sku_code: sku.sku_code || '',
        sku_name: sku.sku_name || '',
        price: Number(sku.price || 0),
        original_price: sku.original_price == null || sku.original_price === '' ? null : Number(sku.original_price),
        stock: Number(sku.stock || 0),
        image: sku.image || '',
        status: Number(sku.status ?? 1),
        is_default: Number(sku.is_default ?? (index === 0 ? 1 : 0)),
        sort_order: Number(sku.sort_order ?? (index + 1) * 10),
        specs: normalizeSkuSpecs(sku.specs)
      }))
    } else {
      skuList.value = [createEmptySku()]
    }
  } catch (error) {
    ElMessage.error('获取商品详情失败')
    console.error(error)
  }
}

// 将可能为字符串的数字字段转为数字
function normalizeNumberFields() {
  const toNumber = (v, def = 0) => {
    if (v === '' || v === null || v === undefined) return def
    const n = Number(v)
    return Number.isNaN(n) ? def : n
  }
  form.price = toNumber(form.price, 0)
  form.original_price = form.original_price == null || form.original_price === '' ? null : toNumber(form.original_price, 0)
  form.stock = toNumber(form.stock, 0)
  form.heat_score = toNumber(form.heat_score, 0)
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
    // 提交前规范化数字字段，避免前端校验把字符串判为非法
    normalizeNumberFields()
    await formRef.value.validate()
    validateSkuList()
    
    loading.value = true
    
    // 处理图片列表
    const images = imageList.value.filter(img => img.trim())
    
    // 处理标签列表
    const tags = tagList.value
    
    // 复制并剔除不应提交的字段
    const cleaned = { ...form }
    // 编辑时不需要 ai_candidate_id；创建时需要把它带上用于后端联动
    if (isEdit.value) {
      delete cleaned.ai_candidate_id
    }

    const submitData = {
      ...cleaned,
      price: Number(skuSummary.value.price),
      original_price: Number(skuSummary.value.originalPrice),
      stock: Number(skuSummary.value.stock),
      images: images.length > 0 ? images : null,
      tags: tags.length > 0 ? tags : null,
      skus: buildSubmitSkus()
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
      ElMessage.error(error?.message || (isEdit.value ? '商品更新失败' : '商品创建失败'))
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
onMounted(async () => {
  skuList.value = [createEmptySku()]
  
  // 先加载基础数据
  await getCategories()
  getBrands()
  await getProductTypes()
  
  // 处理从AI推荐页面传递的参数（在分类数据加载完成后）
  handleAIRecommendationData()
  
  if (isEdit.value) {
    getProductDetail()
  }
})

// 处理从AI推荐页面传递的数据
function handleAIRecommendationData() {
  const query = route.query
  
  // 检查是否来自AI推荐
  if (query.from_ai_recommendation === 'true') {
    console.log('从AI推荐页面进入，开始填充数据:', query)
    
    // 填充AI推荐的基础数据
    if (query.name) form.name = query.name
    if (query.description) form.description = query.description
    if (query.image) form.image = query.image
    if (query.heat_score) form.heat_score = parseFloat(query.heat_score) || 0
    if (query.source_platform) form.source_platform = query.source_platform
    if (query.source_url) form.source_url = query.source_url
    if (query.download_url) form.download_url = query.download_url
    if (query.source_keyword) form.source_keyword = query.source_keyword
    
    // 设置AI候选商品ID
    if (query.ai_candidate_id) {
      form.ai_candidate_id = parseInt(query.ai_candidate_id)
      console.log('设置AI候选商品ID:', form.ai_candidate_id)
    }
    
    // 设置AI推荐相关字段
    form.is_ai_recommended = true
    form.ai_recommendation = query.description || ''
    
    // 处理分类（AI推荐传递的是分类ID）
    if (query.category) {
      // 检查传递的是否为数字（分类ID）
      const categoryId = parseInt(query.category)
      if (!isNaN(categoryId)) {
        // 直接使用分类ID
        form.category_id = categoryId
        console.log('设置分类ID:', categoryId)
      } else {
        // 如果传递的是分类名称，则查找对应的ID
        const category = categories.value.find(cat => cat.name === query.category)
        if (category) {
          form.category_id = category.id
          console.log('通过名称找到分类ID:', category.id, '分类名称:', category.name)
        }
      }
      getProductTypes()
    }
    
    console.log('AI推荐数据填充完成:', form)
  }
}
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

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}

.section-tip {
  margin-top: 8px;
  color: #909399;
  font-size: 13px;
}

.sku-summary {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
  margin-bottom: 16px;
}

.summary-card {
  padding: 16px 18px;
  border-radius: 10px;
  background: linear-gradient(135deg, #f8fbff 0%, #eef5ff 100%);
  border: 1px solid #dbe7ff;
}

.summary-label {
  color: #606266;
  font-size: 13px;
}

.summary-value {
  margin-top: 8px;
  color: #1f2d3d;
  font-size: 24px;
  font-weight: 700;
}

.sku-card {
  padding: 18px 18px 4px;
  margin-bottom: 16px;
  border: 1px solid #e5eaf3;
  border-radius: 12px;
  background: #fafcff;
}

.sku-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.sku-card-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.sku-card-title {
  color: #303133;
  font-size: 15px;
  font-weight: 600;
}

.sku-spec-editor {
  margin-top: 8px;
  padding-top: 16px;
  border-top: 1px dashed #dbe2ec;
}

.sku-spec-editor__title {
  margin-bottom: 12px;
  color: #4b5563;
  font-size: 13px;
  font-weight: 600;
}

.sku-spec-editor__preview {
  margin-top: 4px;
  color: #64748b;
  font-size: 13px;
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
