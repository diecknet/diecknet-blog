---
aliases:
    - exchange-online-per-azure-automation
slug: Exchange-Online-per-Azure-Automation
title: "Exchange Online per Azure Automation steuern im Jahr 2023"
date: 2023-01-09
tags: [microsoft365, office365, exchangeonline, powershell, exo, azure, azureautomation]
cover:
    image: /images/2023/2023-AA-EXO.jpg
comments: true    
---

Ich versuche es kurz und knackig zu halten:
Wenn ihr Exchange Online per Azure Automation steuern wollt, dann ist **Managed Identities** was ihr benutzen solltet (Stand: Anfang 2023).

## Legacy Ansatz

Früher wurden dafür auch gerne RunAs Accounts oder Plaintext Credentials (🤢) verwendet, aber das gilt mittlerweile als veraltet. RunAs Accounts sind zum Herbst 2023 abgekündigt und zu Klartext-Kennwörtern muss ich nix sagen, oder?
Eventuell bieten sich noch App Registrierungen in Azure AD an, aber wenn ihr wirklich einfach nur per Azure Automation ein paar Exchange Einstellungen automatisieren wollt, ist das eigentlich nicht notwendig.

## TL;DR Managed Identities + Exchange Online PowerShell

Eine **System Assigned Managed Identity** weist einer Azure Resource eine *Identität* zu. Dieser Identität können Rechte zugewiesen werden, z.B. für die Administration von Exchange Online oder bestimmten Azure Ressourcen. Die Verwaltung der Identität erfolgt automatisch, es muss also kein Passwort regelmäßig geändert werden oder ähnliches. Und wenn die dazugehörige Ressource (in dem Fall das Azure Automation Konto) gelöscht wird, wird die System Assigned Managed Identity automatisch mitgelöscht.
Das Exchange Online PowerShell Modul unterstützt ab Version 3 Managed Identities für die Authentifizierung.

## Howto Video

Ich habe ein [Video](https://www.youtube.com/watch?v=unXf7ma1NR4) erstellt, in dem zeige wie Exchange Online per Azure Automation gesteuert werden kann. Dabei wird eine System Assigned Managed Identity für das Azure Automation Konto verwendet und dieser Identität die Rechte zur Exchange Verwaltung zugewiesen.

[![Exchange Online per Azure Automation verwalten (YouTube)](/images/2023/2023-01-09_Azure_Automation_Exchange_online_thumbnail.png "Exchange Online per Azure Automation verwalten (YouTube)")](https://www.youtube.com/watch?v=unXf7ma1NR4)

## Weiterführende Links

Die offizielle Microsoft Dokumentation dazu ist hier zu finden: [https://learn.microsoft.com/en-us/powershell/exchange/connect-exo-powershell-managed-identity?view=exchange-ps](https://learn.microsoft.com/en-us/powershell/exchange/connect-exo-powershell-managed-identity?view=exchange-ps)
