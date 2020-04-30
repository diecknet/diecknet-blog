---
layout: post
title: "Exchange Hybrid: HCW8064 OAuth configuration couldn't get performed"
subtitle: OAuth configuration manually done
lang: en
tags: [exchange, exchange 2013, exchange hybrid, oauth, office 365]
image: "/img/2020/2020-04-28-HCW8064-01.png"
---
![HCW8064 - The HCW has completed, but was not able to perform the OAuth portion of your Hybrid configuration. If you need features that rely on OAuth, you can try running the HCW again or manually configure OAuth using these manual steps.](/img/2020/2020-04-28-HCW8064-01.png "HCW8064 - The HCW has completed, but was not able to perform the OAuth portion of your Hybrid configuration. If you need features that rely on OAuth, you can try running the HCW again or manually configure OAuth using these manual steps.") <br /> 

At the end of the Hybrid Configuration Wizard (HCW) I received the following warning message:
> HCW8064 - The HCW has completed, but was not able to perform the OAuth portion of your Hybrid configuration. If you need features that rely on OAuth, you can try running the HCW again or manually configure OAuth using these manual steps.

The link "**more information**" links to [https://support.microsoft.com/en-us/help/3089172/hcw-has-completed-but-was-not-able-to-perform-the-oauth-portion-of-you](https://support.microsoft.com/en-us/help/3089172/hcw-has-completed-but-was-not-able-to-perform-the-oauth-portion-of-you){:target="_blank" rel="noopener noreferrer"}. If you lookup what OAuth is used for, [this article](https://docs.microsoft.com/en-us/exchange/using-oauth-authentication-to-support-ediscovery-in-an-exchange-hybrid-deployment-exchange-2013-help?redirectedfrom=MSDN){:target="_blank" rel="noopener noreferrer"} comes up. There you can read OAuth is needed for cross-premises eDiscovery searches. Since these functions were not relevant in the project, I ignored them for the time being. By the way, running HCW again did not set up OAuth propely as well.

OAuth *can* also be used for authentication for cross-premise sharing of Free/Busy information. The linked [OAuth-article](https://docs.microsoft.com/en-us/exchange/using-oauth-authentication-to-support-ediscovery-in-an-exchange-hybrid-deployment-exchange-2013-help?redirectedfrom=MSDN){:target="_blank" rel="noopener noreferrer"} mentions **only** eDiscovery -  which is also the section of the documentation where the article resides. More OAuth-scenarios are not explained there. Free/Busy is not mentioned in [the article about configuring OAuth for Exchange Hybrid](https://docs.microsoft.com/en-us/exchange/configure-oauth-authentication-between-exchange-and-exchange-online-organizations-exchange-2013-help){:target="_blank" rel="noopener noreferrer"} either.

## No Free/Busy available

After the first test users were migrated to Exchange Online, it turned out that the cross-premise access to Free/Busy information did not work. There are two very good articles in the Exchange Team Blog explaining Hybrid Free/Busy:
- [Demystifying Hybrid Free/Busy: what are the moving parts?](https://techcommunity.microsoft.com/t5/exchange-team-blog/demystifying-hybrid-free-busy-what-are-the-moving-parts/ba-p/607704){:target="_blank" rel="noopener noreferrer"}
- [Demystifying Hybrid Free/Busy: Finding errors and troubleshooting](https://techcommunity.microsoft.com/t5/exchange-team-blog/demystifying-hybrid-free-busy-finding-errors-and-troubleshooting/ba-p/607727){:target="_blank" rel="noopener noreferrer"}

## Intra-Organization Connector (IOC)

You can check both on-premise and in Exchange Online whether an **Intra-Organization Connector** (required for Hybrid OAuth) is present. Since the configuration via HCW failed, no working IOC configuration should be stored.

{% highlight powershell linedivs %}
Get-IntraOrganizationConnector | fl
{% endhighlight %}

The attribute "Enabled" is set to "False", therefore no OAuth is used. Just as expected.
!["Get-IntraOrganizationConnector | fl" - "Enabled" is set to "False"](/img/2020/2020-04-28-IOC-01.png "'Get-IntraOrganizationConnector | fl' - 'Enabled' is set to 'False'")

## Organization Relationship (ORG REL)

The next step is to check if an Organization Relationship exists.

{% highlight powershell linedivs %}
Get-OrganizationRelationship | fl
{% endhighlight %}

![Get-OrganizationRelationship | fl - Organization Relationship to the O365 Mail Domain exists](/img/2020/2020-04-28-ORG-REL.png "Get-OrganizationRelationship | fl - Organization Relationship to the O365 Mail Domain exists")

In my case, an Organization Relationship was returned. So DAUTH is in use.

## Checking DAUTH

I've actually only scratched the surface here. After some troubleshooting it turned out that authentication via DAUTH really isn't working in this case. I have tried to check the cross-premise availability in Outlook on the Web (OWA). In the browser developer console (accessible via "F12") under "Network" you can filter for "GetUserAvailabilityInternal".

![Retrieving developer options - Network in the browser for OWA](/img/2020/2020-04-28-NetworkConsoleBrowserOWA.png "Retrieving developer options - Network in the browser for OWA")

The relevant information I could find there:

> Error 0x80048800
> wst:FailedAuthentication
> AADSTS901124: Application 'fydibohf25spdlt.example.com' does not exist.

The details of the Free/Busy Troubleshooting are also available in [Exchange Team Blog: Demystifying Hybrid Free/Busy: Finding errors and troubleshooting](https://techcommunity.microsoft.com/t5/exchange-team-blog/demystifying-hybrid-free-busy-finding-errors-and-troubleshooting/ba-p/607727){:target="_blank" rel="noopener noreferrer"}. Since the non-existent application and the code "AADSTS901124" seemed to be no standard scenario, I actually wanted to open a ticket at Microsoft. But since OAuth is the modern and recommended authentication method anyway, one can also do troubleshooting for that.

## Setting up OAuth manually

Basically the manual setup of OAuth is described in the article [Configure OAuth authentication between Exchange and Exchange Online organizations](https://docs.microsoft.com/en-us/exchange/configure-oauth-authentication-between-exchange-and-exchange-online-organizations-exchange-2013-help){:target="_blank" rel="noopener noreferrer"}. I'm not going to repeat it all here. What was different for me, though:

### Exchange Server Auth Certificate expired and renewed

In the section ["Step 3: Export the on-premises authorization certificate"](https://docs.microsoft.com/en-us/exchange/configure-oauth-authentication-between-exchange-and-exchange-online-organizations-exchange-2013-help#step-3-export-the-on-premises-authorization-certificate){:target="_blank" rel="noopener noreferrer"} it's described how the **Microsoft Exchange Server Auth Certificate** can get exported. In the next step it would get imported into Exchange Online. Since the Exchange 2013 system has been in operation at the customer's site for over 5 years, the certificate has already been replaced once. Since Hybrid and OAuth have never been used here, the new certificate was never stored for authentication.

At the German site [msxfaq.de there is a good article about Exchange OAuth](https://www.msxfaq.de/exchange/e2013/exchange_oauth.htm){:target="_blank" rel="noopener noreferrer"}. It describes, among other things, how per {% ihighlight powershell %}Set-AuthConfig{% endihighlight %} the new certificate can be applied:

{% highlight powershell linedivs %}
Set-AuthConfig -NewCertificateThumbprint <myCertThumbprint> -NewCertificateEffectiveDate (Get-Date)
Set-AuthConfig -PublishCertificate
{% endhighlight %}

After that an {% ihighlight powershell %}iisreset{% endihighlight %} is also required.

### Configuring Intra-Organization Connector

Afterwards I could proceed according to the documentation ([Step 3, 4 and 5](https://docs.microsoft.com/en-us/exchange/configure-oauth-authentication-between-exchange-and-exchange-online-organizations-exchange-2013-help#step-3-export-the-on-premises-authorization-certificate){:target="_blank" rel="noopener noreferrer"}). [Step 6 and 7](https://docs.microsoft.com/en-us/exchange/configure-oauth-authentication-between-exchange-and-exchange-online-organizations-exchange-2013-help#step-6-create-an-intraorganizationconnector-from-your-on-premises-organization-to-office-365){:target="_blank" rel="noopener noreferrer"} didn't apply anymore. There was no need to create the IOC, they just had to get enabled by {% ihighlight powershell %}Get-IntraOrganizationConnector | Set-IntraOrganizationConnector -Enabled $true{% endihighlight %}. Step 8 didn't play a role, because there were no pre-Exchange 2013 SP1 servers in the environment.

## Tests

Afterwards I could successfully perform the following tests:

### OAuth Test using PowerShell

Execute in the On-Premise Exchange Management Shell:

{% highlight powershell linedivs %}
Test-OAuthConnectivity -Service EWS -TargetUri https://outlook.office365.com/ews/exchange.asmx -Mailbox <On-Premises Mailbox> -Verbose | Format-List
{% endhighlight %}

Execute in Exchange Online PowerShell:

{% highlight powershell linedivs %}
Test-OAuthConnectivity -Service EWS -TargetUri <external hostname authority of your Exchange On-Premises deployment>/metadata/json/1 -Mailbox <Exchange Online Mailbox> -Verbose | Format-List
{% endhighlight %}

### Retrieving Free/Busy times (Cross-Premise)

Actually, it was possible to retrieve cross-premise free/busy times - in both directions. Here is an example screenshot showing the query from an Exchange Online mailbox to an Exchange On-Premise mailbox.

![Outlook on the Web: retrieving Free/Busy times from Exchange Online to Exchange On-Premise - successfully](/img/2020/2020-04-28-FreeBusy.png "Outlook on the Web: retrieving Free/Busy times from Exchange Online to Exchange On-Premise - successfully")

## Related links

- [Demystifying Hybrid Free/Busy: what are the moving parts? (Exchange Team Blog)](https://techcommunity.microsoft.com/t5/exchange-team-blog/demystifying-hybrid-free-busy-what-are-the-moving-parts/ba-p/607704){:target="_blank" rel="noopener noreferrer"}
- [Demystifying Hybrid Free/Busy: Finding errors and troubleshooting (Exchange Team Blog)](https://techcommunity.microsoft.com/t5/exchange-team-blog/demystifying-hybrid-free-busy-finding-errors-and-troubleshooting/ba-p/607727){:target="_blank" rel="noopener noreferrer"}
- [Configure OAuth authentication between Exchange and Exchange Online organizations (docs.microsoft.com)](https://docs.microsoft.com/en-us/exchange/configure-oauth-authentication-between-exchange-and-exchange-online-organizations-exchange-2013-help){:target="_blank" rel="noopener noreferrer"}
- [Exchange OAuth article (msxfaq.de)](https://www.msxfaq.de/exchange/e2013/exchange_oauth.htm){:target="_blank" rel="noopener noreferrer"}
