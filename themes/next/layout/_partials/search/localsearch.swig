{% if theme.scheme %}
  <form class="site-search-form">
  <span class="search-icon fa fa-search"></span>
    <input type="text" id="local-search-input" class="st-search-input" placeholder="{{ __('search.placeholder') }}" />
  </form>
{% endif %}

<script type="text/javascript" id="local.search.active">
var inputArea       = document.querySelector("#local-search-input");
inputArea.onclick   = function(){ getSearchFile(); this.onclick = null }
inputArea.onkeydown = function(){ if(event.keyCode == 13) return false }
</script>
