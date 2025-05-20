/* Flashcards - A simple flashcard generator for NexT theme
 * Enhanced with H1 sections, shuffle, jump-to-card, and view transitions.
 */

(function() {
  'use strict';

  var Flashcards = function() {
    this.h1Sections = []; // Array of { h1Title: string, cards: [], isFlatList?: boolean, isCombined?: boolean }
    this.currentCardsSet = [];
    this.originalCardsSetOrder = []; // For un-shuffling
    this.currentIndex = 0;
    this.currentH1Title = '';
    this.isFlipped = false;
    this.isAnimating = false; // For card slide animation
    this.isViewAnimating = false; // For H1/Flashcard view transition
    this.animationDuration = 150; // ms, for card sliding
    this.animationViewDuration = 300; // ms, for view transitions
    this.originalBodyOverflow = '';
    this.currentView = 'h1Selection'; // 'h1Selection' or 'flashcards'
    this.isShuffled = false; // For shuffle state
  };

  Flashcards.prototype._parseAllHeadingsAndCards = function() {
    this.h1Sections = [];
    const postBody = $('.post-body');
    const $headingsAndContentNodes = postBody.children();

    if (postBody.find('h1').length > 0) {
      let currentH1Section = null;
      $headingsAndContentNodes.each((index, element) => {
        const $el = $(element);
        if ($el.is('h1')) {
          currentH1Section = { h1Title: $el.text().trim(), cards: [] };
          this.h1Sections.push(currentH1Section);
        } else if ($el.is('h2') && currentH1Section) {
          const cardTitle = $el.text().trim();
          let cardContent = '';
          let node = $el.next();
          while (node.length && !node.is('h1') && !node.is('h2')) {
            cardContent += node.prop('nodeType') === 1 ? node.clone().prop('outerHTML') : node.text();
            node = node.next();
          }
          if (cardTitle) {
            currentH1Section.cards.push({ front: cardTitle, back: cardContent });
          }
        }
      });
      this.h1Sections = this.h1Sections.filter(section => section.cards.length > 0);

      // Add "All Cards (Combined)" if multiple actual H1 sections exist
      if (this.h1Sections.filter(s => !s.isFlatList).length > 1) {
        let allCardsCombined = [];
        this.h1Sections.forEach(section => {
          if (!section.isFlatList) { // Exclude any potential flat list if logic changes
            allCardsCombined = allCardsCombined.concat(section.cards);
          }
        });
        if (allCardsCombined.length > 0) {
          this.h1Sections.unshift({ h1Title: "All Cards", cards: allCardsCombined, isCombined: true });
        }
      }

    } else {
      const flatCards = [];
      postBody.find('h2').each((index, element) => {
        const $el = $(element);
        const cardTitle = $el.text().trim();
        let cardContent = '';
        let node = $el.next();
        while (node.length && !node.is('h2')) {
          cardContent += node.prop('nodeType') === 1 ? node.clone().prop('outerHTML') : node.text();
          node = node.next();
        }
        if (cardTitle) {
          flatCards.push({ front: cardTitle, back: cardContent });
        }
      });
      if (flatCards.length > 0) {
        this.h1Sections.push({ h1Title: "All Flashcards", cards: flatCards, isFlatList: true });
      }
    }
    return this.h1Sections.length > 0;
  };

  Flashcards.prototype.showFlashcardModal = function() {
    var self = this;

    if (this.h1Sections.length === 0) {
      if (!this._parseAllHeadingsAndCards()) {
        alert('No H2 headings found to create flashcards!');
        return;
      }
    }

    this.isFlipped = false;
    this.isAnimating = false;
    this.isViewAnimating = false;
    this.isShuffled = false; // Reset shuffle on modal open

    var $modal = $('#flashcard-modal');
    const $h1View = $('#h1-selection-view'); // Cache these
    const $flashcardView = $('#flashcard-view');

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

  Flashcards.prototype.hideFlashcardModal = function() {
    $('#flashcard-modal').fadeOut(400, () => {
      if ($('body').hasClass('flashcard-modal-open')) {
        $('body').css('overflow', this.originalBodyOverflow).removeClass('flashcard-modal-open');
      }
      // Reset views to hidden for next open
      $('#h1-selection-view, #flashcard-view')
        .removeClass('view-active view-prep-left view-prep-right view-sliding-out-left view-sliding-out-right')
        .addClass('view-hidden');
    });
  };

  Flashcards.prototype._updateH1SelectionViewContent = function() {
    var $h1List = $('#h1-list').empty();
    if (this.h1Sections.length === 0) {
      $h1List.append('<li>No sections found.</li>'); return;
    }

    this.h1Sections.forEach((section) => {
      const $li = $('<li>')
        .addClass('h1-list-item')
        // --- BEGIN MODIFICATION ---
        // Use .html() instead of .text() to include the icon HTML
        // Add the icon HTML before the text content
        .html(`<i class="fa fa-tag"></i> ${section.h1Title} (${section.cards.length})`)
        // --- END MODIFICATION ---
        .on('click', () => {
          if (this.isViewAnimating) return;
          this._transitionToFlashcardView(section);
        });
      $h1List.append($li);
    });
  };

  Flashcards.prototype._transitionToH1SelectionView = function() {
    if (this.isViewAnimating) return;
    this.isViewAnimating = true;
    this.currentView = 'h1Selection';

    const $flashcardView = $('#flashcard-view');
    const $h1View = $('#h1-selection-view');

    this._updateH1SelectionViewContent(); // Populate list before animation

    $flashcardView.removeClass('view-active').addClass('view-sliding-out-right');
    $h1View.removeClass('view-hidden view-sliding-out-left view-sliding-out-right').addClass('view-prep-left');

    requestAnimationFrame(() => { // Ensures prep class is applied before active
      $h1View[0].offsetHeight; // Force reflow
      $h1View.removeClass('view-prep-left').addClass('view-active');
    });

    setTimeout(() => {
      $flashcardView.addClass('view-hidden').removeClass('view-sliding-out-right');
      this.isViewAnimating = false;
    }, this.animationViewDuration);
  };

  Flashcards.prototype._updateFlashcardViewContent = function() {
    // --- BEGIN MODIFICATION ---
    // Use .html() and add the icon before the title
    $('.flashcard-current-h1-title').html(`<i class="fa fa-tag"></i> ${this.currentH1Title}`);
    // --- END MODIFICATION ---

    let showBackButton = false;
    const hasCombined = this.h1Sections.some(s => s.isCombined);
    const actualH1Count = this.h1Sections.filter(s => !s.isFlatList && !s.isCombined).length;

    if (hasCombined) { // If "All Cards" exists, we can always go back to the list that includes it
      showBackButton = true;
    } else if (actualH1Count > 1) { // Multiple actual H1s (and no "All Cards" was made)
      showBackButton = true;
    }
    // If it's a single H1 section (not flatlist, not combined), showBackButton remains false.
    // If it's a flatlist, showBackButton remains false.
    $('#back-to-h1-selection').toggle(showBackButton);

    var flashcardElement = $('#flashcard-modal .flashcard');
    flashcardElement.removeClass('slide-out-left slide-out-right is-sliding-no-transition')
      .css({'transform': 'translateX(0)', 'opacity': '1'});
    this.updateCardContent();
  };

  Flashcards.prototype._transitionToFlashcardView = function(selectedSection) {
    if (this.isViewAnimating) return;
    this.isViewAnimating = true;
    this.currentView = 'flashcards';

    this.currentCardsSet = [...selectedSection.cards]; // Create a copy
    this.originalCardsSetOrder = [...selectedSection.cards]; // Store original order for this new set
    this.currentH1Title = selectedSection.h1Title;
    this.currentIndex = 0;
    this.isShuffled = false; // Reset shuffle for new section
    $('#shuffle-cards-btn').removeClass('shuffle-active');

    this._updateFlashcardViewContent(); // Populate card content before animation

    const $flashcardView = $('#flashcard-view');
    const $h1View = $('#h1-selection-view');

    $h1View.removeClass('view-active').addClass('view-sliding-out-left');
    $flashcardView.removeClass('view-hidden view-sliding-out-left view-sliding-out-right').addClass('view-prep-right');

    requestAnimationFrame(() => {
      $flashcardView[0].offsetHeight; // Force reflow
      $flashcardView.removeClass('view-prep-right').addClass('view-active');
    });

    setTimeout(() => {
      $h1View.addClass('view-hidden').removeClass('view-sliding-out-left');
      this.isViewAnimating = false;
    }, this.animationViewDuration);
  };

  Flashcards.prototype.updateCardContent = function() {
    if (!this.currentCardsSet || this.currentCardsSet.length === 0) {
      $('#flashcard-modal .flashcard-front').html('<h2>No cards in this section.</h2>');
      $('#flashcard-modal .flashcard-back').html('');
      $('#jump-to-card-input').val('');
      $('#card-counter-total').text('/ 0');
      $('#prev-card, #next-card, #shuffle-cards-btn').prop('disabled', true);
      return;
    }
    $('#prev-card, #next-card, #shuffle-cards-btn').prop('disabled', false);

    var card = this.currentCardsSet[this.currentIndex];
    var flashcardElement = $('#flashcard-modal .flashcard');
    this.isFlipped = false;
    flashcardElement.removeClass('flipped');

    // Add the hint icon div along with the h2 title
    flashcardElement.find('.flashcard-front').html(
      `<h2>${card.front}</h2>
       <div class="flashcard-hint-icon"><i class="fa fa-lightbulb-o"></i></div>`
    );

    flashcardElement.find('.flashcard-back').html(card.back);
    $('#jump-to-card-input').val(this.currentIndex + 1);
    $('#jump-to-card-input').attr('max', this.currentCardsSet.length);
    $('#card-counter-total').text('/ ' + this.currentCardsSet.length);
  };

  Flashcards.prototype.flipCard = function() {
    if (this.isAnimating || this.isViewAnimating || !this.currentCardsSet || this.currentCardsSet.length === 0) return;
    this.isFlipped = !this.isFlipped;
    $('#flashcard-modal .flashcard').toggleClass('flipped');
  };

  Flashcards.prototype._animateCardSwitch = function(direction) {
    if (this.isAnimating || this.isViewAnimating || !this.currentCardsSet || this.currentCardsSet.length === 0) return;
    var flashcardElement = $('#flashcard-modal .flashcard');
    var slideOutClass = direction === 'next' ? 'slide-out-left' : 'slide-out-right';
    var slideInStartTransform = direction === 'next' ? 'translateX(100%)' : 'translateX(-100%)';
    this.isAnimating = true;
    flashcardElement.addClass(slideOutClass);
    setTimeout(() => {
      if (direction === 'next') this.currentIndex++; else this.currentIndex--;
      this.updateCardContent();
      flashcardElement.addClass('is-sliding-no-transition');
      flashcardElement.css({'transform': slideInStartTransform, 'opacity': '0'});
      flashcardElement[0].offsetHeight;
      flashcardElement.removeClass('is-sliding-no-transition');
      requestAnimationFrame(() => {
        flashcardElement.removeClass(slideOutClass);
        flashcardElement.css({'transform': 'translateX(0)', 'opacity': '1'});
      });
      setTimeout(() => { this.isAnimating = false; }, this.animationDuration);
    }, this.animationDuration);
  };

  Flashcards.prototype.nextCard = function() {
    if (this.currentCardsSet && this.currentIndex < this.currentCardsSet.length - 1) {
      this._animateCardSwitch('next');
    }
  };

  Flashcards.prototype.prevCard = function() {
    if (this.currentCardsSet && this.currentIndex > 0) {
      this._animateCardSwitch('prev');
    }
  };

  Flashcards.prototype.toggleShuffle = function() {
    if (this.isAnimating || this.isViewAnimating || !this.currentCardsSet || this.currentCardsSet.length === 0) return;

    this.isShuffled = !this.isShuffled;
    const $shuffleButton = $('#shuffle-cards-btn');

    if (this.isShuffled) {
      // this.originalCardsSetOrder is already a copy of the true original when section was loaded
      // Shuffle currentCardsSet (which might be original or already a copy if un-shuffled previously)
      for (let i = this.currentCardsSet.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [this.currentCardsSet[i], this.currentCardsSet[j]] = [this.currentCardsSet[j], this.currentCardsSet[i]];
      }
      $shuffleButton.addClass('shuffle-active');
    } else {
      // Restore from the pristine original order for this section
      this.currentCardsSet = [...this.originalCardsSetOrder];
      $shuffleButton.removeClass('shuffle-active');
    }
    this.currentIndex = 0;
    this.isFlipped = false;
    $('#flashcard-modal .flashcard').removeClass('flipped slide-out-left slide-out-right is-sliding-no-transition')
      .css({'transform': 'translateX(0)', 'opacity': '1'});
    this.updateCardContent();
  };

  Flashcards.prototype.jumpToCard = function(cardNumber) {
    if (this.isAnimating || this.isViewAnimating || !this.currentCardsSet || this.currentCardsSet.length === 0) return;
    var num = parseInt(cardNumber);
    if (isNaN(num) || num < 1 || num > this.currentCardsSet.length) {
      $('#jump-to-card-input').val(this.currentIndex + 1); return;
    }
    this.currentIndex = num - 1;
    this.isFlipped = false;
    $('#flashcard-modal .flashcard').removeClass('flipped slide-out-left slide-out-right is-sliding-no-transition')
      .css({'transform': 'translateX(0)', 'opacity': '1'});
    this.updateCardContent();
  };

  window.NexT = window.NexT || {};
  window.NexT.flashcards = new Flashcards();

  $(document).ready(function() {
    if ($('.sidebar-nav-toc').length) {
      var flashcardBtn = '<i class="flashcard-btn fa fa-clone" title="Generate Flashcards"></i>';
      $('.sidebar-nav-toc').append(flashcardBtn);
      $('.flashcard-btn').on('click', function() { window.NexT.flashcards.showFlashcardModal(); });
    }
  });
})();
