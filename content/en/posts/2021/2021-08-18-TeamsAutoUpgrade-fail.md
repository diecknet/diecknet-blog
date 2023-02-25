---
aliases:
    - teamsautoupgrade-fail
slug: TeamsAutoUpgrade-fail
title: Moving from Skype for Business to Teams sucks
contenttags:
    [
        MicrosoftTeams,
        SkypeForBusiness
    ]
cover:
    image: /images/2021/2021-08-05_TeamsUpgradeInMinusOneDays.png
imageAlt: -1 days until your Teams Upgrade. Good news!
date: 2021-08-18
---

The upgrade process from Skype for Business Online to Microsoft Teams is a disaster. I had several SMB clients reporting unnecessary errors regarding Teams/Skype. With unnecessary I mean: **They had no issues using Teams until 2021-07-31.**

## Issue: Suddenly Skype Meetings are back in Outlook mobile

One client reported, that they suddenly have Skype Meetings in Outlook on iOS again, instead of Teams Meetings.

![Skype Meeting in Outlook on iOS](/images/2021/2021-08-11-TeamsUpgrade_SuddenlySkypeMeetings.png "Skype Meeting in Outlook on iOS")

That particular client manages their Microsoft 365 tenant themselves. They were already exclusively using Teams for quite a while (>2 years), but never switched to "TeamsOnly" mode. I'm sure they don't read their Message Center entries on a regular basis (if ever). Microsoft informs the client with a message like this, when the automatic upgrade fails:

> We ran into a problem upgrading your organization to Microsoft Teams, so we paused your upgrade. We understand you were expecting this upgrade to happen soon, and we apologize for the delay.
>  
> **How does this affect me?** Your users should have the same Skype for Business experience they're accustomed to using. It should appear as if nothing has changed.
>  
> **What do I need to do to prepare for this change?** We're working to fix the problem that caused us to pause your upgrade. We'll notify you when we're ready, once again, to upgrade your users to Teams.
>  
> There are no actions you need to take. Please click Additional Information below to learn more.

And promptly after in another Message:

> As part of the upcoming Skype for Business Online service retirement (originally announced in MC219641 of July '20), your organization has been scheduled for an [assisted upgrade](https://docs.microsoft.com/en-us/microsoftteams/upgrade-assisted) to help transition your Skype for Business Online users to Microsoft Teams. However, we paused your scheduled upgrade after detecting one or more DNS records that point to a domain in an on-premises Skype for Business deployment. These records are required if your organization includes on-premises Skype for Business users.
>  
> If your organization does not have any on-premises Skype for Business Server or Lync Server users, these DNS records must be updated to point to Microsoft 365 or removed by **August 13, 2021**.
>  
> Microsoft cannot take this step for you. If you do not remove stale DNS records, your assisted upgrade will still be rescheduled for a later date, but taking these steps gives you greater control over the upgrade experience.

Okay, so the upgrade was halted. According to the Message the client had DNS entries pointing to an on-premises Skype for Business Server system. Thing is: **The client does not have a S4B Server.** And they never had one in the past. The upgrade process just assumes, that the client has one.

![The Teams-Upgrade was paused!](/images/2021/2021-08-18_TeamsUpgradePaused.png "The Teams-Upgrade was paused!")

## The actual issue

![We can't upgrade this organization to 'Teams Only' mode.](/images/2021/2021-08-18_TeamsUpgradeFailed.png "We can't upgrade this organization to 'Teams Only' mode.")

The actual issue is, that this particular client has Wildcard DNS entries for their domains in public DNS. So when the Upgrade Process checks for the Skype DNS entries, it'll receive the IP-Address of the client's website. The upgrade process does not check if:

- the domain uses wildcard DNS entries
- the provided DNS answer actually points to a running Skype for Business Server environment (or if it ever did in the past)

The instructions in the error message (when manually trying to upgrade to Teams) is not really helpful: Microsoft assumes the client actually has a S4b deployment, so they only recommend to migrate the users with `Move-CsUser`.
Side-note: A while ago this error message was only visible when trying to upgrade to TeamsOnly using PowerShell. The Teams Admin Center just showed an "unknown error".

## The solution

After creating DNS entries in the customers DNS zone to point to Skype for Business Online, we could upgrade the tenant to Teams Only. The Skype Meeting option in Outlook for iOS went back to Teams Meeting soon afterwards.

These are the DNS entries ([source](https://docs.microsoft.com/en-us/skypeforbusiness/troubleshoot/online-configuration/dns-configuration-issue)):

### SRV records

Type|Service|Protocol|Port|Weight|Priority|TTL|Name|Target|
|-|-|-|-|-|-|-|-|-|
|SRV|_sip|_tls|443|1|100|1 hour|**\<DomainName>**|sipdir.online.lync.com|
|SRV|_sipfederationtls|_tcp|5061|1|100|1 hour|**\<DomainName>**|sipfed.online.lync.com|

### CNAME records

|Type|Host name|Destination|TTL|
|-|-|-|-|
|CNAME|sip.**\<DomainName>**|sipdir.online.lync.com|1 hour|
|CNAME|lyncdiscover.**\<DomainName>**|webdir.online.lync.com|1 hour|

## My thoughts on the issue

First of all I wish the automatic/assisted Upgrade would do a better job on understanding the DNS configuration of a domain. Alternatively there should be atleast an option to just skip the DNS Check when upgrading to TeamsOnly mode. Something like a `-Force` Option for `Grant-CsTeamsUpgradePolicy -Global`.  
Either of those ways would make the transition to TeamsOnly mode way easier and smoother.
