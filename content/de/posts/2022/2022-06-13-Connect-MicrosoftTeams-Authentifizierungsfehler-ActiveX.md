---
comments: true
aliases:
    - connect-microsoftteams-authentifizierungsfehler-activex
slug: Connect-MicrosoftTeams-Authentifizierungsfehler-ActiveX
title: "Microsoft Teams PowerShell: Authentifizierungsfehler/ActiveX-Steuerelement kann nicht instanziiert werden"
subtitle: "Fehlercode: Microsoft.TeamsCmdlets.Powershell.Connect.ConnectMicrosoftTeams"
date: 2022-06-13
tags: [microsoft365, office365, microsoftteams, powershell]
cover:
    image: /images/2022/2022-06-13_TeamsPowerShellConnect.png
---

Ich habe heute einen merkwürdigen Fehler beim Verbinden mit der Teams PowerShell erhalten. Ich notiere das hier kurz, da ich nach 15 Sekunden Internetrecherche keine Lösung dazu gefunden habe 😇. Alles was ich dazu spontan gefunden hatte, hatte nichts mit Teams zu tun.

Ich wollte mich einfach nur per `Connect-MicrosoftTeams` mit der Microsoft Teams Administration per PowerShell verbinden. Ohne Angabe irgendwelcher weiteren Parameter, einfach ganz normal mit einem personalisierten Adminkonto anmelden und dann MFA bestätigen und so weiter. Aber bevor ich überhaupt nach einem Benutzernamen gefragt wurde - alles rot.

Die Fehlermeldung:

> Connect-MicrosoftTeams : Mindestens ein Fehler ist aufgetreten.
> In Zeile:1 Zeichen:1
> \+ Connect-MicrosoftTeams
> \+ ~~~~~~~~~~~~~~~~~~~~~~
> \+ CategoryInfo : Authentifizierungsfehler: (:) [Connect-MicrosoftTeams], AggregateException
> \+ FullyQualifiedErrorId : Connect-MicrosoftTeams,Microsoft.TeamsCmdlets.Powershell.Connect.ConnectMicrosoftTeams
>
> Connect-MicrosoftTeams : Das ActiveX-Steuerelement 8856f961-340a-11d0-a96b-00c04fd705a2 kann nicht instanziiert
> werden, da der aktuelle Thread kein Singlethread-Apartment ist.
> In Zeile:1 Zeichen:1
> \+ Connect-MicrosoftTeams
> \+ ~~~~~~~~~~~~~~~~~~~~~~
> \+ CategoryInfo : Authentifizierungsfehler: (:) [Connect-MicrosoftTeams], ThreadStateException
> \+ FullyQualifiedErrorId : Connect-MicrosoftTeams,Microsoft.TeamsCmdlets.Powershell.Connect.ConnectMicrosoftTeams
>
> Connect-MicrosoftTeams : Der Objektverweis wurde nicht auf eine Objektinstanz festgelegt.
> In Zeile:1 Zeichen:1
> \+ Connect-MicrosoftTeams
> \+ ~~~~~~~~~~~~~~~~~~~~~~
> \+ CategoryInfo : NotSpecified: (:) [Connect-MicrosoftTeams], NullReferenceException
> \+ FullyQualifiedErrorId : System.NullReferenceException,Microsoft.TeamsCmdlets.Powershell.Connect.ConnectMicrosoftTeams

## Version des Teams PowerShell Modul

Ich hatte erst vermutet, dass ich eine veraltete Modulversion verwendet habe, aber auch mit Version 4.4.1 (aktuellste Version während ich diesen Post verfasse) ist der Fehler aufgetreten.

## Workaround

Die genaue Ursache habe ich jetzt nicht untersucht. Anscheinend war aber noch eine alte Authentifzierung zwischen gecached. Einmal kurz `Disconnect-MicrosoftTeams` ausgeführt und anschließend konnte ich mich auch wie gewohnt per `Connect-MicrosoftTeams` einloggen.
