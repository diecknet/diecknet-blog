---
layout: page
title: Mein 11ty Cheatsheet
lang: de
---
Das ist mein persönlicher 11ty Cheat Sheet. Die Infos und Tags sind auf dieses Blog-Setup zugeschnitten.

## Links

Durch das 11ty Plugin `external-links.js` können externe Links genau so wie interne Links gesetzt werden. Externe Links werden automatisch mit den Attributen `target="_blank" rel="noopener noreferrer"` versehen.

``` md
[Beispiel-Link](https://www.example.com)
```

Ergebnis:  
[Beispiel-Link](https://www.example.com)

## Code highlighting

```` md
``` powershell
$example = "123"
Write-Host "Hello World - $($example)"
```
````

Ergebnis:  

``` powershell
$example = "123"
Write-Host "Hello World - $($example)"
```

### Inline code

``` markdown
Ich erwähne Code im Text `das hier ist code` - cool!
```

Ergebnis:  

Ich erwähne Code im Text `das hier ist code` - cool!

### test

{% highlight js %}
alert(1337);
{% endhighlight %}