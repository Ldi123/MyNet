<template>
  <div class="home-wrapper">
    <!-- 非紧凑：Hero（身份 + 标题 + 数据 + CTA + 推荐卡） -->
    <section
      class="hero card-box"
      :class="{ 'hide-banner': !showBanner }"
      v-if="!compactLayout"
      ref="heroTop"
    >
      <HeroIdentity
        :postCount="total"
        :catCount="catCount"
        :tagCount="tagCount"
        :tagline="taglineText"
      />
      <div class="hero-right" ref="heroRight" v-if="showRec">
        <RecCard ref="recTop" @close="recClosed = true" />
      </div>
    </section>

    <!-- 快捷入口 -->
    <div
      class="features-wrap"
      :class="{ 'hide-banner': !showBanner }"
      ref="featuresWrap"
      v-if="hasFeatures"
    >
      <div class="features">
        <component
          :is="feature.link ? 'router-link' : 'a'"
          class="feature"
          :class="feature.cls || 'f' + (index + 1)"
          :to="feature.link"
          :href="feature.link || 'javascript:;'"
          v-for="(feature, index) in homeData.features"
          :key="index"
        >
          <div class="ico" v-if="feature.ico">{{ feature.ico }}</div>
          <img
            class="feature-img"
            v-else-if="feature.imgUrl"
            :src="$withBase(feature.imgUrl)"
            :alt="feature.title"
          />
          <h3>{{ feature.title }}</h3>
          <p>{{ feature.details }}</p>
          <span class="feature-arrow" aria-hidden="true">→</span>
        </component>
      </div>
    </div>

    <MainLayout>
      <template #mainLeft>
        <div class="sec-head" v-if="showBanner">
          <h2>最新文章</h2>
          <router-link to="/archives/">查看全部 →</router-link>
        </div>

        <!-- 紧凑（≤640）：推荐卡上移到列表上方 -->
        <div
          class="hero-right as-list"
          :class="{ 'hide-banner': !showBanner }"
          v-if="compactLayout && showBanner && showRec"
        >
          <RecCard ref="recList" @close="recClosed = true" />
        </div>

        <!-- 简约版文章列表 -->
        <UpdateArticle
          class="card-box"
          v-if="homeData.postList === 'simple'"
          :length="homeData.simplePostListLength || 10"
        />

        <!-- 详情版文章列表 -->
        <template
          v-else-if="!homeData.postList || homeData.postList === 'detailed'"
        >
          <PostList :currentPage="currentPage" :perPage="perPage" />
          <div
            class="pager-wrap"
            ref="pagerWrap"
            v-show="Math.ceil(total / perPage) > 1"
          >
            <Pagination
              :total="total"
              :perPage="perPage"
              :currentPage="currentPage"
              @getCurrentPage="handlePagination"
            />
          </div>
        </template>

        <!-- 紧凑：Hero 沉到分页下方 -->
        <section
          class="hero card-box hero-sunk"
          v-if="compactLayout && showBanner"
        >
          <HeroIdentity
            :postCount="total"
            :catCount="catCount"
            :tagCount="tagCount"
            :tagline="taglineText"
          />
        </section>

        <Content class="theme-vdoing-content custom card-box" />
      </template>

      <template #mainRight>
        <CategoriesBar
          v-if="
            $themeConfig.category !== false &&
            $categoriesAndTags.categories.length
          "
          :categoriesData="$categoriesAndTags.categories"
          :length="10"
        />
        <TagsBar
          v-if="$themeConfig.tag !== false && $categoriesAndTags.tags.length"
          :tagsData="$categoriesAndTags.tags"
          :length="30"
        />
        <div
          class="custom-html-box card-box"
          v-if="homeSidebarB"
          v-html="homeSidebarB"
        ></div>
        <div class="card-box poem-card">
          <center>
            <img
              alt="今日诗词"
              src="https://v2.jinrishici.com/one.svg?font-size=30&spacing=2&color=Coral"
              style="max-width:94%; margin: 25% 0;"
            />
          </center>
        </div>
      </template>
    </MainLayout>
  </div>
</template>

<script>
import MainLayout from '@theme/components/MainLayout'
import PostList from '@theme/components/PostList'
import UpdateArticle from '@theme/components/UpdateArticle'
import Pagination from '@theme/components/Pagination'
import CategoriesBar from '@theme/components/CategoriesBar'
import TagsBar from '@theme/components/TagsBar'
import HeroIdentity from '@theme/components/HeroIdentity'
import RecCard from '@theme/components/RecCard'

const COMPACT_BREAKPOINT = 640 // 设计稿手机端布局断点

export default {
  data () {
    return {
      compactLayout: false,
      total: 0,
      perPage: 6,
      currentPage: 1,
      recClosed: false
    }
  },
  computed: {
    homeData () {
      return {
        ...this.$page.frontmatter
      }
    },
    hasFeatures () {
      return !!(this.homeData.features && this.homeData.features.length)
    },
    taglineText () {
      return this.homeData.tagline || undefined
    },
    catCount () {
      return this.$categoriesAndTags.categories.length
    },
    tagCount () {
      return this.$categoriesAndTags.tags.length
    },
    homeSidebarB () {
      const { htmlModules } = this.$themeConfig
      return htmlModules ? htmlModules.homeSidebarB : ''
    },
    showBanner () {
      return this.$route.query.p
        && this.$route.query.p != 1
        && (!this.homeData.postList || this.homeData.postList === 'detailed')
        ? false : true
    },
    showRec () {
      if (this.recClosed) return false
      if (this.homeData.recCard === false) return false
      if (this.$themeConfig.homeRec === false) return false
      return true
    }
  },
  components: {
    MainLayout,
    PostList,
    UpdateArticle,
    CategoriesBar,
    TagsBar,
    Pagination,
    HeroIdentity,
    RecCard
  },
  created () {
    this.total = this.$sortPosts.length
  },
  mounted () {
    if (this.$route.query.p) {
      this.currentPage = Number(this.$route.query.p)
    }
    this.mq = window.matchMedia(`(max-width: ${COMPACT_BREAKPOINT}px)`)
    this.onCompactChange = () => {
      this.compactLayout = this.mq.matches
    }
    this.onCompactChange()
    if (this.mq.addEventListener) {
      this.mq.addEventListener('change', this.onCompactChange)
    } else if (this.mq.addListener) {
      this.mq.addListener(this.onCompactChange)
    }
  },
  beforeDestroy () {
    if (this.mq && this.onCompactChange) {
      if (this.mq.removeEventListener) {
        this.mq.removeEventListener('change', this.onCompactChange)
      } else if (this.mq.removeListener) {
        this.mq.removeListener(this.onCompactChange)
      }
    }
  },
  watch: {
    '$route.query.p' () {
      if (!this.$route.query.p) {
        this.currentPage = 1
      } else {
        this.currentPage = Number(this.$route.query.p)
      }
    }
  },
  methods: {
    handlePagination (i) {
      this.currentPage = i
    }
  }
}
</script>

<style lang="stylus" scoped>
.home-wrapper
  max-width $homePageWidth
  margin 0 auto
  padding ($navbarHeight + 1.4rem) 1.5rem 0
  box-sizing border-box
  .hide-banner
    display none !important

  // ===== Hero =====
  .hero
    position relative
    overflow hidden
    display flex
    align-items center
    gap 3rem
    padding 2.8rem 3rem
    margin-bottom 1.1rem
    border-radius 20px
    &::before
      content ""
      position absolute
      inset 0
      background radial-gradient(600px 300px at 85% -40px, rgba(17, 168, 205, 0.16), transparent 60%),
        radial-gradient(420px 260px at -60px 110%, rgba(255, 87, 34, 0.1), transparent 60%)
      pointer-events none
    & > *
      position relative
      z-index 1
    .hero-right
      width 400px
      flex-shrink 0
    &.hero-sunk
      margin-top 0.6rem
      margin-bottom 2rem
      padding 1.4rem 1.2rem
      display block

  // ≤640 上移后的推荐卡（在 MainLayout 内，不在 .hero 下）
  .hero-right.as-list
    width 100%
    max-width none
    margin-bottom 0.9rem
    .rec-card
      transform none
      box-shadow 0 1px 2px 0 rgba(0, 0, 0, 0.05)

  // ===== features =====
  .features-wrap
    margin-bottom 1.1rem
  .features
    display grid
    grid-template-columns repeat(3, 1fr)
    gap 1.1rem
  .feature
    position relative
    overflow hidden
    display block
    background var(--mainBg)
    border 1px solid var(--borderColor)
    border-radius 16px
    padding 1.4rem 1.4rem 1.3rem
    box-shadow 0 1px 2px 0 rgba(0, 0, 0, 0.05)
    color var(--textColor)
    transition all 0.28s
    &::after
      content "→"
      position absolute
      right 1.35rem
      top 1.5rem
      font-size 1rem
      color var(--text3)
      opacity 0
      transform translateX(-6px)
      transition all 0.28s
    &:hover
      transform translateY(-4px)
      box-shadow 0 12px 32px -12px rgba(0, 50, 60, 0.18)
      border-color rgba(17, 168, 205, 0.35)
      &::after
        opacity 1
        transform translateX(0)
        color $accentColor
    .ico
      width 46px
      height 46px
      border-radius 13px
      display grid
      place-items center
      font-size 22px
      margin-bottom 0.95rem
      background linear-gradient(135deg, rgba(17, 168, 205, 0.18), rgba(17, 168, 205, 0.08))
    &.f2 .ico
      background linear-gradient(135deg, rgba(255, 87, 34, 0.16), rgba(255, 87, 34, 0.06))
    &.f3 .ico
      background linear-gradient(135deg, rgba(52, 199, 89, 0.16), rgba(52, 199, 89, 0.06))
    .feature-img
      width 4rem
      height 4rem
      border-radius 12px
      object-fit cover
      margin-bottom 0.9rem
    h3
      font-size 1.05rem
      font-weight 650
      margin 0 0 0.3rem
      border none
      padding 0
      letter-spacing -0.01em
    p
      margin 0
      font-size 0.82rem
      line-height 1.55
      color var(--text2)
      opacity 1

  // ===== sec-head =====
  .sec-head
    display flex
    align-items baseline
    justify-content space-between
    margin 0.25rem 0.1rem 0.9rem
    h2
      font-size 1.18rem
      font-weight 700
      letter-spacing -0.01em
      margin 0
      display flex
      align-items center
      gap 0.55rem
      border none
      padding 0
      &::before
        content ""
        width 4px
        height 18px
        border-radius 2px
        background linear-gradient(180deg, $accentColor, #0B7E9E)
    a
      font-size 0.82rem
      font-weight 600
      color var(--textLightenColor)
      transition color 0.2s
      &:hover
        color $accentColor

  .main-wrapper
    margin 0
    max-width none
    padding 0
    width 100%
    .main-left
      .card-box
        margin-bottom 0.9rem
      .pager-wrap
        margin-bottom 0
      .pagination
        margin-bottom 2rem
      .theme-vdoing-content
        padding 0 2rem
        overflow hidden
        & > :first-child
          padding-top 2rem
        & > :last-child
          padding-bottom 2rem
    .main-right
      .custom-html-box
        padding 0
        overflow hidden

// ===== 960 以下：Hero 单列、右卡全宽 =====
@media (max-width 960px)
  .home-wrapper
    .hero
      flex-direction column
      align-items stretch
      gap 1.5rem
      padding 2.2rem 1.8rem
      .hero-right
        width 100%
        max-width 420px
        margin 0 auto
        .rec-card
          transform none

// ===== ≤640：精简 Hero / features 横滑 =====
@media (max-width 640px)
  .home-wrapper
    padding-top ($navbarHeight + 0.7rem)
    .hero
      gap 0
      padding 1.4rem 1.1rem
    .features-wrap
      margin-bottom 0.9rem
    .features
      display flex
      overflow-x auto
      scroll-snap-type x mandatory
      -webkit-overflow-scrolling touch
      scrollbar-width none
      gap 0.75rem
      &::-webkit-scrollbar
        display none
    .feature
      flex 0 0 min(78%, 300px)
      scroll-snap-align start
      padding 1.1rem 1.1rem 1rem
      .ico
        width 40px
        height 40px
        font-size 19px
        margin-bottom 0.65rem
      p
        font-size 0.78rem
    .rec-card
      padding 1rem 1.1rem 0.9rem
    .sec-head
      margin-bottom 0.75rem
</style>
