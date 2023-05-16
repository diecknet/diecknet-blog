---
slug: "exchange-eac-not-working-after-decomissioning-all-databases"
title: "Exchange EAC stopped working after decomissioning all Mailbox Databases"
date: 2023-05-16
comments: true
tags: [Hybrid, Exchange, Exchange Server, Active Directory]
cover: 
    image: "/images/2023/2023-05-16-ExchangeEAC-Error500.jpg"
---

I had this weird issue with a Exchange Server environment:
The company had an Exchange Server 2016 DAG and migrated all User Mailboxes to Exchange Online. I then installed a fresh Exchange Server 2019 for Recipient Management and SMTP-Relay.
To use the Exchange Server 2019 Hybrid License, I did not create a Mailbox Database.
I removed all remaining System Mailboxes and Arbitration Mailboxes from the Exchange 2016 Servers. I decomissioned the DAG and uninstalled Exchange from the old Servers.

## Error 500

Soon the company realized, they now get an **HTTP Error 500** after authenticating to ECP. So the page still prompted for credentials, but after entering valid credentials -> Error 500.

[![Error 500 after authenticating to the Exchange Admin Center](/images/2023/2023-05-16-ExchangeEAC-Error500.jpg "Error 500 after authenticating to the Exchange Admin Center")](/images/2023/2023-05-16-ExchangeEAC-Error500.jpg)

## Investigating

The [Exchange HealthChecker.ps1](https://microsoft.github.io/CSS-Exchange/Diagnostics/HealthChecker/) did not find any relevant issues.
I also didn't find any relevant log entries on the system. I forgot how I came to the conclusion, but I suspected the missing System Mailboxes. Maybe it was this Error 5000 - AdminAuditLog Event:

```text
Failed to save admin audit log for this cmdlet invocation.  
Organization: First Organization  
Log content:  
Cmdlet Name: Enable-Mailbox  
Object Modified: example.com/Users/SystemMailbox{e0dc1c29-89c3-4034-b678-e6c29d823ed9}  
Parameter: Identity = SystemMailbox{e0dc1c29-89c3-4034-b678-e6c29d823ed9}  
Parameter: Arbitration = True  
Caller: example.com/`<OUPathToMyAdminAccount>`/MyAdminUser  
ExternalAccess: False  
Succeeded: True  
Run Date: 2023-05-16T11:50:20  
OriginatingServer: EXCHANGE2019 (15.02.1118.026)  

Error:  
Exception thrown during AdminLogProvisioningHandler.Validate: Microsoft.Exchange.Data.Storage.ObjectNotFoundException: The discovery mailbox, a hidden default mailbox that is required to search mailboxes, can't be found. It may have been inadvertently deleted. This mailbox must be re-created before you can search mailboxes.  
  at Microsoft.Exchange.Data.Storage.Infoworker.MailboxSearch.MailboxDataProvider.GetDiscoveryMailbox(IRecipientSession session)  
  at Microsoft.Exchange.Management.SystemConfigurationTasks.AdminAuditLogHelper.CheckArbitrationMailboxStatus(OrganizationId organizationId, ADUser& user, ExchangePrincipal& principal, Exception& exception)  
```

But I think it's not allowed to host Mailboxes with a Hybrid Server. It's only allowed for Management and SMTP-Relay - right? I checked the License Terms (Section 3f):

[![USE RIGHTS AND LIMITATIONS FOR EXCHANGE SERVER 2019 HYBRID EDITION. Notwithstanding anything to the contrary in Sections 3a – 3e, your use rights and limitations for Exchange Server Hybrid edition are described in this Section 3f. The software is considered Hybrid edition if 1) you have an active subscription to Microsoft Exchange Online services under a Microsoft Volume Licensing program, 2) you are also running Microsoft Exchange Server as your on-premises email solution, and 3) you use the software solely for the purpose of enabling a hybrid deployment between your Exchange Online users and your on-premises email users. A hybrid deployment refers to the scenario under which your on-premises Exchange Server environment runs in parallel and interacts with the Microsoft Exchange Online service environment to form a single cohesive email infrastructure of your organization. You may not use the Hybrid edition to host on-premises mailboxes, to enable calendar sharing (except for calendar sharing with your Exchange Online users), to perform email filtering, or to perform any other functionality that is not required for a hybrid deployment. You may install and use any number of copies of the software on your devices, provided that you do not have any other instance of the Exchange Server 2019 running on premises.  Sections 1.b. (License Model), 3a – 3e. (Use Rights), 4.a. (Client Access Licenses (CALs)), 4.b. (Multiplexing), 13 (Support Services) below are not applicable to Exchange Server 2019 Hybrid edition. Your rights to use the Hybrid edition end upon the expiration or termination of your subscription to the Exchange Online services. At any time, Microsoft may change which version of the Exchange Server software it recommends for hybrid deployments.  Notwithstanding any other publicly available information pertaining to Exchange products or services, Microsoft makes no representation that it will continue to support Exchange Server 2019 Hybrid edition for hybrid use after the time period during which Exchange Server 2019 Hybrid edition is Microsoft’s recommended solution for hybrid deployments.  You are specifically advised that, if you continue to use Exchange Server 2019 Hybrid edition after it ceases to be Microsoft’s recommended solution for hybrid deployments, you may experience reduced or interrupted functionalities, and Microsoft may not provide support to your hybrid deployment.  For additional information about Microsoft’s recommendation regarding hybrid deployments](/images/2023/2023-05-16-ExchangeHybridLicenseTerms.jpg "USE RIGHTS AND LIMITATIONS FOR EXCHANGE SERVER 2019 HYBRID EDITION. Notwithstanding anything to the contrary in Sections 3a – 3e, your use rights and limitations for Exchange Server Hybrid edition are described in this Section 3f. The software is considered Hybrid edition if 1) you have an active subscription to Microsoft Exchange Online services under a Microsoft Volume Licensing program, 2) you are also running Microsoft Exchange Server as your on-premises email solution, and 3) you use the software solely for the purpose of enabling a hybrid deployment between your Exchange Online users and your on-premises email users. A hybrid deployment refers to the scenario under which your on-premises Exchange Server environment runs in parallel and interacts with the Microsoft Exchange Online service environment to form a single cohesive email infrastructure of your organization. You may not use the Hybrid edition to host on-premises mailboxes, to enable calendar sharing (except for calendar sharing with your Exchange Online users), to perform email filtering, or to perform any other functionality that is not required for a hybrid deployment. You may install and use any number of copies of the software on your devices, provided that you do not have any other instance of the Exchange Server 2019 running on premises.  Sections 1.b. (License Model), 3a – 3e. (Use Rights), 4.a. (Client Access Licenses (CALs)), 4.b. (Multiplexing), 13 (Support Services) below are not applicable to Exchange Server 2019 Hybrid edition. Your rights to use the Hybrid edition end upon the expiration or termination of your subscription to the Exchange Online services. At any time, Microsoft may change which version of the Exchange Server software it recommends for hybrid deployments.  Notwithstanding any other publicly available information pertaining to Exchange products or services, Microsoft makes no representation that it will continue to support Exchange Server 2019 Hybrid edition for hybrid use after the time period during which Exchange Server 2019 Hybrid edition is Microsoft’s recommended solution for hybrid deployments.  You are specifically advised that, if you continue to use Exchange Server 2019 Hybrid edition after it ceases to be Microsoft’s recommended solution for hybrid deployments, you may experience reduced or interrupted functionalities, and Microsoft may not provide support to your hybrid deployment.  For additional information about Microsoft’s recommendation regarding hybrid deployments")](/images/2023/2023-05-16-ExchangeHybridLicenseTerms.jpg)

I highlighted the sentence, that I consider relevant. There is also a section at the beginning of the License terms called "Licensing Terminology" - but there is no clarification what it means to "host on-premises mailboxes". I don't know, I'm not a lawyer and this is not legal advice. BUT one could claim that creating **System**-Mailboxes - Mailboxes that are *required* by the system - is not **hosting** mailboxes.

By the way you can find the License Terms on the Exchange Install Medium (CU ISO) under `<Driveletter>:\Setup\ServerRoles\Common\Eula\en`.

## Fix

I fixed it by recreating a Mailbox Database again and creating the System/Arbitration Mailboxes as described in the [Microsoft Documentation here](https://learn.microsoft.com/en-us/exchange/architecture/mailbox-servers/recreate-arbitration-mailboxes?view=exchserver-2019).

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
