---
comments: true
aliases:
    - my-simple-serverless-journey
slug: My-simple-serverless-journey
layout: post
title: "My simple serverless journey was not that easy"
subtitle: "The making of simpleIP.de"
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

Serverless Computing ist ein interessantes Konzept gewesen. Man hat ein Skript oder Programm ausführen können, ohne die Infrastruktur dahinter (Server, Storage, Netzwerke usw.) selbst aufzusetzen. Man hat einfach Code geschrieben und dieser ist ausgeführt worden. Aber Serverless hat nicht „ohne Server“ bedeutet – man hat sich nur nicht darum kümmern müssen. Das ist gar nicht so weit davon entfernt gewesen, klassischen Webspace bei einem Hosting-Anbieter zu mieten und dort PHP-Skripte abzulegen.
Heutzutage hat Serverless meist irgendeine moderne Architektur bedeutet, mit der Anwendungscode ausgeführt worden ist. Der Unterschied ist **Skalierung** gewesen. Der Cloud-Anbieter hat die Logik übernommen, um Serverless Functions bei Bedarf auszuführen. Wenn die Anwendung nicht genutzt worden ist, ist die Ausführung gestoppt worden und es sind keine Rechenressourcen verbraucht worden.

## Mein Serverless-Anwendungsfall

Manchmal habe ich _einfach_ meine öffentliche IP-Adresse herausfinden müssen, ohne mich mit systemabhängigen Besonderheiten zu beschäftigen. Der einfachste Weg dafür ist gewesen, irgendeine der rund 1,5 Milliarden Websites zu öffnen, die die IP-Adresse des Besuchers anzeigen.

Das Problem ist gewesen: Diese Websites sind oft nervig, voller Werbung, Tracking und unnötiger Informationen gewesen. Ich habe nie sicher sein können, ob eine dieser Seiten wirklich sicher nutzbar gewesen ist. Selbst wenn eine Seite zu einem Zeitpunkt brauchbar gewesen ist, habe ich nicht sicher sein können, dass sie so bleibt. Deshalb habe ich entschieden, eine eigene Website zu bauen, die die IP-Adresse anzeigt.

## Mit Vercel auf Serverless gegangen

Mein erster Versuch ist mit [Vercel](https://vercel.com) gewesen. Ich habe dieses Blog dort bereits als statische Website mit Jekyll und GitHub-Integration gehostet. Ich habe gewusst, dass Vercel auch Serverless Functions unterstützt hat. Irgendwie habe ich die Idee gehabt, eine statische Jamstack-Seite zu erstellen und die IP-Adresse dann per JavaScript-AJAX-Request von einer selbst geschriebenen JSON-API zu holen, die als Serverless Function gelaufen ist.

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

Sauber! Vercel hat für jede Anfrage die Client-IP-Adresse in `req.headers['x-forwarded-for']` zurückgegeben.

![Mein erstes eigenes Microservice, das eine IP-Adresse als JSON angezeigt hat](/images/2021/2021-05-01_vercel_app_api_ip_js.png "Mein erstes eigenes Microservice, das eine IP-Adresse als JSON angezeigt hat")

Danach habe ich angefangen, ein einfaches clientseitiges JavaScript zu schreiben, das die API-URL aufgerufen hat, um die IP-Adresse abzurufen. Wow! Das ist wirklich punktgenaues Denken in Microservices gewesen 😅.

Ich habe schnell eine funktionierende Frontend-Seite gehabt, bis ich gemerkt habe: Vercel hat kein IPv6 unterstützt. Ups. Egal, das Frontend habe ich weiterverwenden können – ich habe nur den Backend-Anbieter wechseln müssen.

## Auf Serverless mit Cloudflare Workers gewechselt

Also bin ich zu Cloudflare Workers gewechselt. Hauptsächlich, weil dort IPv6 und IPv4 unterstützt worden sind. Da Cloudflare Workers die IP-Adresse des Besuchers [auf eine andere Art bereitgestellt hat](https://support.cloudflare.com/hc/en-us/articles/200170986-How-does-Cloudflare-handle-HTTP-Request-headers-), habe ich mein komplettes Backend neu schreiben müssen 🤭. Dabei ist dieser Code entstanden:

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

Obwohl ich es simpel halten wollte, habe ich die Standortinfos zu cool gefunden, um sie wegzulassen 😅. Deshalb habe ich zusätzlich einen geschätzten Standort mit Stadt und Land zurückgegeben. Die Stadt ist oft nicht besonders genau gewesen, aber das Land hat meistens gepasst.

Cool.

![Mein zweites eigenes Microservice, das eine IP-Adresse als JSON angezeigt hat – auf Cloudflare](/images/2021/2021-05-01_cloudflare_workers_api_ip_js.png "Mein zweites eigenes Microservice, das eine IP-Adresse als JSON angezeigt hat – auf Cloudflare")

## Die statische Website auf Cloudflare Pages

Danach habe ich meine statische Seite auf [Cloudflare Pages](https://developers.cloudflare.com/pages/) gelegt. Weil ich kein aufgeblähtes Framework nutzen wollte, habe ich die Seite mit [W3.CSS](https://www.w3schools.com/w3css/default.asp) gestylt und meinen eigenen simplen Code für den AJAX-Request geschrieben. Das ist auch nicht gerade Best-Practice-JavaScript gewesen, aber es hat für mich funktioniert. Ich habe sogar eine Methode eingebaut, damit es in Internet Explorer 5 und 6 funktioniert – obwohl ich nicht getestet habe, ob das wirklich klappt.

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

Danach habe ich begonnen, eine Funktion zu schreiben, die die IP-Adresse in die Zwischenablage des Users kopiert. Es hat einen alten Weg mit `document.execCommand("copy");` und einen modernen Weg über die Clipboard-API `navigator.clipboard.writeText();` gegeben. Ich habe entschieden, beides zu implementieren – zuerst modern, dann den alten Weg als Fallback.

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

Jetzt bin ich im Grunde fertig gewesen, also habe ich die Architektur nochmal geändert 🙄.

## NoScript first – Cloudflare Workers Sites

Dann habe ich gemerkt, dass mir mein aktueller Ansatz aus zwei Gründen nicht gefallen hat:

1. Die Website hat clientseitiges JavaScript benötigt, um zu funktionieren. Ich habe selbst [NoScript](https://noscript.net/) (oder [ScriptSafe](https://github.com/andryou/scriptsafe)) genutzt und Websites, die zwingend JS brauchen, nie besonders gemocht.
2. Um die IP-Adresse auf der Seite anzuzeigen, hätte der Benutzer eine weitere unnötige GET-Anfrage ausgelöst. Ich habe ein schnelleres Ergebnis liefern können, wenn ich alle Informationen in einer Anfrage ausgeliefert habe.

Also habe ich tiefer gegraben und [Cloudflare Workers Sites](https://developers.cloudflare.com/workers/platform/sites) gefunden. Im Kern hat das die Fähigkeiten von Cloudflare Pages – statische Seiten über ein globales CDN auszuliefern – mit Cloudflare Workers kombiniert. Die statischen Teile wie .html- und .css-Dateien sind in Cloudflare KV gespeichert und global verteilt worden. Ich habe dann [HTMLRewriter](https://developers.cloudflare.com/workers/runtime-apis/html-rewriter) verwendet, um IP-Adresse und Standortinfos direkt vor der Auslieferung in meine statische HTML-Seite zu injizieren.

Das Rewriting ist nur für index.html passiert und hat den HTML-Elementen mit den IDs "ipaddress" und "location" entsprechend Werte gesetzt.

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

Gut, die [Seite](https://simpleip.de) ist live gegangen. Der Quellcode ist [auf GitHub verfügbar](https://github.com/diecknet/simple-ip-site), schaut euch das gerne komplett an. Ich bin mir zu 100 % sicher gewesen: Es wäre viel einfacher gewesen, klassischen Shared Webspace und etwas PHP-Code zu nutzen. Aber bei dem ganzen Prozess ist es nicht nur um das Ergebnis gegangen. Es ist auch sehr spannend gewesen, Serverless-Anwendungen und verschiedene Anbieter auszuprobieren. Ich habe den Cloudflare-Ansatz bevorzugt, weil die Serverless Workers global ausgeführt worden sind und nicht nur in den USA wie bei Vercel.
