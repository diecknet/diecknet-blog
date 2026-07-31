---
comments: true
aliases:
    - my-simple-serverless-journey-part2
slug: My-simple-serverless-journey-part2
title: "Die Kehrseite von Serverless"
subtitle: "Wie simpleIP.de entstanden ist – Teil 2"
date: 2021-10-27
tags:
    [
        simpleip,
        serverless,
        cloud,
        vercel,
        cloudflare,
        cloudflareworkers,
        ipaddress,
        php
    ]
cover:
    image: /images/2021/2021-10-27_SimpleIP.de.update.png
---

Nachdem ich [SimpleIP.de](https://simpleip.de) als Serverless-Anwendung gebaut hatte (siehe meinen Blogpost [My simple serverless journey was not that easy](/en/2021/05/02/My-simple-serverless-journey/)), bin ich irgendwie stolz gewesen. Interessante Technologie, kleine und nützliche Website. Nice.

## Realität

Aber nach einer Weile hat mich die Realität eingeholt. Ich habe mit ein paar IPv6-Systemen herumgespielt, als es mir aufgefallen ist. Beim bisherigen Design hat die Seite nur die _primäre_ IP-Adresse des Clients angezeigt. Wenn der Client sowohl IPv6 **als auch** IPv4 unterstützt hat, wurde trotzdem nur eine IP-Adresse angezeigt.

Ich habe ein bisschen herumprobiert. Obwohl Cloudflare DNS Host A- (IPv4) und AAAA- (IPv6) Einträge erlaubt hat, hat es nicht so funktioniert, wie ich es wollte. Cloudflare muss die DNS-Einträge proxyen, damit Cloudflare Workers funktionieren. Und selbst wenn man nur eine IP-Version hinzufügt, hat Cloudflare trotzdem beide Internet-Protokollversionen geproxyt. Die Realität bei Serverless ist also: **Ihr habt nur sehr begrenzte Kontrolle über den Server, auf dem eure Anwendung läuft.** Für manche Szenarien passt das, für andere nicht.

## Mein Workaround

Ich würde das nicht wirklich einen Fix nennen, eher einen etwas hackigen Workaround. Ich habe die Subdomain `alt.simpleip.de` erstellt, die auf ein Shared-Webhosting-Account bei [Netcup](https://netcup.de) zeigt. Im Netcup Customer Control Panel habe ich zwei Subdomains (bzw. eher Sub-Subdomains) angelegt:

-   `v4.alt.simpleip.de`
-   `v6.alt.simpleip.de`

Danach habe ich "Let's Encrypt" TLS-Zertifikate hinzugefügt und ein [kleines PHP-Skript](https://github.com/diecknet/simple-ip-site/blob/8a50cbe079227c6972c3d6b80cc7b5a07c0bfc4e/alt.simpleip.de/index.php) auf den Server gelegt. Das Skript gibt die IP-Adresse des Clients mit

```php
print $_SERVER['REMOTE_ADDR'];
```

aus.

Der Trick ist, dass `v4.alt.simpleip.de` nur einen Host-A-Record hat - dadurch funktioniert es nur für IPv4-Clients. Und `v6.alt.simpleip.de` hat nur einen Host-AAAA-Record - dadurch funktioniert es nur für IPv6-Clients. Ursprünglich wollte ich `ipv4.alt.simpleip.de` und `ipv6.alt.simpleip.de` nutzen, aber anscheinend hat ein Bug im Netcup-Plesk-Control-Panel das verhindert 🤔. Komisch.

Jedenfalls hat meine API funktioniert. Der nächste Schritt war, etwas JavaScript-Code zur Website hinzuzufügen. Der Code versucht, zu beiden Hostnames eine Verbindung aufzubauen. Wenn ein Ergebnis zurückkommt, wird es auf der Seite ergänzt. Den alten Cloudflare-basierten Ansatz habe ich in der Seite gelassen. Wenn ein Client also die Seite aufruft, ist der neue Programmablauf so gewesen:

1. Cloudflare Workers injiziert die Client-IP-Adresse in das HTML und liefert die Seite aus (kein Client-JS nötig).
2. Wenn der HTML-Body lädt **und** Client-JS aktiviert ist:
    - Clientseitiger JavaScript-Call auf den **IPv4**-Endpoint
    - Clientseitiger JavaScript-Call auf den **IPv6**-Endpoint

## Fazit

Also ist es immer noch _irgendwie_ serverless, weil ich den Webserver bei Netcup nicht administrieren musste 😇. Das ist ein Shared-Webhosting-Paket. Wenn man Serverless gehen möchte, gibt es einige Hürden, aber wahrscheinlich gibt es auch einen passenden Workaround. Für meinen Use Case bevorzuge ich diese Workarounds, statt einen kompletten Server zu administrieren.

## Nachtrag 2026

Ich benutze bereits seit einiger Zeit nicht mehr Cloudflare für SimpleIP.de. Ich lasse den Blogpost aber online, als Referenz.
