{% if theme.local_search.enable %}
  <script type="text/javascript">

    var searchFunc = function (path, search_id, content_id) {
      // 0x00. environment initialization
      'use strict';
      var BTN = "<i id='local-search-close'>×</i>";
      var $input = document.getElementById(search_id);
      var $resultContent = document.getElementById(content_id);
      var datas = [];
      var is_load_xml_finished = 0;

      /* loading css1 : Dot Css Loader*/
      var DotLoader = "<div class='loader'>Loading...</div>";

      /* loading css2 : Pure Css Loader - Square */
      var SquareLoader = 
        "<div class='loader'>" +
          "<div class='square' ></div>" +
          "<div class='square'></div>" +
          "<div class='square last'></div>" +
          "<div class='square clear'></div>" +
          "<div class='square'></div>" +
          "<div class='square last'></div>" +
          "<div class='square clear'></div>" +
          "<div class='square '></div>" +
          "<div class='square last'></div>" +
        "</div>";

      $resultContent.innerHTML = 
        BTN + 
        "<ul><span class='local-search-empty'>首次搜索，正在载入索引文件，请稍候……</span>" +
        DotLoader;

      var str = "";
      var keywords = "";
      var temp_keyword = "";

      function handleSearch()
      {
        $resultContent.innerHTML = "";
        
        // 0x04. perform local searching
        if (is_load_xml_finished == 0)
        {
          $resultContent.innerHTML = 
            BTN + 
            "<ul><span class='local-search-empty'>索引文件还未加载完成, 请稍候……</span>" +
            DotLoader;
        }
        else
        {
          datas.forEach(function (data) {
            var isMatch = true;
            var content_index = [];
            if (!data.title || data.title.trim() === '') {
              data.title = "Untitled";
            }
            var orig_data_title = data.title.trim();
            var data_title = orig_data_title.toLowerCase();
            var orig_data_content = data.content.trim().replace(/<[^>]+>/g, "");
            var data_content = orig_data_content.toLowerCase();
            var data_url = decodeURIComponent(data.url);
            var index_title = -1;
            var index_content = -1;
            var first_occur = -1;
            // only match artiles with not empty contents
            if (data_content !== '') {
              keywords.forEach(function (keyword, i) {
                index_title = data_title.indexOf(keyword);
                index_content = data_content.indexOf(keyword);

                if (index_title < 0 && index_content < 0) {
                  isMatch = false;
                } else {
                  if (index_content < 0) {
                    index_content = 0;
                  }
                  if (i == 0) {
                    first_occur = index_content;
                  }
                  // content_index.push({index_content:index_content, keyword_len:keyword_len});
                }
              });
            } else {
              isMatch = false;
            }
            // 0x05. show search results
            if (isMatch) {
              var content = orig_data_content;
              if (first_occur >= 0) {
                // cut out 100 characters
                var start = first_occur - 20;
                var end = first_occur + 80;

                if (start < 0) {
                  start = 0;
                }

                if (start == 0) {
                  end = 100;
                }

                if (end > content.length) {
                  end = content.length;
                }

                var match_content = content.substr(start, end);

                // highlight all keywords
                keywords.forEach(function (keyword) {
                  var regS = new RegExp(keyword, "gi");
                  match_content = match_content.replace(regS, "<b class=\"search-keyword\">" + keyword + "</b>");
                  orig_data_title = orig_data_title.replace(regS, "<b class=\"search-keyword\">" + keyword + "</b>");
                });
                
                str += "<li><a href='" + data_url + "' class='search-result-title' target='_blank'>" + orig_data_title + "</a>";

                str += "<p class=\"search-result\">" + match_content + "...</p>"
              }
              str += "</li>";
            }
          });

          str += "</ul>";
          if (str.indexOf('<li>') === -1) {
            return $resultContent.innerHTML = BTN + "<ul><span class='local-search-empty'>没有找到内容，请尝试更换检索词。<span></ul>";
          }
          $resultContent.innerHTML = BTN + str;
        }
      }

      $input.addEventListener('input', function () {

        // 0x03. parse query to keywords list
        str = '<ul class=\"search-result-list\">';
        temp_keyword = this.value.trim();
        keywords = temp_keyword.toLowerCase().split(/[\s\-]+/);
        if (temp_keyword.length <= 0) {
          return;
        }
        
        handleSearch();
      });


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

          handleSearch();
        }
      });

      $(document).on('click', '#local-search-close', function() {
        $('#local-search-input').val('');
        $('#local-search-result').html('');
      });
    }

    var getSearchFile = function(){
      var path = "/search.xml";
      searchFunc(path, 'local-search-input', 'local-search-result');
    }

  </script>
{% endif %}
