---
aliases:
    - deploy-azure-nat-gateway-azure-virtual-desktop
slug: Deploy-Azure-NAT-Gateway-Azure-Virtual-Desktop
title: Deploy an Azure NAT-Gateway for Azure Virtual Desktop by PowerShell
subtitle: Deploying Azure Resources by REST-API
contenttags:
    [
        azure,
        azure virtual desktop,
        windows virtual desktop,
        nerdio,
        powershell,
        hackathon
    ]
image: /images/2021/2021-06-27-NAT-Gateway-Azure-Virtual-Desktop.png
imageAlt: YouTube Thumbnail for Azure NAT-Gateway/ Azure Virtual Desktop
date: 2021-06-27
---

I created a PowerShell script to automatically deploy an Azure NAT-Gateway into an Azure Virtual Desktop environment. That's useful, if you to need one static IP-Address for your AVD machines. I created the script as a submission for the [Nerdio Hackathon 2021](https://getnerdio.com/nerdio-hackathon/). My first Hackathon attendance :^).

**Update 2021-10-05** - I actually won first place, but apparently not many people participated in the contest. The Nerdio team are a bit disappointed, so they didn't publish any announcements. Anyway I got a 1000 USD Amazon Gift Card 🤩.

[I also created a quick video proof of the script working, which you can check out on YouTube.](https://www.youtube.com/watch?v=luehHTThFFk)

## Get the script

[The script is free to download on GitHub.](https://github.com/diecknet/AzureVirtualDesktop/tree/main/Deploy-NATGatewayAVD)
