/*页面载入完成后，创建复制按钮*/
var copyHtml = '<button class="btn-copy" data-clipboard-snippet> <i class="fa fa-copy" aria-hidden="true"></i> </button>';

$('.highlight').each(function (i, e) {
	let language = $(e).attr("class").split(" ")[1]; // 获取第二个类名
  let langSpanStr = language ? " ● " + language : " ●"
	if ($(e).children('figcaption').length > 0) {
		let curSpan = $(e).children('figcaption').children('span');
		let fileNameStr = curSpan.text();
		// curSpan.html(langSpanStr + "&nbsp;&nbsp;&nbsp; ● " + fileNameStr);
		curSpan.html(langSpanStr);
		let fileName = $("<span> ● " + fileNameStr + "</span>");
		curSpan.after(fileName);
		fileName.after(copyHtml);
	} else {
		let figcaption = $("<figcaption><span>" + langSpanStr + "</span>" + copyHtml + "</figcaption>");
		$(e).prepend(figcaption);
	}
});

// $('.btn-copy').on('click', function (ee) {  // f the .btn-copy click logic isn't running, it's likely due to event delegation context, timing, or DOM structure issues.
// With this (using event delegation and a more robust code fetching):
$(document).on('click', '.btn-copy', async function (ee) { // Make the handler async
  ee.stopPropagation(); // CRITICAL: Prevent the click from bubbling up to the flashcard

  var $button = $(this);
  var $highlightBlock = $button.closest('.highlight');

  if (!$highlightBlock.length) {
    console.warn('.btn-copy clicked but could not find parent .highlight block.');
    updateCopyButtonIcon($button, false);
    $button.blur();
    return;
  }

  var codeToCopy = '';
  // ... (your existing code extraction logic remains the same)
  var $codeLines = $highlightBlock.find('.code .line');
  if ($codeLines.length > 0) {
    codeToCopy = $codeLines.map(function() {
      return $(this).text();
    }).get().join('\n');
  } else {
    var $codeElement = $highlightBlock.find('pre code, td.code code')
      .not($highlightBlock.find('figcaption code'));
    if (!$codeElement.length) {
      $codeElement = $highlightBlock.find('pre').not($highlightBlock.find('figcaption pre'));
    }
    if ($codeElement.length) {
      codeToCopy = $codeElement.first().text();
    } else {
      var $tempDiv = $highlightBlock.clone();
      $tempDiv.find('figcaption').remove();
      codeToCopy = $tempDiv.text();
    }
  }
  codeToCopy = codeToCopy.trim();

  if (!codeToCopy) {
    console.warn('Could not extract code to copy from .highlight block.');
    updateCopyButtonIcon($button, false);
    $button.blur();
    return;
  }

  let result = false;
  if (navigator.clipboard && navigator.clipboard.writeText) {
    try {
      await navigator.clipboard.writeText(codeToCopy);
      result = true;
    } catch (err) {
      console.error('Async: Could not copy text: ', err);
      result = false;
    }
  } else {
    // Fallback to the old method
    // Create and reuse a hidden textarea for copying
    let ta = document.getElementById('hidden-copy-textarea');  // reuse the `ta`
    if (!ta) {
      ta = document.createElement('textarea');
      ta.id = 'hidden-copy-textarea';
      ta.style.position = 'fixed';
      ta.style.top = '-9999px';
      ta.style.left = '-9999px';
      document.body.appendChild(ta);
    }
    // Set content and perform copy
    ta.value = codeToCopy;
    ta.select();
    ta.focus(); // Focus is important for execCommand to work
    try {
      result = document.execCommand('copy');
    } catch (err) {
      console.error('Fallback: Could not copy text: ', err);
      result = false;
    }
    // document.body.removeChild(ta);
  }

  updateCopyButtonIcon($button, result);
  $button.blur(); // Remove focus from the button
});

// Helper function to update button icon
function updateCopyButtonIcon($button, success) {
  const $icon = $button.find('i');
  if (success) {
    $icon.removeClass('fa-copy fa-times').addClass('fa-check');
    setTimeout(function () {
      $icon.removeClass('fa-check').addClass('fa-copy');
    }, 2800);
  } else {
    $icon.removeClass('fa-copy fa-check').addClass('fa-times');
    setTimeout(function() {
      $icon.removeClass('fa-times').addClass('fa-copy');
    }, 2000);
  }
}

