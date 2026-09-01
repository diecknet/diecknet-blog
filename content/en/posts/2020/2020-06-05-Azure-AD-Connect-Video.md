---
comments: true
aliases:
    - azure-ad-connect-video
slug: Plan-and-Prepare-Azure-AD-Connect-Video
title: "Plan and Prepare Azure AD Connect Correctly (Video)"
subtitle: Further Reading on Azure AD Connect
date: 2020-06-05
tags:
    [
        azuread,
        activedirectory,
        azureadconnect,
        microsoft365,
        office365,
        hybrid,
        hybrididentity
    ]
---

Planning and preparing Azure AD Connect is important. I created a [YouTube video](https://www.youtube.com/watch?v=_feF0VPL2Ps) on this topic. In this article I link to the most important sources and documentation articles. I also created a decision tree for finding the right Azure AD Connect architecture.

[![Azure AD Connect: Plan and Prepare (YouTube)](/images/2020/2020-06-06_AzureADConnect-YT-Thumbnail.png "Azure AD Connect: Plan and Prepare (YouTube)")](https://www.youtube.com/watch?v=_feF0VPL2Ps)

## Azure AD Connect Decision Tree

[![Azure AD Connect Decision Tree (free download)](/images/2020/2020-06-05_Azure_AD_Connect_Entscheidungsbaum.jpg "Azure AD Connect Decision Tree (free download)")](https://data.diecknet.de/dl/2020-06-05/Azure_AD_Connect_Entscheidungsbaum.zip)

[Free download (.pdf, .png, .drawio)](https://data.diecknet.de/dl/2020-06-05/Azure_AD_Connect_Entscheidungsbaum.zip)

## Further Reading

-   Supported and unsupported Azure AD Connect topologies: [Topologies for Azure AD Connect (docs.microsoft.com)](https://docs.microsoft.com/en-us/azure/active-directory/hybrid/plan-connect-topologies)
-   Hardware requirements for the Azure AD Connect server: [Prerequisites for Azure AD Connect - Hardware requirements for Azure AD Connect (docs.microsoft.com)](https://docs.microsoft.com/en-us/azure/active-directory/hybrid/how-to-connect-install-prerequisites#hardware-requirements-for-azure-ad-connect)
-   Azure AD Connect cloud provisioning / features and limitations: [What is Azure AD Connect cloud provisioning? (docs.microsoft.com)](https://docs.microsoft.com/en-us/azure/active-directory/cloud-provisioning/what-is-cloud-provisioning)
-   Network ports for Azure AD Connect: [Hybrid Identity Required Ports and Protocols (docs.microsoft.com)](https://docs.microsoft.com/en-us/azure/active-directory/hybrid/reference-connect-ports)
-   Office 365 IP addresses and URLs for precise firewall rules: [Office 365 URLs and IP address ranges (docs.microsoft.com)](https://docs.microsoft.com/en-us/office365/enterprise/urls-and-ip-address-ranges)
-   Microsoft IdFix for checking AD objects: [IdFix : Directory Synchronization Error Remediation Tool (github.com)](https://github.com/microsoft/idfix)
-   Guide to Microsoft IdFix / common errors IdFix finds and how to fix them: [Prepare directory attributes for synchronization with Office 365 by using the IdFix tool (docs.microsoft.com)](https://docs.microsoft.com/en-us/office365/enterprise/prepare-directory-attributes-for-synch-with-idfix)
-   PowerShell code snippet to set the UPN for all users: [Prepare a non-routable domain for directory synchronization - You can also use Windows PowerShell to change the UPN suffix for all users (docs.microsoft.com)](https://docs.microsoft.com/en-us/office365/enterprise/prepare-a-non-routable-domain-for-directory-synchronization#you-can-also-use-windows-powershell-to-change-the-upn-suffix-for-all-users)
-   Create a Group Policy for Seamless Single Sign-On: [Azure Active Directory Seamless Single Sign-On: Quickstart - Roll out the feature (docs.microsoft.com)](https://docs.microsoft.com/en-us/azure/active-directory/hybrid/how-to-connect-sso-quick-start#step-3-roll-out-the-feature)
