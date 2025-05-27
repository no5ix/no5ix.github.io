<meta charset="UTF-8"/>
<meta http-equiv="X-UA-Compatible" content="IE=edge" />
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1"/>
<meta name="theme-color" content="{{ theme.android_chrome_color }}">

<script>
    {/* (function(){
        if('{{ page.password }}'){
            let localStoragePasswdKey = '{{ page.title }}' + '_last_passwd';
            function checkPassword(password) {
                password = password == null ? null : password.trim();
                if (password !== '{{ page.password }}'){
                    if (password != null) {
                        // 如果用户点击了确认而且密码错误的时候, 因为当password == null的时候说明用户点了取消
                        alert('Error!');
                    }
                    if (history.length > 1) {
                        history.back();
                    } else {
                        window.location.href = "about:blank";
                    }
                } else {
                    localStorage.setItem(localStoragePasswdKey, password);
                }
              }

            var password_verify_on_local = true;
            const hostname = window.location.hostname;
            if (password_verify_on_local || (!(hostname === "localhost" || hostname === "127.0.0.1" || hostname === "::1" || hostname.startsWith("192")))) {
              
              // if (window.innerWidth < 768) {

              // 	window.onload = function () {
              // 		// 创建遮罩层
              // 		const overlay = document.createElement("div");
              // 		// 创建输入框容器
              // 		overlay.innerHTML = `
              // 			<div class="password-input-box">
              // 				<p>Open Sesame</p>
              // 				<input type="password" id="passwordInput" style="padding: 10px; width: 200px;">
              // 				<div style="margin-top: 10px;">
              // 				<button id="confirmBtn">ok</button>
              // 				<button id="cancelBtn" style="margin-left: 10px;">cancel</button>
              // 				</div>
              // 			</div>
              // 			`;
              // 		overlay.classList.add("password-overlay");
              // 		document.body.style.overflow = "hidden"; // 禁止body滚动
              // 		document.body.appendChild(overlay);

              // 		setTimeout(() => {
              // 			const input = document.getElementById("passwordInput");
              // 			input.focus(); // 自动弹出键盘, 经测试, 手机上弹不出来, 所以放弃
              // 			// console.log("asdfasdfa??tantantan");

              // 			function confirmPassword() {
              // 				const password = input.value;
              // 				if (password) {
              // 					alert("你输入的密码是: " + password);
              // 					document.body.removeChild(overlay);
              // 				} else {
              // 					alert("请输入密码");
              // 				}
              // 			}

              // 			// 按回车确认
              // 			input.addEventListener("keydown", function (event) {
              // 				if (event.key === "Enter") {
              // 					confirmPassword();
              // 				}
              // 			});
              // 			// 点击确定按钮
              // 			document.getElementById("confirmBtn").onclick = confirmPassword;
              // 			// 点击取消按钮
              // 			document.getElementById("cancelBtn").onclick = function () {
              // 				document.body.removeChild(overlay);
              // 			};
              // 		}, 1000);
              // 	};

              // } else {
                const lspk = localStorage.getItem(localStoragePasswdKey) || "";
                if (lspk !== '{{ page.password }}') {
                    var password = prompt('Open Sesame');
                    checkPassword(password);
                }
              // }

            }

        }
    })(); */}
</script>

{% if theme.pace %}
  {% set pace_css_uri = url_for(theme.vendors._internal + '/pace/'+ theme.pace_theme +'.min.css?v=1.0.2') %}
  {% set pace_js_uri = url_for(theme.vendors._internal + '/pace/pace.min.js?v=1.0.2') %}
    {% if theme.vendors.pace %}
      {% set pace_js_uri = theme.vendors.pace %}
    {% endif %}
    {% if theme.vendors.pace_css %}
      {% set pace_css_uri = theme.vendors.pace_css %}
    {% endif %}
  <script src="{{ pace_js_uri }}"></script>
  <link href="{{ pace_css_uri }}" rel="stylesheet">
{% endif %}


{% if theme.han %}
  {% set Han_uri = url_for(theme.vendors._internal + '/Han/dist/han.min.css?v=3.3') %}
  {% if theme.vendors.Han %}
    {% set Han_uri = theme.vendors.Han %}
  {% endif %}
  <link rel="stylesheet" media="all" href="{{ Han_uri }}">
{% endif %}


{# #238, Disable Baidu tranformation #}
<meta http-equiv="Cache-Control" content="no-transform" />
<meta http-equiv="Cache-Control" content="no-siteapp" />


{% if theme.google_site_verification %}
  <meta name="google-site-verification" content="{{ theme.google_site_verification }}" />
{% endif %}


{% if theme.yandex_site_verification %}
  <meta name="yandex-verification" content="{{ theme.yandex_site_verification }}" />
{% endif %}


{% if theme.baidu_site_verification %}
  <meta name="baidu-site-verification" content="{{ theme.baidu_site_verification }}" />
{% endif %}


{% if theme.qihu_site_verification %}
  <meta name="360-site-verification" content="{{ theme.qihu_site_verification }}" />
{% endif %}




{% include "./head/external-fonts.swig" %}

{% set font_awesome_uri = url_for(theme.vendors._internal + '/font-awesome/css/font-awesome.min.css?v=4.6.2') %}
{% if theme.vendors.fontawesome %}
  {% set font_awesome_uri = theme.vendors.fontawesome %}
{% endif %}
<link href="{{ font_awesome_uri }}" rel="stylesheet" type="text/css" />

<link href="{{ url_for(theme.css) }}/main.css?v={{ theme.version }}" rel="stylesheet" type="text/css" />

{% if page.keywords %}
  <meta name="keywords" content="{{ page.keywords }}" />
{% elif page.tags and page.tags.length %}
  <meta name="keywords" content="{% for tag in page.tags %}{{ tag.name }},{% endfor %}" />
{% elif theme.keywords %}
  <meta name="keywords" content="{{ theme.keywords }}" />
{% endif %}


{% if theme.rss === '' and config.feed and config.feed.path %}
  {% set theme.rss = config.feed.path %}
{% endif %}
{% if theme.rss %}
  <link rel="alternate" href="{{ url_for(theme.rss) }}" title="{{ config.title }}" type="application/atom+xml" />
{% endif %}


{% if theme.favicon %}
  <link rel="shortcut icon" type="image/x-icon" href="{{ url_for(theme.favicon) }}?v={{ theme.version }}" />
{% endif %}


{% if theme.facebook_sdk.enable and theme.facebook_sdk.webmaster %}
  <meta property="fb:admins" content="{{ theme.facebook_sdk.fb_admin }}" />
  <meta property="fb:app_id" content="{{ theme.facebook_sdk.app_id }}" />
{% endif %}


{{
  open_graph({
    twitter_id: theme.twitter,
    google_plus: theme.google_plus,
    fb_admins: theme.fb_admins,
    fb_app_id: theme.fb_app_id
  })
}}


{# Export some HEXO Configurations to Front-End #}
<script type="text/javascript" id="hexo.configurations">
  var NexT = window.NexT || {};
  var CONFIG = {
    root: '{{ theme.root }}',
    scheme: '{{ theme.scheme }}',
    sidebar: {{ theme.sidebar | json_encode }},
    local_search: {{ theme.local_search | json_encode }},
    fancybox: {{ theme.fancybox }},
    tabs: {{ theme.tabs.enable }},
    motion: {{ theme.motion | json_encode }},
    duoshuo: {
      userId: '{{ theme.duoshuo_info.user_id | default() }}',
      author: '{{ theme.duoshuo_info.admin_nickname | default(__('author'))}}'
    },
    algolia: {
      applicationID: '{{ theme.algolia.applicationID }}',
      apiKey: '{{ theme.algolia.apiKey }}',
      indexName: '{{ theme.algolia.indexName }}',
      hits: {{ theme.algolia_search.hits | json_encode }},
      labels: {{ theme.algolia_search.labels | json_encode }}
    }
  };
</script>

{# Canonical, good for google search engine (SEO) : https://support.google.com/webmasters/answer/139066 #}
{% if theme.canonical %}
  <link rel="canonical" href="{{ config.url }}/{{ page.canonical_path.replace('index.html', '') }}"/>
{% endif %}

{% include 'head/custom-head.swig' %}

