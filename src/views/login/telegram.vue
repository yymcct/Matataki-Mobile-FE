<template>
  <div class="container" v-loading="loading">
    <TelegramLogin
      @callback="telegramLogin"
      :telegram-login="TELEGRAM_BOT_NAME"
      mode="callback"
      request-access="write"
      radius="6"
    />
  </div>
</template>

<script>
import TelegramLogin from '@/components/TelegramLogin'
export default {
  name: 'telegramLogin',
  components: {
    TelegramLogin
  },
  data() {
    return {
      loading: false,
      TELEGRAM_BOT_NAME: process.env.VUE_APP_TELEGRAM_BOT
    }
  },
  methods: {
    telegramLogin(user) {
      this.loading = true
      this.$API
        .accountBind({
          platform: 'telegram',
          telegramParams: user,
          telegramBotName: this.TELEGRAM_BOT_NAME
        })
        .then(res => {
          if (res.code === 0) {
            this.$message.success(res.message)
          } else {
            this.$message.warning(res.message)
          }
          this.$router.back(-1)
        })
        .catch(err => {
          console.log(err)
          this.$message.error(`绑定失败${params.platform.toUpperCase()}`)
        })
        .finally(() => {
          this.loading = true
        })
    }
  }
}
</script>
<style lang="less">
.container {
  min-height: 100%;
  max-height: 100%;
  display: flex;
  align-content: center;
  justify-content: center;
  padding-top: 10%;
}
</style>