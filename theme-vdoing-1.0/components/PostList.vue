<template>
  <div class="post-list" ref="postList">
    <transition-group tag="div" name="post">
      <div
        class="post card-box"
        :class="item.frontmatter.sticky && 'iconfont icon-zhiding'"
        v-for="item in sortPosts"
        :key="item.key"
      >
        <div class="meta-top">
          <span
            class="pill"
            :class="{ warm: index === 1 }"
            v-for="(c, index) in topCats(item)"
            :key="'c' + index"
            >{{ c }}</span
          >
          <span class="pill warm" v-if="item.frontmatter.sticky">置顶</span>
          <span class="date" v-if="item.frontmatter.date">{{
            item.frontmatter.date.split(' ')[0]
          }}</span>
        </div>

        <div class="title-wrapper">
          <h2>
            <router-link :to="item.path">
              {{ item.title }}
              <span class="title-tag" v-if="item.frontmatter.titleTag">{{
                item.frontmatter.titleTag
              }}</span>
            </router-link>
          </h2>
        </div>

        <div class="excerpt-wrapper" v-if="item.excerpt">
          <div class="excerpt" v-html="item.excerpt"></div>
        </div>

        <div class="meta-bot">
          <span class="who">
            <span class="ava">{{ authorInitial }}</span
            >{{ authorName }}
          </span>
          <router-link
            class="tag-chip"
            :to="`/tags/?tag=${encodeURIComponent(t)}`"
            v-for="(t, index) in botTags(item)"
            :key="'t' + index"
          >
            <span class="tag-ico iconfont icon-biaoqian1"></span>{{ t }}
          </router-link>
          <router-link :to="item.path" class="readmore"
            >阅读全文 <span class="rm-arrow">→</span></router-link
          >
        </div>
      </div>
    </transition-group>
  </div>
</template>

<script>
export default {
  props: {
    category: {
      type: String,
      default: ''
    },
    tag: {
      type: String,
      default: ''
    },
    currentPage: {
      type: Number,
      default: 1
    },
    perPage: {
      type: Number,
      default: 10
    }
  },
  data () {
    return {
      sortPosts: [],
      postListOffsetTop: 0
    }
  },
  computed: {
    authorName () {
      const author = this.$themeConfig.author
      if (!author) return ''
      return typeof author === 'string' ? author : author.name || ''
    },
    authorInitial () {
      const n = this.authorName || 'D'
      return n.charAt(0).toUpperCase()
    }
  },
  created () {
    this.setPosts()
  },
  watch: {
    currentPage () {
      if (this.$route.query.p != this.currentPage) {
        this.$router.push({
          query: {
            ...this.$route.query,
            p: this.currentPage
          }
        })
      }
      this.setPosts()
    },
    category () {
      this.setPosts()
    },
    tag () {
      this.setPosts()
    }
  },
  methods: {
    setPosts () {
      const currentPage = this.currentPage
      const perPage = this.perPage

      let posts = []
      if (this.category) {
        posts = this.$groupPosts.categories[this.category]
      } else if (this.tag) {
        posts = this.$groupPosts.tags[this.tag]
      } else {
        posts = this.$sortPosts
      }

      this.sortPosts = posts.slice(
        (currentPage - 1) * perPage,
        currentPage * perPage
      )
    },
    topCats (item) {
      const cats = (item.frontmatter.categories || []).filter(Boolean)
      return cats.slice(0, 2)
    },
    botTags (item) {
      if (this.$themeConfig.tag === false) return []
      return (item.frontmatter.tags || []).filter(Boolean)
    }
  }
}
</script>

<style lang='stylus'>
.post-list
  margin-bottom 4rem
  .post
    position relative
    padding 1.35rem 1.6rem
    margin-bottom 0.9rem
    border-radius 16px
    border 1px solid var(--borderColor)
    transition all 0.28s
    &.post-leave-active
      display none
    &.post-enter
      opacity 0
      transform translateX(-20px)
    @media (any-hover hover)
      &:hover
        transform translateY(-3px)
        box-shadow 0 12px 32px -12px rgba(0, 50, 60, 0.18)
        .readmore
          opacity 1
          transform translateX(0)
    &::before
      position absolute
      top -1px
      right 0
      font-size 2.5rem
      color $activeColor
      opacity 0.85

    .meta-top
      display flex
      align-items center
      gap 8px
      margin-bottom 10px
      flex-wrap wrap
      .date
        margin-left auto
        font-size 12.5px
        color var(--text3)
        font-variant-numeric tabular-nums
        opacity 1

    .title-wrapper
      a
        color var(--textColor)
        transition color 0.2s
        &:hover
          color $accentColor
      h2
        margin 0 0 9px
        font-size 1.12rem
        font-weight 650
        line-height 1.45
        letter-spacing -0.01em
        border none
        .title-tag
          height 1.2rem
          line-height 1.2rem
          border 1px solid $activeColor
          color $activeColor
          font-size 0.8rem
          padding 0 0.35rem
          border-radius 0.2rem
          margin-left 0rem
          transform translate(0, -0.15rem)
          display inline-block
        a
          display block
          @media (max-width $MQMobile)
            font-weight 400

    .excerpt-wrapper
      border none
      margin 0 0 14px
      overflow hidden
      .excerpt
        margin-bottom 0
        font-size 0.875rem
        color var(--text2)
        line-height 1.7
        display -webkit-box
        -webkit-line-clamp 2
        -webkit-box-orient vertical
        overflow hidden
        h1, h2, h3
          display none
        img
          max-height 280px
          max-width 100% !important
          margin 0 auto

    .meta-bot
      display flex
      align-items center
      gap 12px
      font-size 12.5px
      color var(--text2)
      flex-wrap wrap
      .who
        display flex
        align-items center
        gap 6px
        .ava
          width 20px
          height 20px
          border-radius 50%
          background linear-gradient(135deg, $accentColor, #0B7E9E)
          color #fff
          font-size 10px
          display grid
          place-items center
          font-weight 700
          line-height 1
      .readmore
        margin-left auto
        color $accentColor
        font-weight 600
        opacity 0
        transform translateX(-8px)
        transition all 0.28s
        white-space nowrap
        .rm-arrow
          margin-left 2px

  // 触屏/无 hover：直接显示阅读全文
  @media (hover none)
    .post
      .readmore
        opacity 1
        transform none
</style>
