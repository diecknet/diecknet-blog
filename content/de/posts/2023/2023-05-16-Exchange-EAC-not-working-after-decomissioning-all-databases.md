---
slug: "exchange-eac-not-working-after-decomissioning-all-databases"
title: "Exchange EAC hat nach dem Außerbetriebnehmen aller Mailbox-Datenbanken nicht mehr funktioniert"
date: 2023-05-16
comments: true
tags: [Hybrid, Exchange, Exchange Server, Active Directory]
cover: 
    image: "/images/2023/2023-05-16-ExchangeEAC-Error500.jpg"
---

Ich habe dieses seltsame Problem in einer Exchange-Server-Umgebung gehabt:
Die Firma hat eine Exchange Server 2016 DAG gehabt und alle Benutzerpostfächer nach Exchange Online migriert. Danach habe ich einen frischen Exchange Server 2019 für Recipient Management und SMTP-Relay installiert.
Um die Exchange Server 2019 Hybrid-Lizenz zu nutzen, habe ich keine Mailbox-Datenbank erstellt.
Ich habe alle verbleibenden System- und Arbitration-Postfächer von den Exchange-2016-Servern entfernt. Ich habe die DAG außer Betrieb genommen und Exchange von den alten Servern deinstalliert.

## Error 500

Kurz darauf hat die Firma bemerkt, dass sie jetzt nach der Anmeldung am Exchange Admin Center (`https://exchangeserver2019.example.com/ecp`) einen **HTTP Error 500** bekommen hat. Die Seite hat also weiterhin Anmeldedaten abgefragt, aber nach Eingabe gültiger Credentials -> Error 500.

[![Error 500 nach der Anmeldung am Exchange Admin Center](/images/2023/2023-05-16-ExchangeEAC-Error500.jpg "Error 500 nach der Anmeldung am Exchange Admin Center")](/images/2023/2023-05-16-ExchangeEAC-Error500.jpg)

## Analyse

Der [Exchange HealthChecker.ps1](https://microsoft.github.io/CSS-Exchange/Diagnostics/HealthChecker/) hat keine relevanten Probleme gefunden.
Ich habe auch keine relevanten Logeinträge auf dem System gefunden. Ich habe vergessen, wie ich genau zu der Schlussfolgerung gekommen bin, aber ich habe die fehlenden System-Postfächer vermutet. Vielleicht war es dieses Event Error 5000 - AdminAuditLog:

```text
Failed to save admin audit log for this cmdlet invocation.
Organization: First Organization
Log content:
Cmdlet Name: Enable-Mailbox
Object Modified: example.com/Users/SystemMailbox{e0dc1c29-89c3-4034-b678-e6c29d823ed9}
Parameter: Identity = SystemMailbox{e0dc1c29-89c3-4034-b678-e6c29d823ed9}
Parameter: Arbitration = True
Caller: example.com/<OUPathToMyAdminAccount>/MyAdminUser
ExternalAccess: False
Succeeded: True
Run Date: 2023-05-16T11:50:20
OriginatingServer: EXCHANGE2019 (15.02.1118.026)

Error:  
Exception thrown during AdminLogProvisioningHandler.Validate: Microsoft.Exchange.Data.Storage.ObjectNotFoundException: The discovery mailbox, a hidden default mailbox that is required to search mailboxes, can't be found. It may have been inadvertently deleted. This mailbox must be re-created before you can search mailboxes.  
  at Microsoft.Exchange.Data.Storage.Infoworker.MailboxSearch.MailboxDataProvider.GetDiscoveryMailbox(IRecipientSession session)  
  at Microsoft.Exchange.Management.SystemConfigurationTasks.AdminAuditLogHelper.CheckArbitrationMailboxStatus(OrganizationId organizationId, ADUser& user, ExchangePrincipal& principal, Exception& exception)  
```

Aber ich denke, dass man mit einem Hybrid-Server eigentlich keine Mailboxen hosten darf. Er ist nur für Management und SMTP-Relay erlaubt - oder? Ich habe die Lizenzbedingungen geprüft (Abschnitt 3f):

[![USE RIGHTS AND LIMITATIONS FOR EXCHANGE SERVER 2019 HYBRID EDITION. Notwithstanding anything to the contrary in Sections 3a – 3e, your use rights and limitations for Exchange Server Hybrid edition are described in this Section 3f. The software is considered Hybrid edition if 1) you have an active subscription to Microsoft Exchange Online services under a Microsoft Volume Licensing program, 2) you are also running Microsoft Exchange Server as your on-premises email solution, and 3) you use the software solely for the purpose of enabling a hybrid deployment between your Exchange Online users and your on-premises email users. A hybrid deployment refers to the scenario under which your on-premises Exchange Server environment runs in parallel and interacts with the Microsoft Exchange Online service environment to form a single cohesive email infrastructure of your organization. You may not use the Hybrid edition to host on-premises mailboxes, to enable calendar sharing (except for calendar sharing with your Exchange Online users), to perform email filtering, or to perform any other functionality that is not required for a hybrid deployment. You may install and use any number of copies of the software on your devices, provided that you do not have any other instance of the Exchange Server 2019 running on premises.  Sections 1.b. (License Model), 3a – 3e. (Use Rights), 4.a. (Client Access Licenses (CALs)), 4.b. (Multiplexing), 13 (Support Services) below are not applicable to Exchange Server 2019 Hybrid edition. Your rights to use the Hybrid edition end upon the expiration or termination of your subscription to the Exchange Online services. At any time, Microsoft may change which version of the Exchange Server software it recommends for hybrid deployments.  Notwithstanding any other publicly available information pertaining to Exchange products or services, Microsoft makes no representation that it will continue to support Exchange Server 2019 Hybrid edition for hybrid use after the time period during which Exchange Server 2019 Hybrid edition is Microsoft’s recommended solution for hybrid deployments.  You are specifically advised that, if you continue to use Exchange Server 2019 Hybrid edition after it ceases to be Microsoft’s recommended solution for hybrid deployments, you may experience reduced or interrupted functionalities, and Microsoft may not provide support to your hybrid deployment.  For additional information about Microsoft’s recommendation regarding hybrid deployments](/images/2023/2023-05-16-ExchangeHybridLicenseTerms.jpg "USE RIGHTS AND LIMITATIONS FOR EXCHANGE SERVER 2019 HYBRID EDITION. Notwithstanding anything to the contrary in Sections 3a – 3e, your use rights and limitations for Exchange Server Hybrid edition are described in this Section 3f. The software is considered Hybrid edition if 1) you have an active subscription to Microsoft Exchange Online services under a Microsoft Volume Licensing program, 2) you are also running Microsoft Exchange Server as your on-premises email solution, and 3) you use the software solely for the purpose of enabling a hybrid deployment between your Exchange Online users and your on-premises email users. A hybrid deployment refers to the scenario under which your on-premises Exchange Server environment runs in parallel and interacts with the Microsoft Exchange Online service environment to form a single cohesive email infrastructure of your organization. You may not use the Hybrid edition to host on-premises mailboxes, to enable calendar sharing (except for calendar sharing with your Exchange Online users), to perform email filtering, or to perform any other functionality that is not required for a hybrid deployment. You may install and use any number of copies of the software on your devices, provided that you do not have any other instance of the Exchange Server 2019 running on premises.  Sections 1.b. (License Model), 3a – 3e. (Use Rights), 4.a. (Client Access Licenses (CALs)), 4.b. (Multiplexing), 13 (Support Services) below are not applicable to Exchange Server 2019 Hybrid edition. Your rights to use the Hybrid edition end upon the expiration or termination of your subscription to the Exchange Online services. At any time, Microsoft may change which version of the Exchange Server software it recommends for hybrid deployments.  Notwithstanding any other publicly available information pertaining to Exchange products or services, Microsoft makes no representation that it will continue to support Exchange Server 2019 Hybrid edition for hybrid use after the time period during which Exchange Server 2019 Hybrid edition is Microsoft’s recommended solution for hybrid deployments.  You are specifically advised that, if you continue to use Exchange Server 2019 Hybrid edition after it ceases to be Microsoft’s recommended solution for hybrid deployments, you may experience reduced or interrupted functionalities, and Microsoft may not provide support to your hybrid deployment.  For additional information about Microsoft’s recommendation regarding hybrid deployments")](/images/2023/2023-05-16-ExchangeHybridLicenseTerms.jpg)

Ich habe den Satz markiert, den ich für relevant gehalten habe.

> You may not use the Hybrid edition to host on-premises mailboxes

Okay, on-premises Mailboxen hosten ist nicht erlaubt. Aber was zählt als Mailbox?
Es gibt am Anfang der Lizenzbedingungen sogar einen Abschnitt „Licensing Terminology“ - aber es gibt keine Klarstellung, was „host on-premises mailboxes“ konkret bedeutet. Ich weiß es nicht, ich bin kein Jurist und das hier ist keine Rechtsberatung. ABER man könnte argumentieren, dass das Erstellen von **System**-Mailboxen - also Mailboxen, die vom System *zwingend* benötigt werden - kein **Hosting** von Mailboxen ist.

Übrigens kann man die Lizenzbedingungen auf dem Exchange-Installationsmedium (CU-ISO) unter `<Driveletter>:\Setup\ServerRoles\Common\Eula\en` finden.

## Fix

Ich habe es behoben, indem ich wieder eine Mailbox-Datenbank erstellt und die System-/Arbitration-Postfächer wie in der [Microsoft-Dokumentation hier](https://learn.microsoft.com/en-us/exchange/architecture/mailbox-servers/recreate-arbitration-mailboxes?view=exchserver-2019) beschrieben neu erstellt habe.

```powershell
# Recreate a Mailbox Database
New-MailboxDatabase -EdbFilePath D:\SystemMailboxDB\DB\SystemMailboxDB.edb -LogFolderPath D:\SystemMailboxDB\LOG\ -Name "System Mailboxes Only"
Restart-Service MSExchangeIS
Mount-Database "System Mailboxes Only"
```

```powershell
# See: https://learn.microsoft.com/en-us/exchange/architecture/mailbox-servers/recreate-arbitration-mailboxes?view=exchserver-2019
# Prepare AD / Recreate Mailbox Users
F:\Setup.exe /IAcceptExchangeServerLicenseTerms_DiagnosticDataON /PrepareAD

# Re-enable the System/Arbitration Mailboxes
Enable-Mailbox -Identity "FederatedEmail.4c1f4d8b-8179-4148-93bf-00a95fa1e042" -Arbitration
Enable-Mailbox -Identity "Migration.8f3e7716-2011-43e4-96b1-aba62d229136" -Arbitration
Set-Mailbox -Identity "Migration.8f3e7716-2011-43e4-96b1-aba62d229136" -Arbitration -Management $true -Force
Get-User -ResultSize Unlimited | where {$_.Name -like "SystemMailbox{1f05a927*"} | Enable-Mailbox -Arbitration
Enable-Mailbox -Identity "SystemMailbox{bb558c35-97f1-4cb9-8ff7-d53741dc928c}" -Arbitration
Get-Mailbox "SystemMailbox{bb558c35-97f1-4cb9-8ff7-d53741dc928c}" -Arbitration | Set-Mailbox -Arbitration -UMGrammar $true -OABGen $true -GMGen $true -ClientExtensions $true -MessageTracking $true -PstProvider $true -MaxSendSize 1GB -Force
$OABMBX = Get-Mailbox "SystemMailbox{bb558c35-97f1-4cb9-8ff7-d53741dc928c}" -Arbitration; Set-ADUser $OABMBX.SamAccountName -Add @{"msExchCapabilityIdentifiers"="40","42","43","44","47","51","52","46"}
Enable-Mailbox -Identity "SystemMailbox{e0dc1c29-89c3-4034-b678-e6c29d823ed9}" -Arbitration
Set-Mailbox -Identity "SystemMailbox{e0dc1c29-89c3-4034-b678-e6c29d823ed9}" -Arbitration -UMDataStorage $true -Force
Enable-Mailbox -Identity "SystemMailbox{D0E409A0-AF9B-4720-92FE-AAC869B0D201}" -Arbitration
Enable-Mailbox -Identity "SystemMailbox{2CE34405-31BE-455D-89D7-A7C7DA7A0DAA}" -Arbitration
$ShardMBX = Get-Mailbox -Identity "SystemMailbox{2CE34405-31BE-455D-89D7-A7C7DA7A0DAA}" -Arbitration
Set-Mailbox -Identity "SystemMailbox{2CE34405-31BE-455D-89D7-A7C7DA7A0DAA}" -Arbitration 
Set-ADUser $ShardMBX.SamAccountName -Add @{"msExchCapabilityIdentifiers"="66"} 
Set-ADUser $ShardMBX.SamAccountName -Add @{"msExchMessageHygieneSCLDeleteThreshold"="9"} 
Set-ADUser $ShardMBX.SamAccountName -Add @{"msExchMessageHygieneSCLJunkThreshold"="4"}
Set-ADUser $ShardMBX.SamAccountName -Add @{"msExchMessageHygieneSCLQuarantineThreshold"="9"}
Set-ADUser $ShardMBX.SamAccountName -Add @{"msExchMessageHygieneSCLRejectThreshold"="7"}

# Check result
Set-ADServerSettings -ViewEntireForest $true; Get-Mailbox -Arbitration | Format-Table Name,DisplayName
```
