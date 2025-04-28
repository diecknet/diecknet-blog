---
slug: "active-directory-recycle-bin"
title: "Active Directory Papierkorb aktivieren, konfigurieren und Objekte wiederherstellen"
date: 2025-04-28
tags: [powershell, active directory]
---

Wenn ihr Active Directory Domain Services verwendet, solltet ihr unbedingt prüfen, ob der **AD-Papierkorb** bei euch aktiviert ist.

## Was ist der AD-Papierkorb?

Der AD-Papierkorb funktioniert ähnlich wie ein Papierkorb im Dateisystem:  
**Gelöschte Objekte** (Benutzer, Gruppen etc.) landen zunächst im Papierkorb und können einfach wiederhergestellt werden.

Das ist besonders praktisch bei:

- versehentlichen Löschungen
- absichtlichen Löschungen, die rückgängig gemacht werden sollen,
- fehlendem AD-Backup (ersetzt natürlich kein Backup!)

Der AD-Papierkorb wurde mit **Windows Server 2008 R2** eingeführt.  
Voraussetzung: Euer AD-Forest muss mindestens den **Windows Server 2008 R2 Functional Level** haben.

Ohne aktivierten AD-Papierkorb ist das Wiederherstellen gelöschter Objekte deutlich schwieriger (siehe Abschnitt [Wiederherstellen ohne AD-Papierkorb](#wiederherstellen-ohne-ad-papierkorb)).

### Wichtige Hinweise

Generell ist die Aktivierung des AD-Papierkorbs empfehlenswert. Aber:

- **Wichtig:** Die Aktivierung kann **nicht rückgängig** gemacht werden!
- Bereits gelöschte Objekte werden dadurch **nicht** nachträglich besser wiederherstellbar.
  - Ganz im Gegenteil: Es gibt auch ohne AD-Papierkorb eine rudimentäre Wiederherstellungsmöglichkeit (siehe Abschnitt [Wiederherstellen ohne AD-Papierkorb](#wiederherstellen-ohne-ad-papierkorb)). Falls ihr jetzt aber einfach den AD-Papierkorb aktiviert, gehen bereits gelöschte Elemente unwiderruflich verloren.

### Wiederherstellen ohne AD-Papierkorb

Auch ohne AD-Papierkorb können gelöschte Objekte rudimentär wiederhergestellt werden, aber:

- Die meisten Eigenschaften **bleiben verloren** (wurden in dem Moment verworfen, wo das Objekt gelöscht wurde)
- Nur die ObjectSID, ObjectGUID und DistinguishedName bleiben erhalten (nützlich falls das gelöschte Objekt in irgendwelchen Berechtigungs-ACLs drin steht)

Beispiel: Wiederherstellung per PowerShell:

```powershell
Get-ADObject -Filter 'isDeleted -eq $true' -IncludeDeletedObjects

<# Beispiel Rückgabe:
[...]
ObjectGUID: 4ed8fada-a248-49fc-bca9-5b920231bd5b
#>

# Dann die ObjectGUID bei Restore-ADObject angeben:
Restore-ADObject -Identity 4ed8fada-a248-49fc-bca9-5b920231bd5b
```

## AD-Papierkorb aktivieren

Das Aktivieren des Active Directory Papierkorbs kann wahlweise über die GUI (AD Verwaltungscenter) oder die PowerShell gemacht werden.

### Über das Active Directory Verwaltungscenter

1. Das **Active Directory Verwaltungscenter** öffnen.
2. Auf die eigene **Domäne** klicken.
3. Rechts erscheint die Option **Papierkorb aktivieren** ➡️ drauf klicken und bestätigen.

Falls die Option ausgegraut ist, ist der AD-Papierkorb bei euch wahrscheinlich schon aktiviert. Wenn ihr euch nicht sicher seid, dann schaut, ob es den Container "Deleted Objects" bei euch im AD gibt. Der sollte nur existieren, wenn der AD-Papierkorb aktiviert ist.

[![Active Directory Admin Center: Prüfen ob der AD-Papierkorb aktiviert ist](/images/2025/2025-04-28_AD-Papierkorb.jpg "Active Directory Admin Center: Prüfen ob der AD-Papierkorb aktiviert ist")](/images/2025/2025-04-28_AD-Papierkorb.jpg)

### Per PowerShell

Per PowerShell könnt ihr den Papierkorb ebenfalls aktivieren. Für meine Domäne "lan.demotenant.de" habe ich folgenden Befehl verwendet. Bei den Parametern `-Identity` und `-Target` müsst ihr natürlich Werte eintragen, die eurer Umgebung entsprechen:

```powershell
Enable-ADOptionalFeature -Identity 'CN=Recycle Bin Feature,CN=Optional Features,CN=Directory Service,CN=Windows NT,CN=Services,CN=Configuration,DC=lan,DC=demotenant,DC=de' -Scope ForestOrConfigurationSet -Target 'lan.demotenant.de'
```

Ihr erhaltet eine Warnung, dass die Änderung nicht rückgängig gemacht werden kann. Die solltet ihr bestätigen.

## Wiederherstellen von Objekten aus dem AD-Papierkorb

Abgesehen von den Objekt-Eigenschaften die jetzt erhalten bleiben, hat die Wiederherstellung aus dem AD-Papierkorb noch einen weiteren Vorteil:  
Die Objekte sind auch per GUI (per AD Verwaltungscenter) wiederherstellbar.

### Wiederherstellung per Active Directory Verwaltungscenter

- Auf den Container **Deleted Objects** klicken.
- Objekt auswählen und auf **Wiederherstellen** klicken um das Objekt in der originalen Organisationseinheit, oder auf **Wiederherstellen in...** um das Objekt in einem anderen Container wiederherzustellen.

[![Active Directory Admin Center: Wiederherstellen eines gelöschten Objekts](/images/2025/2025-04-28_AD-Papierkorb-Restore.jpg "Active Directory Admin Center: Wiederherstellen eines gelöschten Objekts")](/images/2025/2025-04-28_AD-Papierkorb-Restore.jpg)

### Wiederherstellung per PowerShell

```powershell
# Erstmal nach dem gelöschten Objekt suchen, z.B. hier nach *test*
Get-ADObject -Filter 'isDeleted -eq $true -and Name -like "*Test*"' -IncludeDeletedObjects

# Wenn das passt und nur 1 Objekt zurückgegeben wird, 
# können wir die Rückgabe an Restore-ADObject pipen:
Get-ADObject -Filter 'isDeleted -eq $true -and Name -like "*Test*"' -IncludeDeletedObjects | Restore-ADObject
```

Optional: Wiederherstellung in eine andere OU/einen anderen Container:

```powershell
Restore-ADObject -Identity <ObjectGUID> -TargetPath "OU=Beispiel,DC=lan,DC=demotenant,DC=de"
```

## Aufbewahrungsdauer der gelöschten Objekte

Standardmäßig bleiben gelöschte Objekte **180 Tage** im AD erhalten.  
Dieser Wert wird über das **Tombstone Lifetime**-Attribut gesteuert. In älteren Domainen kann es aber sein, dass ihr noch einen geringeren Standardwert habt.

Das könnt ihr mit ADSI Edit überprüfen:

1. ADSI Editor öffnen
2. Verbindung herstellen mit **Konfiguration**
3. Pfad: `CN=Configuration [...] -> CN=Services [...] -> CN=Windows NT [...] -> CN=Directory Services [...]`. Mit Rechtsklick auf `CN=Directory Services [...]` klicken und im Kontextmenü "Eigenschaften" aufrufen.
4. Im Attribut-Editor das Attribut **tombstoneLifetime** prüfen = das ist die Aufbewahrungszeit in Tagen.

Falls `msDS-DeletedObjectLifetime` explizit gesetzt ist, wird stattdessen dieser Wert verwendet. Im Standard ist der Wert aber leer.  
Ist er nicht gesetzt, greift der Wert aus `tombstoneLifetime`.

## Weiterführende Links

- Video dazu auf meinem YouTube-Kanal: <https://youtu.be/3f5Nozh9ny4>
- Microsoft Dokumentation - Enable and use Active Directory Recycle Bin: <https://learn.microsoft.com/en-us/windows-server/identity/ad-ds/get-started/adac/active-directory-recycle-bin?tabs=powershell>
