---
slug: "powershell-constrainedlanguage-mode-per-gpo"
title: "PowerShell ConstrainedLanguage Mode per Gruppenrichtlinie einstellen"
date: 2023-05-20
comments: true
tags: [powershell, language mode, constrained language]
cover: 
    image: "/images/2023/2023-05-21-ConstrainedLanguageModePerGPO.jpg"
---
PowerShell Language Modes sind eine Möglichkeit die Funktionalität der PowerShell einzuschränken, um die Sicherheit eines Systems zu erhöhen. Das ist natürlich nur ein kleiner Baustein in einer größeren Sicherheitsstrategie, also das alleine ist noch kein ausreichender Schutz für ein System.

Gleichzeitig ist das auch ein zweischneidiges Schwert:  
Vorteil: Wir entziehen potenziellen Angreifern ein mächtiges Werkzeug.  
Nachteil: Wir selbst als Administratoren können die PowerShell an einem System auch nicht mehr richtig nutzen.

Ich habe auch ein [Video zum Thema PowerShell Language Modes erstellt](https://www.youtube.com/watch?v=WmgwybaNwjg), in dem ich weiter darauf eingehe. In diesem Blog-Beitrag hier geht es aber nur darum, wie der **ConstrainedLanguage** Mode per Gruppenrichtlinie konfiguriert werden kann. Die anderen Modes lassen sich leider nicht sinnvoll systemweit aktivieren.

## Hinweis zu `__PSLockdownPolicy`

Die Umgebungsvariable `__PSLockdownPolicy` auf den Wert `4` setzen ist [übrigens **KEIN** sicherer oder supporteter Weg um den ConstrainedLanguage Mode zu aktivieren](https://devblogs.microsoft.com/powershell/powershell-constrained-language-mode/).

## ConstrainedLanguage Mode konfigurieren

**Hinweis: Die Vorgehensweise habe ich mit Windows 11 Enterprise Version 22H2 (Build 22621.1702) evaluiert.**

Der ConstrainedLanguage Mode kann per Windows Defender Application Control (WDAC) oder mit dem älteren AppLocker konfiguriert werden.
Verwendet am besten eine VM zum Testen, die schnell wieder auf einen funktionsfähigen Zustand zurückgesetzt werden kann. Es ist möglich sich mit Application Control Policies sehr schnell das System zu zerschießen, sodass es nicht mehr bootfähig ist.

Um den ConstrainedLanguage Mode per WDAC zu konfigurieren, verwenden wir das Sub-Feature "Code Integrity" mit "Script Enforcement". Diese Script Enforcement betrifft nicht nur PowerShell, sondern auch einige andere Skript Hosts, die Microsoft als "Enlightened" bezeichnet. Der Windows Based Script Host (`wscript.exe`) und Microsoft Console Based Script Host (`cscript.exe`) blockiert die komplette Ausführung von Skripten in den Formaten **VBScript**, **cscript** und **jscript** - egal wo die liegen.
Ähnlich verhält sich der Microsoft HTML Application Host (mshta.exe) der für die Ausführung von **.hta** Dateien zuständig ist - die Ausführung von **.hta** Dateien wird pauschal blockiert. Andere Skripte wie z.B. **.bat** oder **.cmd** in der `cmd.exe` werden übrigens gar nicht durch WDAC blockiert. Und auch nicht-Microsoft Skripte wie z.B. Python werden nicht blockiert.

### Schritt 1: Base Policy

Für CodeIntegrity gibt es einige Beispiel-Policies, die wir als Grundlage verwenden können. Diese sind unter folgendem Pfad zu finden:
`C:\Windows\schemas\CodeIntegrity\ExamplePolicies`

Um weiterhin normale Microsoft Applikationen und Systemkomponenten zu erlauben, kopieren wir uns die `AllowMicrosoft.xml` in ein Verzeichnis, z.B. `C:\CIPolicy`. Dann per PowerShell anpassen, sodass die Policy eine neue GUID, einen neuen Namen und eine Versionsnummer erhält:

```ps1
Set-CIPolicyIdInfo -FilePath MyCIPolicy.xml -PolicyName "diecknet Code Integrity" -ResetPolicyID
Set-CIPolicyVersion -FilePath MyCIPolicy.xml -Version "1.0.0.0"
```

### Schritt 2: Bestimmten Dateipfad von der Regel ausschließen

Wenn ein bestimmter Ordnerpfad von der Richtlinie ausgenommen werden sollen, z.B. für Administrative Skripte, können wir eine zusätzliche Policy Rule erstellen. Diese Policy Rule kommt in eine neue Richtlinie.

```ps1
$rule = New-CIPolicyRule -FilePathRule "C:\AdminSkripte\*"
New-CIPolicy –FilePath AdminSkripte.xml –Rules $rule -UserPEs
```

Das `-UserPEs` sorgt dafür, dass auch Dateien im User-Mode unter die Richtlinie fallen.

Dann zusammenführen zu einer neuen Policy Datei:

```ps1
Merge-CIPolicy -OutputFilePath "diecknet-Policy.xml" -PolicyPaths ".\AllowMicrosoft.xml",".\AdminSkripte.xml"
```

Wichtig ist jetzt allerdings noch, dass nur Admins in dieses Verzeichnis schreiben dürfen. Sonst könnten ja alle User einfach neue Skripte in dem Ordner anlegen und sie im FullLanguage Mode ausführen.
Also einmal die Berechtigungen ansehen und ggf. ändern. Hier werden nur bestimmte Standard-Admin-SIDs erkannt, also wenn ihr eine Custom Sicherheitsgruppe verwendet und nicht etwa die lokale Administratoren-Gruppe, dann müsst ihr [Option 18](https://learn.microsoft.com/en-us/windows/security/threat-protection/windows-defender-application-control/select-types-of-rules-to-create#table-1-windows-defender-application-control-policy---policy-rule-options) aktivieren. Das würde z.B. so gehen:

```ps1
# Nur notwendig bei benutzerdefinierten Berechtigungen
Set-RuleOption -FilePath "diecknet-Policy.xml" -Option 18
```

### Schritt 3: Audit Mode deaktivieren

Standardmäßig ist der Audit Mode aktiv. Da ich hier ohnehin mit einem Testsystem arbeite, lasse ich den Audit Mode weg.
Dafür kann entweder wahlweise die Rule mit `Enabled:Audit Mode` manuell aus der `.xml` Datei gelöscht werden, oder per `Set-RuleOption`:

```ps1
Set-RuleOption -FilePath "diecknet-Policy.xml" -Option 3 -Delete
```

### Schritt 4: Policy zu Binary konvertieren

Dann konvertieren die `.xml`-Policy zu einer Binary Datei:

```ps1
ConvertFrom-CIPolicy -XmlFilePath diecknet-Policy.xml -BinaryFilePath diecknet-Policy.cip
```

### Schritt 5: Testen - Richtlinie lokal anwenden

Zum Testen kann die Richtlinie lokal angewandt werden. Am besten vorher einen VM Snapshot erstellen.

```ps1
CiTool.exe --update-policy diecknet-Policy.cip
```

Wenn ihr jetzt eine neue PowerShell Session startet, sollte sie direkt im ConstrainedLanguage Mode laufen. Um das zu prüfen, schaut den Wert der Variable `$ExecutionContext.SessionState.LanguageMode` an. Skripte die in `C:\AdminSkripte` liegen (oder von Microsoft signiert wurden), sollten im FullLanguage Mode laufen. Skripte in anderen Orten sollten im ConstrainedLanguage Mode laufen.

![PowerShell Language Mode Test](/images/2023/2023-05-20-PSLanguageModeTest.jpg)

Diesen Code hier habe ich zum Testen in `test.ps1` verwendet:

```ps1
Write-Host "Hallo aus $PSScriptRoot"
Write-Host "Der aktuelle LanguageMode:"$ExecutionContext.SessionState.LanguageMode
```

### Schritt 6: Richtlinie per GPO verteilen

Wenn alles passt, kann es auch produktiv ausgerollt werden. Das geht z.B. per Gruppenrichtlinie, Microsoft System Center Configuration Manager oder MDM Tools wie Intune. Ich zeige hier wie es per Gruppenrichtlinie geht, weil das Feature und die Dokumentation von Microsoft vernachlässigt wurde.

*Eigentlich* gibt es eine Einstellung unter `Computerkonfiguration -> Richtlinien -> Administrative Vorlagen -> System -> Device Guard`. Allerdings funktioniert das nicht mit Multi-Policy Format Richtlinien, wie wir sie gerade erstellt haben. Microsoft schreibt dazu:

> Group Policy-based deployment of Windows Defender Application Control policies only supports single-policy format WDAC policies. To use WDAC on devices running Windows 10 1903 and greater, or Windows 11, we recommend using an alternative method for policy deployment.

Stattdessen können wir die Datei aber auch einfach direkt per Gruppenrichtlinien verteilen. Das geht unter `Computerkonfiguration -> Einstellungen -> Windows-Einstellungen -> Dateien`. Hier einen neuen Eintrag anlegen und die `.cip`-Quelldatei angeben. Damit sie im Netzwerk verfügbar ist, habe sie einfach in das `NETLOGON`-Verzeichnis meiner Domäne kopiert. Aber es geht natürlich jeder beliebige Fileshare.  
Als Zieldatei dann folgenden Pfad angeben: `C:\Windows\System32\CodeIntegrity\CiPolicies\Active\{Policy-Guid}.cip`
Wobei `Policy-Guid` durch die GUID der Policy ersetzt werden muss. Die geschweiften Klammern sollten aber bleiben. Die PolicyID steht in der `.xml`-Policy-Datei im Tag `<PolicyId>`. Bei mir es `{82C1BF56-B3BC-40FE-AD21-5FC37EBB5CF9}`, also ist der vollständige Zielpfad bei mir: `C:\Windows\System32\CodeIntegrity\CiPolicies\Active\{82C1BF56-B3BC-40FE-AD21-5FC37EBB5CF9}.cip`

![WDAC Policy ID herausfinden](/images/2023/2023-05-20-WDAC-PolicyID.jpg)

![WDAC Policy per GPO Dateien verteilen](/images/2023/2023-05-20_GPO_File.jpg)

Bei dieser Variante wird die Richtlinie erst beim Neustart des Computers angewandt. Ich habe also `gpupdate /force` ausgeführt (eventuell unnötig, aber ich wollte mir einen eventuellen zweiten Neustart sparen) und den Computer neugestartet. Anschließend wurde die Richtlinie wie zuvor in Schritt 5 angewendet.

## Fazit

Meiner Meinung nach ist die Einrichtung von Windows Defender Application Control / CodeIntegrity / PowerShell Language Modes unnötig kompliziert. Auch dass die moderneren Multi-Policies eigentlich nicht per Gruppenrichtlinien unterstützt werden finde ich prall.

## Weiterführende Links

Hier noch ein paar Weiterführende Links und Quellen die mir bei der Recherche geholfen haben. Besonders hervorheben möchte ich die Blog-Reihe auf airdesk.com zu WDAC:

- [airdesk.com: WDAC and Intune Blog series](https://airdesk.com/2019/11/mdac-and-intune-blog-series/)
- [airdesk.com: WDAC and File Path Rules](https://airdesk.com/2019/11/mdac-and-path-rules/)

Und einige sehr gute Infos von HotCakeX:

- [WDAC Wiki auf Github von HotCakeX](https://github.com/HotCakeX/Harden-Windows-Security/wiki/Introduction)
- [Diese sehr ausführliche Antwort zu WDAC hier auf superuser.com](https://superuser.com/questions/1741554/i-cant-get-windows-defender-application-control-policy-working-in-windows-11/1771065#1771065)

Ein paar nützliche Infos stehen auch bei Microsoft:

- [Create a WDAC policy for fully managed devices](https://learn.microsoft.com/en-us/windows/security/threat-protection/windows-defender-application-control/create-wdac-policy-for-fully-managed-devices)
- [Enlightened script hosts that are part of Windows](https://learn.microsoft.com/en-us/windows/security/threat-protection/windows-defender-application-control/design/script-enforcement#enlightened-script-hosts-that-are-part-of-windows)
- [Windows Defender Application Control policy - policy rule options](https://learn.microsoft.com/en-us/windows/security/threat-protection/windows-defender-application-control/select-types-of-rules-to-create#table-1-windows-defender-application-control-policy---policy-rule-options)
- [New-CIPolicy Cmdlet](https://learn.microsoft.com/en-us/powershell/module/configci/new-cipolicy?view=windowsserver2022-ps)
- [Deployment per GPO](https://learn.microsoft.com/en-us/windows/security/threat-protection/windows-defender-application-control/deployment/deploy-windows-defender-application-control-policies-using-group-policy)
- [Entfernen einer WDAC Richtlinie](https://learn.microsoft.com/en-us/windows/security/threat-protection/windows-defender-application-control/disable-windows-defender-application-control-policies)
- [Multi-Richtlinie lokal deployen](https://learn.microsoft.com/en-us/windows/security/threat-protection/windows-defender-application-control/deploy-multiple-windows-defender-application-control-policies)
- [WDAC EventLogs](https://learn.microsoft.com/en-us/windows/security/threat-protection/windows-defender-application-control/event-id-explanations)
- [PowerShell Team: PowerShell Constrained Language Mode](https://devblogs.microsoft.com/powershell/powershell-constrained-language-mode/)
