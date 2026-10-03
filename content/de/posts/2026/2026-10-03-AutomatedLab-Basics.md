---
slug: "automatedlab-basics"
title: "Testumgebung automatisch einrichten per AutomatedLab"
date: 2026-10-03
tags: [powershell, windows]
---

Wenn ihr öfter mal eine Testumgebung braucht um z.B. etwas in einer Active Directory Umgebung auszuprobieren, dann müsst ihr das nicht manuell einrichten. Mit AutomatedLab könnt ihr euch einfach eine Testumgebung definieren und automatisch einrichten. AutomatedLab ist ein kostenloses PowerShell Modul.

Ich demonstriere das Modul auch [in diesem Video auf YouTube](https://youtu.be/v4yjIMkQ4aI).

## Installation

Das Modul funktioniert wohl auch unter Linux und macOS, aber ich habe es bisher nur unter Windows verwendet.

Hinweise zur Installation sind in der offiziellen Dokumentation zu finden: <https://automatedlab.org/en/latest/Wiki/Basic/install/>
Aber ich habe folgendes ausgeführt:

```powershell
Install-Module AutomatedLab -SkipPublisherCheck
Enable-LabHostRemoting -Force
New-LabSourcesFolder -DriveLetter C
```

## ISO-Dateien für Lab Umgebung

Innerhalb des "LabSources" Ordners gibt es einen "ISOs" Ordner. Dort müssen die ISO-Dateien für die automatische Installation der Betriebssysteme abgelegt werden. 

Falls ihr gerade keine ISOs griffbereit habt, könnt ihr euch bei Microsoft auch kostenlose Evaluation Versionen von Windows 11 oder Windows Server herunterladen: <https://www.microsoft.com/en-us/evalcenter>

Anschließend könnt ihr per PowerShell prüfen, ob die ISOs korrekt erkannt werden:

```powershell
Get-LabAvailableOperatingSystem
```

[![Beispielhafte Rückgabe für Get-LabAvailableOperatingSystem - zeigt Windows Server 2025 und Windows 11 in verschiedenen Editionen](/images/2026/2026-10-03-GetLabAvailableOperatingSystem.jpg "Beispielhafte Rückgabe für Get-LabAvailableOperatingSystem - zeigt Windows Server 2025 und Windows 11 in verschiedenen Editionen")](/images/2026/2026-10-03-GetLabAvailableOperatingSystem.jpg)

## Lab definieren und einrichten

Hier ist ein Beispiel für eine einfache Testumgebung. Wenn ihr kein Passwort definiert, dann wird `Somepass1` als Standardpasswort verwendet.

Um die Lesbarkeit zu erhöhen, habe ich die Parameterwerte per [Hashtable und Splatting](/de/2024/05/15/powershell-multiline-commands/#splatting) zugeführt. Ihr könnt aber natürlich auch ganz normal mit der Schreibweise `-Parametername "Parameterwert"` arbeiten, wenn ihr das möchtet.

```powershell
#MyLab.ps1
New-LabDefinition -Name Demotenant -DefaulVirtualizationEngine HyperV

$Domain = {
    DomainName = "ad.demotenant.de"
}

$DC1 = @{
    Name = "DC1"
    Memory = 4GB
    OperationSystem = "Windows Server 2025 Standard (Desktop Experience)"
    Roles = "RootDC"
}
Add-LabMachineDefinition @DC1 @Domain

$Server1 = @{
    Name = "Server1"
    Memory = 4GB
    OperationSystem = "Windows Server 2025 Standard (Desktop Experience)"
}
Add-LabMachineDefinition @Server1 @Domain

$Client1 = @{
    Name = "Client1"
    Memory = 4GB
    OperationSystem = "Windows 11 Pro"
}
Add-LabMachineDefinition @Client1 @Domain

Install-Lab

Show-LabDeploymentSummary
```

Ich habe mir das Skript als `MyLab.ps1` abgespeichert. Wichtig ist: Das Skript muss mit Adminrechten ausgeführt werden, damit mit Hyper-V interagiert werden kann. Ihr könnt also wahlweise euer VS Code (oder die PowerShell ISE) mit Adminrechten starten oder ein extra PowerShell Fenster mit Adminrechten starten.

```powershell
# muss mit Adminrechten ausgeführt werden!
.\MyLab.ps1
```

Das dauert dann ein bisschen, je nach System und gewählten Lab Maschinen. Am Ende wird euch die Zusammenfassung angezeigt. Wenn alles erfolgreich durchgelaufen ist, könnt ihr die Umgebung jetzt benutzen.

## Lab löschen

Wenn ihr fertig seid mit euren Tests, könnt ihr die Umgebung einfach wieder löschen. Falls ihr zwischenzeitlich euer PowerShell Fenster geschlossen habt, könnt ihr das Lab nochmal wieder per `Import-Lab Demotenant` in die Session importieren.

Zum Löschen könnt ihr dann einfach `Remove-Lab` ausführen.

## Weitere Möglichkeiten und Optionen

AutomatedLab kann auch noch weitaus mehr, z.B. auch Microsoft SQL Server installieren oder mehrere AD Domains einrichten und mit Trusts verbinden. Ihr könnt auch den genutzten IP-Bereich, Passwörter und vieles mehr steuern. Schaut dazu am besten [in die Dokumentation](https://automatedlab.org/en/latest/).