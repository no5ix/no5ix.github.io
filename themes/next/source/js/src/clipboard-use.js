/*页面载入完成后，创建复制按钮*/
!function (e, t, a) {
	/* code */
	var initCopyCode = function(){
	  var copyHtml = '';
	  copyHtml += '<button class="btn-copy" data-clipboard-snippet="">';
	//   copyHtml += '  <i class="fa fa-globe"></i><span>copy</span>';
	  copyHtml += '  <i class="fa fa-files-o" aria-hidden="true"></i>';
	  copyHtml += '</button>';
	  $(".highlight").wrap($('<div class="highlight-wrap"></div>'));
	  $('.highlight-wrap').prepend(copyHtml);
	  var clipboard = new ClipboardJS('.btn-copy', {
		  target: function(trigger) {
			  return trigger.nextElementSibling;
		  }
	  });
	  // 成功提示
	  clipboard.on('success', function(e) {
		// toastPlug('复制成功!', 2000)
	  });
	}
	initCopyCode();
  }(window, document);
  