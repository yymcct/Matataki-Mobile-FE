<template>
  <div class="outer">
    <div class="share-btn-container">
      <!-- <div class="share-btn">
        <svg-icon class="share-icon" icon-class="qq" />
        <p>QQ</p>
      </div> -->
      <a :href="socialLink.weibo" target="_blank">
        <div class="share-btn">
          <div class="share-bg">
            <svg-icon class="share-icon weibo" icon-class="weibo" />
          </div>
          <p>{{ $t('p.shareWeibo') }}</p>
        </div>
      </a>
      <a :href="socialLink.facebook" target="_blank">
        <div class="share-btn">
          <div class="share-bg">
            <svg-icon class="share-icon facebook" icon-class="facebook" />
          </div>
          <p>Facebook</p>
        </div>
      </a>
      <a :href="socialLink.twitter" target="_blank">
        <div class="share-btn">
          <div class="share-bg">
            <svg-icon class="share-icon twitter" icon-class="twitter" />
          </div>
          <p>Twitter</p>
        </div>
      </a>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'SocialShare',
  components: {
    // wechat
  },
  props: {
    title: {
      type: String,
      required: true
    },
    img: {
      type: String,
      default: ''
    },
    link: {
      type: String,
      default: ''
    }
  },
  computed: {
    ...mapGetters(['currentUserInfo', 'isLogined']),
    cover() {
      return (
        this.img ||
        'https://ssimg.frontenduse.top/avatar/2019/08/30/c1d6ae7ed4e6102cb45d0a8f656d5569.png'
      )
    },
    socialLink() {
      const title = this.title
      const link = this.link ? this.link : encodeURIComponent(window.location.href)
      const pic = this.cover
      return {
        weibo: `http://service.weibo.com/share/share.php?appkey=&title=${title}&url=${link}&pic=${pic}&searchPic=false&style=simple`,
        facebook: `https://www.facebook.com/sharer.php?title=${title}&href=${link}`,
        twitter: `https://twitter.com/intent/tweet?text=${title}`
      }
    }
  },
  mounted() {},
  methods: {}
}
</script>

<style lang="less" scoped>
.flexCenter {
  display: flex;
  align-items: center;
  justify-content: center;
}
.share-btn-container {
  .flexCenter();
  justify-content: space-around;
  .share-btn {
    .flexCenter();
    flex-direction: column;
    cursor: pointer;
    .share-icon {
      font-size: 4em;
    }
  }
}
.wx-share {
  text-align: center;
  margin-top: 60px;
  .flexCenter();
  flex-direction: column;
  .qrcode {
    background: #ffffff;
    width: 120px;
    height: 120px;
  }
}
.qrcode-container {
  background: #ffffff;
  padding: 5px;
}
p {
  margin: 10px 0 0 0;
  padding: 0;
  font-size: 14px;
  font-weight: 400;
  color: #000000;
}
.share-bg {
  width: 70px;
  height: 70px;
  background-color: #fff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  .share-icon {
    width: 50%;
  }
  .weibo {
    color: #ff5722;
  }
  .facebook {
    color: #3c5999;
  }
  .twitter {
    color: #00aced;
  }
}
.code {
  margin-top: 30px;
  .icon {
    color: #24db5a;
    font-size: 22px;
    margin-left: 4px;
  }
}
</style>
