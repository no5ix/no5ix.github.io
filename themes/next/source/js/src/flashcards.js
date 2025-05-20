/* Flashcards - A simple flashcard generator for NexT theme
 * Created based on the blog post content
 */

(function() {
  'use strict';

  var Flashcards = function() {
    this.cards = [];
    this.currentIndex = 0;
    this.isFlipped = false;
    this.isAnimating = false; // Flag to prevent animation overlaps
    this.animationDuration = 150; // ms, for card sliding. Should match CSS transform transition.
                                  // Note: CSS for .flashcard has 0.2s (200ms)
    this.originalBodyOverflow = ''; // To store the original body overflow style
  };

  Flashcards.prototype.generateCards = function() {
    // ... (existing code)
    var self = this;
    var headings = $('.post-body h2');

    // Clear previous cards
    this.cards = [];

    // Generate cards from h2 headings and their content
    headings.each(function(index) {
      var heading = $(this);
      var title = heading.text();

      // Get content until next h2 or end of post
      var content = '';
      var node = heading.next();

      while (node.length && !node.is('h2')) {
        // Clone the node to avoid modifying the original
        var clonedNode = node.clone();

        // If it's an element node, get its HTML
        if (node.prop('nodeType') === 1) {
          content += clonedNode.prop('outerHTML');
        }

        node = node.next();
      }

      self.cards.push({
        front: title,
        back: content
      });
    });

    return this.cards.length > 0;
  };

  Flashcards.prototype.showFlashcardModal = function() {
    var self = this;

    if (!this.generateCards()) {
      alert('No headings found to create flashcards!');
      return;
    }

    this.currentIndex = 0;
    this.isFlipped = false;
    this.isAnimating = false;

    var $modal = $('#flashcard-modal'); // Cache selector

    if (!$modal.length) {
      var modalHtml =
        '<div id="flashcard-modal" class="flashcard-modal">' +
        '  <div class="flashcard-container">' +
        '    <div class="flashcard">' +
        '      <div class="flashcard-front"></div>' +
        '      <div class="flashcard-back"></div>' +
        '    </div>' +
        '    <div class="flashcard-navigation">' +
        '      <button id="prev-card" class="flashcard-nav-btn">❮</button>' +
        '      <span id="card-counter"></span>' +
        '      <button id="next-card" class="flashcard-nav-btn">❯</button>' +
        '    </div>' +
        '    <button id="close-flashcard" class="close-flashcard"><i class="fa fa-times"></i></button>' +
        '  </div>' +
        '</div>';

      $('body').append(modalHtml);
      $modal = $('#flashcard-modal'); // Re-select after appending

      // --- BEGIN MODIFICATION ---
      $modal.hide(); // Explicitly hide the modal before the first fadeIn
      // --- END MODIFICATION ---

      // Attach event listeners
      // Use $modal.find() for better scoping if elements are inside the modal
      $modal.find('.flashcard').on('click', function() {
        if (!self.isAnimating) {
          self.flipCard();
        }
      });

      // IDs are unique, so direct selection is fine, but can also scope if preferred
      $('#prev-card').on('click', function(e) {
        e.stopPropagation();
        self.prevCard();
      });

      $('#next-card').on('click', function(e) {
        e.stopPropagation();
        self.nextCard();
      });

      $('#close-flashcard').on('click', function() {
        self.hideFlashcardModal();
      });

      // Keydown listener is global
      $(document).on('keydown', function(e) {
        if ($modal.is(':visible')) { // Use $modal here
          if (e.key === 'Escape') {
            self.hideFlashcardModal();
          } else if (e.key === 'ArrowLeft') {
            self.prevCard();
          } else if (e.key === 'ArrowRight') {
            self.nextCard();
          } else if (e.key === ' ') {
            if (!self.isAnimating) {
              self.flipCard();
            }
            e.preventDefault();
          }
        }
      });
    }

    // Ensure the card is in its default position when first shown or when navigating
    var flashcardElement = $modal.find('.flashcard');
    flashcardElement.removeClass('slide-out-left slide-out-right is-sliding-no-transition');
    flashcardElement.css({
      'transform': 'translateX(0)',
      'opacity': '1'
    });

    // Prevent body scroll when modal is open
    if (!$('body').hasClass('flashcard-modal-open')) {
      this.originalBodyOverflow = $('body').css('overflow');
      $('body').css('overflow', 'hidden').addClass('flashcard-modal-open');
    }

    this.updateCardContent();
    $modal.fadeIn(); // Default duration is 400ms, or you can specify e.g., $modal.fadeIn(300);
  };

  Flashcards.prototype.hideFlashcardModal = function() {
    var $modal = $('#flashcard-modal');
    // Restore body scroll after modal is hidden
    $modal.fadeOut(() => { // fadeOut will set display: none at the end
      if ($('body').hasClass('flashcard-modal-open')) {
        $('body').css('overflow', this.originalBodyOverflow).removeClass('flashcard-modal-open');
      }
    });
  };

  // ... (rest of the Flashcards.prototype methods: updateCardContent, flipCard, _animateCardSwitch, nextCard, prevCard) ...
  // Make sure they use $modal.find() or specific IDs as appropriate.
  // For example, in updateCardContent:
  Flashcards.prototype.updateCardContent = function() {
    var card = this.cards[this.currentIndex];
    // Ensure $modal is defined or select it again if not passed/cached at this scope
    var flashcardElement = $('#flashcard-modal .flashcard'); // Or use a cached $modal.find()

    this.isFlipped = false;
    flashcardElement.removeClass('flipped');

    flashcardElement.find('.flashcard-front').html('<h2>' + card.front + '</h2>');
    flashcardElement.find('.flashcard-back').html(card.back);

    $('#card-counter').text((this.currentIndex + 1) + ' / ' + this.cards.length);
  };

  Flashcards.prototype.flipCard = function() {
    if (this.isAnimating) return;
    this.isFlipped = !this.isFlipped;
    $('#flashcard-modal .flashcard').toggleClass('flipped'); // Or use a cached $modal.find()
  };

  Flashcards.prototype._animateCardSwitch = function(direction) {
    if (this.isAnimating) {
      return;
    }
    // Or use a cached $modal.find()
    var flashcardElement = $('#flashcard-modal .flashcard');
    var slideOutClass = direction === 'next' ? 'slide-out-left' : 'slide-out-right';
    var slideInStartTransform = direction === 'next' ? 'translateX(100%)' : 'translateX(-100%)';

    this.isAnimating = true;

    flashcardElement.addClass(slideOutClass);

    setTimeout(() => {
      if (direction === 'next') {
        this.currentIndex++;
      } else {
        this.currentIndex--;
      }
      this.updateCardContent();

      flashcardElement.addClass('is-sliding-no-transition');
      flashcardElement.css({
        'transform': slideInStartTransform,
        'opacity': '0'
      });

      flashcardElement[0].offsetHeight;

      flashcardElement.removeClass('is-sliding-no-transition');
      flashcardElement.removeClass(slideOutClass);

      requestAnimationFrame(() => {
        flashcardElement.css({
          'transform': 'translateX(0)',
          'opacity': '1'
        });
      });

      setTimeout(() => {
        this.isAnimating = false;
      }, this.animationDuration); // This duration is for card slide

    }, this.animationDuration); // This duration is for card slide
  };

  Flashcards.prototype.nextCard = function() {
    if (this.currentIndex < this.cards.length - 1) {
      this._animateCardSwitch('next');
    }
  };

  Flashcards.prototype.prevCard = function() {
    if (this.currentIndex > 0) {
      this._animateCardSwitch('prev');
    }
  };


  // Initialize and expose to window
  window.NexT = window.NexT || {};
  window.NexT.flashcards = new Flashcards();

  // Add button to sidebar
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
