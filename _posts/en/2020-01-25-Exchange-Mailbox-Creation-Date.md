---
layout: post
title: "Exchange: When was that mailbox REALLY created?"
subtitle: MSExchWhenMailboxCreated might not be what it seems...
lang: en
tags: [exchange, powershell, exchange 2013]
image: "/img/2020/2020-01-25 MSExchMailboxWhenCreated PowerShell.png"
---
![Get MSExchMailboxWhenCreated attribute using PowerShell](/img/2020/2020-01-25 MSExchMailboxWhenCreated PowerShell.png "Get MSExchMailboxWhenCreated attribute using PowerShell: Get-ADUser -Properties MSExchMailboxWhenCreated") <br /><br />
If you're wondering when an Exchange mailbox got created, you will most likely stumble over the Active Directory user attribute {% ihighlight powershell %}MSExchWhenMailboxCreated{% endihighlight %. You can get the value using PowerShell or ADUC with advanced features enabled.

{% highlight powershell linedivs %}
Get-ADUser -Properties MSExchMaiboxWhenCreated
{% endhighlight %}

![Get MSExchMailboxWhenCreated attribute using PowerShell](/img/2020/2020-01-25 MSExchMailboxWhenCreated ADUC.png "Get MSExchMailboxWhenCreated attribute using Active Directory Users and Computers. Advanced features need to be enabled.")

## MSExchMailboxWhenCreated contains not the full truth
That could almost be the end of the story. BUT that attribute is not what you might think. The attribute gets only propagated the *FIRST* time the user gets a mailbox. If that users mailbox was disabled and then recreated later, the timestamp of the first mailbox creation retains.

![Checking MSExchMailboxWhenCreated attribute using PowerShell after a mailbox recreation](/img/2020/2020-01-25 MSExchMailboxWhenCreated PowerShell Mailbox recreated.png "Checking MSExchMailboxWhenCreated attribute using PowerShell after a mailbox recreation: The old value remains.")

## Finding out the real Mailbox creation date
If the mailbox creation was done recently, you might find according event log entries on the Exchange Server. If you search the MSExchange Management Event Log for mailbox creations manually (CTRL+F and look for "Enable-Mailbox") you might find the actual mailbox creation date. The PowerShell way would be:

{% highlight powershell linedivs %}
Get-EventLog -Source "MSExchange CmdletLogs" -LogName "MSExchange Management" -ComputerName <Servername> -Message "*Enable-Mailbox*test.user*"
{% endhighlight %}

![Checking the MSExchange Management Event Log for mailbox creations](/img/2020/2020-01-25 Exchange mailbox creation event log.png "Checking the MSExchange Management Event Log for mailbox creations: The mailbox got recently created by Enable-Mailbox cmdlet.")

## Exchange Versions
This procedure was tested with Exchange 2013 CU23. I'm not sure if this behavior is intended, of it's a bug in Exchange 2013.
The general procedure should also apply to Exchange 2016/2019 and Exchange Online.
