{% if theme.scheme %}
  <form class="site-search-form">
  <span class="search-icon fa fa-search"></span>
    <input type="text" id="local-search-input" class="st-search-input" />
  </form>
{% endif %}

<script src="https://apps.bdimg.com/libs/jquery/2.1.4/jquery.min.js"></script>
<script type="text/javascript" id="local.search.active">
  var inputArea            = document.querySelector("#local-search-input");
  var datas                = [];
  var is_load_xml_finished = 0;
  $(document).ready(function(){
    var path = "/search.xml";
    $.ajax({
      // 0x01. load xml file
      url: path,
      dataType: "xml",
      success: function (xmlResponse) {
        // 0x02. parse xml file
        datas = $("entry", xmlResponse).map(function () {
          return {
            title: $("title", this).text(),
            content: $("content", this).text(),
            url: $("url", this).text()
          };
        }).get();

        is_load_xml_finished = 1;
        getSearchFile(datas, is_load_xml_finished);
      }
    });
  });
  inputArea.onclick   = function(){ getSearchFile(datas, is_load_xml_finished); this.onclick = null }
  inputArea.onkeydown = function(){ if(event.keyCode == 13) return false }
</script>
