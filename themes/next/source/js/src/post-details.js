/* global NexT: true */

$(document).ready(function () {

  var html = $('html');
  var hasVelocity = $.isFunction(html.velocity);

  initScrollSpy();
  NexT.utils.needAffix() && initAffix();
  initTOCDimension();


  function scrollToCenter() {
    var tocSelector = '.post-toc';
    var $tocElement = $(tocSelector);
    // var activeCurrentSelector = '.active-current';
    var $currentActiveElement = $(tocSelector + ' .active').last();
    // removeCurrentActiveClass();
    // $currentActiveElement.addClass('active-current');
    // Scrolling to center active TOC element if TOC content is taller then viewport.
    if ($currentActiveElement.offset() === undefined) {
      return;
    }
    $tocElement.animate({ scrollTop: $currentActiveElement.offset().top - $tocElement.offset().top + $tocElement.scrollTop() - ($tocElement.height() / 2) }, 100); // 300ms 动画滚动到 200px
    // $tocElement.scrollTop($currentActiveElement.offset().top - $tocElement.offset().top + $tocElement.scrollTop() - ($tocElement.height() / 2));
  }

  var $tocTitle = $(".sidebar-nav-toc");
  // $tocTitle.prepend("<i class='fa fa-caret-down'></i><i class='fa fa-caret-right'></i>");
  $tocTitle.prepend("<i class='fa fa-minus-square'></i><i class='fa fa-plus-square'></i>");

  var $iconToFold = $(".sidebar-nav-toc > .fa-minus-square");
  var $iconToExpand = $(".sidebar-nav-toc > .fa-plus-square");
  $iconToFold.addClass("hide");

  const allNavItem = $(".post-toc-content .nav-item");

  $(".sidebar-nav-toc > i").click(function () {
    allNavItem.toggleClass("nav-expand");
    $iconToFold.toggleClass("hide");
    $iconToExpand.toggleClass("hide");
    setTimeout(function () {
      scrollToCenter();
    }, 200);  // 因为 .post-toc .nav .nav-child 里有个动画
  });


  // TOC item animation navigate & prevent #item selector in adress bar.
  // $('.post-toc a').on('click', function (e) {
  // 上面两行的注释已无效, 下面这段代码用于实现锚点链接的平滑滚动, 且在浏览器URL处不显示锚点(即#之后的内容), 即URL地址不会发生变化
  // $('a[href^=#],area[href^=#]') 表示 href开头为#的元素
  // $('a[href*=#],area[href*=#]') 表示 href含有#的元素
  $('a[href^=#],area[href^=#]').on('click', function (e) {
    e.preventDefault();  // 取消事件的默认动作。注释这一行则可以在浏览器URL处显示锚点(即#之后的内容)

    // clearTimeout(temp_timer2);
    var that = this;
    // temp_timer2 = setTimeout(function () {
      var cur_href = that.getAttribute('href');
      if (window.history) {
        // 如果支持History API
        // 比如此时window.location为http://localhost:9009/2018/10/23/algo_newbie/#快速排序
        // 但因为 `e.preventDefault();`导致浏览器的地址还是http://localhost:9009/2018/10/23/algo_newbie/
        var state = {title: '', url: cur_href.split("#")[0]};
        history.pushState(state, '', "#" + cur_href.split("#")[1]);
        //现在浏览器的地址变为http://localhost:9009/2018/10/23/algo_newbie/#快速排序
      }
      // 处理滚动动画
      var targetSelector = NexT.utils.escapeSelector(cur_href);
      var offset = $(targetSelector).offset().top - 170; // 此处减去 170 是为了防止页面滚动后  headroom 会挡住锚点跳转之后的标题
      hasVelocity ?
        html.velocity('stop').velocity('scroll', {
          offset: offset + 'px',
          mobileHA: false
        }) :
        $('html, body').stop().animate({
          scrollTop: offset
        }, 500);
    // }, 250);

  });

  function initScrollSpy() {
    var tocSelector = '.post-toc';
    var $tocElement = $(tocSelector);
    var activeCurrentSelector = '.active-current';

    $tocElement
      .on('activate.bs.scrollspy', function () {
        var $currentActiveElement = $(tocSelector + ' .active').last();

        removeCurrentActiveClass();
        $currentActiveElement.addClass(activeCurrentSelector.substring(1));
        // console.log("$currentActiveElement.offset().top")
        // console.log($currentActiveElement.offset().top)
        // console.log("$tocElement.offset().top")
        // console.log($tocElement.offset().top)
        // console.log("$tocElement.scrollTop()")
        // console.log($tocElement.scrollTop())
        // console.log("$tocElement.height() / 2")
        // console.log($tocElement.height() / 2)

        // console.log($currentActiveElement.offset().top - $tocElement.offset().top + $tocElement.scrollTop() - ($tocElement.height() / 2));
        // Scrolling to center active TOC element if TOC content is taller then viewport.
        $tocElement.scrollTop($currentActiveElement.offset().top - $tocElement.offset().top + $tocElement.scrollTop() - ($tocElement.height() / 2));
      })
      // .on('clear.bs.scrollspy', removeCurrentActiveClass);
      .on('clear.bs.scrollspy', function () {
        // $(tocSelector + ' .active').first().children(".nav-link").siblings(".nav-child").hide(100);
        removeCurrentActiveClass();
      });

    $('body').scrollspy({target: tocSelector});

    function removeCurrentActiveClass() {
      $(tocSelector + ' ' + activeCurrentSelector)
        .removeClass(activeCurrentSelector.substring(1));
    }
  }

  // Sidebar float
  function initAffix() {
    var headerHeight = $('.header-inner').height();
    var footerOffset = parseInt($('.main').css('padding-bottom'), 10);

    /*jshint camelcase: false */
    var sidebarTop = (CONFIG.sidebar.offset_float === 0) ?
      headerHeight + CONFIG.sidebar.offset :
      headerHeight;
    /*jshint camelcase: true */

    $('.sidebar-inner').affix({
      offset: {
        top: sidebarTop,
        bottom: footerOffset
      }
    });

    $(document)
      .on('affixed.bs.affix', function () {
        updateTOCHeight(document.body.clientHeight);
      });
  }

  function initTOCDimension() {
    var updateTOCHeightTimer;

    $(window).on('resize', function () {
      updateTOCHeightTimer && clearTimeout(updateTOCHeightTimer);

      updateTOCHeightTimer = setTimeout(function () {
        var tocWrapperHeight = document.body.clientHeight;

        updateTOCHeight(tocWrapperHeight);
      }, 0);
    });

    // Initialize TOC Height.
    updateTOCHeight(document.body.clientHeight);

    // Initialize TOC Width.
    var scrollbarWidth = NexT.utils.getScrollbarWidth();
    // $('.post-toc').css('width', 'calc(100% + ' + scrollbarWidth + 'px)');
  }

  function updateTOCHeight(height) {
    // 为了防止toc sidebar底部有一些目录看不见 被 挡住
    if (document.body.clientWidth < 768) {
      height = height - 128;
    } else {
      height = height - 200;
    }
    // height = height || 'auto';
    $('.post-toc').css('max-height', height);
  }

});

$(document).ready(function () {
  var html = $('html');
  var TAB_ANIMATE_DURATION = 200;
  var hasVelocity = $.isFunction(html.velocity);

  $('.sidebar-nav li').on('click', function () {
    var item = $(this);
    var activeTabClassName = 'sidebar-nav-active';
    var activePanelClassName = 'sidebar-panel-active';
    if (item.hasClass(activeTabClassName)) {
      return;
    }

    var currentTarget = $('.' + activePanelClassName);
    var target = $('.' + item.data('target'));
    hasVelocity ?
      currentTarget
        .removeClass(activePanelClassName)
        .velocity('stop').velocity('transition.slideUpOut', TAB_ANIMATE_DURATION, function () {
        target
          .velocity('stop')
          .velocity('transition.slideDownIn', TAB_ANIMATE_DURATION)
          .addClass(activePanelClassName);
      }) :
      currentTarget.animate({opacity: 0}, TAB_ANIMATE_DURATION, function () {
        currentTarget.hide();
        target
          .stop()
          .css({'opacity': 0, 'display': 'block'})
          .animate({opacity: 1}, TAB_ANIMATE_DURATION, function () {
            currentTarget.removeClass(activePanelClassName);
            target.addClass(activePanelClassName);
          });
      });

    item.siblings().removeClass(activeTabClassName);
    item.addClass(activeTabClassName);
  });

  // Expand sidebar on post detail page by default, when post has a toc.
  var $tocContent = $('.post-toc-content');
  var isSidebarCouldDisplay = CONFIG.sidebar.display === 'post' ||
    CONFIG.sidebar.display === 'always';
  var hasTOC = $tocContent.length > 0 && $tocContent.html().trim().length > 0;
  if (isSidebarCouldDisplay && hasTOC) {
    CONFIG.motion ?
      (NexT.motion.middleWares.sidebar = function () {
        NexT.utils.displaySidebar();
      }) : NexT.utils.displaySidebar();
  }
});
