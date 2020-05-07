---
layout: post
title: "Exchange Online: Apple Internet Accounts - Administratorgenehmigung erforderlich"
subtitle: OAuth Konfiguration manuell durchführen
lang: de
tags: [exchange, exchangeonline, iphone, apple, AzureAD, ios, microsoft365, office365]
image: "/img/2020/2020-05-07_Apple-Internet-Accounts-de_1.png"
---
![Administratorgenehmigung erforderlich - Apple Internet Accounts - Apple Internet Accounts benötigt, um auf Ressourcen in Ihrer Organisation zugreifen zu können, eine Berechtigung, die nur ein Administrator erteilen kann. Bitten Sie einen Administrator, die Berechtigung für diese App zu erteilen, damit Sie die App verwenden können.](/img/2020/2020-05-07_Apple-Internet-Accounts-de_1.png "Administratorgenehmigung erforderlich - Apple Internet Accounts - Apple Internet Accounts benötigt, um auf Ressourcen in Ihrer Organisation zugreifen zu können, eine Berechtigung, die nur ein Administrator erteilen kann. Bitten Sie einen Administrator, die Berechtigung für diese App zu erteilen, damit Sie die App verwenden können.") <br /><br />
Als sich der erste User mit seinem iPhone an Office 365 angemeldet hat, um seine Kontakte und Kalender zu synchronisieren, wurde ihm folgende Meldung angezeigt:
> **Administratorgenehmigung erforderlich**
> Apple Internet Accounts
> Apple Internet Accounts benötigt, um auf Ressourcen in Ihrer Organisation zugreifen zu können, eine Berechtigung, die nur ein Administrator erteilen kann. Bitten Sie einen Administrator, die Berechtigung für diese App zu erteilen, damit Sie die App verwenden können.

Die App hieß früher übrigens "iOS Accounts" und wurde anscheinend Anfang 2020 umbenannt. Die bisherige AppID ist allerdings gleich geblieben.

## Ursache

Folgende Ursachen haben für diese Meldung gesorgt:
1. Apple Internet Accounts wird für den Zugriff auf die Office 365 Ressourcen des Tenants benötigt. Ein Zugriff auf Ressourcen eines Office 365 Tenants ist nur nach Genehmigung der verwendeten App möglich.
2. Es wurde bisher noch keine Benutzer- oder Administrator-Genehmigung für Apple Internet Accounts in diesem Tenant erteilt.
3. Die Benutzer-Genehmigung ist tenantweit deaktiviert. Diese empfehlenswerte Einstellung kann gesetzt werden, damit Endanwender nicht einfach Drittanbieter-Apps für den Zugriff auf Unternehmensdaten berechtigen können.

Die Einstellung zu 3. ist in Azure AD unter ["Enterprise applications" -> "User settings"](https://portal.azure.com/#blade/Microsoft_AAD_IAM/StartboardApplicationsMenuBlade/UserSettings/menuId/){:target="_blank" rel="noopener noreferrer"} zu finden. Die Option lautet "Users can consent to apps accessing company data on their behalf". **Diese Einstellung sollte auf "No" belassen werden!** Dass der Endanwender nicht einfach irgendwelche Apps erlauben darf und deshalb hier nicht weiterkommt, ist ja genau, was man möchte um die Unternehmensdaten vor unberechtigtem Zugriff zu schützen.

## Lösung
Es gibt mehrere Lösungsmöglichkeiten, ohne dass einfach alle Drittanbieter-Apps freigeschaltet werden.

### Lösungsmöglichkeit 1: Apple Internet Accounts tenantweit erlauben

#### Schritt 1

Als erstes muss die Tenant ID des Azure AD Tenants herausgefunden werden. Diese ist auf Overview Seite in Azure Active Directory zu finden (im nachfolgenden Screenshot rot markiert).
![Die Tenant ID ist in Azure Active Directory auf der Overview Seite zu finden.](/img/2020/2020-05-07_AzureAD_TenantID.png "Die Tenant ID ist in Azure Active Directory auf der Overview Seite zu finden.") 

#### Schritt 2

Der Platzhalter {% ihighlight plaintext %}<TenantID>{% endihighlight %} muss in der nachfolgenden URL durch die Tenant ID aus Schritt 1 ersetzt werden. Anschließend kann die erstellte URL mit Tenant Admin (Global Administrator) Rechten aufgerufen werden. Die in der URL enthaltene {% ihighlight plaintext %}client_id{% endihighlight %} ist die ID von Apple Internet Accounts.

{% highlight plaintext linedivs %}
https://login.microsoftonline.com/<TenantID>/oauth2/authorize?client_id=f8d98a96-0999-43f5-8af3-69971c7bb423&response_type=code&redirect_uri=https://example.com&prompt=admin_consent
{% endhighlight %}

#### Schritt 3

Die Abfrage "Angeforderte Berechtigungen für Ihre Organisation zustimmen - Apple Internet Accounts" muss per "Akzeptieren" bestätigt werden.

![Administrativer Zustimmungsdialog: Angeforderte Berechtigung für Ihre Organisation zustimmen - Apple Internet Accounts - Diese Anwendung wird nicht von Microsoft oder Ihrer Organisation veröffentlicht. Diese App benötigt folgende Berechtigungen: Über Exchange Active Sync auf Postfächer zugreifen, Als angemeldeter Benutzer über Exchange-Webdienste auf Postfächer zugreifen, Anmelden und Benutzerprofil lesen](/img/2020/2020-05-07_Apple-Internet-Accounts-de_2.png "Administrativer Zustimmungsdialog für Apple Internet Accounts in Microsoft 365") 

Anschließend wird ein Fehler angezeigt, da die hinterlegte Redirect URL auf https://example.com verweist. Der Fehler AADSTS900561 kann in diesem Fall ignoriert werden.

![Fehler: Leider können wir Sie nicht anmelden. AADSTS900561: The endpoint only accepts POST requests. Received a GET request. Kann in diesem Fall auf Grund der hinterlegten Redirect URL ignoriert werden.](/img/2020/2020-05-07_Apple-Internet-Accounts-de_3.png "Fehler AADSTS900561: Kann in diesem Fall auf Grund der hinterlegten Redirect URL ignoriert werden.")

Die App sollte nun in Azure AD unter "Enterprise applications" -> "All applications" aufgelistet sein.

![Auflistung erlaubter Enterprise Applications in Azure AD](/img/2020/2020-05-07_AzureAD_enterpriseapplicationslist.png "Auflistung erlaubter Enterprise Applications in Azure AD")

#### Schritt 4

Anschließend sollten die Anwender per iOS Kalender/Kontakte auf ihre in Exchange Online hinterlegten Daten zugreifen können.

### Lösungsmöglichkeit 2: Administrator-Anfragen aktivieren