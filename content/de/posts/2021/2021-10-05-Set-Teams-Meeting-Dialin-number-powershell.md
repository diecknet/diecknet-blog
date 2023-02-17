---
aliases:
    - set-teams-meeting-dialin-number-powershell
slug: Set-Teams-Meeting-Dialin-number-powershell
title: Einwahlrufnummer für Teams Meetings per PowerShell setzen
contenttags:
    [teams, microsoft teams, teams dial in number, teams audio conferencing]
image: /images/2021/2021-10-05_TeamsMeeting-DialIn-Number_thumbnail.png
imageAlt: A screenshot showing a Microsoft Teams Meeting invite with a dial-in phone number.
date: 2021-10-05
---

Mit Microsoft Teams Audio Conferencing (Microsoft 365-Audiokonferenz) Lizenzen ist es möglich, Einwahlrufnummern für Teams Besprechungen zu verwenden. Die Lizenz wird für jeden Benutzer benötigt, der zu Teams Meetings mit Einwahlrufnummer einladen soll.

Die Einwahlrufnummer in der Meeting-Einladung basiert auf dem UsageLocation Attribut des Benutzers - **einmalig wenn der Benutzer für Audiokonferenz aktiviert wird**. Also selbst wenn ihr eine falsche UsageLocation korrigiert, hat der Benutzer noch eine alte Einwahlrufnummer zugewiesen.

## Teams Admin Center verwenden um die Einwahlrufnummer für einzelne Benutzer zu ändern

Users ➔ Manage Users ➔ Auf einen Benutzer klicken ➔ Auf "Edit" klicken (neben "Audio Conferencing") ➔ Auswählen der "Toll number" entsprechend des Benutzerstandorts.

[![Microsoft Teams Admin Center mit Optionen zum Ändern der Einwahlrufnummer.](/images/2021/2021-10-05_TeamsMeeting-DialIn-Number.png "Microsoft Teams Admin Center mit Optionen zum Ändern der Einwahlrufnummer.")](/images/2021/2021-10-05_TeamsMeeting-DialIn-Number.png)

## PowerShell verwenden um die Einwahlrufnummer für mehrere Benutzer zu ändern

**Hinweis:** Ihr müsst das [Microsoft Teams PowerShell Modul](https://docs.microsoft.com/en-us/microsoftteams/teams-powershell-install) installiert haben.

Ich nenne diese Nummern "Einwahlrufnummern", aber der interne Name ist "ServiceNumber". Ihr könnt eine Liste der verfügbaren Nummenr per `Get-CsOnlineDialInConferencingServiceNumber` abrufen.

```powershell
# Mit MS Teams verbinden
Connect-MicrosoftTeams

# Alle verfügbaren Einwahlrufnummern anzeigen
Get-CsOnlineDialInConferencingServiceNumber

# Setzen der Einwahlrufnummer. Das hier ist ein Beispielwert. Ja, wir lassen das führende +plus Symbol weg.
$dialInNumber = 1234567890

# Alle Benutzer die geändert werden sollen abrufen. Das hier ist ein Beispiel, das alle Benutzer mit der UsageLocation "US" abruft - ändert es entsprechend wie ihr es braucht mit anderen Filtern
$users = Get-CsOnlineUser -Filter 'UsageLocation -eq "US"' -ResultSize Unlimited

# Loop durch die Users
foreach($user in $users) {
 # Neue Einwahlrufnummer für Meetings anwenden für jeden Benutzer
 Set-CsOnlineDialInConferencingUser -Identity $user.Identity -ServiceNumber $dialInNumber
}
```

## Quelle

[Initiale Zuweisung der Einwahlrufnummern](https://docs.microsoft.com/en-us/microsoftteams/set-the-phone-numbers-included-on-invites-in-teams#initial-assignment-of-phone-numbers-that-are-included-in-the-meeting-invites-for-new-users)

