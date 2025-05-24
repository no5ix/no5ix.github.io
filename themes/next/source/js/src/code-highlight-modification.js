/*页面载入完成后，创建复制按钮*/
var copyHtml = '<button class="btn-copy" data-clipboard-snippet> <i class="fa fa-copy" aria-hidden="true"></i> </button>';

$('.highlight').each(function (i, e) {
	let language = $(e).attr("class").split(" ")[1]; // 获取第二个类名
	if ($(e).children('figcaption').length > 0) {
		let curSpan = $(e).children('figcaption').children('span');
		let fileNameStr = curSpan.text();
		// curSpan.html(" ● " + language + "&nbsp;&nbsp;&nbsp; ● " + fileNameStr);
		curSpan.html(" ● " + language);
		let fileName = $("<span> ● " + fileNameStr + "</span>");
		curSpan.after(fileName);
		fileName.after(copyHtml);
	} else {
		let figcaption = $("<figcaption><span>" + " ● " + language + "</span>" + copyHtml + "</figcaption>");
		$(e).prepend(figcaption);
	}
});

// $('.btn-copy').on('click', function (ee) {  // f the .btn-copy click logic isn't running, it's likely due to event delegation context, timing, or DOM structure issues.
$(document).on('click', '.btn-copy', function (ee) {  // With this (using event delegation and a more robust code fetching):
	ee.stopPropagation(); // Prevent the click from bubbling up

    if ($codeElement.length) {
      // If multiple code elements are found (e.g. in tables), take the first one
      codeToCopy = $codeElement.first().text();
    } else {
      // Last resort: clone the highlight block, remove its figcaption, and get the text.
      // This is less precise and might grab unwanted text if the structure is very complex.
      var $tempDiv = $highlightBlock.clone();
      $tempDiv.find('figcaption').remove();
      codeToCopy = $tempDiv.text();
    }
  }

  codeToCopy = codeToCopy.trim(); // Clean up any extra whitespace

  if (!codeToCopy) {
    console.warn('Could not extract code to copy from .highlight block.');
    $button.find('i').removeClass('fa-copy fa-check').addClass('fa-times');
    setTimeout(function() {
      $button.find('i').removeClass('fa-times').addClass('fa-copy');
    }, 2000);
    $button.blur();
    return;
  }

  var ta = document.createElement('textarea');
  document.body.appendChild(ta);
  ta.style.position = 'fixed'; // Use 'fixed' to ensure it's in the viewport for execCommand
  ta.style.top = '-9999px';    // Position off-screen
  ta.style.left = '-9999px';
  ta.value = codeToCopy;
  ta.select();
  ta.focus(); // Focus is important for execCommand to work
  var result = false;
  try {
    result = document.execCommand('copy');
  } catch (err) {
    console.error('Copy command failed:', err);
    result = false; // Ensure result is false on error
  }
  document.body.removeChild(ta);

  if(result) {
    $button.find('i').removeClass('fa-copy').addClass('fa-check');
    setTimeout(function () {
      $button.find('i').removeClass('fa-check').addClass('fa-copy');
    }, 2800);
  } else {
    // If copy failed, show a failure icon briefly
    $button.find('i').removeClass('fa-copy fa-check').addClass('fa-times');
    setTimeout(function() {
      $button.find('i').removeClass('fa-times').addClass('fa-copy');
    }, 2000);
  }
  $button.blur(); // Remove focus from the button
});
