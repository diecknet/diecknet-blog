---
slug: Azure-AD-Connect-Video
title: "Azure AD Connect richtig planen und vorbereiten (Video)"
subtitle: Weiterführende Links zu Azure AD Connect
date: 2020-06-05
contenttags:
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

Die Planung und Vorbereitung von Azure AD Connect ist wichtig. Ich habe zu dem Thema ein [YouTube Video](https://www.youtube.com/watch?v=_feF0VPL2Ps) erstellt. In diesem Artikel verlinke ich die wichtigsten Quellen und Dokumentationsartikel. Außerdem habe ich einen Entscheidungsbaum für das Finden der richtigen Azure AD Connect Architektur erstellt.

[![Azure AD Connect: Planen und vorbereiten (YouTube)](/images/2020/2020-06-06_AzureADConnect-YT-Thumbnail.png "Azure AD Connect: Planen und vorbereiten (YouTube)")](https://www.youtube.com/watch?v=_feF0VPL2Ps)

## Azure AD Connect Entscheidungsbaum

[![Azure AD Connect Entscheidungsbaum (kostenloser Download)](/images/2020/2020-06-05_Azure_AD_Connect_Entscheidungsbaum.jpg "Azure AD Connect Entscheidungsbaum (kostenloser Download)")](https://data.diecknet.de/dl/2020-06-05/Azure_AD_Connect_Entscheidungsbaum.zip)

[Kostenloser Download (.pdf, .png, .drawio)](https://data.diecknet.de/dl/2020-06-05/Azure_AD_Connect_Entscheidungsbaum.zip)

## Weiterführende Links

-   Unterstützte und nicht unterstützte Azure AD Connect Topologien: [Topologies for Azure AD Connect (docs.microsoft.com)](https://docs.microsoft.com/en-us/azure/active-directory/hybrid/plan-connect-topologies)
-   Hardware Anforderungen für Azure AD Connect Server: [Prerequisites for Azure AD Connect - Hardware requirements for Azure AD Connect (docs.microsoft.com)](https://docs.microsoft.com/en-us/azure/active-directory/hybrid/how-to-connect-install-prerequisites#hardware-requirements-for-azure-ad-connect)
-   Azure AD Connect Cloud Provisioning / Features & Einschränkungen: [What is Azure AD Connect cloud provisioning? (docs.microsoft.com)](https://docs.microsoft.com/en-us/azure/active-directory/cloud-provisioning/what-is-cloud-provisioning)
-   Netzwerk Ports für Azure AD Connect: [Hybrid Identity Required Ports and Protocols (docs.microsoft.com)](https://docs.microsoft.com/en-us/azure/active-directory/hybrid/reference-connect-ports)
-   Office 365 IP-Adressen und URLs für genaue Firewall-Regeln: [Office 365 URLs and IP address ranges (docs.microsoft.com)](https://docs.microsoft.com/en-us/office365/enterprise/urls-and-ip-address-ranges)
-   Microsoft IdFix zum Überprüfen der AD-Objekte: [IdFix : Directory Synchronization Error Remediation Tool (github.com)](https://github.com/microsoft/idfix)
-   Anleitung zu Microsoft IdFix / häufige Fehler die IdFix findet und wie sie zu beheben sind: [Prepare directory attributes for synchronization with Office 365 by using the IdFix tool (docs.microsoft.com)](https://docs.microsoft.com/en-us/office365/enterprise/prepare-directory-attributes-for-synch-with-idfix)
-   PowerShell Code Snip zum setzen der UPN aller Benutzer: [Prepare a non-routable domain for directory synchronization - You can also use Windows PowerShell to change the UPN suffix for all users (docs.microsoft.com)](https://docs.microsoft.com/en-us/office365/enterprise/prepare-a-non-routable-domain-for-directory-synchronization#you-can-also-use-windows-powershell-to-change-the-upn-suffix-for-all-users)
-   Gruppenrichtlinie für Seamless Single Sign-On erstellen: [Azure Active Directory Seamless Single Sign-On: Quickstart - Roll out the feature (docs.microsoft.com)](https://docs.microsoft.com/en-us/azure/active-directory/hybrid/how-to-connect-sso-quick-start#step-3-roll-out-the-feature)

