/* Flashcards - A simple flashcard generator for NexT theme
 * Created based on the blog post content
 */

(function() {
  'use strict';

  var Flashcards = function() {
    this.cards = [];
    this.currentIndex = 0;
    this.isFlipped = false;
  };

  Flashcards.prototype.generateCards = function() {
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

    // Generate cards first
    if (!this.generateCards()) {
      alert('No headings found to create flashcards!');
      return;
    }

    // Reset state
    this.currentIndex = 0;
    this.isFlipped = false;

    // Create modal if it doesn't exist
    if (!$('#flashcard-modal').length) {
      var modalHtml =
        '<div id="flashcard-modal" class="flashcard-modal">' +
        '  <div class="flashcard-container">' +
        '    <div class="flashcard">' +
        '      <div class="flashcard-front"></div>' +
        '      <div class="flashcard-back"></div>' +
        '    </div>' +
        '    <div class="flashcard-navigation">' +
        '      <button id="prev-card" class="flashcard-nav-btn">Previous</button>' +
        '      <span id="card-counter"></span>' +
        '      <button id="next-card" class="flashcard-nav-btn">Next</button>' +
        '    </div>' +
        '    <button id="close-flashcard" class="close-flashcard">×</button>' +
        '  </div>' +
        '</div>';

      $('body').append(modalHtml);

      // Add event listeners
      $('#flashcard-modal .flashcard').on('click', function() {
        self.flipCard();
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

      // Close on escape key
      $(document).on('keydown', function(e) {
        if (e.key === 'Escape' && $('#flashcard-modal').is(':visible')) {
          self.hideFlashcardModal();
        } else if (e.key === 'ArrowLeft' && $('#flashcard-modal').is(':visible')) {
          self.prevCard();
        } else if (e.key === 'ArrowRight' && $('#flashcard-modal').is(':visible')) {
          self.nextCard();
        } else if (e.key === ' ' && $('#flashcard-modal').is(':visible')) {
          self.flipCard();
          e.preventDefault(); // Prevent page scrolling on space
        }
      });
    }

    // Show first card
    this.updateCardContent();

    // Show modal
    $('#flashcard-modal').fadeIn();
  };

  Flashcards.prototype.hideFlashcardModal = function() {
    $('#flashcard-modal').fadeOut();
  };

  Flashcards.prototype.updateCardContent = function() {
    var card = this.cards[this.currentIndex];

    // Reset flip state
    this.isFlipped = false;
    $('.flashcard').removeClass('flipped');

    // Update content
    $('.flashcard-front').html('<h2>' + card.front + '</h2>');
    $('.flashcard-back').html(card.back);

    // Update counter
    $('#card-counter').text((this.currentIndex + 1) + ' / ' + this.cards.length);
  };

  Flashcards.prototype.flipCard = function() {
    this.isFlipped = !this.isFlipped;
    $('.flashcard').toggleClass('flipped');
  };

  Flashcards.prototype.nextCard = function() {
    if (this.currentIndex < this.cards.length - 1) {
      this.currentIndex++;
      this.updateCardContent();
    }
  };

  Flashcards.prototype.prevCard = function() {
    if (this.currentIndex > 0) {
      this.currentIndex--;
      this.updateCardContent();
    }
  };

  // Initialize and expose to window
  window.NexT.flashcards = new Flashcards();

  // Add button to sidebar
  $(document).ready(function() {
    var flashcardBtn = '<div class="flashcard-btn" title="Generate Flashcards"><i class="fa fa-clone"></i></div>';
    $('.sidebar-inner').append(flashcardBtn);

    $('.flashcard-btn').on('click', function() {
      window.NexT.flashcards.showFlashcardModal();
    });
  });

})();
