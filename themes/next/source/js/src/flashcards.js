/* Flashcards - A simple flashcard generator for NexT theme
 * Enhanced with H1 sections, shuffle, and jump-to-card.
 */

(function() {
  'use strict';

  var Flashcards = function() {
    this.h1Sections = []; // Array of { h1Title: string, cards: [], isFlatList?: boolean }
    this.currentCardsSet = []; // The set of cards currently being viewed
    this.currentIndex = 0;
    this.currentH1Title = ''; // Title of the current H1 section
    this.isFlipped = false;
    this.isAnimating = false;
    this.animationDuration = 150; // ms, for card sliding
    this.originalBodyOverflow = '';
    this.currentView = 'h1Selection'; // 'h1Selection' or 'flashcards'
  };

  Flashcards.prototype._parseAllHeadingsAndCards = function() {
    this.h1Sections = [];
    const postBody = $('.post-body');
    const $headingsAndContentNodes = postBody.children(); // Get all direct children

    if (postBody.find('h1').length > 0) {
      let currentH1Section = null;
      $headingsAndContentNodes.each((index, element) => {
        const $el = $(element);
        if ($el.is('h1')) {
          currentH1Section = {
            h1Title: $el.text().trim(),
            cards: []
          };
          this.h1Sections.push(currentH1Section);
        } else if ($el.is('h2') && currentH1Section) {
          const cardTitle = $el.text().trim();
          let cardContent = '';
          let node = $el.next();
          while (node.length && !node.is('h1') && !node.is('h2')) {
            cardContent += node.prop('nodeType') === 1 ? node.clone().prop('outerHTML') : node.text();
            node = node.next();
          }
          if (cardTitle) { // Ensure H2 has a title
            currentH1Section.cards.push({ front: cardTitle, back: cardContent });
          }
        }
      });
      this.h1Sections = this.h1Sections.filter(section => section.cards.length > 0);
    } else {
      // No H1s, treat all H2s as a single flat list
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
        if (cardTitle) { // Ensure H2 has a title
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

    var $modal = $('#flashcard-modal');

    if (!$modal.length) {
      var modalHtml = `
        <div id="flashcard-modal" class="flashcard-modal">
          <div class="flashcard-container">
            <div id="h1-selection-view" style="display: none;">
              <h3 class="h1-selection-title">Select a Section:</h3>
              <ul id="h1-list" class="h1-list-ul"></ul>
            </div>
            <div id="flashcard-view" style="display: none;">
              <button id="back-to-h1-selection" class="flashcard-back-btn" title="Back to Sections">
                <i class="fa fa-arrow-left"></i> Sections
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
      $modal = $('#flashcard-modal').hide(); // Hide before first fadeIn

      // Event Listeners
      $modal.find('.flashcard').on('click', function() {
        if (!self.isAnimating) self.flipCard();
      });
      $('#prev-card').on('click', function(e) { e.stopPropagation(); self.prevCard(); });
      $('#next-card').on('click', function(e) { e.stopPropagation(); self.nextCard(); });
      $('#close-flashcard').on('click', function() { self.hideFlashcardModal(); });
      $('#shuffle-cards-btn').on('click', function(e) { e.stopPropagation(); self.shuffleCards(); });
      $('#back-to-h1-selection').on('click', function(e) { e.stopPropagation(); self._renderH1SelectionView(); });
      $('#jump-to-card-input').on('change', function(e) { self.jumpToCard(parseInt($(this).val())); });
      $('#jump-to-card-input').on('keypress', function(e) {
        if (e.which === 13) { // Enter key
          self.jumpToCard(parseInt($(this).val()));
          $(this).blur(); // Remove focus
        }
      });

      $(document).on('keydown', function(e) {
        if ($modal.is(':visible')) {
          if (e.key === 'Escape') self.hideFlashcardModal();
          if ($('#flashcard-view').is(':visible')) { // Only apply these if flashcards are visible
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
    }

    // Determine initial view
    if (this.h1Sections.length === 1 && (this.h1Sections[0].isFlatList || this.h1Sections.length === 1)) {
      this.currentCardsSet = this.h1Sections[0].cards;
      this.currentH1Title = this.h1Sections[0].h1Title;
      this.currentIndex = 0;
      this._renderFlashcardView();
    } else if (this.h1Sections.length > 0) {
      this._renderH1SelectionView();
    } else {
      alert('No flashcards could be generated.');
      this.hideFlashcardModal(); // Close if no cards
      return;
    }

    // Prevent body scroll
    if (!$('body').hasClass('flashcard-modal-open')) {
      this.originalBodyOverflow = $('body').css('overflow');
      $('body').css('overflow', 'hidden').addClass('flashcard-modal-open');
    }
    $modal.fadeIn(200);
  };

  Flashcards.prototype._renderH1SelectionView = function() {
    this.currentView = 'h1Selection';
    $('#flashcard-view').hide();
    $('#h1-selection-view').show();
    var $h1List = $('#h1-list').empty();

    if (this.h1Sections.length === 0) {
      $h1List.append('<li>No sections found.</li>');
      return;
    }

    this.h1Sections.forEach((section, index) => {
      const $li = $('<li>')
        .addClass('h1-list-item')
        .text(`${section.h1Title} (${section.cards.length} cards)`)
        .attr('data-index', index)
        .on('click', () => {
          this.currentCardsSet = section.cards;
          this.currentH1Title = section.h1Title;
          this.currentIndex = 0;
          this._renderFlashcardView();
        });
      $h1List.append($li);
    });
    // Hide back button if only one H1 section and it's not a flat list (meaning it's a genuine single H1)
    // Or if there are no H1 sections to go back to (e.g. flat list mode)
    if (this.h1Sections.length <= 1 && !this.h1Sections[0]?.isFlatList) {
      $('#back-to-h1-selection').hide();
    } else {
      $('#back-to-h1-selection').show();
    }
  };

  Flashcards.prototype._renderFlashcardView = function() {
    this.currentView = 'flashcards';
    $('#h1-selection-view').hide();
    $('#flashcard-view').show();

    // Show/hide back button
    const showBackButton = this.h1Sections.length > 1 || (this.h1Sections.length === 1 && !this.h1Sections[0].isFlatList);
    $('#back-to-h1-selection').toggle(showBackButton);

    $('.flashcard-current-h1-title').text(this.currentH1Title);

    var flashcardElement = $('#flashcard-modal .flashcard');
    flashcardElement.removeClass('slide-out-left slide-out-right is-sliding-no-transition');
    flashcardElement.css({'transform': 'translateX(0)', 'opacity': '1'});
    this.updateCardContent();
  };

  Flashcards.prototype.hideFlashcardModal = function() {
    $('#flashcard-modal').fadeOut(200, () => {
      if ($('body').hasClass('flashcard-modal-open')) {
        $('body').css('overflow', this.originalBodyOverflow).removeClass('flashcard-modal-open');
      }
    });
  };

  Flashcards.prototype.updateCardContent = function() {
    if (!this.currentCardsSet || this.currentCardsSet.length === 0) {
      // Handle empty card set, perhaps show a message or disable navigation
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
    if (this.isAnimating || !this.currentCardsSet || this.currentCardsSet.length === 0) return;
    this.isFlipped = !this.isFlipped;
    $('#flashcard-modal .flashcard').toggleClass('flipped');
  };

  Flashcards.prototype._animateCardSwitch = function(direction) {
    if (this.isAnimating || !this.currentCardsSet || this.currentCardsSet.length === 0) return;

    var flashcardElement = $('#flashcard-modal .flashcard');
    var slideOutClass = direction === 'next' ? 'slide-out-left' : 'slide-out-right';
    var slideInStartTransform = direction === 'next' ? 'translateX(100%)' : 'translateX(-100%)';

    this.isAnimating = true;
    flashcardElement.addClass(slideOutClass);

    setTimeout(() => {
      if (direction === 'next') this.currentIndex++;
      else this.currentIndex--;
      this.updateCardContent();

      flashcardElement.addClass('is-sliding-no-transition');
      flashcardElement.css({'transform': slideInStartTransform, 'opacity': '0'});
      flashcardElement[0].offsetHeight; // Force reflow
      flashcardElement.removeClass('is-sliding-no-transition slide-out-class');

      requestAnimationFrame(() => {
        flashcardElement.removeClass(slideOutClass); // remove after reflow, before new animation
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

  Flashcards.prototype.shuffleCards = function() {
    if (this.isAnimating || !this.currentCardsSet || this.currentCardsSet.length === 0) return;
    // Fisher-Yates Shuffle
    for (let i = this.currentCardsSet.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.currentCardsSet[i], this.currentCardsSet[j]] = [this.currentCardsSet[j], this.currentCardsSet[i]];
    }
    this.currentIndex = 0;
    this.isFlipped = false;
    $('#flashcard-modal .flashcard').removeClass('flipped slide-out-left slide-out-right is-sliding-no-transition')
      .css({'transform': 'translateX(0)', 'opacity': '1'});
    this.updateCardContent();
  };

  Flashcards.prototype.jumpToCard = function(cardNumber) {
    if (this.isAnimating || !this.currentCardsSet || this.currentCardsSet.length === 0) return;
    var num = parseInt(cardNumber);
    if (isNaN(num) || num < 1 || num > this.currentCardsSet.length) {
      // Invalid input, revert to current card number
      $('#jump-to-card-input').val(this.currentIndex + 1);
      return;
    }
    this.currentIndex = num - 1;
    this.isFlipped = false;
    $('#flashcard-modal .flashcard').removeClass('flipped slide-out-left slide-out-right is-sliding-no-transition')
      .css({'transform': 'translateX(0)', 'opacity': '1'});
    this.updateCardContent();
  };

  // Initialize and expose to window
  window.NexT = window.NexT || {};
  window.NexT.flashcards = new Flashcards();

  $(document).ready(function() {
    if ($('.sidebar-nav-toc').length) {
      var flashcardBtn = '<i class="flashcard-btn fa fa-clone" title="Generate Flashcards"></i>';
      $('.sidebar-nav-toc').append(flashcardBtn);
      $('.flashcard-btn').on('click', function() {
        window.NexT.flashcards.showFlashcardModal();
      });
    }
  });
})();
