<template>
  <div class="token">
    <BaseHeader
      :has-bottom-border-line="true"
      customize-header-bc="#fff"
      :pageinfo="{ title: 'Fan票详情' }"
    />

    <div class="token-detail">
      <div class="link">
        <a :href="'http://rinkeby.etherscan.io/address/' + minetokenToken.contract_address" target="_blank">
        <svg-icon class="detail-btn" icon-class="eth_mini" />
        </a>

        <svg-icon class="detail-btn" icon-class="share1" @click="shareModalShow = true" />

        <router-link v-if="showTokenSetting" :to="{ name: 'minetoken' }">
          <svg-icon class="detail-btn" icon-class="setting" />
        </router-link>
      </div>
      <div class="fl">
        <avatar :src="logo" class="avatar" />
        <div class="token-detail-info">
          <div class="fl info-line">
            <div class="token-info-title bold">
              {{ minetokenToken.symbol }}
            </div>
            <div>
              <p class="token-info-sub">
                {{ minetokenToken.name }}
              </p>
            </div>
          </div>
          <div class="fl info-line">
            <div class="token-info-title">
              创始人：
            </div>
            <div>
              <p class="token-info-sub">
                <router-link :to="{ name: 'user-id', params: { id: minetokenToken.uid } }">
                  {{ name }}
                </router-link>
              </p>
            </div>
          </div>
          <div class="fl info-line">
            <div class="token-info-title">
              发布时间：
            </div>
            <div>
              <p class="token-info-sub">
                {{ createTime }}
              </p>
            </div>
          </div>
          <div class="fl info-line">
            <div class="token-info-title">
              简&emsp;介：
            </div>
            <div>
              <p class="token-info-sub">
                {{ minetokenToken.brief || '暂无' }}
              </p>
            </div>
          </div>
        </div>
      </div>
      <div class="link">
        <a class="help-link" href="https://www.matataki.io/p/977" target="_blank">什么是Fan票?</a>
      </div>
      <p class="warning" v-if="!minetokenToken.contract_address">fan票正在发布中，请稍后过来操作!</p>

    </div>

    <div class="introduction">
      <h2 class="token-title">
        介绍
      </h2>
      <p class="token-introduction">
        <span class="wrap-open">{{ minetokenToken.introduction || '暂无' }}</span>
      </p>
    </div>

    <div class="total">
      <h2 class="token-title">
        数据统计
      </h2>
      <div class="total-content">
        <div class="fl token-data">
          <p class="token-name">
            发行总量
          </p>
          <p class="token-num">
            {{ amount }}<sub>{{ minetokenToken.symbol }}</sub>
          </p>
        </div>

        <div class="fl token-data">
          <p class="token-name">
            流动金池
          </p>
          <p class="token-num">
            {{ cnyReserve }}<sub>CNY</sub> + {{ tokenReserve
            }}<sub>{{ minetokenToken.symbol }}</sub>
          </p>
        </div>

        <div class="fl token-data">
          <p class="token-name">
            24h成交量
          </p>
          <p class="token-num">
            {{ volume }}<sub>{{ minetokenToken.symbol }}</sub>
          </p>
        </div>

        <div class="fl token-data">
          <p class="token-name">
            24h成交额
          </p>
          <p class="token-num">{{ exchangeAmount }}<sub>CNY</sub></p>
        </div>

        <div class="fl token-data">
          <p class="token-name">
            24h涨跌幅
          </p>
          <p class="token-num" :style="{ color: color }">
            {{ change }}
          </p>
        </div>

        <div class="fl token-data">
          <p class="token-name">
            当前价格
          </p>
          <p class="token-num">{{ price || 0 }}<sub>CNY</sub></p>
        </div>
      </div>
    </div>

    <tokenBuyCard :token="minetokenToken" />

    <div class="about">
      <h2 class="token-title">
        相关网站
      </h2>
      <ul v-if="resourcesWebsites.length !== 0">
        <li v-for="(item, index) in resourcesWebsites" :key="index">
          <a target="_blank" :href="item">{{ item }}</a>
        </li>
      </ul>
      <span v-else class="not">暂无</span>
    </div>

    <div class="social">
      <h2 class="token-title">
        社交账号
      </h2>

      <div v-if="resourcesSocialss.length !== 0" class="social-btn">
        <div v-for="(item, index) in resourcesSocialss" :key="index" class="circle">
          <socialIcon :show-tooltip="true" :icon="item.type" :content="item.content" />
        </div>
      </div>
      <span v-else class="not">暂无</span>
    </div>

    <div class="share">
      <h2 class="token-title">
        分享挂件
      </h2>
      <el-input
        v-model="tokenWidget"
        class="token-widget"
        type="textarea"
        :rows="6"
        placeholder="请输入内容"
      />
    </div>

    <div class="related" @click="jumpToRelated">
      <h2 class="token-title">
        相关创作
      </h2>
      <img class="arrow" src="@/assets/img/icon_arrow.svg" alt="" />
    </div>

    <div class="minetoken-card">
      <div class="minetoken-tab">
        <a :class="tabPage === 0 && 'active'" @click="tabPage = 0">
          Fan票持仓
        </a>
        <a :class="tabPage === 1 && 'active'" @click="tabPage = 1">
          Fan票流水
        </a>
        <a :class="tabPage === 2 && 'active'" @click="tabPage = 2">
          流动金持仓
        </a>
        <a :class="tabPage === 3 && 'active'" @click="tabPage = 3">
          流动金流水
        </a>
      </div>
      <div v-if="tabPage === 0 || tabPage === 2" class="minetoken-head">
        <Dropdown class="dropdown" trigger="click" @on-click="toggleOrdering">
          <div v-if="sort === 'amount-desc'">
            持仓量最高
            <img class="arrow" src="@/assets/newimg/arrow-s.svg" />
          </div>
          <div v-else-if="sort === 'amount-asc'">
            持仓量最低
            <img class="arrow reversed" src="@/assets/newimg/arrow-s.svg" />
          </div>
          <div v-else-if="sort === 'name-asc'">
            首字母升序
            <img class="arrow reversed" src="@/assets/newimg/arrow-s.svg" />
          </div>
          <div v-else-if="sort === 'name-desc'">
            首字母降序
            <img class="arrow" src="@/assets/newimg/arrow-s.svg" />
          </div>
          <DropdownMenu slot="list">
            <DropdownItem name="amount-desc" :selected="sort === 'amount-desc'">
              持仓量最高
            </DropdownItem>
            <DropdownItem name="amount-asc" :selected="sort === 'amount-asc'">
              持仓量最低
            </DropdownItem>
            <DropdownItem name="name-asc" :selected="sort === 'name-asc'">
              首字母升序
            </DropdownItem>
            <DropdownItem name="name-desc" :selected="sort === 'name-desc'">
              首字母降序
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>
      </div>
      <div v-if="tabPage === 0 || tabPage === 2" class="minetoken-head">
        <div class="minetoken-title">持仓者</div>
        <div class="minetoken-number">持仓量</div>
      </div>
      <slot></slot>
    </div>
    <Share
      :share-modal-show="shareModalShow"
      :img="logo"
      :minetoken-token="minetokenToken"
      :minetoken-user="minetokenUser"
      @input="val => (shareModalShow = val)"
    />
    <!-- <div class="fixed-bottom">
      <router-link class="exchange" :to="{ name: 'exchange' }">
        <svg-icon class="tokens" icon-class="token" />
        Fan票交易所
      </router-link>
    </div> -->
  </div>
</template>
<script>
import moment from 'moment'
import { mapGetters } from 'vuex'
import avatar from '@/components/avatar/index.vue'
// import mineTokensNav from '@/components/minetokens_nav/index.vue'
import Share from '@/components/token/token_share.vue'
import tokenBuyCard from '@/components/token/token_buy_card.vue'
import socialIcon from '@/components/social_icon/index.vue'
import socialTypes from '@/config/social_types'
import { precision } from '@/utils/precisionConversion'

export default {
  components: {
    avatar,
    // mineTokensNav,
    Share,
    socialIcon,
    tokenBuyCard
  },
  data() {
    return {
      shareModalShow: false,
      tokenWidget: `<iframe width="100%" height="200px" src='${process.env.VUE_APP_URL}/widget/token/?id=${this.$route.params.id}' frameborder=0></iframe>`,
      minetokenToken: {
        contract_address: true // v-fi 会取反
      },
      minetokenUser: Object.create(null),
      minetokenExchange: Object.create(null),
      resourcesSocialss: [],
      resourcesWebsites: [],
      showTokenSetting: false,
      tabPage: Number(this.$route.query.tab) || 0,
      sort: this.$route.query.sort || 'amount-desc'
    }
  },
  computed: {
    ...mapGetters(['currentUserInfo']),
    logo() {
      if (!this.minetokenToken.logo) return ''
      return this.minetokenToken.logo ? this.$API.getImg(this.minetokenToken.logo) : ''
    },
    amount() {
      const tokenamount = precision(
        this.minetokenToken.total_supply || 0,
        'CNY',
        this.minetokenToken.decimals
      )
      return this.$publishMethods.formatDecimal(tokenamount, 4)
    },
    tokenReserve() {
      const tokenamount = precision(
        this.minetokenExchange.token_reserve || 0,
        'CNY',
        this.minetokenToken.decimals
      )
      return this.$publishMethods.formatDecimal(tokenamount, 4)
    },
    cnyReserve() {
      const tokenamount = precision(
        this.minetokenExchange.cny_reserve || 0,
        'CNY',
        this.minetokenToken.decimals
      )
      return this.$publishMethods.formatDecimal(tokenamount, 4)
    },
    volume() {
      const tokenamount = precision(
        this.minetokenExchange.volume_24h || 0,
        'CNY',
        this.minetokenToken.decimals
      )
      return this.$publishMethods.formatDecimal(tokenamount, 4)
    },
    exchangeAmount() {
      const tokenamount = precision(
        this.minetokenExchange.amount_24h || 0,
        'CNY',
        this.minetokenToken.decimals
      )
      return this.$publishMethods.formatDecimal(tokenamount, 4)
    },
    change() {
      if (this.minetokenExchange.change_24h) {
        const amount = (this.minetokenExchange.change_24h * 100).toFixed(2) + '%'
        if (parseInt(amount) > 0) return '+' + amount
        return amount
      } else return '0%'
    },
    price() {
      // const tokenamount = precision(this.minetokenExchange.price || 0, 'CNY', this.minetokenToken.decimals)
      // return this.$publishMethods.formatDecimal(tokenamount, 4)
      return this.minetokenExchange.price || 0
    },
    name() {
      if (this.minetokenUser.nickname || this.minetokenUser.username) {
        let name = this.minetokenUser.nickname || this.minetokenUser.username
        return name.length > 12 ? name.slice(0, 12) + '...' : name
      } else return ''
    },
    color() {
      // 显示转换
      const amount = parseFloat(this.change)
      if (amount < 0) return '#d74e5a'
      else if (amount > 0) return '#41b37d'
      else return 'rgb(153, 153, 153)'
    },
    createTime() {
      return moment(this.minetokenUser.create_time).format('lll')
    }
  },
  watch: {
    currentUserInfo() {
      // 第一次会重复请求两次接口
      if (this.currentUserInfo.id) this.tokenUserId(this.currentUserInfo.id)
    },
    tabPage(val) {
      this.$emit('input', val)
      this.$router.replace({
        query: {
          tab: val
        }
      })
    }
  },
  created() {
    this.minetokenId(this.$route.params.id)
    this.minetokenGetResources(this.$route.params.id)
  },
  mounted() {
    if (this.currentUserInfo.id) this.tokenUserId(this.currentUserInfo.id)
  },
  methods: {
    async minetokenId(id) {
      try {
        const res = await this.$API.minetokenId(id)

        if (res.code === 0) {
          this.minetokenToken = res.data.token || Object.create(null)
          this.minetokenUser = res.data.user || Object.create(null)
          this.minetokenExchange = res.data.exchange || Object.create(null)

          this.$wechatShare({
            title: `${this.minetokenToken.symbol}-${this.minetokenToken.name}`,
            desc: this.minetokenToken.brief || '暂无',
            imgUrl: this.minetokenToken.logo ? this.$API.getImg(this.minetokenToken.logo) : ''
          })
        } else {
          this.$message.success(res.message)
        }
      } catch (err) {
        console.error(err)
      }
    },
    async minetokenGetResources(id) {
      try {
        const res = await this.$API.minetokenGetResources(id)

        if (res.code === 0) {
          const socialFilter = res.data.socials.filter(i => socialTypes.includes(i.type)) // 过滤
          const socialFilterEmpty = socialFilter.filter(i => i.content) // 过滤
          this.resourcesSocialss = socialFilterEmpty
          this.resourcesWebsites = res.data.websites
        } else {
          this.$message.success(res.message)
        }
      } catch (err) {
        console.error(err)
      }
    },
    async tokenUserId(id) {
      try {
        const res = await this.$API.tokenUserId(id)

        if (res.status === 200 && res.data.code === 0 && res.data.data.id > 0) {
          this.showTokenSetting = res.data.data.id === Number(this.$route.params.id)
        }
      } catch (err) {
        console.error('get token user error', err)
      }
    },
    toggleOrdering(name) {
      this.sort = name

      const query = {
        sort: name
      }

      if (this.tabPage > 0) query.tab = this.tabPage

      this.$router.replace({
        query
      })
    },
    jumpToRelated() {
      this.$router.push({
        name: 'MinetokenRelated'
      })
    }
  }
}
</script>
<style lang="less" scoped>
.token {
  background-color: #f1f1f1;
  padding: 45px 0 80px;
  min-height: 100%;
}
.token-detail {
  position: relative;
  margin: 0;
  padding: 14px 20px;
  background: #fff;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.04);
  box-sizing: border-box;
  & > div:nth-child(1) {
    margin-bottom: 10px;
  }
}

.info-line {
  margin: 6px 0;
}
.avatar {
  width: 60px !important;
  height: 60px !important;
  flex: 0 0 60px;
}
.token-detail-info {
  // width: 60%;
  margin-left: 10px;
  font-size: 12px;
  font-weight: 400;
  color: #000;
  line-height: 22px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  flex: 1;
}
.token-info-title {
  // width: 70px;
  flex: 0 0 60px;
  &.bold {
    font-weight: bold;
    font-size: 20px;
  }
}
.token-info-sub {
  font-size: 12px;
  padding: 0 0 0 10px;
  margin: 0;
  a {
    font-size: 12px;
    color: #542de0;
  }
}

.token-container {
  margin: 10px 0 0;
}

.introduction {
  background: #fff;
  padding: 14px 20px;
  margin: 10px 0 0;
  // border-radius: 10px;
}

.token-title {
  font-size: 16px;
  font-weight: bold;
  color: #000;
  line-height: 33px;
  padding: 0;
  margin: 0;
}
.token-introduction {
  font-size: 12px;
  font-weight: 400;
  color: #000;
  line-height: 22px;
  padding: 0;
  margin: 10px 0 0;
}

.total,
.detail,
.about,
.social,
.share,
.related,
.minetoken-card {
  background: #fff;
  padding: 14px 20px;
  // border-radius: 10px;
  margin: 10px 0 0;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.04);
}
.total-content {
  margin-top: 10px;
  flex-wrap: wrap;
}

.token-data {
  display: flex;
  margin: 10px 40px 10px 0;
  &:nth-last-child(1) {
    margin-right: 0;
  }
}
.token-num {
  font-size: 20px;
  font-weight: bold;
  color: #542de0;
  line-height: 28px;
  padding: 0;
  margin: 0;
  sub {
    font-size: 12px;
    bottom: 0;
  }
}
.token-name {
  min-width: 78px;
  font-size: 12px;
  color: #000;
  line-height: 20px;
  padding: 0;
  margin: 6px 0 0;
}
.fixed-bottom {
  background: #fff;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 15px 20px 15px 20px;
  box-shadow: 0px -4px 16px 0px rgba(0, 0, 0, 0.1);
  height: 80px;
  padding: 20px;
  z-index: 2;
}

.exchange {
  border-radius: 20px;
  display: block;
  background: #542de0;
  text-align: center;
  color: #fff;
  font-size: 16px;
  line-height: 22px;
  padding: 10px 0;
  .tokens {
    font-size: 18px;
  }
}

.about ul {
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

.social-btn {
  margin-top: 12px;
  display: flex;
  flex-wrap: wrap;
  // justify-content: space-between;
}
.circle {
  // flex: 0 0 20%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 8px 10px 8px 0;
  &:nth-last-child(1) {
    margin-right: 0;
  }
}
.circle-btn {
  width: 40px;
  height: 40px;
  background-color: #000;
  flex: 0 0 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  box-sizing: border-box;
  cursor: pointer;
}
.token-widget {
  margin-top: 20px;
}
.line {
  height: 1px;
  background: #dbdbdb;
  margin: 20px 0;
}

.not {
  color: #333;
  font-style: 14px;
  padding-top: 20px;
  display: inline-block;
}
.link {
  text-align: right;
}
.help-link {
  font-size: 12px;
  color: #868686;
  text-decoration: underline;
}
.detail-btn {
  color: #000;
  font-size: 20px;
  margin: 0 0 0 19px;
  :nth-child(1) {
    margin-left: 0;
  }
}

.minetoken-card {
  background: #fff;
  padding: 0;
}
.minetoken-tab {
  padding: 12px 0;
  text-align: center;
  border-bottom: 1px solid #ececec;
  display: flex;
  justify-content: center;
  align-items: center;
  a {
    display: block;
    font-size: 14px;
    font-weight: 500;
    color: #b2b2b2;
    line-height: 20px;
    margin: 0 auto;
    position: relative;
    z-index: 1;
    &.active {
      color: #000;
      &::after {
        content: '';
        display: block;
        width: 100%;
        height: 4px;
        background: #542de0;
        position: absolute;
        left: 0;
        right: 0;
        bottom: 1px;
        z-index: 0;
      }
    }
  }
}

.minetoken-head {
  display: flex;
  align-items: center;
  font-size: 14px;
  font-weight: 400;
  color: rgba(0, 0, 0, 1);
  line-height: 20px;
  padding: 14px 20px;
  border-bottom: 1px solid #ececec;
  .minetoken-title {
    width: 70%;
  }
  .minetoken-number {
    width: 30%;
    text-align: center;
  }
}

.dropdown {
  width: calc(100% - 8px);
}
.arrow {
  margin-left: 0.25em;
  margin-bottom: 0.25em;
  vertical-align: middle;
}
.reversed {
  transform: scaleY(-1);
}
.wrap-open {
  white-space: pre-wrap;
}

.related {
  display: flex;
  flex-direction: row;

  .token-title {
    flex: 1;
  }
}

.warning {
  padding: 0;
  margin: 20px 0 0;
  font-size: 12px;
  color: red;
}
</style>
