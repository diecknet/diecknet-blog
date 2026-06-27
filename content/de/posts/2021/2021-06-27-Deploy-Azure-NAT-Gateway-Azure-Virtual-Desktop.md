---
comments: true
aliases:
    - deploy-azure-nat-gateway-azure-virtual-desktop
slug: Deploy-Azure-NAT-Gateway-Azure-Virtual-Desktop
title: Azure NAT-Gateway für Azure Virtual Desktop mit PowerShell bereitstellen
subtitle: Azure-Ressourcen per REST-API bereitstellen
tags:
    [
        azure,
        azure virtual desktop,
        windows virtual desktop,
        nerdio,
        powershell,
        hackathon
    ]
cover:
    image: /images/2021/2021-06-27-NAT-Gateway-Azure-Virtual-Desktop.png
imageAlt: YouTube-Thumbnail für Azure NAT-Gateway/ Azure Virtual Desktop
date: 2021-06-27
---

Ich habe ein PowerShell-Skript erstellt, das automatisch ein Azure NAT-Gateway in einer Azure-Virtual-Desktop-Umgebung bereitgestellt hat. Das ist nützlich, wenn ihr für eure AVD-Maschinen eine statische IP-Adresse benötigt habt. Ich habe das Skript als Einreichung für den [Nerdio Hackathon 2021](https://getnerdio.com/nerdio-hackathon/) erstellt. Das ist meine erste Hackathon-Teilnahme gewesen :^).

**Update 2021-10-05** - Ich habe tatsächlich den ersten Platz gewonnen, aber es haben anscheinend nicht viele Leute am Wettbewerb teilgenommen. Das Nerdio-Team ist etwas enttäuscht gewesen, daher haben sie keine Ankündigungen veröffentlicht. Ich habe trotzdem eine Amazon-Geschenkkarte über 1000 USD bekommen 🤩.

[Ich habe auch ein kurzes Video erstellt, das zeigt, dass das Skript funktioniert. Ihr könnt es euch auf YouTube ansehen.](https://www.youtube.com/watch?v=luehHTThFFk)

## Skript herunterladen

[Das Skript steht auf GitHub kostenlos zum Download bereit.](https://github.com/diecknet/AzureVirtualDesktop/tree/main/Deploy-NATGatewayAVD)
