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
    this.animationDuration = 400; // ms, should match CSS transition duration for transform
  };

  Flashcards.prototype.generateCards = function() {
    // ... (keep existing generateCards method as is)
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
    // ... (keep most of showFlashcardModal method as is, just ensure isAnimating is reset)
    var self = this;

    if (!this.generateCards()) {
      alert('No headings found to create flashcards!');
      return;
    }

    this.currentIndex = 0;
    this.isFlipped = false;
    this.isAnimating = false; // Reset animation flag

    if (!$('#flashcard-modal').length) {
      var modalHtml =
        '<div id="flashcard-modal" class="flashcard-modal">' +
        '  <div class="flashcard-container">' +
        '    <div class="flashcard">' + // This is the element we'll animate
        '      <div class="flashcard-front"></div>' +
        '      <div class="flashcard-back"></div>' +
        '    </div>' +
        '    <div class="flashcard-navigation">' +
        '      <button id="prev-card" class="flashcard-nav-btn">←</button>' +
        '      <span id="card-counter"></span>' +
        '      <button id="next-card" class="flashcard-nav-btn">→</button>' +
        '    </div>' +
        '    <button id="close-flashcard" class="close-flashcard"><i class="fa fa-times"></i></button>' +
        '  </div>' +
        '</div>';

      $('body').append(modalHtml);

      $('#flashcard-modal .flashcard').on('click', function() {
        if (!self.isAnimating) { // Prevent flipping during slide animation
          self.flipCard();
        }
      });

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

      $(document).on('keydown', function(e) {
        if ($('#flashcard-modal').is(':visible')) {
          if (e.key === 'Escape') {
            self.hideFlashcardModal();
          } else if (e.key === 'ArrowLeft') {
            self.prevCard();
          } else if (e.key === 'ArrowRight') {
            self.nextCard();
          } else if (e.key === ' ') {
            if (!self.isAnimating) { // Prevent flipping during slide animation
              self.flipCard();
            }
            e.preventDefault();
          }
        }
      });
    }

    // Ensure the card is in its default position when first shown
    var flashcardElement = $('#flashcard-modal .flashcard');
    flashcardElement.removeClass('slide-out-left slide-out-right is-sliding-no-transition');
    flashcardElement.css({
      'transform': 'translateX(0)',
      'opacity': '1'
    });

    this.updateCardContent();
    $('#flashcard-modal').fadeIn();
  };

  Flashcards.prototype.hideFlashcardModal = function() {
    $('#flashcard-modal').fadeOut();
  };

  Flashcards.prototype.updateCardContent = function() {
    var card = this.cards[this.currentIndex];
    var flashcardElement = $('#flashcard-modal .flashcard');

    this.isFlipped = false;
    flashcardElement.removeClass('flipped');

    // It's important that .flashcard-front and .flashcard-back are direct children
    // or that their container doesn't interfere with the .flashcard's transform.
    flashcardElement.find('.flashcard-front').html('<h2>' + card.front + '</h2>');
    flashcardElement.find('.flashcard-back').html(card.back);

    $('#card-counter').text((this.currentIndex + 1) + ' / ' + this.cards.length);
  };

  Flashcards.prototype.flipCard = function() {
    if (this.isAnimating) return; // Don't allow flip if sliding
    this.isFlipped = !this.isFlipped;
    $('#flashcard-modal .flashcard').toggleClass('flipped');
  };

  Flashcards.prototype._animateCardSwitch = function(direction) {
    if (this.isAnimating) {
      return;
    }

    var flashcardElement = $('#flashcard-modal .flashcard');
    var slideOutClass = direction === 'next' ? 'slide-out-left' : 'slide-out-right';
    var slideInStartTransform = direction === 'next' ? 'translateX(100%)' : 'translateX(-100%)';

    this.isAnimating = true;

    // 1. Apply slide-out animation class
    flashcardElement.addClass(slideOutClass);

    // 2. Wait for slide-out animation to complete
    setTimeout(() => {
      // 3. Update card index
      if (direction === 'next') {
        this.currentIndex++;
      } else {
        this.currentIndex--;
      }
      // 4. Update card content (this also resets flip state)
      this.updateCardContent();

      // 5. Prepare for slide-in:
      //    a. Add class to disable transition for instant repositioning
      flashcardElement.addClass('is-sliding-no-transition');
      //    b. Instantly move card off-screen to the opposite side and make it transparent
      flashcardElement.css({
        'transform': slideInStartTransform,
        'opacity': '0'
      });

      //    c. Force reflow/repaint. Accessing offsetHeight is a common trick.
      flashcardElement[0].offsetHeight;

      //    d. Remove helper class to re-enable transitions for slide-in
      flashcardElement.removeClass('is-sliding-no-transition');
      //    e. Remove the slide-out class (it's done its job)
      flashcardElement.removeClass(slideOutClass);

      // 6. Trigger slide-in animation (back to default state: translateX(0), opacity: 1)
      //    Using requestAnimationFrame can sometimes help ensure the style changes for
      //    instant positioning are rendered before the transition for slide-in starts.
      requestAnimationFrame(() => {
        flashcardElement.css({
          'transform': 'translateX(0)',
          'opacity': '1'
        });
      });


      // 7. After slide-in animation duration, reset isAnimating flag
      setTimeout(() => {
        this.isAnimating = false;
      }, this.animationDuration);

    }, this.animationDuration); // This timeout is for the slide-out
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
  window.NexT = window.NexT || {}; // Ensure NexT object exists
  window.NexT.flashcards = new Flashcards();

  // Add button to sidebar
  $(document).ready(function() {
    // Ensure sidebar-nav-toc exists before appending
    if ($('.sidebar-nav-toc').length) {
      var flashcardBtn = '<i class="flashcard-btn fa fa-clone" title="Generate Flashcards"></i>';
      $('.sidebar-nav-toc').append(flashcardBtn);

      $('.flashcard-btn').on('click', function() {
        window.NexT.flashcards.showFlashcardModal();
      });
    }
  });

})();
