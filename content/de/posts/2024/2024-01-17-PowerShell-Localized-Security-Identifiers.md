---
slug: "powershell-localized-security-identifiers"
title: "PowerShell: Übersetzte Security Identifier Namen herausfinden"
date: 2024-01-17
comments: true
tags: [powershell, security identifiers, windows]
cover: 
    image: "/images/2024/2024-01-17_LocalizedSID.jpg"
---

Security Identifiers sind dazu da, um bestimmte Security Prinzipale oder Gruppen unter Windows zu identifizieren. Leider sind die dazugehörigen Namen lokalisiert, also sind zum Beispiel in einem deutschsprachigen System anders als in einem englischsprachigen System.

Beispielsweise heißt die eingebaute Administratorgruppe auf Englisch `BUILTIN\ADMINISTRATORS` und auf Deutsch `VORDEFINIERT\Administratoren`. Oder das Englische `NT AUTHORITY\SYSTEM` wird an einem Deutschen System zu `NT-AUTORITÄT\SYSTEM`. **Das finde ich richtig abgefahren!** Da wird auf einmal ein Leerzeichen durch ein Bindestrich ersetzt. Naja was soll's.

Diese unterschiedlichen Namen können problematisch sein, wenn sie in Skripten fest reingeschrieben werden (hardcoded). Und falls das Skript dann auf einem anderssprachigem System ausgeführt wird, dann schlägt es fehl - zumindest teilweise, kommt auf das Skript an. So war es zum Beispiel [in diesem Skript vom Microsoft FastTrack Team](https://github.com/microsoft/FastTrack/blob/master/scripts/Find-MailboxDelegates/Find-MailboxDelegates.ps1), welches bei Migrationen zu Exchange Online helfen soll. Ich habe dann eine [Code Änderung eingereicht](https://github.com/microsoft/FastTrack/commit/ff6532501fc68f6c99a8b4447b1efb72158f1315), die auch akzeptiert wurde.

## SID zu Namen konvertieren

Hier also die Lösung: Anstatt den Security Principal Namen in allen erdenklichen Sprachen im Code aufzunehmen, kann eine .NET Methode verwendet werden. Hier zum Beispiel um den korrekten Namen für `NT AUTHORITY\SYSTEM` am aktuellen System herauszufinden:

```powershell
# Get the localized name of "NT AUTHORITY\SYSTEM" for the current user's language
# for example on German System it would return "NT-AUTORITÄT\SYSTEM"
([System.Security.Principal.SecurityIdentifier]::new("S-1-5-18")).Translate([System.Security.Principal.NTAccount]).Value
```

Falls ihr den Namen für einen anderen Security Identifier herausfinden wollt, dann habe ich [hier auf GitHub ein paar Code Snippets abgelegt](https://github.com/diecknet/diecknet-scripts/blob/main/Snips/Get-LocalizedNTAuthority.ps1). Aber grundsätzlich müsst ihr nur die SID austauschen, die als Parameter für die `new()` Methode verwendet wird. Viele weitere SIDs könnt ihr hier bei Microsoft finden: [https://learn.microsoft.com/en-us/windows-server/identity/ad-ds/manage/understand-security-identifiers](https://learn.microsoft.com/en-us/windows-server/identity/ad-ds/manage/understand-security-identifiers)
