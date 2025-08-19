/* global hexo */

'use strict';

// const { parse } = require('url');
// const { unescapeHTML } = require('hexo-util');
//
// hexo.extend.filter.register('after_post_render', data => {
//   const { config } = hexo;
//   const theme = hexo.theme.config;
//   if (!theme.exturl && !theme.lazyload) return;
//   if (theme.lazyload) {
//     data.content = data.content.replace(/(<img[^>]*)\ssrc=/ig, '$1 data-src=');
//   }
//   if (theme.exturl) {
//     const siteHost = parse(config.url).hostname || config.url;
//     // External URL icon
//     const exturlIcon = theme.exturl_icon ? '<i class="fa fa-external-link-alt"></i>' : '';
//     data.content = data.content.replace(/<a[^>]*\shref="([^"]+)"[^>]*>([^<]+)<\/a>/ig, (match, href, html) => {
//       // Exit if the href attribute doesn't exist.
//       if (!href) return match;
//
//       // Exit if the url has same host with `config.url`, which means it's an internal link.
//       const link = parse(href);
//       if (!link.protocol || link.hostname === siteHost) return match;
//
//       // Return encrypted URL with title.
//       const title = match.match(/title="([^"]+)"/);
//       const encoded = Buffer.from(unescapeHTML(href)).toString('base64');
//       if (title) return `<span class="exturl" data-url="${encoded}" title="${title[1]}">${html}${exturlIcon}</span>`;
//
//       return `<span class="exturl" data-url="${encoded}">${html}${exturlIcon}</span>`;
//     });
//   }
//
// }, 0);


// hexo.extend.filter.register('after_post_render', function (data) {
//   // Use a regex to add loading="lazy" to <img> tags that don't have it
//   data.content = data.content.replace(/<img(?![^>]*loading=)([^>]*)>/g, function (match, attr) {
//     return `<img loading="lazy"${attr}>`;
//   });
//
//   console.log("asdfa laazy??asdfa loading!");
//   return data;
// });

hexo.extend.filter.register('after_render:html', function (str) {
  // 这个代码似乎会执行两遍, 所以得: 现在添加了 (?![^>]*data-src) 负向前瞻，只处理没有 data-src 属性的图片，避免重复处理。
  // Replace src with data-src and add placeholder, but only if data-src doesn't exist
  const placeholder = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA4MCA2MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjgwIiBoZWlnaHQ9IjYwIiBmaWxsPSIjRjVGNUY1Ii8+CjxwYXRoIGQ9Ik0zNSAyNUg0NVYzNUgzNVYyNVoiIGZpbGw9IiNEREREREQiLz4KPC9zdmc+';
  return str.replace(/<img(?![^>]*data-src)([^>]*)\ssrc="([^"]+)"([^>]*)>/g, '<img$1 src="' + placeholder + '" data-src="$2"$3>');
});


