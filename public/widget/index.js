(function(){
    // 获取url信息
    const urlSearch = window.location.search.substr(1).split('&')
    // 获取容器
    const appDom = document.querySelector('#app')
    // 跳转地址
    let url = `https://test.smartsignature.io`
    // 接口地址
    let baseUrl = `https://apitest.smartsignature.io`
    // 默认图片 logo
    let logoImg = '../img/logo.png'
    // 数据
    let urlSearchData = {}

    // axios 设置
    const axiosApi = axios.create({
      baseURL: baseUrl,
      timeout: 30000,
    });

    // 提取内容 删除多余的标签
    const regRemoveContent = str => {
      // 去除空格
      const strTrim = str => str.replace(/\s+/g, '');
      // 去除标签
      const regRemoveTag = str => str.replace(/<[^>]+>/ig, '');
      // 去除markdown img
      const regRemoveMarkdownImg = str => str.replace(/!\[.*?\]\((.*?)\)/ig, '');
      // 去除 markdown 标签
      const regRemoveMarkdownTag = str => str.replace(/[\\\`\*\_\[\]\#\+\-\!\>]/ig, '');

      const regRemoveTagResult = regRemoveTag(str)
      const regRemoveMarkdownImgResult = regRemoveMarkdownImg(regRemoveTagResult)
      const regRemoveMarkdownTagResult = regRemoveMarkdownTag(regRemoveMarkdownImgResult)
      return strTrim(regRemoveMarkdownTagResult)
    }

    // url 参数解析
    const urlSearchDecodeURIComponent = arr => {
      let data = {}
      arr.forEach(i => {
        let arrData = i.split('=')
        data[arrData[0]] = decodeURIComponent(arrData[1])
      });
      return data
    }
    urlSearchData = urlSearchDecodeURIComponent(urlSearch)
    if (urlSearchData.content) urlSearchData.content = regRemoveContent(urlSearchData.content)

    // 设置内容
    const setAppDom = ({title, content, img, ups, read, username}) => {
      let appDomStr = `
      <div class="container">
        <div class="widget">
          <img class="logo" src="${logoImg}" alt="logo" />
          <h1 class="jumpPage">${title || '没有获取到标题......'}</h1>
          <div class="widget-content">
            <img class="cover jumpPage" src="${img || logoImg}" alt="cover" />
            <p class="widget-des">${content || '没有获取到内容......'}</p>
          </div>
          <p class="author">by: ${username || '没有获取到作者信息...'}</p>
          <div class="readorups jumpPage">
            <span><img src="./img/read.svg" alt="read" />${read || 0}</span>
            <span><img src="./img/ups.svg" alt="ups" />${ups || 0}</span>
          </di>
        </div>
      </div>`
      appDom.innerHTML = appDomStr
      // show line 4
      $clamp(document.querySelector('.widget-des'), {clamp: 4});

      // 页面跳转
      const titleClick = () => {
       let jumpPageDom = document.querySelectorAll('.jumpPage')
       jumpPageDom.forEach((i, index) => {
        jumpPageDom[index].addEventListener('click', () => {
          let invite = urlSearchData.invite ? `?invite=${urlSearchData.invite}` : ''
          window.open(`${url}/article/${urlSearchData.id || ''}${invite}`)  
        }, false)
       })
      }
      titleClick()
    }

    // 获取内容
    const getArticleContent = hash => {
      let url = `/ipfs/catJSON/${hash}`
      axiosApi.get(url)
        .then((res) => {
          if (res.status === 200 && res.data.code === 200) {
            let {data} = res.data

            urlSearchData.content = regRemoveContent(data.content)
            let {title,content, img,ups,read,username} = urlSearchData
            setAppDom({title,content, img,ups,read, username})
          } else {
            console.error('请求失败')
            setAppDom({})
          }
        })
        .catch((err) => {
          console.log(err)
            setAppDom({})
        })
    }

    // 通过id获取信息
    const getInfobyId = id => {
      let url = `/p/${id}`
      axiosApi.get(url)
        .then((response) => {
          if (response.status === 200 && response.data.code === 0) {
            let {data} = response.data
            urlSearchData.title = data.title
            urlSearchData.ups = data.ups
            urlSearchData.read = data.read
            urlSearchData.username = data.nickname || data.username
            urlSearchData.img = data.cover ? baseUrl+ '/image/' +data.cover : logoImg
            let {title,content, img,ups,read, username} = urlSearchData
            setAppDom({title,content, img,ups,read, username})
            // 没有传递内容请求接口获取
            if (!urlSearchData.content) getArticleContent(data.hash)
          } else {
            console.error('请求失败')
            setAppDom({})
          }
        })
        .catch((error) => {
          console.log(error);
            setAppDom({})
        })
    }
    getInfobyId(urlSearchData.id)
}())