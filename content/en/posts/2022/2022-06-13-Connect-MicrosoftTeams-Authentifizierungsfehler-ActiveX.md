---
comments: true
aliases:
    - connect-microsoftteams-authentifizierungsfehler-activex
slug: microsoft-teams-powershell-authentication-error-activex
title: "Microsoft Teams PowerShell: Authentication error / ActiveX control cannot be instantiated"
subtitle: "Error code: Microsoft.TeamsCmdlets.Powershell.Connect.ConnectMicrosoftTeams"
date: 2022-06-13
tags: [microsoft365, office365, microsoftteams, powershell]
cover:
    image: /images/2022/2022-06-13_TeamsPowerShellConnect.png
---

Today I received a strange error when connecting to Teams PowerShell. I am noting it here briefly because after 15 seconds of searching the web I did not find a solution 😇. Everything I found initially had nothing to do with Teams.

I simply wanted to connect to the Microsoft Teams administration with PowerShell using `Connect-MicrosoftTeams`. Without specifying any additional parameters, just log in normally with a personalized admin account and then confirm MFA and so on. But before I was even asked for a username, everything was red.

The error message:

> Connect-MicrosoftTeams : One or more errors occurred.
> In line:1 character:1
> + Connect-MicrosoftTeams
> + ~~~~~~~~~~~~~~~~~~~~~~
> + CategoryInfo : AuthenticationError: (:) [Connect-MicrosoftTeams], AggregateException
> + FullyQualifiedErrorId : Connect-MicrosoftTeams,Microsoft.TeamsCmdlets.Powershell.Connect.ConnectMicrosoftTeams
>
> Connect-MicrosoftTeams : The ActiveX control 8856f961-340a-11d0-a96b-00c04fd705a2 cannot be instantiated because the current thread is not a single-threaded apartment.
> In line:1 character:1
> + Connect-MicrosoftTeams
> + ~~~~~~~~~~~~~~~~~~~~~~
> + CategoryInfo : AuthenticationError: (:) [Connect-MicrosoftTeams], ThreadStateException
> + FullyQualifiedErrorId : Connect-MicrosoftTeams,Microsoft.TeamsCmdlets.Powershell.Connect.ConnectMicrosoftTeams
>
> Connect-MicrosoftTeams : Object reference not set to an instance of an object.
> In line:1 character:1
> + Connect-MicrosoftTeams
> + ~~~~~~~~~~~~~~~~~~~~~~
> + CategoryInfo : NotSpecified: (:) [Connect-MicrosoftTeams], NullReferenceException
> + FullyQualifiedErrorId : System.NullReferenceException,Microsoft.TeamsCmdlets.Powershell.Connect.ConnectMicrosoftTeams

## Version of the Teams PowerShell module

I first suspected that I was using an outdated module version, but the error also occurred with version 4.4.1 (the latest version while I was writing this post).

## Workaround

I have not investigated the exact cause. Apparently, however, an old authentication was still cached. I ran `Disconnect-MicrosoftTeams` once and then I was able to log in normally again with `Connect-MicrosoftTeams`.
