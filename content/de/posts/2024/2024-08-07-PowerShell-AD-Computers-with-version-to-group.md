---
slug: "powershell-active-directory-computers-filtering"
title: "PowerShell: Active Directory Computer filtern"
date: 2024-08-07
comments: true
tags: [powershell, active directory]
---
Ich habe vor Kurzem an einem Kundenprojekt gearbeitet, bei dem ich rund um Active Directory Computer einiges machen musste. Ich habe PowerShell und etwas leichtes Filtern und Verarbeiten verwendet. Diese Beispiele teile ich jetzt hier und hoffentlich findet sie jemand interessant oder hilfreich. Vielleicht werde ich sie auch zukünftig interessant finden - in dem Fall: Moin Andi! 👋

## Beispiel 1: Computer nach Betriebssystemversion filtern

Das AD-Attribut `OperatingSystemVersion` enthält die OS-Version inklusive Buildnummer in einem Format wie diesem: `10.0 (19041)`

Ich habe einige ältere Geräte finden müssen, aber ein Vergleich mit einem "kleiner als"-Operator gegen den Attributwert war nicht möglich. Deshalb habe ich mit dem Operator `-match` und einem regulären Ausdruck nur die eigentliche Buildnummer in den Klammern extrahiert. Wenn der RegEx gepasst hat, ist das extrahierte Ergebnis in der automatischen Variable `$Matches` gelandet.

Danach habe ich die Buildnummer schließlich mit dem "kleiner als"-Operator (`-lt`) vergleichen können. Wenn das Gerät eine ältere Buildversion als `19042` verwendet hat, habe ich den Computer einer bestimmten Sicherheitsgruppe hinzugefügt.

```powershell
$ADComputers = Get-ADComputer -Filter * -Properties OperatingSystemVersion

foreach($ADComputer in $ADComputers) {
    if($ADComputer.OperatingSystemVersion -match "\d+\.\d? \((\d+)\)") {
        if($Matches[1] -lt 19042) {
            Add-ADGroupMember -Identity "My-Group-with-old-devices" -Members $ADComputer.DistinguishedName
            $ADComputer.Name # just outputting this, so I know where I'm currently at
        }
    }
}
```

## Beispiel 2: Nur Windows-Client-Computer abrufen

Da der Kunde auch Windows Server und andere Nicht-Windows-Geräte im AD gehabt hat, habe ich den folgenden Code verwendet, um nur Windows-**Clients** abzurufen:

```powershell
$ADComputers = Get-ADComputer -Filter "OperatingSystem -notlike '*Server*' -and OperatingSystem -like '*Windows*'" -Properties OperatingSystemVersion,OperatingSystem
```

## Beispiel 3: Alle Computer auflisten, die nicht von Intune verwaltet wurden

Ich habe außerdem vergleichen wollen, welche Geräte aus dem AD nicht über Microsoft Intune verwaltet wurden. Ich habe über das Intune Admin Center eine Liste der Windows-Geräte aus Intune exportiert.

[![Export Windows Devices list via Intune in CSV format](/images/2024/2024-08-07-Intune-Export-Devices.jpg "Export Windows Devices list via Intune in CSV format")](/images/2024/2024-08-07-Intune-Export-Devices.jpg)

Danach habe ich die Liste (CSV-Format) in PowerShell importiert und sie mit einer Liste von AD-Computern über den Operator `-notin` verglichen. Alle Geräte, die dann zurückgegeben wurden, waren **nicht** in Intune, sondern nur im Active Directory.

```powershell
$IntuneDevices = Import-Csv IntuneExportDownloadedFromThePortal.csv
$NonIntuneDevices = foreach($ADComputer in $ADComputers) {
    if($ADComputer.Name -notin $IntuneDevices."Device name") {
        $ADComputer | Select-Object -Property Name,Enabled,OperatingSystem,OperatingSystemVersion
    }
}
$NonIntuneDevices | Export-Csv -Path .\NonIntuneDevices.csv -NoTypeInformation -Encoding utf8
```
