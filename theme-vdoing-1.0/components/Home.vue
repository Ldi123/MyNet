<template>
  <div class="home-wrapper">
    <!-- 挂件：公告条 -->
    <AnnounceBar v-if="widgets.announce" />

    <!-- 非紧凑：Hero（身份 + 标题 + 数据 + CTA + 推荐卡） -->
    <section
      class="hero card-box"
      :class="{ 'hide-banner': !showBanner }"
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
          v-bind="feature.link ? { to: feature.link } : { href: 'javascript:;' }"
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

    <!-- 挂件横排带：倒数日 / 最近更新 -->
    <div
      class="widget-strip"
      :class="{ 'hide-banner': !showBanner }"
      v-if="showStrip"
    >
      <CountdownCard v-if="widgets.countdown" />
      <LastUpdatedCard v-if="widgets.lastUpdate" />
    </div>

    <MainLayout>
      <template #mainLeft>
        <div class="sec-head" v-if="showBanner">
          <h2>最新文章</h2>
          <router-link to="/archives/">
            查看全部
            <span class="arr">
              <svg viewBox="0 0 16 16" aria-hidden="true">
                <path
                  d="M3 8h9M8.5 4.5 12 8l-3.5 3.5"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.6"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </span>
          </router-link>
        </div>

        <!-- 紧凑（≤640）：推荐卡上移到列表上方 -->
        <div
          class="hero-right as-list"
          :class="{ 'hide-banner': !showBanner }"
          v-if="showBanner && showRec"
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
          v-if="showBanner"
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
        <LinksCard v-if="widgets.links" />
        <QuoteCard v-if="widgets.quote" />
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
import AnnounceBar from '@theme/components/widgets/AnnounceBar'
import CountdownCard from '@theme/components/widgets/CountdownCard'
import LastUpdatedCard from '@theme/components/widgets/LastUpdatedCard'
import LinksCard from '@theme/components/widgets/LinksCard'
import QuoteCard from '@theme/components/widgets/QuoteCard'

export default {
  data () {
    return {
      total: 0,
      perPage: 6,
      currentPage: 1,
      recClosed: false
    }
  },
  computed: {
    widgets () {
      return this.$themeConfig.widgets || {}
    },
    showStrip () {
      const w = this.widgets
      return !!(w.countdown || w.lastUpdate)
    },
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
    RecCard,
    AnnounceBar,
    CountdownCard,
    LastUpdatedCard,
    LinksCard,
    QuoteCard
  },
  created () {
    this.total = this.$sortPosts.length
  },
  mounted () {
    if (this.$route.query.p) {
      this.currentPage = Number(this.$route.query.p)
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
      display none

  // ≤640 上移后的推荐卡（在 MainLayout 内，不在 .hero 下；默认隐藏，由媒体查询显示）
  .hero-right.as-list
    width 100%
    max-width none
    margin-bottom 0.9rem
    display none
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
    align-items center
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
        background linear-gradient(180deg, var(--festColor, $accentColor), #0B7E9E)
    a
      display inline-flex
      align-items center
      gap 5px
      height 28px
      padding 0 10px 0 13px
      border-radius 999px
      background linear-gradient(180deg, var(--blurBg), var(--mainBg))
      backdrop-filter saturate(140%) blur(6px)
      -webkit-backdrop-filter saturate(140%) blur(6px)
      border 1px solid var(--borderColor)
      color var(--textColor)
      font-size 0.76rem
      font-weight 600
      letter-spacing 0.02em
      line-height 1
      box-shadow 0 1px 2px rgba(0, 0, 0, 0.05), inset 0 1px 0 rgba(255, 255, 255, 0.12)
      transition transform 0.25s cubic-bezier(0.22, 0.61, 0.36, 1), box-shadow 0.25s, border-color 0.25s
      .arr
        display inline-flex
        align-items center
        justify-content center
        width 18px
        height 18px
        border-radius 50%
        background-color var(--chipBg)
        color var(--festColor, $accentColor)
        transition background-color 0.25s, color 0.25s, transform 0.25s
        svg
          display block
          width 10px
          height 10px
      &:hover
        border-color var(--festColor, $accentColor)
        box-shadow 0 6px 18px -8px rgba(0, 0, 0, 0.28), inset 0 1px 0 rgba(255, 255, 255, 0.12)
        transform translateY(-1px)
        .arr
          background-color var(--festColor, $accentColor)
          color #fff
          transform translateX(1px)

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
      a
        height 26px
        padding 0 8px 0 11px
        font-size 0.72rem
        .arr
          width 16px
          height 16px
          svg
            width 9px
            height 9px
    // 紧凑/非紧凑布局改由 CSS 断点切换（原先由 JS mounted 切 v-if，
    // 导致线上首屏先渲染出非紧凑的旧版首页 Hero，挂载后才重排成紧凑布局）
    .hero:not(.hero-sunk)
      display none
    .hero.hero-sunk
      display block
    .hero-right.as-list
      display block
</style>
