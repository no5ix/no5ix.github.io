/* Flashcards - A simple flashcard generator for NexT theme
 * Enhanced with H1 sections, shuffle, jump-to-card, and view transitions.
 */

(function () {
  'use strict';

  var Flashcards = function () {
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
    this.modalAnimationDuration = 250; // ms, for modal zoom animation (matches CSS)
    this.originalBodyOverflow = '';
    this.currentView = 'h1-selection'; // 'h1-selection', 'flashcard', or 'card-menu'
    this.isShuffled = false; // For shuffle state
    this.isTouchingCodeBlock = false; // NEW: Flag for touch on code block

    this.isAutoReadActive = false;
    this.speechSynthesis = window.speechSynthesis || null;

    // Keep state in memory
    this.modalInitialized = false; // To track if modal has been opened and set up once
    // Keep state in memory
  };

  Flashcards.prototype._parseAllHeadingsAndCards = function () {
    this.h1Sections = [];
    const postBody = $('.post-body');
    if (!postBody.length) return false; // Guard: Ensure .post-body exists

    const $children = postBody.children();
    const introIcon = '<i class="fa fa-sticky-note"></i> &nbsp;&nbsp;&nbsp;';

    // 注意：之前版本中的 STOP_SELECTORS_STRING 及其相关逻辑已被移除或调整，
    // 现在主要通过 H1/H2 结构以及对 <footer> 标签的特殊处理来界定内容。

    if (postBody.find('h1').length > 0) {
      let currentH1Section = null;
      let h1ContentBuffer = ''; // Buffer for content between H1 and first H2, or after last H2

      for (let i = 0; i < $children.length; i++) {
        const $el = $($children[i]);

        if ($el.is('h1')) {
          // Finalize previous H1 section if it exists and had buffered content
          if (currentH1Section && h1ContentBuffer.trim() !== '') {
            currentH1Section.cards.unshift({ // Add to the beginning of the section's cards
              front: introIcon + currentH1Section.h1Title,
              back: h1ContentBuffer.trim()
            });
          }
          h1ContentBuffer = ''; // Reset buffer for new H1

          // Start new H1 section
          currentH1Section = {h1Title: $el.text().trim(), cards: []};
          this.h1Sections.push(currentH1Section);

          // Check for content immediately after H1 before any H2 or footer (for H1-only cards)
          let nextNodeIndex = i + 1;
          let h1OnlyContent = '';
          while (nextNodeIndex < $children.length) {
            const $contentNode = $($children[nextNodeIndex]);
            // MODIFIED: Stop if next H1, H2, or a footer is encountered
            if ($contentNode.is('h1') || $contentNode.is('h2') || $contentNode.is('footer')) {
              break;
            }
            h1OnlyContent += $contentNode.prop('nodeType') === 1 ? $contentNode.clone().prop('outerHTML') : $contentNode.text();
            nextNodeIndex++;
          }

          // If this H1 is followed by another H1, end of content, or a footer,
          // and h1OnlyContent is not empty, create a card for it.
          if (h1OnlyContent.trim() !== '' &&
            (nextNodeIndex === $children.length || $($children[nextNodeIndex]).is('h1') || $($children[nextNodeIndex]).is('footer'))) {
            if (currentH1Section.cards.length === 0) { // Only add if no H2 cards were found yet for this H1
              currentH1Section.cards.push({
                front: currentH1Section.h1Title,
                back: h1OnlyContent.trim()
              });
            }
          }
        } else if (currentH1Section) { // If we are inside an H1 section
          if ($el.is('h2')) {
            // If there was content buffered before this H2, create a card for it
            if (h1ContentBuffer.trim() !== '') {
              currentH1Section.cards.push({
                front: introIcon + currentH1Section.h1Title,
                back: h1ContentBuffer.trim()
              });
              h1ContentBuffer = ''; // Clear buffer as we've now hit an H2
            }

            // Process H2 card
            const cardTitle = $el.text().trim();
            let cardContent = '';
            let h2ContentNodeIndex = i + 1;
            while (h2ContentNodeIndex < $children.length) {
              const $contentNode = $($children[h2ContentNodeIndex]);
              // MODIFIED: Stop if next H1, H2, or a footer is encountered
              if ($contentNode.is('h1') || $contentNode.is('h2') || $contentNode.is('footer')) {
                break;
              }
              cardContent += $contentNode.prop('nodeType') === 1 ? $contentNode.clone().prop('outerHTML') : $contentNode.text();
              h2ContentNodeIndex++;
            }
            if (cardTitle) {
              currentH1Section.cards.push({front: cardTitle, back: cardContent.trim()});
            }
            i = h2ContentNodeIndex - 1; // Advance main loop counter past H2 content
          } else {
            // Accumulate content for h1ContentBuffer (if no H2 encountered yet in this section, or after last H2)
            // MODIFIED: Do not add if the element itself is a footer
            if (!$el.is('footer')) {
              if (currentH1Section.cards.length === 0 || h1ContentBuffer !== '' || (currentH1Section.cards.length > 0 && currentH1Section.cards[0].front.includes(introIcon))) {
                h1ContentBuffer += $el.prop('nodeType') === 1 ? $el.clone().prop('outerHTML') : $el.text();
              }
            }
          }
        }
      }
      // After loop, check if the last H1 section had buffered content that wasn't part of an H1-only card
      if (currentH1Section && h1ContentBuffer.trim() !== '') {
        const isLastCardH1Only = currentH1Section.cards.length > 0 &&
          currentH1Section.cards[currentH1Section.cards.length - 1].front === currentH1Section.h1Title;

        if (!isLastCardH1Only) {
          const introCardExists = currentH1Section.cards.some(card => card.front === introIcon + currentH1Section.h1Title && card.back === h1ContentBuffer.trim());
          if (!introCardExists) {
            currentH1Section.cards.unshift({
              front: introIcon + currentH1Section.h1Title,
              back: h1ContentBuffer.trim()
            });
          }
        }
      }

      this.h1Sections = this.h1Sections.filter(section => section.cards.length > 0);

      // Create "All Cards" section if multiple H1 sections exist
      if (this.h1Sections.filter(s => !s.isFlatList).length > 1) {
        let allCardsCombined = [];
        this.h1Sections.forEach(section => {
          if (!section.isFlatList) { // Only combine cards from actual H1 sections, not flat lists
            allCardsCombined = allCardsCombined.concat(section.cards);
          }
        });
        if (allCardsCombined.length > 0) {
          this.h1Sections.unshift({h1Title: "All Cards", cards: allCardsCombined, isCombined: true});
        }
      }

    } else { // No H1 tags, treat all H2s as flat list
      const flatCards = [];
      $children.each((index, element) => {
        const $el = $(element);
        if ($el.is('h2')) {
          const cardTitle = $el.text().trim();
          let cardContent = '';
          let node = $el.next();
          while (node.length) {
            // MODIFIED: Stop if next H2 or a footer is encountered
            if (node.is('h2') || node.is('footer')) {
              break;
            }
            cardContent += node.prop('nodeType') === 1 ? node.clone().prop('outerHTML') : node.text();
            node = node.next();
          }
          if (cardTitle) {
            flatCards.push({front: cardTitle, back: cardContent.trim()});
          }
        }
      });
      if (flatCards.length > 0) {
        this.h1Sections.push({h1Title: "All Flashcards", cards: flatCards, isFlatList: true});
      }
    }
    return this.h1Sections.length > 0;
  };


  Flashcards.prototype.showFlashcardModal = function () {
    var self = this;
    var $modal = $('#flashcard-modal');

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
                <div class="flashcard-header-info">
                  <div class="flashcard-current-h1-title"></div>
                </div>
                <div class="flashcard">
                  <div class="flashcard-front"></div>
                  <div class="flashcard-back"></div>
                </div>
              </div>
              <div class="flashcard-navigation">
                <button id="prev-card" class="flashcard-nav-btn">❮</button>
                <button id="next-card" class="flashcard-nav-btn">❯</button>
                <button id="show-card-menu-btn" class="flashcard-nav-btn" title="Show Card List">
                  <i class="fa fa-list-ul"></i>
                </button>
                <button id="auto-read-btn" class="flashcard-nav-btn" title="Toggle Auto Read">
                  <i class="fa fa-volume-up"></i>
                </button>
                <button id="shuffle-cards-btn" class="flashcard-nav-btn" title="Shuffle Cards">
                  <i class="fa fa-random"></i>
                </button>
              </div>
            </div>
            <div id="card-menu-view" class="fc-view view-hidden">
              <button id="back-to-card-display" class="flashcard-back-btn" title="Back to Card">
                <i class="fa fa-arrow-left"></i>
              </button>
              <div class="flashcard-header-info">
                <div class="flashcard-current-h1-title"></div>
                <div class="card-counter-display">
                  <i class="fa fa-file-text"></i> <span id="card-total-display"></span>
                </div>
              </div>
              <ul id="card-menu-list-ul" class="h1-list-ul"></ul>
            </div>
            <button id="close-flashcard" class="close-flashcard"><i class="fa fa-times"></i></button>
          </div>
        </div>`;
      $('body').append(modalHtml);
      $modal = $('#flashcard-modal');

      var $flashcardElement = $modal.find('.flashcard');

      $flashcardElement.off('click.flashcards').on('click.flashcards', function (event) {
        if ($(event.target).closest('.btn-copy').length) {
          return;
        }
        if (self.isTouchingCodeBlock) {
          return;
        }
        if (!self.isAnimating && !self.isViewAnimating && self.currentView === 'flashcard') {
          self.flipCard();
        }
      });

      var touchstartX = 0;
      var touchstartY = 0;
      var touchendX = 0;
      var touchstartTime = 0;
      var minSwipeDistance = 50;
      var maxSwipeTime = 700;
      var maxVerticalOffset = 75;

      $flashcardElement.off('touchstart.flashcardsSwipe touchend.flashcardsSwipe')
        .on('touchstart.flashcardsSwipe', function (event) {
          const target = event.target;
          if (self.isFlipped && $(target).closest('pre').length > 0) {
            self.isTouchingCodeBlock = true;
          } else {
            self.isTouchingCodeBlock = false;
          }
          if (self.isTouchingCodeBlock) {
            return;
          }
          touchstartX = event.originalEvent.changedTouches[0].screenX;
          touchstartY = event.originalEvent.changedTouches[0].screenY;
          touchstartTime = new Date().getTime();
        })
        .on('touchend.flashcardsSwipe', function (event) {
          if (self.isTouchingCodeBlock) {
            self.isTouchingCodeBlock = false;
            return;
          }
          if (touchstartX === 0 && touchstartY === 0) return;
          touchendX = event.originalEvent.changedTouches[0].screenX;
          const touchendY = event.originalEvent.changedTouches[0].screenY;
          var elapsedTime = new Date().getTime() - touchstartTime;
          var deltaX = touchendX - touchstartX;
          var deltaY = touchendY - touchstartY;
          if (elapsedTime <= maxSwipeTime) {
            if (Math.abs(deltaX) >= minSwipeDistance && Math.abs(deltaY) <= maxVerticalOffset) {
              if (deltaX > 0) {
                if (!self.isAnimating && !self.isViewAnimating && self.currentView === 'flashcard') {
                  self.prevCard();
                }
              } else {
                if (!self.isAnimating && !self.isViewAnimating && self.currentView === 'flashcard') {
                  self.nextCard();
                }
              }
            }
          }
          touchstartX = 0;
          touchstartY = 0;
          touchstartTime = 0;
        });

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
      $('#show-card-menu-btn').off('click.flashcards').on('click.flashcards', function (e) {
        e.stopPropagation();
        self._transitionToCardMenuView();
      });
      $('#back-to-card-display').off('click.flashcards').on('click.flashcards', function (e) {
        e.stopPropagation();
        self._transitionFromCardMenuToDisplayView();
      });

      $(document).off('keydown.flashcards').on('keydown.flashcards', function (e) {
        if (!$modal.hasClass('modal-visible') || self.isViewAnimating) return;

        if (e.key === 'Escape') self.hideFlashcardModal();
        if (self.currentView === 'flashcard') {
          if (e.key === 'ArrowLeft') self.prevCard();
          else if (e.key === 'ArrowRight') self.nextCard();
          else if (e.key === ' ') {
            if (!self.isAnimating && !$(e.target).is('input, textarea, button')) {
              if (self.isTouchingCodeBlock) return;
              self.flipCard();
              e.preventDefault();
            }
          }
        }
      });

      $('#auto-read-btn').off('click.flashcards').on('click.flashcards', function (e) {
        e.stopPropagation();
        self.toggleAutoRead();
      });
    }

    if (!this.modalInitialized) {
      if (this.h1Sections.length === 0) {
        if (!this._parseAllHeadingsAndCards()) {
          alert('No H2 headings found to create flashcards!');
          return;
        }
      }

      this.isFlipped = false;
      this.isAnimating = false;
      this.isViewAnimating = false;
      this.isShuffled = false;
      this.isAutoReadActive = false;

      $('#auto-read-btn').removeClass('auto-read-active');
      $('#shuffle-cards-btn').removeClass('shuffle-active');

      $('#h1-selection-view, #flashcard-view, #card-menu-view')
        .removeClass('view-active view-prep-left view-prep-right view-sliding-out-left view-sliding-out-right')
        .addClass('view-hidden');

      if (this.h1Sections.length === 1 && (this.h1Sections[0].isFlatList || (this.h1Sections.length === 1 && !this.h1Sections[0].isCombined))) {
        const section = this.h1Sections[0];
        this.currentCardsSet = [...section.cards];
        this.originalCardsSetOrder = [...section.cards];
        this.currentH1Title = section.h1Title;
        this.currentIndex = 0;
        this.currentView = 'flashcard';
        $('#flashcard-view').removeClass('view-hidden').addClass('view-active');
        this._updateFlashcardViewContent();
      } else if (this.h1Sections.length > 0) {
        this.currentView = 'h1-selection';
        this.currentCardsSet = [];
        this.originalCardsSetOrder = [];
        this.currentH1Title = '';
        this.currentIndex = 0;
        $('#h1-selection-view').removeClass('view-hidden').addClass('view-active');
        this._updateH1SelectionViewContent();
      } else {
        alert('No flashcards could be generated.');
        return;
      }
      this.modalInitialized = true;
    } else {
      $('#auto-read-btn').toggleClass('auto-read-active', this.isAutoReadActive);
      $('#shuffle-cards-btn').toggleClass('shuffle-active', this.isShuffled);

      $('#h1-selection-view, #flashcard-view, #card-menu-view').addClass('view-hidden').removeClass('view-active');

      if (this.currentView === 'flashcard') {
        if (this.currentCardsSet.length === 0 || this.currentIndex >= this.currentCardsSet.length) {
          if (this.h1Sections.length === 0) {
            if (!this._parseAllHeadingsAndCards() || this.h1Sections.length === 0) {
              alert('Error: Flashcard data lost. No content found.');
              this.hideFlashcardModal();
              this.modalInitialized = false;
              return;
            }
          }
          this.currentView = 'h1-selection';
        }
      }

      if (this.currentView === 'flashcard') {
        $('#flashcard-view').removeClass('view-hidden').addClass('view-active');
        const intendedFlipState = this.isFlipped;
        this._updateFlashcardViewContent();
        if (intendedFlipState) {
          this.isFlipped = true;
          $('#flashcard-modal .flashcard').addClass('flipped');
        }
      } else if (this.currentView === 'h1-selection') {
        $('#h1-selection-view').removeClass('view-hidden').addClass('view-active');
        this._updateH1SelectionViewContent();
      } else if (this.currentView === 'card-menu') {
        $('#card-menu-view').removeClass('view-hidden').addClass('view-active');
        this._populateCardMenuView();
      }
    }

    if (!$('body').hasClass('flashcard-modal-open')) {
      this.originalBodyOverflow = $('body').css('overflow');
      $('body').css('overflow', 'hidden').addClass('flashcard-modal-open');
    }

    $modal.css('display', 'flex');
    $modal[0].offsetHeight;
    $modal.addClass('modal-visible');
  };

  Flashcards.prototype.hideFlashcardModal = function () {
    if (this.speechSynthesis) {
      this.speechSynthesis.cancel();
    }

    var $modal = $('#flashcard-modal');
    $modal.removeClass('modal-visible');
    setTimeout(() => {
      $modal.css('display', 'none');
      if ($('body').hasClass('flashcard-modal-open')) {
        $('body').css('overflow', this.originalBodyOverflow).removeClass('flashcard-modal-open');
      }
    }, this.modalAnimationDuration);
  };

  Flashcards.prototype._updateH1SelectionViewContent = function () {
    var $h1List = $('#h1-list').empty();
    if (this.h1Sections.length === 0) {
      $h1List.append('<li>No sections found.</li>');
      return;
    }

    this.h1Sections.forEach((section) => {
      const $li = $('<li>')
        .addClass('h1-list-item')
        .html(`<i class="fa fa-tag"></i> ${section.h1Title} <span class="cards-index">(${section.cards.length})</span>`)
        .on('click', () => {
          if (this.isViewAnimating) return;
          this._transitionToFlashcardView(section);
        });
      $h1List.append($li);
    });
  };

  Flashcards.prototype._transitionToH1SelectionView = function () {
    if (this.speechSynthesis) {
      this.speechSynthesis.cancel();
    }
    if (this.isViewAnimating) return;
    this.isViewAnimating = true;

    const $currentActiveView = $('#' + this.currentView + '-view');
    const $h1View = $('#h1-selection-view');
    this.currentView = 'h1-selection';

    this._updateH1SelectionViewContent();

    if ($currentActiveView.length) {
      $currentActiveView.removeClass('view-active').addClass('view-sliding-out-right');
    }
    $h1View.removeClass('view-hidden view-sliding-out-left view-sliding-out-right').addClass('view-prep-left');

    requestAnimationFrame(() => {
      $h1View[0].offsetHeight;
      $h1View.removeClass('view-prep-left').addClass('view-active');
    });

    setTimeout(() => {
      if ($currentActiveView.length) {
        $currentActiveView.addClass('view-hidden').removeClass('view-sliding-out-right');
      }
      this.isViewAnimating = false;
    }, this.animationViewDuration);
  };

  Flashcards.prototype._updateFlashcardViewContent = function () {
    // The line below was: $('#flashcard-modal .flashcard-current-h1-title').html(...);
    // It's now updated inside the new wrapper, so this specific line targets the correct element.
    $('#flashcard-view .flashcard-header-info .flashcard-current-h1-title').html(`<i class="fa fa-tag"></i> ${this.currentH1Title}`);

    let showBackButton = false;
    const hasCombined = this.h1Sections.some(s => s.isCombined);
    const actualH1Count = this.h1Sections.filter(s => !s.isFlatList && !s.isCombined).length;

    if (hasCombined) {
      showBackButton = true;
    } else if (actualH1Count > 1) {
      showBackButton = true;
    }
    $('#back-to-h1-selection').toggle(showBackButton);

    var flashcardElement = $('#flashcard-modal .flashcard');
    flashcardElement.removeClass('slide-out-left slide-out-right is-sliding-no-transition')
      .css({'transform': 'translateX(0)', 'opacity': '1'});
    this.updateCardContent();
  };

  Flashcards.prototype._transitionToFlashcardView = function (selectedSection) {
    if (this.isViewAnimating) return;
    this.isViewAnimating = true;
    this.currentView = 'flashcard';

    this.currentCardsSet = [...selectedSection.cards];
    this.originalCardsSetOrder = [...selectedSection.cards];
    this.currentH1Title = selectedSection.h1Title;
    this.currentIndex = 0;
    this.isShuffled = false;
    $('#shuffle-cards-btn').removeClass('shuffle-active');

    this._updateFlashcardViewContent();

    const $flashcardView = $('#flashcard-view');
    const $h1View = $('#h1-selection-view');
    const $cardMenuView = $('#card-menu-view');
    $cardMenuView.addClass('view-hidden').removeClass('view-active view-prep-left view-prep-right view-sliding-out-left view-sliding-out-right');

    $h1View.removeClass('view-active').addClass('view-sliding-out-left');
    $flashcardView.removeClass('view-hidden view-sliding-out-left view-sliding-out-right').addClass('view-prep-right');

    requestAnimationFrame(() => {
      $flashcardView[0].offsetHeight;
      $flashcardView.removeClass('view-prep-right').addClass('view-active');
    });

    setTimeout(() => {
      $h1View.addClass('view-hidden').removeClass('view-sliding-out-left');
      this.isViewAnimating = false;
    }, this.animationViewDuration);
  };

  Flashcards.prototype._populateCardMenuView = function () {
    var self = this;
    var $cardListUl = $('#card-menu-list-ul').empty();
    $('#card-menu-view .flashcard-current-h1-title').html(`<i class="fa fa-tag"></i> ${this.currentH1Title}`);
    $('#card-menu-view #card-total-display').text(this.currentCardsSet.length);

    if (!this.currentCardsSet || this.currentCardsSet.length === 0) {
      $cardListUl.append('<li class="h1-list-item">No cards in this section.</li>');
      return;
    }

    this.currentCardsSet.forEach((card, index) => {
      const frontText = $('<div>').html(card.front).text();
      const $li = $('<li>')
        .addClass('h1-list-item')
        // .html(`${frontText} <span class="cards-index">(${index + 1}/${this.currentCardsSet.length})</span>`)
        .html(`<span class="cards-index">${index + 1}. </span> ${frontText}`)
        .on('click', function () {
          if (self.isViewAnimating) return;
          self.jumpToCard(index + 1);
          self._transitionFromCardMenuToDisplayView();
        });
      $cardListUl.append($li);
    });
  };

  Flashcards.prototype._transitionToCardMenuView = function () {
    if (this.isViewAnimating) return;
    this.isViewAnimating = true;
    this.currentView = 'card-menu';

    const $flashcardView = $('#flashcard-view');
    const $cardMenuView = $('#card-menu-view');

    this._populateCardMenuView();

    $flashcardView.removeClass('view-active').addClass('view-sliding-out-left');
    $cardMenuView.removeClass('view-hidden view-sliding-out-left view-sliding-out-right').addClass('view-prep-right');

    requestAnimationFrame(() => {
      $cardMenuView[0].offsetHeight;
      $cardMenuView.removeClass('view-prep-right').addClass('view-active');
    });

    setTimeout(() => {
      $flashcardView.addClass('view-hidden').removeClass('view-sliding-out-left');
      this.isViewAnimating = false;
    }, this.animationViewDuration);
  };

  Flashcards.prototype._transitionFromCardMenuToDisplayView = function (cardIndexToShow) {
    if (this.isViewAnimating) return;
    this.isViewAnimating = true;
    this.currentView = 'flashcard';

    const $flashcardView = $('#flashcard-view');
    const $cardMenuView = $('#card-menu-view');

    this._updateFlashcardViewContent();

    $cardMenuView.removeClass('view-active').addClass('view-sliding-out-right'); // Card menu slides out to the right
    $flashcardView.removeClass('view-hidden view-sliding-out-left view-sliding-out-right').addClass('view-prep-left'); // Flashcard view prepares from the left

    requestAnimationFrame(() => {
      $flashcardView[0].offsetHeight;
      $flashcardView.removeClass('view-prep-left').addClass('view-active'); // Flashcard view slides in from the left (movement towards right)
    });

    setTimeout(() => {
      $cardMenuView.addClass('view-hidden').removeClass('view-sliding-out-right'); // Clean up card menu view class
      this.isViewAnimating = false;
    }, this.animationViewDuration);

    // fix: the back of flashcard doesn't scroll to the top when I click a flashcard from card-menu-list-ul
    $('#flashcard-modal .flashcard .flashcard-back').scrollTop(0);
  };


  Flashcards.prototype._speak = function (text) {
    if (!this.speechSynthesis || !text) {
      return;
    }
    this.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = document.documentElement.lang || 'en-US';
    this.speechSynthesis.speak(utterance);
  };

  Flashcards.prototype.toggleAutoRead = function () {
    if (!this.speechSynthesis) {
      alert('Sorry, your browser does not support text-to-speech.');
      return;
    }
    this.isAutoReadActive = !this.isAutoReadActive;
    const $button = $('#auto-read-btn');
    $button.toggleClass('auto-read-active', this.isAutoReadActive);

    if (this.isAutoReadActive) {
      if (this.currentView === 'flashcard' && this.currentCardsSet.length > 0) {
        const currentCard = this.currentCardsSet[this.currentIndex];
        if (currentCard && currentCard.front) {
          const frontText = $('<div>').html(currentCard.front).text();
          this._speak(frontText);
        }
      }
    } else {
      this.speechSynthesis.cancel();
    }
  };

  Flashcards.prototype.updateCardContent = function () {
    if (!this.currentCardsSet || this.currentCardsSet.length === 0) {
      if (this.speechSynthesis) this.speechSynthesis.cancel();
      $('#flashcard-modal .flashcard-front').html('<h2>No card to display</h2>');
      $('#flashcard-modal .flashcard-back').html('');
      // The old counter display elements are no longer in the header for flashcard-view.
      // The new counter elements on the front face won't be created if there's no card, which is fine.
      // $('#card-current-display').text('0'); // This would target the (now removed) header counter
      // $('#card-total-display').text('0');   // This would target the (now removed) header counter
      return;
    }

    var card = this.currentCardsSet[this.currentIndex];
    var flashcardElement = $('#flashcard-modal .flashcard');
    var frontFace = flashcardElement.find('.flashcard-front');
    var backFace = flashcardElement.find('.flashcard-back');
    var oldFrontTransition, oldBackTransition;

    oldFrontTransition = frontFace.css('transition');
    oldBackTransition = backFace.css('transition');
    frontFace.css('transition', 'none');
    backFace.css('transition', 'none');

    this.isFlipped = false;
    flashcardElement.removeClass('flipped');

    flashcardElement[0].offsetHeight;
    frontFace.css('transition', oldFrontTransition);
    backFace.css('transition', oldBackTransition);

    // Add card counter HTML to the front face
    // Added some inline style for positioning. You might want to move this to your .styl file.
    flashcardElement.find('.flashcard-front').html(
      `<h2>${card.front}</h2>
       <div class="flashcard-hint-icon"><i class="fa fa-lightbulb-o"></i></div>
       <div class="card-counter-display">
         <i class="fa fa-file-text"></i> <span id="card-current-display-on-front"></span> / <span id="card-total-display-on-front"></span>
       </div>`
    );
    flashcardElement.find('.flashcard-back').html(card.back);
    backFace.scrollTop(0);

    // Update the new counter display elements on the front face
    $('#card-current-display-on-front').text(this.currentIndex + 1);
    $('#card-total-display-on-front').text(this.currentCardsSet.length);

    // The original #card-total-display in card-menu-view is updated by _populateCardMenuView

    if (this.isAutoReadActive && card && card.front) {
      const frontText = $('<div>').html(card.front).text();
      this._speak(frontText);
    } else if (this.speechSynthesis) {
      this.speechSynthesis.cancel();
    }
  };

  Flashcards.prototype.flipCard = function () {
    if (this.isAnimating || this.isViewAnimating || this.currentView !== 'flashcard' || !this.currentCardsSet || this.currentCardsSet.length === 0) return;
    this.isFlipped = !this.isFlipped;
    $('#flashcard-modal .flashcard').toggleClass('flipped');
    
    // Load images when flipping to back side
    if (this.isFlipped) {
      $('#flashcard-modal .flashcard-back img[data-src]').each(function() {
        const dataSrc = $(this).attr('data-src');
        if (dataSrc) {
          $(this).attr('src', dataSrc);
        }
      });
    }
  };

  Flashcards.prototype._animateCardSwitch = function (newIndex, maintainFlipState = true) {
    if (this.isAnimating || this.isViewAnimating || this.currentView !== 'flashcard' || !this.currentCardsSet || this.currentCardsSet.length === 0) return;
    if (newIndex < 0 || newIndex >= this.currentCardsSet.length || newIndex === this.currentIndex) return;

    var flashcardElement = $('#flashcard-modal .flashcard');
    const direction = newIndex > this.currentIndex ? 'next' : 'prev';
    var slideOutClass = direction === 'next' ? 'slide-out-left' : 'slide-out-right';
    var slideInStartTransform = direction === 'next' ? 'translateX(100%)' : 'translateX(-100%)';

    this.isAnimating = true;

    flashcardElement.addClass(slideOutClass);

    setTimeout(() => {
      this.currentIndex = newIndex;
      this.updateCardContent(); // This will now also correctly set up the counter on the new card's front

      flashcardElement.addClass('is-sliding-no-transition');
      flashcardElement.css({'transform': slideInStartTransform, 'opacity': '0'});
      flashcardElement[0].offsetHeight;
      flashcardElement.removeClass('is-sliding-no-transition');

      requestAnimationFrame(() => {
        flashcardElement.removeClass(slideOutClass);
        flashcardElement.css({'transform': 'translateX(0)', 'opacity': '1'});
      });
      setTimeout(() => {
        this.isAnimating = false;
      }, this.animationDuration);
    }, this.animationDuration);
  };

  Flashcards.prototype.nextCard = function () {
    if (this.currentView !== 'flashcard') return;
    if (this.currentCardsSet && this.currentIndex < this.currentCardsSet.length - 1) {
      this._animateCardSwitch(this.currentIndex + 1, false);
    }
  };

  Flashcards.prototype.prevCard = function () {
    if (this.currentView !== 'flashcard') return;
    if (this.currentCardsSet && this.currentIndex > 0) {
      this._animateCardSwitch(this.currentIndex - 1, false);
    }
  };

  Flashcards.prototype.toggleShuffle = function () {
    if (this.isAnimating || this.isViewAnimating || this.currentView !== 'flashcard' || !this.currentCardsSet || this.currentCardsSet.length === 0) return;

    this.isShuffled = !this.isShuffled;
    const $shuffleButton = $('#shuffle-cards-btn');

    if (this.isShuffled) {
      for (let i = this.currentCardsSet.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [this.currentCardsSet[i], this.currentCardsSet[j]] = [this.currentCardsSet[j], this.currentCardsSet[i]];
      }
      $shuffleButton.addClass('shuffle-active');
    } else {
      this.currentCardsSet = [...this.originalCardsSetOrder];
      $shuffleButton.removeClass('shuffle-active');
    }
    this.currentIndex = 0;
    this.isFlipped = false;
    $('#flashcard-modal .flashcard').removeClass('flipped slide-out-left slide-out-right is-sliding-no-transition')
      .css({'transform': 'translateX(0)', 'opacity': '1'});
    this.updateCardContent(); // This will correctly update the card and its front-face counter
  };

  Flashcards.prototype.jumpToCard = function (cardNumber) {
    if (this.isAnimating || this.isViewAnimating || !this.currentCardsSet || this.currentCardsSet.length === 0) return;

    var num = parseInt(cardNumber);
    if (isNaN(num) || num < 1 || num > this.currentCardsSet.length) {
      return; // Invalid card number
    }

    const newIndex = num - 1;
    if (newIndex === this.currentIndex && this.currentView === 'flashcard') {
      return; // No change if already on the card and in display view
    }

    if (this.currentView !== 'flashcard' && this.currentView !== 'card-menu') {
      console.warn("Jump initiated from unexpected view:", this.currentView);
      return;
    }

    if (this.currentView === 'flashcard') {
      this._animateCardSwitch(newIndex, false);
    } else if (this.currentView === 'card-menu') {
      this.currentIndex = newIndex;
      // If jumping from card menu, the transition to flashcard view will handle content update.
      // However, if the request implies just updating the index for when it transitions back,
      // this is sufficient. The _transitionFromCardMenuToDisplayView calls _updateFlashcardViewContent.
    }
  };

  window.NexT = window.NexT || {};
  window.NexT.flashcards = new Flashcards();

  $(document).ready(function () {
    if ($('.sidebar-nav-toc').length) {
      var flashcardBtn = '<i class="flashcard-btn fa fa-clone" title="Generate Flashcards"></i>';
      $('.sidebar-nav-toc').append(flashcardBtn);
      $('.flashcard-btn').on('click', function () {
        window.NexT.flashcards.showFlashcardModal();
      });
    }
  });
})();
