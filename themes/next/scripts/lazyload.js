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
  // Use a regex to add loading="lazy" to <img> tags that don't have it
  // Comment out the below line, because when I click the TOC, I hope it will jump to the right place, but now it doesn't. it's because of the lazy load img thing, and it's complicated to fix it.
  // return str.replace(/<img(?![^>]*loading=)([^>]*?)>/g, '<img width="800" height="600" loading="lazy"$1>');
});


