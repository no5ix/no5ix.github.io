/* Flashcards - A simple flashcard generator for NexT theme
 * Enhanced with H1 sections, shuffle, jump-to-card, and view transitions.
 */

(function() {
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
    this.originalBodyOverflow = '';
    this.currentView = 'h1Selection'; // 'h1Selection' or 'flashcards'
    this.isShuffled = false; // For shuffle state
    this.isTouchingCodeBlock = false; // NEW: Flag for touch on code block

    this.isAutoReadActive = false;
    this.speechSynthesis = window.speechSynthesis || null;
  };

  Flashcards.prototype._parseAllHeadingsAndCards = function() {
    this.h1Sections = [];
    const postBody = $('.post-body');
    const $children = postBody.children(); // Get all direct children of post-body

    if (postBody.find('h1').length > 0) {
      let currentH1Section = null;
      let h1ContentBuffer = ''; // Buffer for content between H1 and first H2

      for (let i = 0; i < $children.length; i++) {
        const $el = $($children[i]);

        if ($el.is('h1')) {
          // Finalize previous H1 section if it exists and had buffered content
          if (currentH1Section && h1ContentBuffer.trim() !== '') {
            currentH1Section.cards.unshift({ // Add to the beginning of the section's cards
              front: currentH1Section.h1Title, // Or a more generic title
              back: h1ContentBuffer.trim()
            });
          }
          h1ContentBuffer = ''; // Reset buffer for new H1

          // Start new H1 section
          currentH1Section = { h1Title: $el.text().trim(), cards: [] };
          this.h1Sections.push(currentH1Section);

          // Check for content immediately after H1 before any H2 (for H1-only cards)
          let nextNodeIndex = i + 1;
          let h1OnlyContent = '';
          while (nextNodeIndex < $children.length && !$($children[nextNodeIndex]).is('h1') && !$($children[nextNodeIndex]).is('h2')) {
            const $contentNode = $($children[nextNodeIndex]);
            h1OnlyContent += $contentNode.prop('nodeType') === 1 ? $contentNode.clone().prop('outerHTML') : $contentNode.text();
            nextNodeIndex++;
          }
          // If this H1 is followed by another H1 or end of content without any H2s,
          // and h1OnlyContent is not empty, create a card for it.
          if (h1OnlyContent.trim() !== '' && (nextNodeIndex === $children.length || $($children[nextNodeIndex]).is('h1'))) {
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
                front: currentH1Section.h1Title,
                back: h1ContentBuffer.trim()
              });
              h1ContentBuffer = ''; // Clear buffer as we've now hit an H2
            }

            // Process H2 card
            const cardTitle = $el.text().trim();
            let cardContent = '';
            let h2ContentNodeIndex = i + 1;
            while (h2ContentNodeIndex < $children.length && !$($children[h2ContentNodeIndex]).is('h1') && !$($children[h2ContentNodeIndex]).is('h2')) {
              const $contentNode = $($children[h2ContentNodeIndex]);
              cardContent += $contentNode.prop('nodeType') === 1 ? $contentNode.clone().prop('outerHTML') : $contentNode.text();
              h2ContentNodeIndex++;
            }
            if (cardTitle) {
              currentH1Section.cards.push({ front: cardTitle, back: cardContent.trim() });
            }
            i = h2ContentNodeIndex - 1; // Advance main loop counter past H2 content
          } else {
            // Accumulate content for h1ContentBuffer (if no H2 encountered yet in this section)
            // or for general content if H2s are already being processed (though current logic processes H2 content immediately)
            if (currentH1Section.cards.length === 0 || h1ContentBuffer !== '') { // only buffer if no H2s processed yet or if we are actively buffering for intro
              h1ContentBuffer += $el.prop('nodeType') === 1 ? $el.clone().prop('outerHTML') : $el.text();
            }
          }
        }
      }
      // After loop, check if the last H1 section had buffered content
      if (currentH1Section && h1ContentBuffer.trim() !== '' && !currentH1Section.cards.some(card => card.back === h1ContentBuffer.trim())) {
        // Add only if this content wasn't already added as part of an "H1-only" card logic
        if (currentH1Section.cards.length === 0 || currentH1Section.cards[0].front !== currentH1Section.h1Title) {
          currentH1Section.cards.unshift({
            front: currentH1Section.h1Title,
            back: h1ContentBuffer.trim()
          });
        }
      }


      this.h1Sections = this.h1Sections.filter(section => section.cards.length > 0);

      if (this.h1Sections.filter(s => !s.isFlatList).length > 1) {
        let allCardsCombined = [];
        this.h1Sections.forEach(section => {
          if (!section.isFlatList) {
            allCardsCombined = allCardsCombined.concat(section.cards);
          }
        });
        if (allCardsCombined.length > 0) {
          this.h1Sections.unshift({ h1Title: "All Cards", cards: allCardsCombined, isCombined: true });
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
          while (node.length && !node.is('h2')) { // Collect content until next H2 or end
            cardContent += node.prop('nodeType') === 1 ? node.clone().prop('outerHTML') : node.text();
            node = node.next();
          }
          if (cardTitle) {
            flatCards.push({ front: cardTitle, back: cardContent.trim() });
          }
        }
      });
      if (flatCards.length > 0) {
        this.h1Sections.push({ h1Title: "All Flashcards", cards: flatCards, isFlatList: true });
      }
    }
    return this.h1Sections.length > 0;
  };

  Flashcards.prototype.showFlashcardModal = function () {
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
    this.isShuffled = false; // Reset shuffle on modal open

    this.isAutoReadActive = false; // always start with auto-read off
    $('#auto-read-btn').removeClass('active'); // Match the state above

    if (!$modal.length) {
      // ... (modalHtml definition) ...
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
                <div class="flashcard">
                  <div class="flashcard-front"></div>
                  <div class="flashcard-back"></div>
                </div>
              </div>
              <div class="flashcard-navigation">
                <button id="auto-read-btn" class="flashcard-nav-btn" title="Toggle Auto Read">
                  <i class="fa fa-volume-up"></i>
                </button>
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

      var $flashcardElement = $modal.find('.flashcard');

      $flashcardElement.off('click.flashcards').on('click.flashcards', function () {
        // Prevent flip if a swipe was just handled on a code block,
        // or if a swipe is in progress that didn't originate from a code block
        // but we want to give swipe precedence.
        if (self.isTouchingCodeBlock) { // If touch started on code block, click might be unintentional
          return;
        }
        if (!self.isAnimating && !self.isViewAnimating) {
          self.flipCard();
        }
      });

      // --- BEGIN SWIPE FUNCTIONALITY ---
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
          // Check if the touch started on a <pre> tag or its descendant,
          // but only if the card is currently flipped to the back.
          if (self.isFlipped && $(target).closest('pre').length > 0) {
            self.isTouchingCodeBlock = true;
          } else {
            self.isTouchingCodeBlock = false;
          }

          if (self.isTouchingCodeBlock) {
            // If on a code block, don't record swipe details for card navigation
            return;
          }

          touchstartX = event.originalEvent.changedTouches[0].screenX;
          touchstartY = event.originalEvent.changedTouches[0].screenY;
          touchstartTime = new Date().getTime();
        })
        .on('touchend.flashcardsSwipe', function (event) {
          if (self.isTouchingCodeBlock) {
            // Reset flag and do nothing if the touch started on a code block
            self.isTouchingCodeBlock = false;
            return;
          }

          // If touchstartX was not set (because touch started on code block and returned early)
          if (touchstartX === 0 && touchstartY === 0) return;


          touchendX = event.originalEvent.changedTouches[0].screenX;
          const touchendY = event.originalEvent.changedTouches[0].screenY;

          var elapsedTime = new Date().getTime() - touchstartTime;
          var deltaX = touchendX - touchstartX;
          var deltaY = touchendY - touchstartY;

          if (elapsedTime <= maxSwipeTime) {
            if (Math.abs(deltaX) >= minSwipeDistance && Math.abs(deltaY) <= maxVerticalOffset) {
              if (deltaX > 0) {
                if (!self.isAnimating && !self.isViewAnimating && self.currentView === 'flashcards') {
                  self.prevCard();
                }
              } else {
                if (!self.isAnimating && !self.isViewAnimating && self.currentView === 'flashcards') {
                  self.nextCard();
                }
              }
            }
          }
          // Reset for next swipe
          touchstartX = 0;
          touchstartY = 0;
          touchstartTime = 0;
        });
      // --- END SWIPE FUNCTIONALITY ---

      // ... (rest of the event listeners: prev-card, next-card, etc.)
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
        if ($modal.is(':visible') && !self.isViewAnimating) {
          if (e.key === 'Escape') self.hideFlashcardModal();
          if ($('#flashcard-view').hasClass('view-active')) {
            if (e.key === 'ArrowLeft') self.prevCard();
            else if (e.key === 'ArrowRight') self.nextCard();
            else if (e.key === ' ') {
              if (!self.isAnimating && !$(e.target).is('input, textarea, button')) {
                // Also check isTouchingCodeBlock here if spacebar flip is an issue
                if (self.isTouchingCodeBlock) return;
                self.flipCard();
                e.preventDefault();
              }
            }
          }
        }
      });

      $('#auto-read-btn').off('click.flashcards').on('click.flashcards', function(e) {
        e.stopPropagation();
        self.toggleAutoRead();
      });
    }

    // ... (rest of showFlashcardModal logic) ...
    $('#h1-selection-view, #flashcard-view')
      .removeClass('view-active view-prep-left view-prep-right view-sliding-out-left view-sliding-out-right')
      .addClass('view-hidden');
    $('#shuffle-cards-btn').removeClass('shuffle-active');

    if (this.h1Sections.length === 1 && (this.h1Sections[0].isFlatList || this.h1Sections.length === 1 && !this.h1Sections[0].isCombined)) {
      const section = this.h1Sections[0];
      this.currentCardsSet = [...section.cards];
      this.originalCardsSetOrder = [...section.cards];
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
    $modal.fadeIn(400);
  };


  Flashcards.prototype.hideFlashcardModal = function() {
    if (this.speechSynthesis) {
      this.speechSynthesis.cancel();
    }
    // It might also be good to reset isAutoReadActive and button state here
    this.isAutoReadActive = false;
    $('#auto-read-btn').removeClass('active');
    // However, the user might want it to persist for the next session. Let's leave it for now.
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
    if (this.speechSynthesis) {
      this.speechSynthesis.cancel();
    }
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

  Flashcards.prototype._speak = function (text) {
    if (!this.speechSynthesis || !text) {
      return;
    }
    // Cancel any ongoing speech
    this.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    // Attempt to use the document's language, fallback to English
    utterance.lang = document.documentElement.lang || 'en-US';
    // You can add more configurations to utterance if needed (e.g., rate, pitch)

    this.speechSynthesis.speak(utterance);
  };

  Flashcards.prototype.toggleAutoRead = function () {
    if (!this.speechSynthesis) {
      alert('Sorry, your browser does not support text-to-speech.');
      return;
    }
    this.isAutoReadActive = !this.isAutoReadActive;
    const $button = $('#auto-read-btn');
    $button.toggleClass('active', this.isAutoReadActive);

    if (this.isAutoReadActive) {
      // If turning on and a card is visible, read its front
      if (this.currentView === 'flashcards' && this.currentCardsSet.length > 0) {
        const currentCard = this.currentCardsSet[this.currentIndex];
        // card.front should be the raw text for the question
        if (currentCard && currentCard.front) {
          // Extract text if H2 contains icons or other HTML
          const frontText = $('<div>').html(currentCard.front).text(); // Get clean text
          this._speak(frontText);
        }
      }
    } else {
      // If turning off, cancel any speech
      this.speechSynthesis.cancel();
    }
  };

  Flashcards.prototype.updateCardContent = function () {
    if (!this.currentCardsSet || this.currentCardsSet.length === 0) {
      // ... (handle no cards) ...
      if (this.speechSynthesis) this.speechSynthesis.cancel(); // Stop speech if no cards
      return;
    }
    // ... (enable buttons) ...

    var card = this.currentCardsSet[this.currentIndex];
    var flashcardElement = $('#flashcard-modal .flashcard');
    this.isFlipped = false;
    flashcardElement.removeClass('flipped');

    flashcardElement.find('.flashcard-front').html(
      `<h2>${card.front}</h2>
       <div class="flashcard-hint-icon"><i class="fa fa-lightbulb-o"></i></div>`
    );

    flashcardElement.find('.flashcard-back').html(card.back);
    $('#jump-to-card-input').val(this.currentIndex + 1);
    $('#jump-to-card-input').attr('max', this.currentCardsSet.length);
    $('#card-counter-total').text('/ ' + this.currentCardsSet.length);

    // --- NEW: Auto Read ---
    if (this.isAutoReadActive && card && card.front) {
      this._speak(card.front); // Assuming card.front is clean text
    } else if (this.speechSynthesis) { // If auto-read is off, ensure any previous speech is cancelled
      this.speechSynthesis.cancel();
    }
    // --- END NEW ---
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
