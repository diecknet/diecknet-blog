---
comments: true
aliases:
    - how-to-configure-m365-azure-ad-mfa-methods
slug: How-to-configure-M365-azure-ad-MFA-methods
title: "MFA-Methoden für Azure AD konfigurieren"
date: 2022-02-02
tags: [azure ad, microsoft 365, mfa, multi-factor-authentication]
cover:
    image: /images/2022/2022-02-02_thumbnail.png
---

Dieser Beitrag ist veraltet. Die ["Authentication Methods Policy"](https://learn.microsoft.com/en-us/entra/identity/authentication/how-to-authentication-methods-manage#authentication-methods-policy) ist inzwischen im Entra-Portal leicht erreichbar. Falls ihr noch von den alten Einstellungen migrieren müsst, findet ihr den vollständigen aktuellen Artikel bei [Microsoft Learn](https://learn.microsoft.com/en-us/entra/identity/authentication/how-to-authentication-methods-manage#authentication-methods-policy).


## ALTER BEITRAG ZUR REFERENZ

Meiner Meinung nach erklärt die offizielle Microsoft-Dokumentation nicht klar, wo ihr die erlaubten MFA-Methoden für Azure AD konfiguriert. Wenn ihr euch also auch fragt, wo ihr die erlaubten Multi-Faktor-Authentifizierungsmethoden für Microsoft 365 festlegt, seid ihr hier richtig.

Stand 2022-02-02 findet ihr die Einstellungen hier:

### Kurze Antwort

Sie befinden sich weiterhin im klassischen MFA-Portal für Azure AD, hier: [https://account.activedirectory.windowsazure.com/usermanagement/mfasettings.aspx](https://account.activedirectory.windowsazure.com/usermanagement/mfasettings.aspx)

### Lange Antwort

Wenn ihr mir oder dem Link oben nicht vertraut, könnt ihr euch auch manuell bis zur richtigen Stelle durchklicken:

1. Öffnet das Azure-AD-Portal und dann das Verzeichnis ("Azure Active Directory").  
   [![Azure AD Admin Portal](/images/2022/2022-02-02_Azure_Active_Directory_admin_center.png "Azure AD Admin Portal")](/images/2022/2022-02-02_Azure_Active_Directory_admin_center.png)

1. Öffnet "Security".  
   [![Azure AD Admin Portal - Open Security](/images/2022/2022-02-02_Azure_Active_Directory_admin_center_2.png "Azure AD Admin Portal - Open Security")](/images/2022/2022-02-02_Azure_Active_Directory_admin_center_2.png)

1. Öffnet "MFA".  
   [![Azure AD Admin Portal - Security - Open MFA](/images/2022/2022-02-02_Azure_Active_Directory_admin_center_Security.png "Azure AD Admin Portal - Security - Open MFA")](/images/2022/2022-02-02_Azure_Active_Directory_admin_center_Security.png)

1. Klickt auf "Additional cloud-based MFA settings".  
   [![Azure AD Admin Portal - Security - Open MFA](/images/2022/2022-02-02_Azure_Active_Directory_admin_center_MFA.png "Azure AD Admin Portal - Security - Open MFA")](/images/2022/2022-02-02_Azure_Active_Directory_admin_center_MFA.png)

1. Das klassische Active-Directory-/Office-365-Portal öffnet sich. Wählt unter "Verification options" die gewünschten erlaubten Authentifizierungsmethoden aus. Vergesst nicht, auf "Save" zu klicken.  
   [![Azure AD Classic MFA Admin Portal](/images/2022/2022-02-02_MFA_Portal_classic.png "Azure AD Classic MFA Admin Portal")](/images/2022/2022-02-02_MFA_Portal_classic.png)
