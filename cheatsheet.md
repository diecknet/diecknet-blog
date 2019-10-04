---
layout: content-only
title: My Jekyll Cheatsheet
---
This is my Jekyll Cheat Sheet.
# Code highlighting
## Multi-Line code
Best option for normal code:
{% highlight liquid linedivs %}
{% raw %}{% highlight powershell linedivs %}
Write-Host "some code..."
{% endhighlight %}{% endraw %}
{% endhighlight %}
Result:
{% highlight powershell linedivs %}
Write-Host "some code..."
{% endhighlight %}
## Inline code
{% highlight liquid linedivs %}
I have some {% raw %}{% ihighlight HTML %}<h1>some HTML code</h1>{% endihighlight %} in my text.
{% endraw %}
{% endhighlight %}
Result:
I have some {% raw %}{% ihighlight HTML %}<h1>some HTML code</h1>{% endihighlight %} in my text.