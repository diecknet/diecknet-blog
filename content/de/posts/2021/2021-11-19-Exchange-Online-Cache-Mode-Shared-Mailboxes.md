---
title: Outlook Cache Modus für Freigegebene Postfächer
contenttags: [exchange, exchange online, shared mailbox, freigegebenes postfach]
image: /images/2021/2021-11-19-Es-sind-weitere-Elemente-in-diesem-Ordner-auf-dem-Server-vorhanden_Zoomed.png
imageAlt: A screenshot showing a Microsoft Teams Meeting invite with a dial-in phone number.
date: 2021-11-19
---

In neueren Microsoft Outlook Versionen es ist nicht mehr möglich, im Cache Modus für freigegebene Postfächer weitere E-Mails abzurufen. Stattdessen wird am Ende der E-Mail-Liste folgender Hinweis angezeigt:

> Es sind weitere Elemente in diesem Ordner auf dem Server vorhanden.
>
> Verbindung mit dem Server herstellen, um diese anzuzeigen

[![Outlook Meldung: Es sind weitere Elemente in diesem Ordner auf dem Server vorhanden. Verbindung mit dem Server herstellen, um diese anzuzeigen](/images/2021/2021-11-19-Es-sind-weitere-Elemente-in-diesem-Ordner-auf-dem-Server-vorhanden_Zoomed.png "Outlook Meldung: Es sind weitere Elemente in diesem Ordner auf dem Server vorhanden. Verbindung mit dem Server herstellen, um diese anzuzeigen")](/images/2021/2021-11-19-Es-sind-weitere-Elemente-in-diesem-Ordner-auf-dem-Server-vorhanden_Zoomed.png)

In persönlichen Postfächern wird stattdessen die Möglichkeit geboten, weitere Elemente vom Server abzurufen. Der Text dazu wurde stümperhaft automatisch übersetzt, was sich gut ins Gesamtbild fügt:

> Es sind weitere Elemente in diesem Ordner auf dem Server vorhanden.
>
> Klicken Sie hier, um weitere Informationen "Microsoft Exchange" anzuzeigen

[![Outlook Meldung: Es sind weitere Elemente in diesem Ordner auf dem Server vorhanden. Klicken Sie hier, um weitere Informationen Microsoft Exchange anzuzeigen](/images/2021/2021-11-19_Es-sind-weitere-Elemente-in-diesem-Ordner-auf-dem-Server-vorhanden-weitere-Informationen_Zoomed.png "Outlook Meldung: Es sind weitere Elemente in diesem Ordner auf dem Server vorhanden. Klicken Sie hier, um weitere Informationen Microsoft Exchange anzuzeigen")](/images/2021/2021-11-19_Es-sind-weitere-Elemente-in-diesem-Ordner-auf-dem-Server-vorhanden-weitere-Informationen_Zoomed.png)

## Workaround

Da es nicht immer praktikabel ist, einfach den Cache Mode für alle Postfachdaten in allen freigegebenen Postfächern zu aktivieren habe ich nach einem Workaround gesucht. Von vielen wird empfohlen, freigegebene Postfächer gar nicht zu cachen. Nach Möglichkeit würde ich aber zumindest für einen gewissen Zeitraum cachen.

**Hinweis: In manchen Umgebungen funktioniert diese Vorgehensweise nicht und es wird kein Link zum Anzeigen von allen Elementen angezeigt. Die Ursache ist mir aktuell unklar.**

Kurz zusammengefasst lautet die Vorgehensweise:

1. AutoMapping für das Postfach deaktivieren. Dafür muss die Berechtigung auf das Postfach entzogen werden und dann per PowerShell mit dem zusätzlichen Parameter `-AutoMapping:$false` wieder erteilt werden. Anschließend 1h warten, bis die Berechtigung aktiv wird.
1. Das freigegebene Postfach als zusätzliches **Konto** hinzufügen – nicht als freigegebenes Postfach.
1. Bei Angabe der Zugangsdaten dann mit den Zugangsdaten des Benutzers anmelden (nicht mit der E-Mail-Adresse der SharedMailbox).
1. Outlook neustarten.
1. Der Cache Zeitraum lässt sich nun für die SharedMailbox separat einstellen. Der Abruf von Daten über den Cache Zeitraum hinaus ist möglich.

### 1. AutoMapping deaktivieren

Per [Exchange Online PowerShell](https://docs.microsoft.com/de-de/powershell/exchange/exchange-online-powershell?view=exchange-ps) die FullAccess Berechtigung zunächst entziehen, dann mit dem zusätzlichen Parameter `-AutoMapping:$false` erneut zuweisen. In diesem Beispiel heißt das freigegebene Postfach `MyShared-Mailbox` und der Benutzer mit Vollzugriff heißt `andreas.dieckmann`. Ich gehe hier von einer Exchange Online Umgebung aus.

```powershell
Remove-MailboxPermission MyShared-Mailbox -User andreas.dieckmann -AccessRights fullaccess
Add-MailboxPermission MyShared-Mailbox -User andreas.dieckmann -AccessRights fullaccess -AutoMapping:$false
```

Nun 1h abwarten, bis die Berechtigung aktiv wird.

### 2. Freigegebenes Postfach als zusätzliches Konto hinzufügen

Ein neues Konto hinzufügen, beispielsweise per "Datei" ➔ "Kontoeinstellungen" ➔ "Kontoeinstellungen..." ➔ "Neu...".
Die E-Mail-Adresse eintragen und auf "Verbinden" klicken.

[![Outlook Konto Einrichtung: Einbinden eines Kontos.](/images/2021/2021-11-19-E-Mail-Konto-Einrichtung-01.png "Outlook Konto Einrichtung: Einbinden einer SharedMailbox als Konto.")](/images/2021/2021-11-19-E-Mail-Konto-Einrichtung-01.png)

[![Outlook Konto Einrichtung: Einbinden einer SharedMailbox als Konto.](/images/2021/2021-11-19-E-Mail-Konto-Einrichtung-02.png "Outlook Konto Einrichtung: Einbinden einer SharedMailbox als Konto.")](/images/2021/2021-11-19-E-Mail-Konto-Einrichtung-02.png)

### 3. Zugangsdaten des Benutzers angeben

Im Authentifizierungs-Dialog die E-Mail-Adresse des freigegebenen Postfachs entfernen und stattdessen die E-Mail-Adresse des Benutzers eintragen. Falls bereits nach dem Kennwort des Freigegebenen Postfachs gefragt wird, auf "Mit einem anderen Konto anmelden" klicken.

[![Outlook Konto Einrichtung: E-Mail-Adresse der SharedMailbox entfernen.](/images/2021/2021-11-19-E-Mail-Konto-Einrichtung-03.png "Outlook Konto Einrichtung: E-Mail-Adresse der SharedMailbox entfernen.")](/images/2021/2021-11-19-E-Mail-Konto-Einrichtung-03.png)

[![Outlook Konto Einrichtung: E-Mail-Adresse des Benutzers eingeben.](/images/2021/2021-11-19-E-Mail-Konto-Einrichtung-04.png "Outlook Konto Einrichtung: E-Mail-Adresse des Benutzers eingeben.")](/images/2021/2021-11-19-E-Mail-Konto-Einrichtung-04.png)

### 4. Outlook neustarten

Outlook beenden und neustarten.

[![Outlook schließen Dialog](/images/2021/2021-11-19-Close-Outlook.png "Outlook schließen Dialog")](/images/2021/2021-11-19-Close-Outlook.png)

### 5. Cache Zeitraum einstellen

Der Cache Zeitraum ist jetzt in den Kontoeinstellungen separat einstellbar. Wenn ihr den Zeitraum anpasst, müsst ihr anschließend Outlook noch einmal neustarten.

[![Outlook Cache Zeitraum für SharedMailbox einstellen](/images/2021/2021-11-19-E-Mail-Konto-Cache-Zeitraum.png "Outlook Cache Zeitraum für SharedMailbox einstellen")](/images/2021/2021-11-19-E-Mail-Konto-Cache-Zeitraum.png)

## Ergebnis

Anschließend sollte der Abruf von E-Mails möglich sein, wenn diese älter als der Cache Zeitraum sind. Dazu auf "Klicken Sie hier, um weitere Informationen zu Microsoft Exchange anzuzeigen" klicken.

[![Outlook Cache Zeitraum für SharedMailbox einstellen](/images/2021/2021-11-19_Es-sind-weitere-Elemente-in-diesem-Ordner-auf-dem-Server-vorhanden-weitere-Informationen.png "Outlook Cache Zeitraum für SharedMailbox einstellen")](/images/2021/2021-11-19_Es-sind-weitere-Elemente-in-diesem-Ordner-auf-dem-Server-vorhanden-weitere-Informationen.png)

## Fazit

Ich bin mit diesem Workaround recht zufrieden. Ein wirklich guter Weg das zu automatisieren ist mir leider nicht bekannt. Außerdem habe ich mindestens 1 Tenant, bei dem die Einstellung nicht funktioniert. Dort wird zwar das Freigegebene Postfach als zusätzliches Konto eingebunden, aber der Abruf von nicht-gecacheten E-Mails ist trotzdem nicht möglich.
