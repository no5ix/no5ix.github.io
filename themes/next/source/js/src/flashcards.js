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
      // HTML structure remains largely the same as your previous version
      var modalHtml = `
        <div id="flashcard-modal" class="flashcard-modal">
          <div class="flashcard-container">
            <div id="h1-selection-view" class="fc-view view-hidden">
              <h3 class="h1-selection-title">Select a Section:</h3>
              <ul id="h1-list" class="h1-list-ul"></ul>
            </div>
            <div id="flashcard-view" class="fc-view view-hidden">
              <button id="back-to-h1-selection" class="flashcard-back-btn" title="Back to Sections">
                <i class="fa fa-arrow-left"></i>
              </button>
              <div class="flashcard-content-area">
                <div class="flashcard-current-h1-title"></div>
                <div class="flashcard">
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
      $modal = $('#flashcard-modal').hide();

      // Event Listeners
      $modal.find('.flashcard').on('click', function() { if (!self.isAnimating && !self.isViewAnimating) self.flipCard(); });
      $('#prev-card').on('click', function(e) { e.stopPropagation(); self.prevCard(); });
      $('#next-card').on('click', function(e) { e.stopPropagation(); self.nextCard(); });
      $('#close-flashcard').on('click', function() { self.hideFlashcardModal(); });
      $('#shuffle-cards-btn').on('click', function(e) { e.stopPropagation(); self.toggleShuffle(); });
      $('#back-to-h1-selection').on('click', function(e) { e.stopPropagation(); self._transitionToH1SelectionView(); });
      $('#jump-to-card-input').on('change', function() { self.jumpToCard(parseInt($(this).val())); });
      $('#jump-to-card-input').on('keypress', function(e) {
        if (e.which === 13) { self.jumpToCard(parseInt($(this).val())); $(this).blur(); }
      });

      $(document).on('keydown', function(e) {
        if ($modal.is(':visible') && !self.isViewAnimating) {
          if (e.key === 'Escape') self.hideFlashcardModal();
          if ($('#flashcard-view').hasClass('view-active')) {
            if (e.key === 'ArrowLeft') self.prevCard();
            else if (e.key === 'ArrowRight') self.nextCard();
            else if (e.key === ' ') {
              if (!self.isAnimating && !$(e.target).is('input, textarea, button')) {
                self.flipCard(); e.preventDefault();
              }
            }
          }
        }
      });
    }

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
      this.hideFlashcardModal(); return;
    }

    if (!$('body').hasClass('flashcard-modal-open')) {
      this.originalBodyOverflow = $('body').css('overflow');
      $('body').css('overflow', 'hidden').addClass('flashcard-modal-open');
    }
    $modal.fadeIn(200);
  };

  Flashcards.prototype._updateH1SelectionViewContent = function() {
    var $h1List = $('#h1-list').empty();
    if (this.h1Sections.length === 0) {
      $h1List.append('<li>No sections found.</li>'); return;
    }

    this.h1Sections.forEach((section) => {
      const $li = $('<li>')
        .addClass('h1-list-item')
        .text(`${section.h1Title} (${section.cards.length})`)
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
    $('.flashcard-current-h1-title').text(this.currentH1Title);

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

  Flashcards.prototype.hideFlashcardModal = function() {
    $('#flashcard-modal').fadeOut(200, () => {
      if ($('body').hasClass('flashcard-modal-open')) {
        $('body').css('overflow', this.originalBodyOverflow).removeClass('flashcard-modal-open');
      }
      // Reset views to hidden for next open
      $('#h1-selection-view, #flashcard-view')
        .removeClass('view-active view-prep-left view-prep-right view-sliding-out-left view-sliding-out-right')
        .addClass('view-hidden');
    });
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
    flashcardElement.find('.flashcard-front').html('<h2>' + card.front + '</h2>');
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
