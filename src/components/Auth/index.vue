<template>
  <Modal v-model="showModal" footer-hide class-name="modalCenter signupModal">
    <section v-show="step === 1" class="auth-main">
      <img
        v-if="referral"
        class="referral"
        src="@/assets/img/invite.png"
        :alt="$t('auth.invite')"
      />
      <div class="auth-title-container">
        <span :class="['auth-title', { active: isLogin }]" @click="isLogin = true">{{
          $t('login')
        }}</span>
        <span :class="['auth-title', { active: !isLogin }]" @click="isLogin = false">{{
          $t('registered')
        }}</span>
      </div>
      <div class="loginRegister">
        <Login v-show="isLogin" @switch="step = 3" @hide="showModal = false" />
        <Register v-show="!isLogin" @switch="isLogin = true" />
      </div>
    </section>
    <Wallet v-show="step === 2" />
    <section v-show="step === 3" class="auth-main">
      <ResetPassword @switch="step = 1;isLogin = true;" />
    </section>
    <div class="footer-arrow" @click="step === 1 ? (step = 2) : (step = 1)">
      <div v-if="step === 2 || step === 3" class="arrow">
        <van-icon name="arrow-left" />
      </div>
      <span>{{ step === 1 ? $t('auth.viewWallet') : $t('auth.backLogin') }}</span>
      <div v-if="step === 1" class="arrow">
        <van-icon name="arrow" />
      </div>
    </div>
  </Modal>
</template>

<script>
/* eslint-disable */
import Login from './login'
import Register from './register'
import Wallet from './wallet'
import ResetPassword from './resetPassword'
import utils from "@/utils/utils";

export default {
  name: 'AuthModal',
  components: {
    Wallet,
    Login,
    Register,
    ResetPassword
  },
  data() {
    return {
      isLogin: true,
      step: 1,
      showModal: false,
      referral: false
    }
  },
  props: {
    value: {
      type: Boolean,
      default: false
    }
  },
  watch: {
    showModal(val) {
      this.$emit('input', val)
    },
    value(val) {
      this.showModal = val
    }
  },
  mounted(){
    this.isReferral()
    this.getReferral()
  },
  methods: {
    // 是否有推荐
    isReferral() {
      let search = window.location.search.slice(1)
      let searchArr = search.split('&')
      let searchFilter = searchArr.filter((i) => i.includes('referral='))
      // 有邀请id
      if (searchFilter.length !== 0) utils.setCookie('referral', searchFilter[0].slice(9))
      else { // 如果没有邀请连接
      // 移动端和pc端不一样 会加载GitHub无法写入邀请人 所以不做删除
        // 检查是否有邀请id 有则删除
        // let referral = utils.getCookie('referral')
        // if (referral) utils.delCookie('referral')
      }
      // console.log(this.referral)
    },
    // 得到邀请状态
    getReferral() {
      let referral = utils.getCookie('referral')
      if (referral) this.referral = true
    }
  }
}
</script>

<style src="./auth.less" lang="less" scoped>
</style>
<style lang="less">
.ss-form {
  input {
    background: #F1F1F1;
  }
}
.ss-btn {
  button {
    width: 100%;
    background-color: #000000;
    border-color: #000000;
    &:hover, &:active, &:focus {
      background-color: #333333;
      border-color: #333333;
    }
  }
}
.signupModal {
  .ivu-modal-body {
    padding: 0;
  }
}
</style>
