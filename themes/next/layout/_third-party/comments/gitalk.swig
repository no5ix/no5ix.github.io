{% if page.comments && theme.gitalk.enable %}
    <link rel="stylesheet" href="/css/gitalk.css">
    <script src="/js/src/gitalk.min.js"></script>
    <script type="text/javascript">
		var gitalk = new Gitalk({
            clientID: '{{ theme.gitalk.ClientID }}',
            clientSecret: '{{ theme.gitalk.ClientSecret }}',
            repo: '{{ theme.gitalk.repo }}',
            owner: '{{ theme.gitalk.githubID }}',
            admin: ['{{ theme.gitalk.adminUser }}'], 
            id: location.pathname,
            distractionFreeMode: '{{ theme.gitalk.distractionFreeMode }}'
		})
		gitalk.render('gitalk-container')           
    </script>
{% endif %}