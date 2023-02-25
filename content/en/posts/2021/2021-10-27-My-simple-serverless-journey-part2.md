---
aliases:
    - my-simple-serverless-journey-part2
slug: My-simple-serverless-journey-part2
title: "The Downside of going serverless"
subtitle: "The making of simpleIP.de - Part 2"
date: 2021-10-27
contenttags:
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

After creating [SimpleIP.de](https://simpleip.de) as a serverless application (see my blog post [My simple serverless journey was not that easy](/en/2021/05/02/My-simple-serverless-journey/)) I was kinda proud. Interesting technology, small and useful website. Nice.

## Reality

But after a while reality kicked in. I was playing around with some IPv6 systems, when it hit me. With the previous design, the site would show only the _primary_ IP-Address of the client. If the client supports both IPv6 **and** IPv4, it would still only show one IP-Address.

I tried a bit around. Eventhough Cloudflare allows DNS Host A (IPv4) and AAAA (IPv6) entries, it wouldn't work as I wanted. Cloudflare needs to proxy the DNS entries, to make Cloudflarer Workers work. And even if you only add one IP Version, it would still proxy for both Internet Protocol versions. So the reality of serverless is: **You only have very limited control over the server that hosts your application.** For some scenarios that might be okay, for others not.

## My Workaround

I wouldn't really call this a fix, just a hacky workaround. I created a subdomain `alt.simpleip.de` that points to a Shared Webhost Account at [Netcup](https://netcup.de). In my Netcup Customer Control Panel, I added two Subdomains (or rather Sub-Subdomains):

-   `v4.alt.simpleip.de`
-   `v6.alt.simpleip.de`

I then added "Let's Encrypt" TLS certificates and put a [small PHP-Script](https://github.com/diecknet/simple-ip-site/blob/8a50cbe079227c6972c3d6b80cc7b5a07c0bfc4e/alt.simpleip.de/index.php) on the server. The script outputs the IP-Address of the client using

```php
print $_SERVER['REMOTE_ADDR'];
```

The trick is, that `v4.alt.simpleip.de` only has a Host A Record - so it only works for IPv4 clients. And `v6.alt.simpleip.de` only has a Host AAAA Record - so it only works for IPv6 clients. Initially I wanted to use `ipv4.alt.simpleip.de` and `ipv6.alt.simpleip.de`, but apparently a bug in the Netcup Plesk Control Panel prevented that 🤔. Weird.

Anyway my API is running. Next step was to add some JavaScript code to the website. The code tries to connect to both of these hostnames. If there is a result, it'll get added to the site. I left the old Cloudflare based approach still in the site. So when a client requests the page, the new program flow is as follows:

1. Cloudflare Workers injects the Client-IP-Address into the HTML and delivers the site (No Client-JS needed).
2. When the HTML Body loads **and** Client-JS is enabled:
    - Client based JavaScript call to **IPv4** endpoint
    - Client based JavaScript call to **IPv6** endpoint

## Conclusion

So it's still _kinda_ serverless, since I don't administer the Webserver at Netcup 😇. It's a Shared Webhost package. When going serverless, there are several obstacles, but there's mostlikely a Workaround. For my use case, I still prefer these workarounds instead of administering a full server.
