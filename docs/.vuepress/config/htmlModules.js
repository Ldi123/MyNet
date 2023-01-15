/** 插入自定义html模块 (可用于插入广告模块等)
 * {
 *   homeSidebarB: htmlString, 首页侧边栏底部
 *
 *   sidebarT: htmlString, 所有左侧边栏顶部
 *   sidebarB: htmlString, 所有左侧边栏底部
 *
 *   pageT: htmlString, 页面顶部
 *   pageB: htmlString, 页面底部
 *   pageTshowMode: string, 页面顶部-显示方式：未配置默认所有页面；'article' => 仅文章页①； 'custom' => 仅自定义页①
 *   pageBshowMode: string, 页面底部-显示方式：未配置默认所有页面；'article' => 仅文章页①； 'custom' => 仅自定义页①
 *
 *   windowLB: htmlString, 全局窗口左下角②
 *   windowRB: htmlString, 全局窗口右下角②
 * }
 *
 * ①注：在.md文件front matter配置`article: false`的页面是自定义页，未配置的默认是文章页（首页除外）。
 * ②注：windowLB 和 windowRB：1.展示区块宽高最大是200*200px。2.请给自定义元素定一个不超过200px的固定宽高。3.在屏宽小于960px时无论如何都不会显示。
 */

module.exports = {
  homeSidebarB:`<div class="app">
    <div class="lantern-box">
      <div class="lantern-left">
        <div class="lantern">
          <div class="lines"></div>
          <div class="lantern-a">
            <div class="lantern-b">
              <div class="lantern-t">新</div>
            </div>
          </div>
          <div class="spike spike-a">
            <div class="spike-c"></div>
            <div class="spike-b"></div>
          </div>
        </div>
        <div class="lantern">
          <div class="lines"></div>
          <div class="lantern-a">
            <div class="lantern-b">
              <div class="lantern-t">年</div>
            </div>
          </div>
          <div class="spike spike-a">
            <div class="spike-c"></div>
            <div class="spike-b"></div>
          </div>
        </div>
        <div class="lantern">
          <div class="lines"></div>
          <div class="lantern-a">
            <div class="lantern-b">
              <div class="lantern-t">快</div>
            </div>
          </div>
          <div class="spike spike-a">
            <div class="spike-c"></div>
            <div class="spike-b"></div>
          </div>
        </div>
        <div class="lantern">
          <div class="lines"></div>
          <div class="lantern-a">
            <div class="lantern-b">
              <div class="lantern-t">乐</div>
            </div>
          </div>
          <div class="spike spike-a">
            <div class="spike-c"></div>
            <div class="spike-b"></div>
          </div>
        </div>
      </div>
      <div class="lantern-right">
        <div class="lantern">
          <div class="lines"></div>
          <div class="lantern-a">
            <div class="lantern-b">
              <div class="lantern-t">兔</div>
            </div>
          </div>
          <div class="spike spike-a">
            <div class="spike-c"></div>
            <div class="spike-b"></div>
          </div>
        </div>
        <div class="lantern">
          <div class="lines"></div>
          <div class="lantern-a">
            <div class="lantern-b">
              <div class="lantern-t">年</div>
            </div>
          </div>
          <div class="spike spike-a">
            <div class="spike-c"></div>
            <div class="spike-b"></div>
          </div>
        </div>
        <div class="lantern">
          <div class="lines"></div>
          <div class="lantern-a">
            <div class="lantern-b">
              <div class="lantern-t">大</div>
            </div>
          </div>
          <div class="spike spike-a">
            <div class="spike-c"></div>
            <div class="spike-b"></div>
          </div>
        </div>
        <div class="lantern">
          <div class="lines"></div>
          <div class="lantern-a">
            <div class="lantern-b">
              <div class="lantern-t">吉</div>
            </div>
          </div>
          <div class="spike spike-a">
            <div class="spike-c"></div>
            <div class="spike-b"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <!-- 纵向自适应 -->
  <ins class="adsbygoogle"
      style="display:block;padding: 0.95rem;"
      data-ad-client="ca-pub-7828333725993554"
      data-ad-slot="7802654582"
      data-ad-format="auto"
      data-full-width-responsive="true">
  </ins>
  
  <style scoped>
  .app{
   width:100%;min-height:100px;color:#ffaa7f;background: #ffffff;
  }
  .lantern-box {
    position: relative;
    top: 0px;
    z-index: 999;
  }
   
  .lantern-left {
    float: left;
  }
   
  .lantern-right {
    float: right;
  }
   
  .lantern {
    position: relative;
    width: 120px;
    height: 90px;
    margin-bottom: 70px;
    background: #d8000f;
    background: rgba(216, 0, 15, 0.8);
    border-radius: 50% 50%;
    -webkit-transform-origin: 50% -100px;
    -webkit-animation: swing 3s infinite ease-in-out;
    box-shadow: -5px 5px 50px 4px rgba(250, 108, 0, 1);
  }
   
  .lantern-a {
    width: 100px;
    height: 90px;
    background: #d8000f;
    background: rgba(216, 0, 15, 0.1);
    margin: 12px 8px 8px 8px;
    border-radius: 50% 50%;
    border: 2px solid #dc8f03;
  }
   
  .lantern-b {
    width: 50px;
    height: 90px;
    background: #d8000f;
    background: rgba(216, 0, 15, 0.1);
    margin: -4px 8px 8px 26px;
    border-radius: 50% 50%;
    border: 2px solid #dc8f03;
  }
   
  .lines {
    position: absolute;
    top: -20px;
    left: 60px;
    width: 3px;
    height: 20px;
    background: #dc8f03;
  }
   
  .spike-a {
    position: relative;
    width: 5px;
    height: 20px;
    margin: -5px 0 0 59px;
    -webkit-animation: swing 4s infinite ease-in-out;
    -webkit-transform-origin: 50% -45px;
    background: #ffa500;
    border-radius: 0 0 5px 5px;
  }
   
  .spike-b {
    position: absolute;
    top: 14px;
    left: -2px;
    width: 10px;
    height: 10px;
    background: #dc8f03;
    border-radius: 50%;
  }
   
  .spike-c {
    position: absolute;
    top: 18px;
    left: -2px;
    width: 10px;
    height: 35px;
    background: #ffa500;
    border-radius: 0 0 0 5px;
  }
   
  .lantern:before {
    position: absolute;
    top: -7px;
    left: 29px;
    height: 12px;
    width: 60px;
    content: " ";
    display: block;
    z-index: 999;
    border-radius: 5px 5px 0 0;
    border: solid 1px #dc8f03;
    background: #ffa500;
    background: linear-gradient(to right, #dc8f03, #ffa500, #dc8f03, #ffa500, #dc8f03);
  }
   
  .lantern:after {
    position: absolute;
    bottom: -7px;
    left: 10px;
    height: 12px;
    width: 60px;
    content: " ";
    display: block;
    margin-left: 20px;
    border-radius: 0 0 5px 5px;
    border: solid 1px #dc8f03;
    background: #ffa500;
    background: linear-gradient(to right, #dc8f03, #ffa500, #dc8f03, #ffa500, #dc8f03);
  }
   
  .lantern-t {
    font-family: 华文行楷, Arial, Lucida Grande, Tahoma, sans-serif;
    font-size: 3.2rem;
    color: #dc8f03;
    font-weight: bold;
    line-height: 85px;
    text-align: center;
  }
   
  .lantern-t, .lantern-box {
    background: transparent !important;
  }
   
  @keyframes swing {
    0% {
      -moz-transform: rotate(-10deg)
    }
   
    50% {
      -moz-transform: rotate(10deg)
    }
   
    100% {
      -moz-transform: rotate(-10deg)
    }
  }
   
  @keyframes swing {
    0% {
      -webkit-transform: rotate(-10deg)
    }
   
    50% {
      -webkit-transform: rotate(10deg)
    }
   
    100% {
      -webkit-transform: rotate(-10deg)
    }
  }
  </style>`,
  sidebarT:
    `<!--  固定100% * 150px可显示，max-height:150px 未见显示-->
    <ins class="adsbygoogle"
          style="display:inline-block;width:100%;max-height:150px"
          data-ad-client="ca-pub-7828333725993554"
          data-ad-slot="6625304284"></ins>
      <script>
          (adsbygoogle = window.adsbygoogle || []).push({});
      </script>`,
  sidebarB:
    `<!-- 正方形 -->
      <ins class="adsbygoogle"
          style="display:block"
          data-ad-client="ca-pub-7828333725993554"
          data-ad-slot="3508773082"
          data-ad-format="auto"
          data-full-width-responsive="true"></ins>
      <script>
          (adsbygoogle = window.adsbygoogle || []).push({});
      </script>`,
  pageT:
    `<!-- 固定100% * 90px可显示，max-height:90px未见显示-->
     <ins class="adsbygoogle"
          style="display:inline-block;width:100%;max-height:90px"
          data-ad-client="ca-pub-7828333725993554"
          data-ad-slot="6625304284"></ins>
      <script>
          (adsbygoogle = window.adsbygoogle || []).push({});
      </script>`,
  // pageTshowMode: 'article',
  pageB:
    `<!-- 横向自适应 -->
      <ins class="adsbygoogle"
          style="display:block"
          data-ad-client="ca-pub-7828333725993554"
          data-ad-slot="6620245489"
          data-ad-format="auto"
          data-full-width-responsive="true"></ins>
      <script>
          (adsbygoogle = window.adsbygoogle || []).push({});
      </script>`,
  // pageBshowMode: 'article',
  // windowLB: // 会遮挡部分侧边栏
  //   `<!-- 固定200*200px -->
  //     <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"></script>
  //     <ins class="adsbygoogle"
  //         style="display:inline-block;width:200px;height:200px"
  //         data-ad-client="ca-pub-7828333725993554"
  //         data-ad-slot="6625304284"></ins>
  //     <script>
  //         (adsbygoogle = window.adsbygoogle || []).push({});
  //     </script>`,
  windowRB:
    `<!-- 固定160*160px -->
      <ins class="adsbygoogle"
          style="display:inline-block;max-width:160px;max-height:160px"
          data-ad-client="ca-pub-7828333725993554"
          data-ad-slot="8377369658"></ins>
      <script>
          (adsbygoogle = window.adsbygoogle || []).push({});
      </script>
      `,
}


// module.exports = {
//   homeSidebarB: `<div style="width:100%;height:100px;color:#fff;background: #eee;">自定义模块测试</div>`,
//   sidebarT: `<div style="width:100%;height:100px;color:#fff;background: #eee;">自定义模块测试</div>`,
//   sidebarB: `<div style="width:100%;height:100px;color:#fff;background: #eee;">自定义模块测试</div>`,
//   pageT: `<div style="width:100%;height:100px;color:#fff;background: #eee;">自定义模块测试</div>`,
//   pageB: `<div style="width:100%;height:100px;color:#fff;background: #eee;">自定义模块测试</div>`,
//   windowLB: `<div style="width:100%;height:100px;color:#fff;background: #eee;">自定义模块测试</div>`,
//   windowRB: `<div style="width:100%;height:100px;color:#fff;background: #eee;">自定义模块测试</div>`,
// }
