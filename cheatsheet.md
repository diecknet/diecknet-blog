---
layout: page
title: Mein Jekyll Cheatsheet
lang: de
---
Das ist mein persönlicher Jekyll Cheat Sheet. Die Infos und Tags sind auf dieses Blog-Setup zugeschnitten.
# Links
## External Links
{% highlight liquid linedivs %}
{% raw %}
[Beispiel-Link](https://www.example.com){:target="_blank" rel="noopener noreferrer"}
{% endraw %}
{% endhighlight %}
Ergebnis:
[Beispiel-Link](https://www.example.com){:target="_blank" rel="noopener noreferrer"}
## Internal Links
{% highlight liquid linedivs %}
{% raw %}
[Azure AD Connect richtig planen und vorbereiten](/2020/06/05/Azure-AD-Connect-Video/)
{% endraw %}
{% endhighlight %}
Ergebnis:
[Azure AD Connect richtig planen und vorbereiten](/2020/06/05/Azure-AD-Connect-Video/)

# Code highlighting
## Multi-Line code
Best option for normal code:
{% highlight liquid linedivs %}
{% raw %}{% highlight powershell linedivs %}
Write-Host "some code..."
{% endhighlight %}{% endraw %}
{% endhighlight %}
Ergebnis:
{% highlight powershell linedivs %}
Write-Host "some code..."
{% endhighlight %}
## Inline code
{% highlight liquid linedivs %}
I have some {% raw %}{% ihighlight HTML %}<h1>some HTML code</h1>{% endihighlight %} in my text.
{% endraw %}
{% endhighlight %}
Ergebnis:

I have some {% ihighlight HTML %}<h1>some HTML code</h1>{% endihighlight %} in my text.
