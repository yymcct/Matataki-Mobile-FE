<template>
  <div v-if="isPublishCoins" class="coins-publish">
    <!-- <div class="line" /> -->
    <div class="coins-head">
      <div class="fl ac">
        <avatar v-if="tokenCover" :src="tokenCover" size="30px" style="margin-right: 10px;" />
        <h1>
          {{ tokenDetailData.token.symbol }}
          ({{ tokenDetailData.token.name }})
        </h1>
      </div>
      <!-- <el-tooltip effect="dark" content="如何管理你的Fan票?" placement="top-start">
          <svg-icon
            class="help-icon"
            icon-class="help"
          />
        </el-tooltip> -->
      <a class="help-link" target="_blank" href="https://www.matataki.io/p/979"
        >如何管理你的Fan票?</a
      >

      <div class="btn">
        <router-link :to="{ name: 'token-id', params: { id: tokenDetailData.token.id || 0 } }">
          <el-button size="mini">
            详情
          </el-button>
        </router-link>
        <router-link :to="{ name: 'editminetoken' }">
          <el-button size="mini">
            编辑
          </el-button>
        </router-link>
        <el-button size="mini" @click="addCoins">
          增发
        </el-button>
        <router-link :to="{ name: 'exchange', hash: '#swap', query: { output: tokenDetailData.token.symbol } }">
          <el-button size="mini" type="primary">
            交易
          </el-button>
        </router-link>
      </div>

      <p class="warning" v-if="!tokenDetailData.token.contract_address">fan票正在发布中，请稍后过来操作!</p>
    </div>
    <div class="line" />

    <h2 class="token-title">
      简介
    </h2>
    <p class="token-sub">
      {{ tokenDetailData.token.brief || '暂无' }}
    </p>
    <div class="line" />

    <h2 class="token-title">
      介绍
    </h2>
    <p class="token-sub">
      <span class="wrap-open">{{ tokenDetailData.token.introduction || '暂无' }}</span>
    </p>

    <div class="line" />

    <h2 class="token-title">
      相关网站
    </h2>
    <ul v-if="resourcesWebsites.length !== 0" class="about-nav">
      <li v-for="(item, index) in resourcesWebsites" :key="index">
        <a target="_blank" :href="item">{{ item }}</a>
      </li>
    </ul>
    <span v-else class="not">暂无</span>
    <div class="line" />

    <h2 class="token-title">
      社交账号
    </h2>

    <div v-if="resourcesSocialss.length !== 0" class="fl social">
      <div class="social-btn">
        <socialIcon
          v-for="(item, index) in resourcesSocialss"
          :key="index"
          :show-tooltip="true"
          :icon="item.type"
          :content="item.content"
        />
      </div>
    </div>
    <span v-else class="not">暂无</span>
    <div class="line" />

    <h2 class="token-title">
      分享挂件
    </h2>

    <el-input
      v-model="tokenWidget"
      class="token-widget"
      type="textarea"
      :rows="4"
      placeholder="请输入内容"
    />
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import moment from 'moment'
import avatar from '@/components/avatar/index.vue'
import { precision, toPrecision } from '@/utils/precisionConversion'
import socialTypes from '@/config/social_types'
import socialIcon from '@/components/social_icon/index.vue'

export default {
  components: {
    avatar,
    socialIcon
  },
  data() {
    return {
      tokenId: null,
      isPublishCoins: false,
      tokenDetailData: {
        token: {
          contract_address: true // // v-fi 会取反
        }
      },
      pointLog: {
        params: {
          pagesize: 10
        },
        apiUrl: 'tokenUserList',
        list: []
      },
      currentPage: Number(this.$route.query.page) || 1,
      loading: false, // 加载数据
      total: 0,
      assets: {},
      viewStatus: 0, // 0 1
      amount: 0,
      resourcesSocialss: [],
      resourcesWebsites: []
    }
  },
  computed: {
    ...mapGetters(['isLogined']),
    totalAmount() {
      if (this.tokenDetailData.token) {
        const tokenamount = precision(
          this.tokenDetailData.token.total_supply,
          'CNY',
          this.tokenDetailData.token.decimals
        )
        return this.$publishMethods.formatDecimal(tokenamount, 4)
      } else return 0
    },
    tokenReserve() {
      if (this.tokenDetailData.exchange) {
        const tokenamount = precision(
          this.tokenDetailData.exchange.token_reserve,
          'CNY',
          this.tokenDetailData.token.decimals
        )
        return this.$publishMethods.formatDecimal(tokenamount, 4)
      } else return 0
    },
    cnyReserve() {
      if (this.tokenDetailData.exchange) {
        const tokenamount = precision(
          this.tokenDetailData.exchange.cny_reserve,
          'CNY',
          this.tokenDetailData.token.decimals
        )
        return this.$publishMethods.formatDecimal(tokenamount, 4)
      } else return 0
    },
    balance() {
      if (this.tokenDetailData.token) {
        const tokenamount = precision(
          this.tokenDetailData.token.balance,
          'CNY',
          this.tokenDetailData.token.decimals
        )
        return this.$publishMethods.formatDecimal(tokenamount, 4)
      } else return 0
    },
    nowPrice() {
      if (this.tokenDetailData.exchange) {
        const price =
          this.tokenDetailData.exchange.cny_reserve / this.tokenDetailData.exchange.token_reserve
        const formatDecimal = this.$publishMethods.formatDecimal(price, 2)
        return isNaN(formatDecimal) ? 0 : Number(formatDecimal) < 0.01 ? '<0.01' : formatDecimal
      } else return 0
    },
    tokenCover() {
      if (this.tokenDetailData.token) {
        const logo = this.tokenDetailData.token.logo
        return logo ? this.$API.getImg(logo) : ''
      } else return ''
    },
    tokenWidget() {
      return `<iframe width="100%" height="200px" src='${
        process.env.VUE_APP_URL
      }/widget/token/?id=${this.tokenId || 0}' frameborder=0></iframe>`
    }
  },
  created() {
    this.tokenDetail()

    // 根据token判断是否有通证 如果有显示当前页面并且调用list
    // 否则修改界面显示
  },
  mounted() {},
  methods: {
    async tokenDetail() {
      await this.$API.tokenDetail().then(res => {
        if (res.code === 0) {
          if (res.data.token) {
            this.isPublishCoins = true
            this.tokenDetailData = res.data
            this.tokenId = res.data.token.id
            this.minetokenGetResources(res.data.token.id)
          } else {
            this.$router.push({
              name: 'postminetoken'
            })
          }
        } else {
          this.$message.error(res.message)
        }
      })
    },
    async minetokenGetResources(id) {
      await this.$API
        .minetokenGetResources(id)
        .then(res => {
          if (res.code === 0) {
            const socialFilter = res.data.socials.filter(i => socialTypes.includes(i.type)) // 过滤
            const socialFilterEmpty = socialFilter.filter(i => i.content) // 过滤
            this.resourcesSocialss = socialFilterEmpty
            this.resourcesWebsites = res.data.websites
          } else {
            this.$message.success(res.message)
          }
        })
        .catch(err => {
          console.log(err)
        })
    },
    async minetokenMint(amount) {
      const data = {
        amount: toPrecision(amount, 'CNY', this.tokenDetailData.token.decimals)
      }
      await this.$API.minetokenMint(data).then(res => {
        if (res.code === 0) {
          this.tokenDetail()
          this.$message.success(res.message)
        } else {
          this.$message.error(res.message)
        }
      })
    },
    addCoins() {
      if (!this.isLogined) return this.$store.commit('setLoginModal', true)
      this.$prompt('增发数量(总量最多发行一亿)', '提示', {
        inputPattern: /^\d{0,9}$/,
        inputErrorMessage: '请输入数字(总量最多发行一亿)',
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        customClass: 'add-minetoken'
      }).then(({ value }) => {
        if (Number(value) + Number(this.totalAmount) > 100000000)
          return this.$message.warning('发行总量不能超过一亿')
        if (Number(value) > 0) this.minetokenMint(Number(value))
      })
    },
    createTime(time) {
      return moment(time).format('MMMDo HH:mm')
    },
    // cover(cover) {
    //   return cover ? this.$API.getImg(cover) : ''
    // },
    // tokenAmount(amount) {
    //   const tokenamount = precision(amount, 'CNY', this.tokenDetailData.token.decimals)
    //   return this.$publishMethods.formatDecimal(tokenamount, 4)
    // },
    paginationData(res) {
      // console.log(res)
      this.pointLog.list = res.data.list
      this.assets = res.data
      this.total = res.data.count || 0
      this.amount = res.data.amount || 0
      this.loading = false
    },
    togglePage(i) {
      this.loading = true
      this.pointLog.list = []
      this.currentPage = i
      this.$router.push({
        query: {
          page: i
        }
      })
    }
  }
}
</script>

<style lang="less" scoped>
.coins-publish {
  padding: 10px 20px;
}
.coins-head {
  margin: 0 0 20px;
  h1 {
    font-size: 22px;
    font-weight: bold;
    color: rgba(0, 0, 0, 1);
    line-height: 33px;
    padding: 0;
    margin: 0;
  }
  .help-icon {
    color: rgba(219, 219, 219, 1);
    margin-left: 10px;
    margin-right: 10px;
  }
  .help-link {
    font-size: 12px;
    color: #868686;
    text-decoration: underline;
    margin: 6px 0;
    display: block;
  }
}

.token-title {
  font-size: 16px;
  font-weight: bold;
  color: rgba(0, 0, 0, 1);
  line-height: 33px;
  padding: 0;
  margin: 10px 0 0;
}
.token-sub {
  font-size: 12px;
  font-weight: 400;
  color: rgba(0, 0, 0, 1);
  line-height: 22px;
  padding: 0;
  margin: 10px 0;
}

.coins-info {
  border-bottom: 1px solid #ececec;
  padding: 0 0 20px;
}
.info-line {
  width: 1px;
  height: 40px;
  background: #dbdbdb;
  margin: 0 40px;
}

.line {
  height: 1px;
  background: #ececec;
}

.about-nav {
  padding: 0;
  margin: 10px 0 0;
  overflow: hidden;
  li {
    list-style: none;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    margin: 10px 0;
    a {
      font-size: 12px;
      color: #000;
      line-height: 22px;
      text-decoration: underline;
    }
  }
}
.social {
  margin: 10px 0;
}
.social-btn {
  display: flex;
  & > div {
    margin-right: 8px;
    &:nth-last-child(1) {
      margin-right: 0;
    }
  }
}
.token-widget {
  // width: 400px;
  margin-top: 10px;
}

.not {
  color: #333;
  font-style: 14px;
  padding-top: 20px;
  display: inline-block;
}
.btn {
  margin: 10px 0 0;
  a {
    margin: 0 4px;
  }
}
.wrap-open {
  white-space: pre-wrap;
}

.warning {
  padding: 0;
  margin: 20px 0 0;
  font-size: 12px;
  color: red;
}
</style>

<style>
.add-minetoken {
  width: 90%;
}
</style>
