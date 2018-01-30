/* global NexT: true */

$(document).ready(function () {
    NexT.motion = {};
  
    var sidebarToggleLines = {
      lines: [],
      push: function (line) {
        this.lines.push(line);
      },
      init: function () {
        this.lines.forEach(function (line) {
          line.init();
        });
      },
      arrow: function () {
        this.lines.forEach(function (line) {
          line.arrow();
        });
      },
      close: function () {
        this.lines.forEach(function (line) {
          line.close();
        });
      }
    };
  
    function SidebarToggleLine(settings) {
      this.el = $(settings.el);
      this.status = $.extend({}, {
        init: {
          width: '100%',
          opacity: 1,
          left: 0,
          rotateZ: 0,
          top: 0
        }
      }, settings.status);
    }
  
    SidebarToggleLine.prototype.init = function () {
      this.transform('init');
    };
    SidebarToggleLine.prototype.arrow = function () {
      this.transform('arrow');
    };
    SidebarToggleLine.prototype.close = function () {
      this.transform('close');
    };
    SidebarToggleLine.prototype.transform = function (status) {
      this.el.velocity('stop').velocity(this.status[status]);
    };
  
    var sidebarToggleLine1st = new SidebarToggleLine({
      el: '.sidebar-toggle-line-first',
      status: {
        arrow: {width: '56%', rotateZ: '-30deg', top: '2px'},
        close: {width: '80%', rotateZ: '-45deg', top: '5px'}
      }
    });
    var sidebarToggleLine2nd = new SidebarToggleLine({
      el: '.sidebar-toggle-line-middle',
      status: {
        arrow: {width: '78%'},
        close: {opacity: 0}
      }
    });
    var sidebarToggleLine3rd = new SidebarToggleLine({
      el: '.sidebar-toggle-line-last',
      status: {
        arrow: {width: '56%', rotateZ: '30deg', top: '-2px'},
        close: {width: '80%', rotateZ: '45deg', top: '-5px'}
      }
    });
  
    sidebarToggleLines.push(sidebarToggleLine1st);
    sidebarToggleLines.push(sidebarToggleLine2nd);
    sidebarToggleLines.push(sidebarToggleLine3rd);
  
    var SIDEBAR_WIDTH = '285px';
    var SIDEBAR_DISPLAY_DURATION = 150;
  
    var sidebarToggleMotion = {
      toggleEl: $('.sidebar-toggle'),
      toggleEl_inside: $('.sidebar-toggle-inside'),
      dimmerEl: $('#sidebar-dimmer'),
      sidebarEl: $('.sidebar'),
      isSidebarVisible: false,
      init: function () {
        this.toggleEl.on('click', this.clickHandler.bind(this));
        this.toggleEl_inside.on('click', this.clickHandler.bind(this));
        this.dimmerEl.on('click', this.clickHandler.bind(this));
        this.toggleEl.on('mouseenter', this.mouseEnterHandler.bind(this));
        this.toggleEl.on('mouseleave', this.mouseLeaveHandler.bind(this));
  
        $(document)
          .on('sidebar.isShowing', function () {
            NexT.utils.isDesktop() && $('body').velocity('stop').velocity(
              document.body.scrollHeight < 20000 ? {paddingRight: SIDEBAR_WIDTH} : {paddingRight: 0},
              SIDEBAR_DISPLAY_DURATION
            );
          })
          .on('sidebar.isHiding', function () {
          });
      },
      clickHandler: function () {
        this.isSidebarVisible ? this.hideSidebar() : this.showSidebar();
        this.isSidebarVisible = !this.isSidebarVisible;
      },
      mouseEnterHandler: function () {
        if (this.isSidebarVisible) {
          return;
        }
        sidebarToggleLines.arrow();
      },
      mouseLeaveHandler: function () {
        if (this.isSidebarVisible) {
          return;
        }
        sidebarToggleLines.init();
      },
      showSidebar: function () {
        var self = this;
  
        sidebarToggleLines.close();
  
        this.sidebarEl.velocity('stop').velocity({
            width: SIDEBAR_WIDTH
          }, {
            display: 'block',
            duration: SIDEBAR_DISPLAY_DURATION,
            begin: function () {
              $('.sidebar .motion-element').velocity(
                'transition.slideRightIn',
                {
                  stagger: 50,
                  drag: true,
                  complete: function () {
                    self.sidebarEl.trigger('sidebar.motion.complete');
                  }
                }
              );
            },
            complete: function () {
              self.sidebarEl.addClass('sidebar-active');
              self.sidebarEl.trigger('sidebar.didShow');
            }
          }
        );
  
        this.sidebarEl.trigger('sidebar.isShowing');
      },
      hideSidebar: function () {
        NexT.utils.isDesktop() && $('body').velocity('stop').velocity({paddingRight: 0});
        this.sidebarEl.find('.motion-element').velocity('stop').css('display', 'none');
        this.sidebarEl.velocity('stop').velocity({width: 0}, {display: 'none'});
  
        sidebarToggleLines.init();
  
        this.sidebarEl.removeClass('sidebar-active');
        this.sidebarEl.trigger('sidebar.isHiding');
  
        //在 post 页面下按下隐藏 sidebar 时如果当前选中的是“站点概览”，将 toc 去除 motion 效果
        //防止再次打开时会出现在“站点概览”下的 bug
        if (!!$('.post-toc-wrap')) {
          if ($('.site-overview').css('display') === 'block') {
            $('.post-toc-wrap').removeClass('motion-element');
          }
        }
      }
    };
    sidebarToggleMotion.init();
  
    NexT.motion.integrator = {
      queue: [],
      cursor: -1,
      add: function (fn) {
        this.queue.push(fn);
        return this;
      },
      next: function () {
        this.cursor++;
        var fn = this.queue[this.cursor];
        $.isFunction(fn) && fn(NexT.motion.integrator);
      },
      bootstrap: function () {
        this.next();
      }
    };
  
    NexT.motion.middleWares =  {
      logo: function (integrator) {
        var sequence = [];
        var $brand = $('.brand');
        var $title = $('.site-title');
        var $subtitle = $('.site-subtitle');
        var $logoLineTop = $('.logo-line-before i');
        var $logoLineBottom = $('.logo-line-after i');
  
        $brand.size() > 0 && sequence.push({
          e: $brand,
          p: {opacity: 1},
          o: {duration: 200}
        });
  
        NexT.utils.isMist() && hasElement([$logoLineTop, $logoLineBottom]) &&
        sequence.push(
          getMistLineSettings($logoLineTop, '100%'),
          getMistLineSettings($logoLineBottom, '-100%')
        );
  
        hasElement($title) && sequence.push({
          e: $title,
          p: {opacity: 1, top: 0},
          o: { duration: 200 }
        });
  
        hasElement($subtitle) && sequence.push({
          e: $subtitle,
          p: {opacity: 1, top: 0},
          o: {duration: 200}
        });
  
        if (sequence.length > 0) {
          sequence[sequence.length - 1].o.complete = function () {
            integrator.next();
          };
          $.Velocity.RunSequence(sequence);
        } else {
          integrator.next();
        }
  
  
        function getMistLineSettings (element, translateX) {
          return {
            e: $(element),
            p: {translateX: translateX},
            o: {
              duration: 500,
              sequenceQueue: false
            }
          };
        }
  
        /**
         * Check if $elements exist.
         * @param {jQuery|Array} $elements
         * @returns {boolean}
         */
        function hasElement ($elements) {
          $elements = Array.isArray($elements) ? $elements : [$elements];
          return $elements.every(function ($element) {
            return $.isFunction($element.size) && $element.size() > 0;
          });
        }
      },

      menu: function (integrator) {

        if (CONFIG.motion.async) {
          integrator.next();
        }
  
        $('.menu-item').velocity('transition.slideDownIn', {
          display: null,
          duration: 700,
          complete: function () {
            integrator.next();
          }
        });
  
        $('.header').velocity('transition.bounceUpIn', 500);
      },
  
      postList: function (integrator) {
        //var $post = $('.post');
        var $postBlock = $('.post-block, .pagination, .comments');
        var $postBlockTransition = CONFIG.motion.transition.post_block;
        var $postHeader = $('.post-header');
        var $postHeaderTransition = CONFIG.motion.transition.post_header;
        var $postBody = $('.post-body');
        var $postBodyTransition = CONFIG.motion.transition.post_body;
        var $collHeader = $('.collection-title, .archive-year');
        var $collHeaderTransition = CONFIG.motion.transition.coll_header;
        var $sidebarAffix = $('.sidebar-inner');
        var $sidebarAffixTransition = CONFIG.motion.transition.sidebar;
        var hasPost = $postBlock.size() > 0;
  
        hasPost ? postMotion() : integrator.next();
  
        if (CONFIG.motion.async) {
          integrator.next();
        }
  
        function postMotion () {
          var postMotionOptions = window.postMotionOptions || {
              stagger: 100,
              drag: true
            };
          postMotionOptions.complete = function () {
            // After motion complete need to remove transform from sidebar to let affix work on Pisces | Gemini.
            if (CONFIG.motion.transition.sidebar && (NexT.utils.isPisces() || NexT.utils.isGemini())) {
              $sidebarAffix.css({ 'transform': 'initial' });
            }
            integrator.next();
          };
  
          //$post.velocity('transition.slideDownIn', postMotionOptions);
          if (CONFIG.motion.transition.post_block) {
            $postBlock.velocity('transition.' + $postBlockTransition, postMotionOptions);
          }
          if (CONFIG.motion.transition.post_header) {
            $postHeader.velocity('transition.' + $postHeaderTransition, postMotionOptions);
          }
          if (CONFIG.motion.transition.post_body) {
            $postBody.velocity('transition.' + $postBodyTransition, postMotionOptions);
          }
          if (CONFIG.motion.transition.coll_header) {
            $collHeader.velocity('transition.' + $collHeaderTransition, postMotionOptions);
          }
          // Only for Pisces | Gemini.
          if (CONFIG.motion.transition.sidebar && (NexT.utils.isPisces() || NexT.utils.isGemini())) {
            $sidebarAffix.velocity('transition.' + $sidebarAffixTransition, postMotionOptions);
          }
        }
      },
  
      sidebar: function (integrator) {
        if (CONFIG.sidebar.display === 'always') {
          NexT.utils.displaySidebar();
        }
        integrator.next();
      }
    };
  
  });