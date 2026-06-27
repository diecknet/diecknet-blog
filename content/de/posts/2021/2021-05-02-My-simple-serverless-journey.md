---
comments: true
aliases:
    - my-simple-serverless-journey
slug: My-simple-serverless-journey
layout: post
title: "Meine einfache Serverless-Reise war gar nicht so einfach"
subtitle: "Die Entstehung von simpleIP.de"
date: 2021-05-02
tags:
    [
        simpleip,
        serverless,
        cloud,
        vercel,
        cloudflare,
        cloudflareworkers,
        ipaddress
    ]
cover:
    image: /images/2021/2021-05-02_SimpleIP.jpg
---

Serverless Computing ist ein spannendes Konzept. Man kann ein Skript oder Programm ausführen, ohne die komplette Infrastruktur dahinter aufzubauen (Server, Storage, Netzwerke usw.). Man schreibt einfach den Code und er wird ausgeführt. Aber Serverless heißt nicht „ohne Server“ – man muss sich nur nicht darum kümmern. Das ist gar nicht so weit weg von klassischem Webspace beim Hoster, auf den man PHP-Skripte legt.

Heute meint Serverless meistens eine moderne Architektur, mit der man Anwendungscode ausführen kann. Der große Unterschied ist das **Skalieren**. Der Cloud-Anbieter übernimmt die Logik, wann und wie Serverless-Funktionen laufen. Wenn die Anwendung nicht genutzt wird, wird nichts ausgeführt und es werden keine Rechenressourcen verbraucht.

## Mein Serverless-Anwendungsfall

Ich habe ab und zu _einfach_ nur meine öffentliche IP-Adresse gebraucht, ohne mich mit irgendeinem systemabhängigen Kram herumzuschlagen. Der einfachste Weg dafür ist eine der gefühlt 1,5 Milliarden Websites, die die IP-Adresse des Besuchers anzeigen.

Das Problem: Viele dieser Seiten sind nervig, voller Werbung, Tracking und unnötiger Informationen. Ich konnte nie sicher sein, ob die jeweilige Seite wirklich vertrauenswürdig ist. Selbst wenn sie heute okay ist, muss das morgen nicht mehr so sein. Also habe ich meine eigene Seite gebaut, die nur die IP-Adresse anzeigt.

## Serverless mit Vercel

Mein erster Versuch lief mit [Vercel](https://vercel.com). Dieses Blog hoste ich dort bereits als statische Seite mit Jekyll und GitHub-Integration. Ich wusste, dass Vercel auch Serverless Functions unterstützt. Also habe ich eine statische Jamstack-Seite gebaut und dann per JavaScript-AJAX-Request die IP-Adresse über eine selbst geschriebene JSON-API abgefragt, die als Serverless Function läuft.

Das ist tatsächlich ziemlich einfach gewesen.

1. Ein neues GitHub-Repository erstellen und [mit Vercel verbinden](https://vercel.com/docs/git)
2. Eine ".js"-Datei im Unterordner "api" erstellen.

Diesen Code habe ich verwendet, um die IP-Adresse des Besuchers als einfache JSON-Antwort zurückzugeben:

```javascript
/*ip.js*/
module.exports = (req, res) => {
    res.json({
        ip: req.headers["x-forwarded-for"]
    });
};
```

Sauber! Vercel liefert bei jedem Request die Client-IP-Adresse in `req.headers['x-forwarded-for']`.

![Mein erster eigener Microservice, der eine IP-Adresse als JSON anzeigt](/images/2021/2021-05-01_vercel_app_api_ip_js.png "Mein erster eigener Microservice, der eine IP-Adresse als JSON anzeigt")

Danach habe ich ein kleines clientseitiges JavaScript geschrieben, das die API-URL aufruft und die IP-Adresse abholt. Wow – Microservice-Denken auf den Punkt 😅.

Ich hatte schnell eine funktionierende Frontend-Seite, bis ich gemerkt habe: Vercel unterstützt kein IPv6. Ups. Egal, das Frontend konnte ich weiter nutzen – ich musste nur den Backend-Anbieter wechseln.

## Wechsel zu Serverless mit Cloudflare Workers

Also bin ich auf Cloudflare Workers gewechselt. Hauptsächlich, weil dort IPv4 und IPv6 unterstützt werden. Da Cloudflare Workers die IP-Adresse des Besuchers [anders bereitstellt](https://support.cloudflare.com/hc/en-us/articles/200170986-How-does-Cloudflare-handle-HTTP-Request-headers-), musste ich mein komplettes Backend neu schreiben 🤭. Daraus ist dieser Code entstanden:

```javascript
function getClientIPInfo(request) {
    /*get clientdata from cloudflare workers*/
    /*the ||-comparison is to prevent errors in the workers quick edit mode*/
    let location = (request.cf || {}).country;
    // if we know which city, prepend to location
    if ((request.cf || {}).city) {
        location = (request.cf || {}).city + ", " + location;
    }
    const clientIPInfo = {
        /*get client ip address by Cloudflare header 'CF-Connecting-IP'*/
        ipaddress: request.headers.get("CF-Connecting-IP"),
        /*location of client ip address*/
        location: location
    };
    return clientIPInfo;
}
```

Obwohl ich es simpel halten wollte, war die Standortinfo einfach zu cool, um sie wegzulassen 😅. Deshalb gebe ich jetzt zusätzlich einen geschätzten Standort mit Stadt und Land zurück. Die Stadt ist oft nicht ganz korrekt, das Land passt aber meistens.

Cool.

![Mein zweiter eigener Microservice, der eine IP-Adresse als JSON anzeigt – auf Cloudflare](/images/2021/2021-05-01_cloudflare_workers_api_ip_js.png "Mein zweiter eigener Microservice, der eine IP-Adresse als JSON anzeigt – auf Cloudflare")

## Die statische Seite auf Cloudflare Pages

Danach habe ich meine statische Seite auf [Cloudflare Pages](https://developers.cloudflare.com/pages/) gelegt. Weil ich kein aufgeblasenes Framework nutzen wollte, habe ich die Seite mit [W3.CSS](https://www.w3schools.com/w3css/default.asp) gestylt und den AJAX-Request selbst gebaut. Das war nicht gerade Best-Practice-JavaScript, hat aber für mich funktioniert. Ich habe sogar eine Methode eingebaut, die auch mit Internet Explorer 5 und 6 laufen soll – auch wenn ich das nicht getestet habe.

```javascript
/*Retrieve IP-Address using AJAX request*/
function getIPinfo() {
    var jsonresult = {};
    var locationtext = "";
    // Create Object for classic AJAX Request
    var xhttp; //= new XMLHttpRequest();
    if (window.XMLHttpRequest) {
        // AJAX for modern browsers
        xhttp = new XMLHttpRequest();
    } else {
        // AJAX for IE6, IE5
        xhttp = new ActiveXObject("Microsoft.XMLHTTP");
    }
    xhttp.onreadystatechange = function () {
        // request is technically OK, if the request is "done" (readyState == 4) and the HTTP Response Code is "OK" (status == 200)
        if (this.readyState == 4 && this.status == 200) {
            // trying to parse the result as json
            try {
                jsonresult = JSON.parse(this.responseText);
            } catch (e) {
                // use this placeholder data if parsing was not possible in try{} script block above
                jsonresult = JSON.parse('{"ip":"ERROR","country":"XX"}');
                console.log("Error while trying to parse JSON response");
                console.log(e);
            }
            // output JSON in console log
            console.log(jsonresult);
            // trying to fill in IP address field on site
            try {
                document.getElementById("ipaddress").value = jsonresult.ip;
            } catch (e) {
                console.log("Error while trying to fill in IP address");
                console.log(e);
            }

            // gather country info in variable "locationtext", if country set and not "XX" (Cloudflare placeholder for "unknown")
            if (jsonresult.country && jsonresult.country != "XX") {
                locationtext = jsonresult.country;
            } else {
                locationtext = "Unknown";
            }

            // gather city info in variable "locationtext", if city is set
            if (jsonresult.city) {
                locationtext = jsonresult.city + ", " + locationtext;
            }

            // trying to set location text on site
            try {
                document.getElementById("location").innerText = locationtext;
            } catch (e) {
                console.log("Error while trying to fill in IP address");
                console.log(e);
            }
        }
    };
    xhttp.open("GET", "https://ip.di1.workers.dev/ip", true);
    xhttp.send();
}
```

Anschließend habe ich eine Funktion gebaut, um die IP-Adresse in die Zwischenablage zu kopieren. Es gibt den alten Weg mit `document.execCommand("copy");` und den modernen Weg über die Clipboard API `navigator.clipboard.writeText();`. Ich habe beide umgesetzt: erst modern, dann als Fallback die Legacy-Methode.

```javascript
function copy2Clipboard(whichElement) {
    // copy the textvalue from the specified element into the clipboard
    // using the modern clipboard API
    var copyText = document.getElementById(whichElement);
    try {
        navigator.clipboard.writeText(copyText.value).then(
            function () {
                console.log("success");
            },
            function () {
                console.log("fail");
            }
        );
    } catch (e) {
        console.log(e);
        copy2ClipboardLegacy(whichElement);
    }
}

function copy2ClipboardLegacy(whichElement) {
    // copy the textvalue from the specified element into the clipboard
    // using the legacy exec-copy command method
    // this is used as a fallback, if copy2Clipboard fails.
    try {
        var copyText = document.getElementById(whichElement);
        copyText.select();
        copyText.setSelectionRange(0, 999);
        document.execCommand("copy");
    } catch (e) {
        console.log("legacy copy to clipboard failed");
        console.log(e);
    }
}
```

Damit war ich eigentlich fertig – also habe ich die Architektur natürlich nochmal umgebaut 🙄.

## NoScript first – Cloudflare Workers Sites

Dann habe ich gemerkt, dass mir mein Ansatz aus zwei Gründen nicht gefallen hat:

1. Die Website braucht clientseitiges JavaScript. Ich nutze selbst [NoScript](https://noscript.net/) (oder [ScriptSafe](https://github.com/andryou/scriptsafe)) und mag Seiten nicht, die ohne JS nicht sauber funktionieren.
2. Um die IP-Adresse anzuzeigen, hätte der Nutzer einen zusätzlichen, unnötigen GET-Request ausgelöst. Ich konnte schneller liefern, wenn alle Informationen direkt mit einer Anfrage kommen.

Also habe ich weiter gesucht und [Cloudflare Workers Sites](https://developers.cloudflare.com/workers/platform/sites) gefunden. Das kombiniert im Grunde die Möglichkeiten von Cloudflare Pages (statische Seiten über ein globales CDN ausliefern) mit Cloudflare Workers. Die statischen Teile wie `.html` und `.css` landen in Cloudflare KV und werden global verteilt. Mit [HTMLRewriter](https://developers.cloudflare.com/workers/runtime-apis/html-rewriter) injiziere ich dann nur IP-Adresse und Standort in meine statische HTML-Seite, bevor sie an den Nutzer ausgeliefert wird.

Das Umschreiben passiert nur für `index.html` und setzt die Werte der HTML-Elemente mit den IDs `ipaddress` und `location`.

```javascript
// if the main page / or /index is requested, we apply a HTMLRewriter to inject the IP-Address and location info
if (pathname == "/" || pathname == "/index.html") {
    let ipInfo = getClientIPInfo(request);
    return new HTMLRewriter()
        .on("input", new ElementHandler(ipInfo))
        .transform(response);
}

// [...]

/*handles elements to inject values using HTMLRewriter*/
class ElementHandler {
    constructor(ipInfo) {
        this.ipInfo = ipInfo;
    }
    element(element) {
        // get element id
        const elementid = element.getAttribute("id");

        // depending on which element-id we have, put ipaddress or location in
        switch (elementid) {
            case "ipaddress":
                // set value of ipaddress-field in HTML
                element.setAttribute("value", this.ipInfo.ipaddress);
                break;
            case "location":
                // set value of location-field in HTML
                element.setAttribute("value", this.ipInfo.location);
                break;
        }
    }
}
```

## Fazit

Die [Seite](https://simpleip.de) läuft, und der Quellcode ist [auf GitHub verfügbar](https://github.com/diecknet/simple-ip-site). Schaut es euch gern an. Ich bin mir zu 100 % sicher: Mit klassischem Shared Webspace und etwas PHP wäre das deutlich einfacher gewesen. Aber der Weg ist hier wichtiger gewesen als nur das Ergebnis. Es war wirklich spannend, Serverless-Anwendungen und unterschiedliche Anbieter praktisch auszuprobieren. Ich bevorzuge den Cloudflare-Ansatz, weil die Serverless Worker global ausgeführt werden und nicht nur in den USA wie bei Vercel.
