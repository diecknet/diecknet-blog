---
layout: post
title: "My simple serverless journey was not that easy"
subtitle: "The making of simpleIP.de"
date: 2021-05-02
contenttags:
    [
        simpleip,
        serverless,
        cloud,
        vercel,
        cloudflare,
        cloudflareworkers,
        ipaddress
    ]
image: /assets/images/2021/2021-05-02_SimpleIP.jpg
---

Serverless Computing is an interesting concept. You can execute a script or programm without setting up the infrastructure behind it (servers, storage, networks, etc.). You just write your code and it gets executed. But Serverless doesn't mean "without any servers" - you just don't need to worry about them. That's not that much of a difference to renting classic webspace from any webhosting service and putting your PHP scripts there.
Nowadays Serverless usually means some kind of modern architecture that allows you to run your application code. The difference is **scaling**. The cloud provider handles the logic to run your serverless functions as it's needed. When your application is not used, the execution is stopped and no computing resources are consumed.

## My serverless use case

Sometimes I _simply_ need to find out my public IP-Address, without worrying about any specific system caveats. The easiest way to find out that information, is to browse any of the roughly 1.5 billion websites that display the visitor's IP-Address.

Thing is - these websites are really annoying, full of ads, tracking and tons of unnecessary informations. I can never be sure if any of these particular sites is actually safe to use. Even if at one point in time a site is usable, I can't be sure if it will stay like that. I decided to make my own website to show the IP-Address.

## Going Serverless with Vercel

My first attempt was to use [Vercel](https://vercel.com). I'm already hosting this blog there as a static site using Jekyll with Github integration. I knew that Vercel also supports Serverless functions. I somehow got the idea to create a static Jamstack site and then fetch the IP-Address using a JavaScript AJAX request to a self-written JSON API which runs as a Serverless function.

That was actually pretty easy.

1. Create a new Github repository and [connect it with Vercel](https://vercel.com/docs/git)
2. Create a ".js"-script file in the "api" subfolder.

I used this code to return the visitor's IP-Adress as a simple JSON response:

```javascript
/*ip.js*/
module.exports = (req, res) => {
    res.json({
        ip: req.headers["x-forwarded-for"]
    });
};
```

Neat! Vercel returns the client IP-Address for every request in `req.headers['x-forwarded-for']`.

![My first own Microservice displaying an IP-Address as JSON](/assets/images/2021/2021-05-01_vercel_app_api_ip_js.png "My first own Microservice displaying an IP-Address as JSON")

I then started out to write a simple clientside JavaScript that calls the API URL to retrieve the IP-Address. Wow! That's on-point thinking in microservices 😅.

I quickly got to a working frontend site, until I realized: Vercel doesn't support IPv6. Woops. Nevermind I can still use my frontend, I'll just switch my backend provider.

## Switching to Serverless with Cloudflare Workers

So I switched over to Cloudflare Workers. Mainly because they do support IPv6 and IPv4. Since Cloudflare Workers is providing the visitor's IP-Address [in a different way](https://support.cloudflare.com/hc/en-us/articles/200170986-How-does-Cloudflare-handle-HTTP-Request-headers-), I had to rewrite my complete backend 🤭. I came up with this code:

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

Eventhough I wanted to keep it simple, I found the location info too cool to leave it out 😅. So I'm also returning an estimated location with city and country. The city-info is often not really accurate, but the country usually works.

Cool.

![My second own Microservice displaying an IP-Address as JSON - on Cloudflare](/assets/images/2021/2021-05-01_cloudflare_workers_api_ip_js.png "My second own Microservice displaying an IP-Address as JSON - on Cloudflare")

## The static site on Cloudflare Pages

I've then put my static site on [Cloudflare Pages](https://developers.cloudflare.com/pages/). Because I didn't want to use any overblown framework, I decided to style the site with [W3.CSS](https://www.w3schools.com/w3css/default.asp) and write my own simple code for the AJAX request. Also not really the best-practice JS code, but it worked for me. I even included a method to make it work in Internet Explorer 5 and 6 - eventhough I didn't test if that actually works.

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

I then started out to write a function to copy the IP-Address to the user's clipboard. There is a legacy way to do it, using `document.execCommand("copy");` and a modern way via the Clipboard API `navigator.clipboard.writeText();`. I decided to implement both, with the modern approach first and the old method as a fallback.

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

Now I'm basically done, so let's change the architecture again 🙄.

## NoScript first - Cloudflare Workers Sites

I then realized, that I didn't like my current approach for two reasons:

1. The website requires clientside JavaScript to work. I'm using [NoScript](https://noscript.net/) (or [ScriptSafe](https://github.com/andryou/scriptsafe)) myself and I don't really like websites that require JS to work properly.
2. To display the IP-Address on the site, the user would initiate another unnecessary GET-request. I can deliver a quicker result when serving all information in one request.

So I dug deeper and found [Cloudflare Workers Sites](https://developers.cloudflare.com/workers/platform/sites). Essentially it combines the capabilities of Cloudflare Pages - to deliver static sites through a global CDN - and Cloudflare Workers. The static portions like .html and .css files are saved in Cloudflare KV and get distributed globally. I'm then using [HTMLRewriter](https://developers.cloudflare.com/workers/runtime-apis/html-rewriter) to just inject the IP-Address and location info into my static HTML page before delivering it to the user.

The rewriting only happens for index.html and sets the value of the HTML-elements with the ids "ipaddress" and "location" accordingly.

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

## Conclusion

Well, the [site](https://simpleip.de) is up and running. The source code is [available on Github](https://github.com/diecknet/simple-ip-site), feel free to check the whole thing out. I'm 100% sure: It would've been way easier to just use a classic shared webspace and some PHP code. But this whole process was not just about the result. It was also really interesting to check out Serverless applications and different providers. I do prefer the Cloudflare approach, because the Serverless Workers are executed globally, not only in the US like with Vercel.
