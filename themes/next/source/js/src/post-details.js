/* global NexT: true */

$(document).ready(function () {

  var html = $('html');
  var hasVelocity = $.isFunction(html.velocity);

  initScrollSpy();
  NexT.utils.needAffix() && initAffix();
  initTOCDimension();

  // if (document.body.clientWidth >= 768) {
  //   // 找出页面上所有 lazy-load 图片
  //   document.querySelectorAll('img[loading="lazy"]').forEach(img => {
  //     img.removeAttribute('loading'); // 立即触发加载
  //   });
  // }

  // $('a[href^=#],area[href^=#]') 表示 href开头为#的元素
  // $('a[href*=#],area[href*=#]') 表示 href含有#的元素

  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', function (e) {
      let cur_href = this.getAttribute('href');
      const targetId = cur_href.slice(1);
      const target = document.getElementById(targetId);
      if (!target) return;

      e.preventDefault();

      if (window.history) {
        // 如果支持History API
        // 比如此时window.location为http://localhost:9009/2018/10/23/algo_newbie/#快速排序
        // 但因为 `e.preventDefault();`导致浏览器的地址还是http://localhost:9009/2018/10/23/algo_newbie/
        let state = {title: '', url: cur_href.split("#")[0]};
        history.pushState(state, '', "#" + cur_href.split("#")[1]);
        //现在浏览器的地址变为http://localhost:9009/2018/10/23/algo_newbie/#快速排序
      }

      // 获取目标标题相对于文档顶部的偏移
      const targetTop = target.getBoundingClientRect().top + window.scrollY;
      let imgCount = 0;
      // 找出页面上所有在当前位置与目标标题之间的 lazy-load 图片
      document.querySelectorAll('img[loading="lazy"]').forEach(img => {
        const imgTop = img.getBoundingClientRect().top + window.scrollY;
        if (imgTop <= targetTop && imgTop >= window.pageYOffset) {
          img.removeAttribute('loading'); // 立即触发加载
          imgCount++;
        }
      });
      // console.log("imgCount=", imgCount);
      const targetSelector = NexT.utils.escapeSelector(cur_href);

      const scrollToHref = function() {
        // 处理滚动动画
        // 此处减去 170 是为了防止页面滚动后  headroom 会挡住锚点跳转之后的标题, 另一个搜 motion.js里的 170
        let offset = $(targetSelector).offset().top - 170;
        // $('html, body').stop().animate({
        //   scrollTop: offset
        // }, 600);
        window.scrollTo({
          top: offset,
          behavior: 'smooth'
        });
      }
      // because the browser only requests 6 ~ 8 images at a time
      // we assume one request costs 60 ms
      let delay = imgCount / 6 * 60;
      // if (document.body.clientWidth >= 768) {
      //     scrollToHref();
      // } else {
        // 延迟跳转，等待浏览器加载图片并重排
        setTimeout(() => {
          scrollToHref();
          setTimeout(() => {
            if (window.pageYOffset != $(targetSelector).offset().top - 170) {
              scrollToHref();  // double check and scroll to the right place
            }
          }, 300);
        }, delay);
      // }
    });
  });

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
    // let delay = 300;
    // if ($iconToFold.is(":hidden")) {
    //   delay = 600;  // this delay for collapse all the toc
    // }
    // setTimeout(function () {
      NexT.utils.sidebarScrollToCenter();
    // }, delay);  // 因为 .post-toc .nav .nav-child 里有个动画
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
