/*页面载入完成后，创建复制按钮*/
var copyHtml = '<button class="btn-copy" data-clipboard-snippet> <i class="fa fa-copy" aria-hidden="true"></i> </button>';

$('.highlight').each(function (i, e) {
	let language = $(e).attr("class").split(" ")[1]; // 获取第二个类名
	if ($(e).children('figcaption').length > 0) {
		let curSpan = $(e).children('figcaption').children('span');
		let codeName = curSpan.text();
		curSpan.html(" ● " + language + "&nbsp;&nbsp;&nbsp; ● " + codeName);
		curSpan.after(copyHtml);
	} else {
		let figcaption = $("<figcaption><span>" + " ● " + language + "</span>" + copyHtml + "</figcaption>");
		$(e).prepend(figcaption);
	}
});

$('.btn-copy').on('click', function (ee) {
	var code = $(this).parent().parent().find('.code').find('.line').map(function (i, eee) {
		return $(eee).text();
	}).toArray().join('\n');

	var ta = document.createElement('textarea');
	document.body.appendChild(ta);
	ta.style.position = 'absolute';
	ta.style.top = '0px';
	ta.style.left = '0px';
	ta.value = code;
	ta.select();
	ta.focus();
	var result = document.execCommand('copy');
	document.body.removeChild(ta);
	console.log("ccccccc?");

	// 点击了之后则复制按钮显示 "√"图标, 800毫秒后恢复原样
	if(result) {
		var $b = $(this).parent().find('.btn-copy')
		// $(this).text('√');
		// $(this).text('✓');
		// $(this).text('✅');
		// $(this).text('✔');
		$b.find('i.fa-copy').remove();
		$b.append($('<i class="fa fa-check" aria-hidden="true"></i>'));
		// $b.append($('<i class="fa fa-check-circle" aria-hidden="true"></i>'));
		// $b.append($('<i class="fa fa-check-circle-o" aria-hidden="true"></i>'));
		// $b.append($('<i class="fa fa-check-square" aria-hidden="true"></i>'));
		// $b.append($('<i class="fa fa-check-square-o" aria-hidden="true"></i>'));
		setTimeout(function () {
			$b.find('i.fa-check').remove();
			// $b.find('i.fa-check-circle').remove();
			// $b.find('i.fa-check-circle-o').remove();
			// $b.find('i.fa-check-square').remove();
			// $b.find('i.fa-check-square-o').remove();
			$b.append($('<i class="fa fa-copy" aria-hidden="true"></i>'));
		}, 2800);
	}
	$(this).blur();
});
