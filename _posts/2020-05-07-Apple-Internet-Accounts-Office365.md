---
layout: post
title: "Exchange Online: Apple Internet Accounts - Administratorgenehmigung erforderlich"
subtitle: iOS Zugriff auf Office 365 ermöglichen
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
1. Die App "Apple Internet Accounts" wird von Apple iOS für den Zugriff auf die Office 365 Ressourcen des Benutzers benötigt. Ein Zugriff auf Ressourcen eines Office 365 Tenants durch eine Drittanbieter App ist nur nach expliziter Genehmigung möglich.
2. Es wurde bisher noch keine Benutzer- oder Administrator-Genehmigung für Apple Internet Accounts in diesem Tenant erteilt.
3. Die Benutzer-Genehmigung ist tenantweit deaktiviert. Diese empfehlenswerte Einstellung kann gesetzt werden, damit Endanwender nicht einfach Drittanbieter-Apps für den Zugriff auf Unternehmensdaten berechtigen können.

Die Einstellung zu 3. ist in Azure AD unter ["Enterprise applications" -> "User settings"](https://portal.azure.com/#blade/Microsoft_AAD_IAM/StartboardApplicationsMenuBlade/UserSettings/menuId/){:target="_blank" rel="noopener noreferrer"} zu finden. Die Option lautet "Users can consent to apps accessing company data on their behalf". **Diese Einstellung sollte auf "No" belassen werden!** Dass der Endanwender nicht einfach irgendwelche Apps erlauben darf (und deshalb hier nicht weiterkommt), ist ja genau was man möchte um die Unternehmensdaten vor unberechtigtem Zugriff zu schützen.

## Lösung

Es gibt mehrere Lösungsmöglichkeiten, ohne dass einfach alle Drittanbieter-Apps freigeschaltet werden.

### Lösungsmöglichkeit 1: Apple Internet Accounts tenantweit erlauben

#### Schritt 1: TenantID herausfinden

Als Erstes muss die Tenant ID des Azure AD Tenants herausgefunden werden. Diese ist auf ["Overview Seite in Azure Active Directory"](https://portal.azure.com/#blade/Microsoft_AAD_IAM/ActiveDirectoryMenuBlade/Overview){:target="_blank" rel="noopener noreferrer"} zu finden (im nachfolgenden Screenshot rot markiert).

![Die Tenant ID ist in Azure Active Directory auf der Overview Seite zu finden.](/img/2020/2020-05-07_AzureAD_TenantID.png "Die Tenant ID ist in Azure Active Directory auf der Overview Seite zu finden.") 

#### Schritt 2: URL zusammensetzen

Der Platzhalter {% ihighlight plaintext %}<TenantID>{% endihighlight %} muss in der nachfolgenden URL durch die Tenant ID aus Schritt 1 ersetzt werden. Anschließend kann die erstellte URL mit Tenant Admin (Global Administrator) Rechten aufgerufen werden. Die in der URL enthaltene {% ihighlight plaintext %}client_id{% endihighlight %} ist die ID von Apple Internet Accounts.

{% highlight plaintext linedivs %}
https://login.microsoftonline.com/<TenantID>/oauth2/authorize?client_id=f8d98a96-0999-43f5-8af3-69971c7bb423&response_type=code&redirect_uri=https://example.com&prompt=admin_consent
{% endhighlight %}

#### Schritt 3: Berechtigung administrativ für den gesamten Tenant erteilen

Die Abfrage "Angeforderte Berechtigungen für Ihre Organisation zustimmen - Apple Internet Accounts" muss per "Akzeptieren" bestätigt werden.

![Administrativer Zustimmungsdialog: Angeforderte Berechtigung für Ihre Organisation zustimmen - Apple Internet Accounts - Diese Anwendung wird nicht von Microsoft oder Ihrer Organisation veröffentlicht. Diese App benötigt folgende Berechtigungen: Über Exchange Active Sync auf Postfächer zugreifen, Als angemeldeter Benutzer über Exchange-Webdienste auf Postfächer zugreifen, Anmelden und Benutzerprofil lesen](/img/2020/2020-05-07_Apple-Internet-Accounts-de_2.png "Administrativer Zustimmungsdialog für Apple Internet Accounts in Microsoft 365") 

Anschließend wird ein Fehler angezeigt, da die hinterlegte Redirect URL auf https://example.com verweist. Der Fehler AADSTS900561 kann in diesem Fall ignoriert werden.

![Fehler: Leider können wir Sie nicht anmelden. AADSTS900561: The endpoint only accepts POST requests. Received a GET request. Kann in diesem Fall auf Grund der hinterlegten Redirect URL ignoriert werden.](/img/2020/2020-05-07_Apple-Internet-Accounts-de_3.png "Fehler AADSTS900561: Kann in diesem Fall auf Grund der hinterlegten Redirect URL ignoriert werden.")

Die App sollte nun in Azure AD unter "Enterprise applications" -> "All applications" aufgelistet sein.

![Auflistung erlaubter Enterprise Applications in Azure AD](/img/2020/2020-05-07_AzureAD_enterpriseapplicationslist.png "Auflistung erlaubter Enterprise Applications in Azure AD")

#### Schritt 4: Funktion überprüfen

Anschließend sollten die Anwender per iOS Kalender/Kontakte auf ihre in Exchange Online hinterlegten Daten zugreifen können.

### Lösungsmöglichkeit 2: Administrator-Anfragen aktivieren

Alternativ kann aktiviert werden, dass Anwender die Genehmigung einer App beantragen können. Dies ist auch ergänzend zu der einmaligen administrativen Freigabe aus Lösung 1 möglich.

#### Schritt 1: Admin Consent Requests aktivieren

Als Administrator in Azure AD ["Enterprise applications" -> "User settings"](https://portal.azure.com/#blade/Microsoft_AAD_IAM/StartboardApplicationsMenuBlade/UserSettings/menuId/){:target="_blank" rel="noopener noreferrer"} aufrufen. Unter "Admin consent requests (Preview)" kann die Option "Users can request admin consent to apps they are unable to consent to" aktiviert werden. Anschließend auf "Select admin consent request reviewers" klicken und die Administratoren auswählen, die die Requests bestätigen sollen. Bei Bedarf kann die Benachrichtigung des Administrators per E-Mail deaktiviert/aktiviert werden. Standardmäßig laufen die Anfragen nach 30 Tagen ab, was bei Bedarf auch angepasst werden kann.

![Aktivieren von Enterprise Application Admin Consent Request in Azure AD](/img/2020/2020-05-07_EnterpriseApplication_AdminConsentRequest.png "Aktivieren von Enterprise Application Admin Consent Request in Azure AD")

#### Schritt 2: Benutzer fragt Administrator-Zustimmung an

Wenn ein Benutzer nun eine neue Applikation nutzen möchte, erscheint die Meldung "**Genehmigung erforderlich**". Die notwendigen Berechtigungen der Applikation werden aufgelistet. Der Benutzer muss eine Begründung für die Anfrage der Applikation eingeben. Anschließend kann die Genehmigungsanforderung abgesendet werden.

![Hinweis für Endanwender bei Benutzung der App - Genehmigung erforderlich. Die Rechte der App werden aufgeführt. Es muss eine Begründung für die Anfrage eingegeben werden.](/img/2020/2020-05-07_RequestAdminConsent_as_enduser.png "Hinweis für Endanwender bei Benutzung der App - Genehmigung erforderlich. Die Rechte der App werden aufgeführt. Es muss eine Begründung für die Anfrage eingegeben werden.")

#### Schritt 3: Administrator prüft die Genehmigungsanforderung

Die ausgewählten Administratoren erhalten eine E-Mail, in der Details zur Anforderung aufgeführt werden. In der E-Mail kann auf "Anforderung überprüfen" geklickt werden, um die Anfrage zu bearbeiten. Falls bis zum Ablaufdatum nicht reagiert wird, wird die Anfrage automatisch zurückgewiesen.

![Auflistung von Enterprise Application - Admin consent requests](/img/2020/2020-05-07_EnterpriseApplication_AdminConsentRequest_by_mail.png "Auflistung von Enterprise Application - Admin consent requests")

Alternativ kann der Administrator auch die Liste der offenen Anfragen in Azure AD aufrufen. Hierzu ["Enterprise applications" -> "Admin consent requests"](https://portal.azure.com/#blade/Microsoft_AAD_IAM/StartboardApplicationsMenuBlade/AccessRequests/menuId/){:target="_blank" rel="noopener noreferrer"} anklicken.

![Auflistung von Enterprise Application - Admin consent requests](/img/2020/2020-05-07_EnterpriseApplications_userreqeustlist.png "Auflistung von Enterprise Application - Admin consent requests")

Es können Details wie Name, Homepage URL, verwendete Reply URLs angezeigt werden. Unter "Requested by" wird angezeigt, welcher Benutzer die App angefragt hat. Der Administrator kann nun wahlweise die Berechtigungen prüfen und genehmigen ("Review permissions and consent"), oder die Anfrage per "Deny" ablehnen. Falls die Applikation dauerhaft gesperrt werden soll, damit keine Anfragen mehr zu dieser App eingereicht werden können, kann "Block" angeklickt werden.

![Abruf von Details zum Enterprise Application Admin consent request](/img/2020/2020-05-07_EnterpriseApplication_AdminConsent_Actions_and_infos.png "Abruf von Details zum Enterprise Application Admin consent request")

Falls die Applikation nicht gestattet wurde, würde der Benutzer bei der nächsten Anmeldung die Meldung **AADSTS7000112** erhalten.

![Applikation wurde durch den Administrator blockiert oder nicht genehmigt: AADSTS7000112 application is disabled](/img/2020/2020-05-07_AADSTS7000112_application_disabled.png "Applikation wurde durch den Administrator blockiert oder nicht genehmigt: AADSTS7000112 application is disabled")

#### Schritt 4: Funktion überprüfen

Anschließend sollten die Anwender die angefragte und genehmigte App verwenden können.

## Deaktivieren einer zuvor erlaubten App

Wenn eine App bereits erlaubt ist, kann sie bei Bedarf auch wieder deaktiviert werden. Hierzu die Applikation aus "Enterprise applications" raussuchen und unter "Properties" die Option "Enabled for users to sign-in" auf "No" setzen. Falls man hier stattdessen auf "Delete" klickt, können die Benutzer wieder erneut eine Genehmigung beantragen.

![Deaktivieren einer bereits bestehenden Enterprise App: Enabled for users to sign-in auf No setzen.](/img/2020/2020-05-07_Disable_existing_enterpriseapp.png "Deaktivieren einer bereits bestehenden Enterprise App: Enabled for users to sign-in auf No setzen.")

## Weiterführende Links
- [Dokumentation: Application management with Azure Active Directory (docs.microsoft.com)](https://docs.microsoft.com/en-us/azure/active-directory/manage-apps/what-is-application-management){:target="_blank" rel="noopener noreferrer"}
- [Artikel: "iOS accounts needs permission to access Office 365 resources" (office365.thorpick.de)](https://office365.thorpick.de/ios-accounts-needs-permission-to-access-office-365-resources){:target="_blank" rel="noopener noreferrer"}
