// ... (Flashcards 构造函数和 _parseAllHeadingsAndCards 方法不变) ...

Flashcards.prototype.showFlashcardModal = function () {
  var self = this;

  // ... (方法顶部的其他代码不变) ...

  if (!$modal.length) {
    var modalHtml = `
        <div id="flashcard-modal" class="flashcard-modal">
          <div class="flashcard-container">
            <div id="h1-selection-view" class="fc-view view-hidden">
              <ul id="h1-list" class="h1-list-ul"></ul>
            </div>
            <div id="flashcard-view" class="fc-view view-hidden">
              <button id="back-to-h1-selection" class="flashcard-back-btn" title="Back to Sections">
                <i class="fa fa-arrow-left"></i>
              </button>
              <div class="flashcard-content-area">
                <div class="flashcard-current-h1-title"></div>
                <div class="flashcard"> {/* 滑动事件将绑定到这个元素 */}
                  <div class="flashcard-front"></div>
                  <div class="flashcard-back"></div>
                </div>
              </div>
              <div class="flashcard-navigation">
                <button id="prev-card" class="flashcard-nav-btn">❮</button>
                <div class="card-counter-container">
                  <input type="number" id="jump-to-card-input" min="1" class="flashcard-jump-input">
                  <span id="card-counter-total"></span>
                </div>
                <button id="next-card" class="flashcard-nav-btn">❯</button>
                <button id="shuffle-cards-btn" class="flashcard-nav-btn" title="Shuffle Cards">
                  <i class="fa fa-random"></i>
                </button>
              </div>
            </div>
            <button id="close-flashcard" class="close-flashcard"><i class="fa fa-times"></i></button>
          </div>
        </div>`;
    $('body').append(modalHtml);
    $modal = $('#flashcard-modal').hide(); // jQuery hide() 会设置 display: none
    // $container = $modal.find('.flashcard-container'); // 如果后面需要用 $container

    // --- 事件监听器绑定 ---
    var $flashcardElement = $modal.find('.flashcard'); // 获取卡片元素

    $flashcardElement.off('click.flashcards').on('click.flashcards', function () {
      if (!self.isAnimating && !self.isViewAnimating) {
        self.flipCard();
      }
    });

    // --- BEGIN SWIPE FUNCTIONALITY ---
    var touchstartX = 0;
    var touchstartY = 0;
    var touchendX = 0;
    // var touchendY = 0; // touchendY is not strictly needed for horizontal swipe decision
    var touchstartTime = 0;
    var minSwipeDistance = 50;    // 滑动的最小距离 (像素)
    var maxSwipeTime = 700;       // 完成滑动的最大时间 (毫秒)
    var maxVerticalOffset = 75;   // 水平滑动时允许的最大垂直偏移量

    $flashcardElement.off('touchstart.flashcardsSwipe touchend.flashcardsSwipe') // 清除旧的滑动事件监听器
      .on('touchstart.flashcardsSwipe', function (event) {
        // jQuery 将原生事件包装在 originalEvent 中
        touchstartX = event.originalEvent.changedTouches[0].screenX;
        touchstartY = event.originalEvent.changedTouches[0].screenY;
        touchstartTime = new Date().getTime();
        // 注意：这里不立即 event.preventDefault()，
        // 因为如果卡片内容本身需要垂直滚动，这会阻止它。
        // 我们只在确定是水平滑动时考虑是否阻止默认行为（如果需要）。
      })
      .on('touchend.flashcardsSwipe', function (event) {
        touchendX = event.originalEvent.changedTouches[0].screenX;
        const touchendY = event.originalEvent.changedTouches[0].screenY; // 获取 Y 坐标用于计算垂直偏移

        var elapsedTime = new Date().getTime() - touchstartTime;
        var deltaX = touchendX - touchstartX;
        var deltaY = touchendY - touchstartY;

        if (elapsedTime <= maxSwipeTime) { // 检查滑动是否足够快
          // 检查是否主要是水平滑动，并且达到最小滑动距离
          if (Math.abs(deltaX) >= minSwipeDistance && Math.abs(deltaY) <= maxVerticalOffset) {
            if (deltaX > 0) { //向右滑动 (手指从左向右移动)
              if (!self.isAnimating && !self.isViewAnimating && self.currentView === 'flashcards') {
                self.prevCard();
              }
            } else { // 向左滑动 (手指从右向左移动)
              if (!self.isAnimating && !self.isViewAnimating && self.currentView === 'flashcards') {
                self.nextCard();
              }
            }
            // 如果滑动成功切换了卡片，可以考虑阻止此触摸事件触发翻转卡片的 click 事件
            // 但通常如果滑动距离足够，click 事件可能不会被触发，或者影响不大。
            // 如果确实有冲突，可以在这里设置一个短时间的标志位来忽略接下来的 click。
          }
        }
        // 重置触摸起始点，为下一次滑动做准备 (虽然在此简单实现中，每次 touchend 后都会重置)
        // touchstartX = 0;
        // touchstartY = 0;
      });
    // --- END SWIPE FUNCTIONALITY ---


    // 其他按钮的事件监听器 (确保使用 .off().on() 模式)
    $('#prev-card').off('click.flashcards').on('click.flashcards', function (e) {
      e.stopPropagation();
      self.prevCard();
    });
    $('#next-card').off('click.flashcards').on('click.flashcards', function (e) {
      e.stopPropagation();
      self.nextCard();
    });
    $('#close-flashcard').off('click.flashcards').on('click.flashcards', function () {
      self.hideFlashcardModal();
    });
    $('#shuffle-cards-btn').off('click.flashcards').on('click.flashcards', function (e) {
      e.stopPropagation();
      self.toggleShuffle();
    });
    $('#back-to-h1-selection').off('click.flashcards').on('click.flashcards', function (e) {
      e.stopPropagation();
      self._transitionToH1SelectionView();
    });
    $('#jump-to-card-input').off('change.flashcards keypress.flashcards')
      .on('change.flashcards', function () {
        self.jumpToCard(parseInt($(this).val()));
      })
      .on('keypress.flashcards', function (e) {
        if (e.which === 13) {
          self.jumpToCard(parseInt($(this).val()));
          $(this).blur();
        }
      });

    $(document).off('keydown.flashcards').on('keydown.flashcards', function (e) {
      // ... (键盘事件处理逻辑不变) ...
      if ($modal.is(':visible') && !self.isViewAnimating) {
        if (e.key === 'Escape') self.hideFlashcardModal();
        if ($('#flashcard-view').hasClass('view-active')) {
          if (e.key === 'ArrowLeft') self.prevCard();
          else if (e.key === 'ArrowRight') self.nextCard();
          else if (e.key === ' ') {
            if (!self.isAnimating && !$(e.target).is('input, textarea, button')) {
              self.flipCard();
              e.preventDefault();
            }
          }
        }
      }
    });
    // --- 事件监听器绑定结束 ---
  }

  // ... (showFlashcardModal 方法的其余部分不变) ...
  // Reset views to a known state (hidden, not in transition)
  $('#h1-selection-view, #flashcard-view')
    .removeClass('view-active view-prep-left view-prep-right view-sliding-out-left view-sliding-out-right')
    .addClass('view-hidden');
  $('#shuffle-cards-btn').removeClass('shuffle-active');


  // Determine initial view (no animation for initial load)
  if (this.h1Sections.length === 1 && (this.h1Sections[0].isFlatList || this.h1Sections.length === 1 && !this.h1Sections[0].isCombined)) {
    const section = this.h1Sections[0];
    this.currentCardsSet = [...section.cards]; // Create a copy
    this.originalCardsSetOrder = [...section.cards]; // Store original order
    this.currentH1Title = section.h1Title;
    this.currentIndex = 0;
    this.currentView = 'flashcards';
    $('#flashcard-view').removeClass('view-hidden').addClass('view-active');
    this._updateFlashcardViewContent();
  } else if (this.h1Sections.length > 0) {
    this.currentView = 'h1Selection';
    $('#h1-selection-view').removeClass('view-hidden').addClass('view-active');
    this._updateH1SelectionViewContent();
  } else {
    alert('No flashcards could be generated.');
    this.hideFlashcardModal();
    return;
  }

  if (!$('body').hasClass('flashcard-modal-open')) {
    this.originalBodyOverflow = $('body').css('overflow');
    $('body').css('overflow', 'hidden').addClass('flashcard-modal-open');
  }
  $modal.fadeIn(400); // Or your preferred animation for the modal itself
};

// ... (其余的 Flashcards.prototype 方法不变) ...
