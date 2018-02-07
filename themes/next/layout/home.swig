<!DOCTYPE html>

{% set html_class = 'theme-next ' + theme.scheme %}
{% if theme.motion.enable %}
  {% set html_class = html_class + ' use-motion' %}
{% endif %}

<html class="{{ html_class | lower }}" lang="{{ config.language }}">
<head>
  {% include '_partials/head.swig' %}

  {% set swiper_css_uri = url_for(theme.vendors._internal + '/swiper/dist/css/swiper.css') %}
  {% if theme.vendors.swiper_css %}
      {% set swiper_css_uri = theme.vendors.swiper_css %}
  {% endif %}
  <link href="{{ swiper_css_uri }}" rel="stylesheet" type="text/css" />

  {% set swiper_js_uri = url_for(theme.vendors._internal + '/swiper/dist/js/swiper.js') %}
  {% if theme.vendors.swiper %}
    {% set swiper_js_uri = theme.vendors.swiper %}
  {% endif %}
  <script src="{{ swiper_js_uri }}"></script>

  <title>{% block title %}{% endblock %}</title>
  {% include '_third-party/analytics/index.swig' %}

  <style>
    // html, body {
    //   position: relative;
    //   height: 100%;
    // }
    // body {
    //   background: #000;
    //   font-family: Helvetica Neue, Helvetica, Arial, sans-serif;
    //   font-size: 14px;
    //   color:#000;
    //   margin: 0;
    //   padding: 0;
    // }
    body {
      background: linear-gradient(to bottom,rgba(0,0,0,.1) 0%,rgba(0,0,0,.1) 50%,rgba(0,0,0,.3) 100%),linear-gradient(to bottom,#6e8882 0%,#95a495 31%,#b3ac95 68%,#95846b 83%,#5c5041 100%)
    }
    .swiper-container {
      width: 100%;
      height: 100%;
    }
    .swiper-slide {
      overflow: hidden;
    }
  </style>
</head>

<body itemscope itemtype="http://schema.org/WebPage" lang="{{ page.lang || page.language || config.language }}">

  {% set container_class = "container " %}
  {% if theme.sidebar.position %}
    {% set container_class = container_class + 'sidebar-position-' + theme.sidebar.position %}
  {% endif %}

  <div class="{{ container_class }} {% block page_class %}{% endblock %} ">
    <div class="headband"></div>

    <header id="header" class="header" itemscope itemtype="http://schema.org/WPHeader">
      <div class="header-inner"> {%- include '_partials/header.swig' %} </div>
    </header>

    <div id="local-search-result-mobile" class="local-search-result-cls"></div>

  
        <div class="swiper-container swiper-container-horizontal">
        <div class="swiper-wrapper" style="transform: translate3d(-2126px, 0px, 0px); transition-duration: 0ms;">
        <div class="swiper-slide" style="width: 1063px;">
        <div class="swiper-zoom-container">
        <img src="http://lorempixel.com/800/800/sports/1/">
        </div>
        </div>
        <div class="swiper-slide swiper-slide-prev" style="width: 1063px;">
        <div class="swiper-zoom-container">
        <img src="http://lorempixel.com/800/400/sports/2/">
        </div>
        </div>
        <div class="swiper-slide swiper-slide-active" style="width: 1063px;">
        <div class="swiper-zoom-container">
        <img src="http://lorempixel.com/400/800/sports/3/">
        </div>
        </div>
        </div>

        <div class="swiper-pagination swiper-pagination-white swiper-pagination-bullets"><span class="swiper-pagination-bullet"></span><span class="swiper-pagination-bullet"></span><span class="swiper-pagination-bullet swiper-pagination-bullet-active"></span></div>

        <div class="swiper-button-prev"></div>
        <div class="swiper-button-next swiper-button-disabled"></div>
        </div>

        {% if theme.sidebar.display !== 'remove' %}
          {% block sidebar %}{% endblock %}
        {% endif %}


    <footer id="footer" class="footer">
      <div class="footer-inner">
        {% include '_partials/footer.swig' %}
        {% block footer %}{% endblock %}
      </div>
    </footer>

  </div>

  {% include '_scripts/vendors.swig' %}
  {% include '_scripts/commons.swig' %}

  {% set scheme_script = '_scripts/schemes/' + theme.scheme | lower + '.swig' %}
  {% include scheme_script %}

  {% block script_extra %}
    {% include '_scripts/pages/post-details.swig' %}
  {% endblock %}

  {% include '_scripts/boostrap.swig' %}

  {% include '_third-party/comments/index.swig' %}
  {% include '_third-party/search/index.swig' %}
  {% include '_third-party/analytics/lean-analytics.swig' %}
  {% include '_third-party/seo/baidu-push.swig' %}
  {% include '_third-party/rating.swig' %}
  {% include '_third-party/mathjax.swig' %}
  {% include '_third-party/scroll-cookie.swig' %}
  {% include '_third-party/exturl.swig' %}

  <!-- {% include '_custom/custom.swig' %}-->
</body>
</html>


<!-- 页面点击小红心 -->
{% if theme.loving_heart %}
  <script type="text/javascript" src="/js/src/love.js"></script>
{% endif %}


<script type="text/javascript" src="/js/src/headroom.js"></script> 

<script>
  var swiper = new Swiper('.swiper-container', {
    zoom: true,
    pagination: {
      el: '.swiper-pagination',
    },
    navigation: {
      nextEl: '.swiper-button-next',
      prevEl: '.swiper-button-prev',
    },
  });
</script>
