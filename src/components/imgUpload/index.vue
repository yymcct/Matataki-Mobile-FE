<template>
  <div>
    <!-- 上传图片 -->
    <FileUpload
      ref="upload"
      v-model="files"
      extensions="gif,jpg,jpeg,png,webp"
      accept="image/png,image/gif,image/jpeg,image/webp"
      @input-file="inputFile"
      @input-filter="inputFilter"
    >
      <slot name="uploadButton">
        <Button>{{ $t('imgUpload.btn') }}</Button>
      </slot>
    </FileUpload>

    <!-- 编辑图片 modal -->
    <Modal
      v-model="modal"
      width="400"
      class-name="img-upload-modal"
      closable
      :mask-closable="false"
    >
      <div slot="header" class="modal-header">
        <p class="modal-header-title">{{ $t('imgUpload.title') }}</p>
        <p class="modal-header-subtitle">{{ $t('imgUpload.subtitle') }}</p>
      </div>
      <div class="modal-content" :style="computedStyleContent">
        <!-- 目前都只用了单文件上传, 所以裁剪取得files[0] 如果需要支持多图,请扩展组件 -->
        <img v-if="files.length && modal" ref="editImage" :src="files[0].url" />
      </div>
      <el-button
        slot="footer"
        class="save-button"
        type="primary"
        size="large"
        :loading="modalLoading"
        @click.prevent="uploadButton"
      >
        {{ buttonText }}
      </el-button>
    </Modal>
  </div>
</template>

<script>
import VueUploadComponent from 'vue-upload-component'
import Cropper from 'cropperjs'
import Compressor from 'compressorjs'
import { mapGetters } from 'vuex'
import { ifpsUpload } from '@/api/ipfs'

export default {
  name: 'ImgUpload',
  components: { FileUpload: VueUploadComponent },
  props: {
    // 按钮文字
    buttonText: {
      type: String,
      default: function() {
        return this.$t('imgUpload.save')
      }
    },
    // 显示上传图片大小 单位 M
    imgSize: {
      type: Number,
      default: 5
    },
    // 是否上传完成
    imgUploadDone: {
      type: Number,
      default: 0,
      required: true
    },
    // 比列
    aspectRatio: {
      type: Number,
      default: 1 / 1
    },
    // 上传类型
    updateType: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      files: [], // 文件数据
      modal: false, // modal 框显示和隐藏
      modalLoading: false, // modal button loading
      postAction: ifpsUpload, // 上传地址
      quality: 0.8 // 压缩品质
    }
  },
  computed: {
    ...mapGetters(['isLogined']),
    computedStyleContent() {
      if (this.updateType === 'artileCover') {
        return {
          width: '240px',
          height: '120px'
        }
      } else {
        return {
          width: '240px',
          height: '240px'
        }
      }
    }
  },
  watch: {
    // 显示modal
    modal(value) {
      if (value) {
        this.modalLoading = false
        this.$nextTick(() => {
          if (!this.$refs.editImage) {
            return
          }
          const cropper = new Cropper(this.$refs.editImage, {
            aspectRatio: this.aspectRatio,
            viewMode: 3,
            dragMode: 'move',
            autoCropArea: 1,
            restore: false,
            modal: false,
            guides: false,
            highlight: false,
            cropBoxMovable: false,
            cropBoxResizable: false,
            toggleDragModeOnDblclick: false
          })
          this.cropper = cropper
        })
      } else if (this.cropper) {
        this.cropper.destroy()
        this.cropper = false
      }
    },
    // 上传完成
    imgUploadDone() {
      this.modal = false
      this.modalLoading = false
    }
  },
  methods: {
    /**
     * Pretreatment // 过滤操作可以写在这里
     * @param  Object|undefined   newFile   读写
     * @param  Object|undefined   oldFile   只读
     * @param  Function           prevent   阻止回调
     * @return undefined
     */
    // eslint-disable-next-line consistent-return
    async inputFilter(newFile, oldFile, prevent) {
      if (newFile && !oldFile) {
        // 过滤不是图片后缀的文件
        if (!/\.(gif|jpg|jpeg|png|webp)$/i.test(newFile.name)) {
          this.$toast.fail({
            duration: 1000,
            message: this.$t('imgUpload.selectImg')
          })
          return prevent()
        }
      }
      // 限定最大字节
      const maxSize = size => {
        if (newFile.file.size >= 0 && newFile.file.size > 1024 * 1024 * size) {
          this.$toast.fail({
            duration: 1000,
            message: this.$t('imgUpload.imgVeryBIg')
          })
          prevent()
          return false
        }
        return true
      }
      // 压缩方法
      const compressorFunc = async () => {
        // 如果是 gif 跳过
        // console.log(this.files[0].file);
        if (this.files[0].file.type !== 'image/gif') {
          await new Compressor(newFile.file, {
            quality: this.quality,
            success(file) {
              // eslint-disable-next-line no-param-reassign
              newFile.file = file
              maxSize(this.imgSize)
            },
            error(err) {
              console.log(err)
              this.$toast.fail({
                duration: 1000,
                message: this.$t('imgUpload.autoCompressionFail')
              })
            }
          })
        }
      }
      // 图片预览
      const modalImgView = () => {
        if (newFile && (!oldFile || newFile.file !== oldFile.file)) {
          // eslint-disable-next-line no-param-reassign
          newFile.url = ''
          const URL = window.URL || window.webkitURL
          if (URL && URL.createObjectURL) {
            // eslint-disable-next-line no-param-reassign
            newFile.url = URL.createObjectURL(newFile.file)
            //   console.log(this.files);
            this.modal = true // 显示 modal
          }
        }
      }
      const maxSizeResult = await maxSize(10)
      if (!maxSizeResult) return true
      await compressorFunc()
      await modalImgView()
    },
    // 上传图片
    async uploadButton() {
      if (!this.checkLogin) return
      this.modalLoading = true
      let file = this.files[0].file
      // 如果是gif不作处理
      if (this.files[0].file.type !== 'image/gif') {
        let oldFile = this.files[0]
        let binStr = atob(
          this.cropper
            .getCroppedCanvas()
            .toDataURL(oldFile.type)
            .split(',')[1]
        )
        let arr = new Uint8Array(binStr.length)
        for (let i = 0; i < binStr.length; i++) {
          arr[i] = binStr.charCodeAt(i)
        }
        file = new File([arr], oldFile.name, { type: oldFile.type })
      }

      try {
        const res = await this.$backendAPI.uploadImage(this.updateType, file)
        // console.log(this.files[0]);
        if (res.status === 200 && res.data.code === 0) {
          this.$emit('doneImageUpload', {
            type: this.updateType,
            data: res.data
          })
        } else {
          this.modalLoading = false
          this.$toast.fail({
            duration: 1000,
            message: this.$t('imgUpload.uploadImgFail')
          })
        }

        // console.log(file)
      } catch (error) {
        // 捕获错误 未登陆提示
        console.log(error)
        this.modalLoading = false
        if (error.toString().includes('code 401')) {
          this.$toast.fail({
            duration: 1000,
            message: this.$t('error.pleaseLogin')
          })
        } else {
          this.$toast.fail({
            duration: 1000,
            message: this.$t('error.uploadImgFail')
          })
        }
      }
    },
    /**
     * Has changed // 上传完的操作写在这里
     * @param  Object|undefined   newFile   只读
     * @param  Object|undefined   oldFile   只读
     * @return undefined
     */
    // eslint-disable-next-line no-unused-vars
    async inputFile(newFile, oldFile, prevent) {
      if (newFile && !oldFile) {
      }
      if (!newFile && oldFile) {
      }
    },
    checkLogin() {
      if (!this.isLogined) {
        this.$toast.fail({
          duration: 1000,
          message: this.$t('imgUpload.pleaseLogin')
        })
        return false
      }
      return true
    }
  }
}
</script>

<style lang="less" src="./index.less">
// 覆盖图像上传modal样式 无法使用scoped
</style>
