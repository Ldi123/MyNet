<template>
  <div class="pagination">
    <button
      type="button"
      class="page-btn prev"
      :disabled="currentPage === 1"
      @click="goPrex()"
    >上一页</button>

    <!-- 分页在5页及以下时 -->
    <div
      class="pagination-list"
      v-if="pages <= 5"
    >
      <button
        type="button"
        class="page-btn num"
        v-for="item in pages"
        :key="item"
        :class="{active: currentPage === item}"
        @click="goIndex(item)"
      >{{item}}</button>
    </div>
    <!-- 分页在5页以上 -->
    <div
      class="pagination-list"
      v-else
    >
      <!-- 一号位 -->
      <button
        type="button"
        class="page-btn num"
        :class="{active: currentPage === 1}"
        @click="goIndex(1)"
      >1</button>

      <!-- 二号位 -->
      <span
        class="ellipsis ell-two"
        v-show="currentPage > 3"
        @click="goIndex(currentPage - 2)"
        title="上两页"
      />
      <!--这里没有使用v-if的原因是因为部署版本在当前页大于3时刷新页面出现了一些bug-->
      <button
        type="button"
        class="page-btn num"
        v-show="currentPage <= 3"
        :class="{active: currentPage === 2}"
        @click="goIndex(2)"
      >2</button>

      <!-- 三号位 -->
      <button
        type="button"
        class="page-btn num"
        :class="{active: currentPage >= 3 && currentPage <= (pages - 2)}"
        @click="goIndex(threeNum())"
      >{{ threeNum() }}</button>

      <!-- 四号位 -->
      <span
        class="ellipsis ell-four"
        v-show="currentPage < (pages - 2)"
        @click="goIndex(currentPage + 2)"
        title="下两页"
      />
      <button
        type="button"
        class="page-btn num"
        v-show="currentPage >= (pages - 2)"
        :class="{active: currentPage === pages-1}"
        @click="goIndex(pages-1)"
      >{{ pages-1 }}</button>

      <!-- 五号位 -->
      <button
        type="button"
        class="page-btn num"
        :class="{active: currentPage === pages}"
        @click="goIndex(pages)"
      >{{pages}}</button>
    </div>

    <button
      type="button"
      class="page-btn next"
      :disabled="currentPage === pages"
      @click="goNext()"
    >下一页</button>
  </div>
</template>

<script>
export default {
  props: {
    total: { // 总长度
      type: Number,
      default: 10
    },
    perPage: { // 每页长
      type: Number,
      default: 6
    },
    currentPage: { // 当前页
      type: Number,
      default: 1
    }
  },
  computed: {
    pages () { // 总页数
      return Math.ceil(this.total / this.perPage)
    }
  },
  methods: {
    threeNum () { // 三号位页码计算
      let num = 3
      const currentPage = this.currentPage
      const pages = this.pages
      if (currentPage < 3) {
        num = 3
      } else if (currentPage > (pages - 3)) {
        num = pages - 2
      } else {
        num = currentPage
      }
      return num
    },
    goPrex () {
      let currentPage = this.currentPage
      if (currentPage > 1) {
        this.handleEmit(--currentPage)
      }
    },
    goNext () {
      let currentPage = this.currentPage
      if (currentPage < this.pages) {
        this.handleEmit(++currentPage)
      }
    },
    goIndex (i) {
      if (i !== this.currentPage) {
        this.handleEmit(i)
      }
    },
    handleEmit (i) {
      this.$emit('getCurrentPage', i)
    }
  }
}
</script>

<style lang='stylus'>
.pagination
  position relative
  min-height 60px
  text-align center
  display flex
  flex-wrap wrap
  align-items center
  justify-content center
  gap 8px

  // 设计稿：统一胶囊按钮
  .page-btn
    min-width 38px
    height 38px
    padding 0 14px
    margin 0
    box-sizing border-box
    display inline-flex
    align-items center
    justify-content center
    border-radius 10px
    border 1px solid var(--borderColor)
    background var(--mainBg)
    color var(--text2)
    font-size 14px
    font-family inherit
    line-height 1
    cursor pointer
    white-space nowrap
    flex-shrink 0
    transition border-color 0.2s, color 0.2s, background 0.2s, box-shadow 0.2s
    &:disabled
      cursor not-allowed
      opacity 0.45
      color var(--text3)
      border-color var(--borderColor)
      background var(--mainBg)
    &:not(:disabled):hover
      border-color $accentColor
      color $accentColor
    &.active
      background $accentColor
      border-color $accentColor
      color #fff
      font-weight 600
      opacity 1
      &:not(:disabled):hover
        color #fff
        border-color $accentColor
        box-shadow 0 4px 12px -4px rgba(17, 168, 205, 0.45)
    &.num
      padding 0 0.35rem

  span
    line-height 1rem
    opacity 0.9
    cursor pointer
    white-space nowrap
    flex-shrink 0
    &:hover
      color $accentColor
    &.ellipsis
      opacity 0.5
      &::before
        content '...'
        font-size 1.2rem
      @media (any-hover hover)
        &.ell-two
          &:hover
            &::before
              content '«'
        &.ell-four
          &:hover
            &::before
              content '»'

  .pagination-list
    display flex
    flex-wrap wrap
    align-items center
    justify-content center
    gap 8px

@media (max-width 640px)
  .pagination
    gap 6px
    .page-btn
      min-width 32px
      height 32px
      padding 0 10px
      font-size 13px
      border-radius 8px
    .pagination-list
      gap 6px
@media (max-width 390px)
  .pagination
    .page-btn
      min-width 30px
      height 30px
      font-size 12.5px
      padding 0 8px
</style>
