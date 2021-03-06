<template>
  <el-dialog
    :visible.sync="visible"
    :show-close="false"
    :close-on-click-modal="false"
    width="90%"
    custom-class="import br10"
    @close="$emit('close')"
  >
    <el-input v-model="url" :placeholder="$t('publish.importInput')" />
    <p class="des gray">
      {{ $t('publish.importDes1') }}
    </p>
    <p class="des" />
    <p class="des">
      {{ $t('publish.importDes2') }}
    </p>
    <div class="statement">
      <el-checkbox v-model="statement">
        {{ $t('publish.importAgree') }}
      </el-checkbox>
    </div>
    <span slot="footer" class="dialog-footer">
      <el-button @click="visible = false">
        {{ $t('cancel') }}
      </el-button>
      <el-button :loading="loading" :disabled="!statement" type="primary" @click="importFunc">
        {{ $t('confirm') }}
      </el-button>
    </span>
  </el-dialog>
</template>
<script>
import { strTrim, internetUrl } from '@/utils/reg'

export default {
  props: {
    value: {
      type: Boolean,
      default: false
    },
    // 默认打新建草稿打开新页面, 否则传递数据
    openNewPage: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      visible: false,
      url: '',
      statement: true,
      loading: false
    }
  },
  watch: {
    visible(val) {
      if (!val) {
        this.url = ''
        this.statement = true
        this.loading = false
      }
      this.$emit('input', val)
    },
    value(val) {
      this.visible = val
    }
  },
  methods: {
    resetData() {
      this.url = ''
      this.statement = true
    },
    async importFunc() {
      const url = strTrim(this.url)
      if (!internetUrl(url)) return this.$message.error(this.$t('publish.importAddressError'))
      this.loading = true
      await this.$API
        .importArticle(url)
        .then(res => {
          if (res.code === 0) {
            const templateLink = `\n\n${this.$t('publish.importAddress')}[${url}](${url})`
            res.data.content += templateLink
            const { title, content, cover } = res.data
            if (this.openNewPage) {
              this.createDraft({
                title,
                content,
                cover
              })
            } else {
              this.$message.success(this.$t('publish.importSuccess'))
              this.$emit('res', {
                title,
                content,
                cover
              })
              this.loading = false
              this.visible = false
            }
            this.resetData()
          } else {
            this.$message.error(res.message)
            this.loading = false
          }
        })
        .catch(err => {
          this.loading = false
          this.$message.error(this.$t('publish.importError'))
          console.log('err', err)
        })
    },
    async createDraft(article) {
      await this.$API
        .createDraft({
          ...article,
          commentPayPoint: 1,
          fissionFactor: 2000,
          is_original: 0,
          tags: ''
        })
        .then(res => {
          if (res.code === 0) {
            this.$message.success(this.$t('publish.importSuccess'))
            this.$router.push({
              name: 'publish-type-id',
              params: {
                type: 'draft',
                id: res.data
              }
            })
            this.loading = false
            this.visible = false
          } else {
            this.$message.error(res.message)
            this.loading = false
          }
        })
        .catch(err => {
          this.loading = false
          this.$message.error(this.$t('publish.importError'))
          console.log(err)
        })
    }
  }
}
</script>

<style lang="less">
.import .el-dialog__header {
  padding: 0;
}

.import {
  .des {
    font-size: 14px;
    font-weight: 400;
    color: #565656;
    line-height: 1.5;
    &.gray {
      color: #6f6f6f;
    }
    &:nth-of-type(1) {
      margin-bottom: 30px;
    }
  }
}
</style>
