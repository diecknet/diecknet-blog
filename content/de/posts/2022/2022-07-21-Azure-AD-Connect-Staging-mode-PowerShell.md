---
aliases:
    - azure-ad-connect-staging-mode-powershell
slug: Azure-AD-Connect-Staging-mode-PowerShell
title: "Azure AD Connect Staging Mode per PowerShell setzen"
date: 2022-07-21
tags: [azure ad, powershell, azure ad connect]
cover:
    image: /images/2022/2022-07-21_Azure-AD-Connect-Staging-mode-is-enabled.png
comments: true
---

Hier ist ein schneller Tipp, wie ihr den Staging Mode in Azure AD Connect per PowerShell ein- oder ausschaltet. Leider gibt es kein natives Cmdlet im Stil von `Set-ADSyncStagingMode` oder so.

In diesem Artikel erkläre ich zuerst den Ansatz und liste danach den vollständigen Befehlsblock auf, den ihr nutzen könnt. Ihr könnt also gern nach unten zum Ende des Beitrags springen. Die folgenden PowerShell-Cmdlets müsst ihr auf dem Azure-AD-Connect-Server ausführen.

**Führt diese Befehle auf eigenes Risiko aus.**

## Aktuelle Azure AD Connect Staging-Mode-Einstellung auflisten

Als Erstes könnt ihr die aktuellen Azure-AD-Connect-Einstellungen mit `Get-ADSyncGlobalSettings` abrufen.

```powershell
$aadSyncSettings=Get-ADSyncGlobalSettings
$aadSyncSettings
```

[![Screenshot of PowerShell Code Execution - Retrieve Azure AD Connect Settings](/images/2022/2022-07-21_AAD-Connect-Settings-Overview-PowerShell.png "Screenshot of PowerShell Code Execution - Retrieve Azure AD Connect Settings")](/images/2022/2022-07-21_AAD-Connect-Settings-Overview-PowerShell.png)

## Die Parameter des ADSyncGlobalSettings-Objekts untersuchen

Die interessanten Dinge verstecken sich in der Eigenschaft „parameters“. Die Einstellung für den Staging Mode liegt in „Microsoft.Synchronize.StagingMode“.

```powershell
$aadSyncSettings.parameters
```

[![Screenshot of PowerShell Code Execution - Found the Staging mode](/images/2022/2022-07-21_AzureAD-Connect-Staging-Mode-spotted-PowerShell.png "Screenshot of PowerShell Code Execution - Found the Staging mode")](/images/2022/2022-07-21_AzureAD-Connect-Staging-Mode-spotted-PowerShell.png)

## Den Staging Mode ändern

Um den Staging Mode zu konfigurieren, müsst ihr „Microsoft.Synchronize.StagingMode“ entweder auf „True“ (Staging Mode aktivieren) oder auf „False“ (Staging Mode deaktivieren) setzen.

```powershell
# to disable AAD Connect Staging mode
($aadSyncSettings.parameters | ?{$_.name -eq "Microsoft.Synchronize.StagingMode"}).value="False"
```

```powershell
# to enable AAD Connect Staging mode
($aadSyncSettings.parameters | ?{$_.name -eq "Microsoft.Synchronize.StagingMode"}).value="True"
```

## Den Staging Mode tatsächlich SETZEN

Haha, ja. Wir sind noch nicht fertig. Bis hierhin haben wir nur ein PowerShell-Objekt („Microsoft.IdentityManagement.PowerShell.ObjectModel.GlobalSettings“), das die Azure-AD-Connect-Einstellungen repräsentiert. Und das Ändern dieses Objekts ändert die tatsächliche Konfiguration von Azure AD Connect nicht. Also müssen wir die echte Konfiguration mit unserem geänderten Settings-Objekt setzen.

```powershell
Set-ADSyncGlobalSettings $aadSyncSettings
```

[![Screenshot of PowerShell Code Execution - Changing and setting the Staging mode](/images/2022/2022-07-21_AzureAD-Connect-Staging-mode-set-by-powershell.png "Screenshot of PowerShell Code Execution - Changing and setting the Staging mode")](/images/2022/2022-07-21_AzureAD-Connect-Staging-mode-set-by-powershell.png)

Danach habe ich im GUI (Azure AD Connect Wizard) das gewünschte Ergebnis überprüft. In meinem Fall ist der Staging Mode jetzt aktiviert. Großartig!

[![Verification of Azure AD Connect Staging Mode in the Wizard](/images/2022/2022-07-21_Azure-AD-Connect-Staging-mode-is-enabled.png "Verification of Azure AD Connect Staging Mode in the Wizard")](/images/2022/2022-07-21_Azure-AD-Connect-Staging-mode-is-enabled.png)

## Zusammenfassung – vollständige Code-Snippets

Nachdem wir all diese Informationen gesammelt haben, können wir unsere eigenen kurzen PowerShell-Code-Snippets erstellen, um den Azure-AD-Connect-Staging-Mode zu prüfen, zu aktivieren oder zu deaktivieren.

### Snippet zum Prüfen des Azure AD Connect Staging Mode

```powershell
$aadSyncSettings=Get-ADSyncGlobalSettings
($aadSyncSettings.parameters | ?{$_.name -eq "Microsoft.Synchronize.StagingMode"}).value
# output "False" means Staging mode is disabled
# output "True" means Staging mode is enabled
```

### Snippet zum Deaktivieren des Azure AD Connect Staging Mode

```powershell
$aadSyncSettings=Get-ADSyncGlobalSettings
($aadSyncSettings.parameters | ?{$_.name -eq "Microsoft.Synchronize.StagingMode"}).value="False"
Set-ADSyncGlobalSettings $aadSyncSettings
```

### Snippet zum Aktivieren des Azure AD Connect Staging Mode

```powershell
$aadSyncSettings=Get-ADSyncGlobalSettings
($aadSyncSettings.parameters | ?{$_.name -eq "Microsoft.Synchronize.StagingMode"}).value="True"
Set-ADSyncGlobalSettings $aadSyncSettings
```
