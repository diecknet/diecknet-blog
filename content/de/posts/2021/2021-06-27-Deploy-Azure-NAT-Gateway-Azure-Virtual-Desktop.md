---
comments: true
aliases:
    - deploy-azure-nat-gateway-azure-virtual-desktop
slug: Deploy-Azure-NAT-Gateway-Azure-Virtual-Desktop
title: Bereitstellung eines Azure NAT-Gateways für Azure Virtual Desktop mit PowerShell
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
imageAlt: YouTube Thumbnail for Azure NAT-Gateway/ Azure Virtual Desktop
date: 2021-06-27
---

Ich habe ein PowerShell-Skript erstellt, das automatisch ein Azure NAT-Gateway in einer Azure Virtual Desktop Umgebung bereitstellt. Das ist nützlich, wenn ihr eine statische IP-Adresse für eure AVD-Maschinen braucht. Das Skript habe ich als Beitrag für den [Nerdio Hackathon 2021](https://getnerdio.com/nerdio-hackathon/) erstellt. Mein erster Hackathon überhaupt :^).

**Update 2021-10-05** - Ich habe tatsächlich den ersten Platz gewonnen, allerdings haben anscheinend nicht viele am Wettbewerb teilgenommen. Das Nerdio-Team war etwas enttäuscht und hat daher keine Ankündigung veröffentlicht. Immerhin habe ich einen Amazon-Gutschein über 1000 USD bekommen 🤩.

[Ich habe außerdem ein kurzes Video erstellt, das zeigt, wie das Skript funktioniert. Ihr könnt es euch auf YouTube ansehen.](https://www.youtube.com/watch?v=luehHTThFFk)

## Skript abrufen

[Das Skript könnt ihr kostenlos auf GitHub herunterladen.](https://github.com/diecknet/AzureVirtualDesktop/tree/main/Deploy-NATGatewayAVD)
