---
layout: post
title: Exchange - When was that mailbox REALLY created?
subtitle: MSExchWhenMailboxCreated might not be what it seems...
date: 2020-01-25
contenttags: [exchange, powershell, exchange2013]
image: /assets/images/2020/2020-01-25_MSExchWhenMailboxCreated_PowerShell.png
---

If you're wondering when an Exchange mailbox got created, you will most likely stumble over the Active Directory user attribute `MSExchWhenMailboxCreated`. You can get the value using PowerShell or ADUC with advanced features enabled.

```powershell
Get-ADUser -Properties MSExchMaiboxWhenCreated
```

![Get MSExchWhenMailboxCreated attribute using PowerShell](/assets/images/2020/2020-01-25_MSExchWhenMailboxCreated_ADUC.png "Get MSExchWhenMailboxCreated attribute using Active Directory Users and Computers. Advanced features need to be enabled.")

## MSExchWhenMailboxCreated contains not the full truth

That could almost be the end of the story. BUT that attribute is not what you might think. The attribute gets only propagated the _FIRST_ time the user gets a mailbox. If that users mailbox was disabled and then recreated later, the timestamp of the first mailbox creation retains.

![Checking MSExchWhenMailboxCreated attribute using PowerShell after a mailbox recreation](/assets/images/2020/2020-01-25 MSExchWhenMailboxCreated PowerShell Mailbox recreated.png "Checking MSExchWhenMailboxCreated attribute using PowerShell after a mailbox recreation - The old value remains.")

## Finding out the real Mailbox creation date

If the mailbox creation was done recently, you might find according event log entries on the Exchange Server. If you search the MSExchange Management Event Log for mailbox creations manually (CTRL+F and look for `Enable-Mailbox`) you might find the actual mailbox creation date. The PowerShell way would be:

```powershell
Get-EventLog -Source "MSExchange CmdletLogs" -LogName "MSExchange Management" -ComputerName <Servername> -Message "*Enable-Mailbox*test.user*"
```

![Checking the MSExchange Management Event Log for mailbox creations](/assets/images/2020/2020-01-25_Exchange_mailbox_creation_event_log.png "Checking the MSExchange Management Event Log for mailbox creations - The mailbox got recently created by Enable-Mailbox cmdlet.")

## Exchange Versions

This procedure was tested with Exchange 2013 CU23. I'm not sure if this behavior is intended, of it's a bug in Exchange 2013.
The general procedure should also apply to Exchange 2016/2019 and Exchange Online.
