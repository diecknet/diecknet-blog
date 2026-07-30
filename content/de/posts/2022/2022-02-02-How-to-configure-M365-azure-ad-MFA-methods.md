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

Dieser Beitrag ist veraltet. Die ["authentcation methods policy"](https://learn.microsoft.com/en-us/entra/identity/authentication/how-to-authentication-methods-manage#authentication-methods-policy) ist jetzt im Entra-Portal einfach verfügbar geworden. Möglicherweise habt ihr trotzdem noch von den Legacy-Einstellungen migrieren müssen; den vollständigen Artikel habt ihr bei [Microsoft Learn](https://learn.microsoft.com/en-us/entra/identity/authentication/how-to-authentication-methods-manage#authentication-methods-policy) gelesen.


## ALTER BEITRAG als Referenz

Meiner Meinung nach hat die offizielle Microsoft-Dokumentation keine klaren Informationen dazu geboten, wo die erlaubten MFA-Methoden für Azure AD konfiguriert worden sind. Wenn ihr euch ebenfalls gefragt habt, wie die erlaubten Multi-Faktor-Authentifizierungs-Methoden für Microsoft 365 konfiguriert worden sind, seid ihr hier richtig gewesen.

Stand 2022-02-02 habt ihr die Einstellungen hier gefunden:

### Kurze Antwort

Es ist weiterhin im klassischen MFA-Azure-AD-Portal gewesen, hier: [https://account.activedirectory.windowsazure.com/usermanagement/mfasettings.aspx](https://account.activedirectory.windowsazure.com/usermanagement/mfasettings.aspx)

### Lange Antwort

Wenn ihr mir oder dem Link oben nicht vertraut habt, habt ihr euch manuell bis zur richtigen Stelle durchklicken können:

1. Ihr habt das Azure-AD-Portal geöffnet und das Verzeichnis ("Azure Active Directory") geöffnet.  
   [![Azure AD Admin Portal](/images/2022/2022-02-02_Azure_Active_Directory_admin_center.png "Azure AD Admin Portal")](/images/2022/2022-02-02_Azure_Active_Directory_admin_center.png)

1. Ihr habt "Security" geöffnet.  
   [![Azure AD Admin Portal - Open Security](/images/2022/2022-02-02_Azure_Active_Directory_admin_center_2.png "Azure AD Admin Portal - Open Security")](/images/2022/2022-02-02_Azure_Active_Directory_admin_center_2.png)

1. Ihr habt "MFA" geöffnet.  
   [![Azure AD Admin Portal - Security - Open MFA](/images/2022/2022-02-02_Azure_Active_Directory_admin_center_Security.png "Azure AD Admin Portal - Security - Open MFA")](/images/2022/2022-02-02_Azure_Active_Directory_admin_center_Security.png)

1. Ihr habt auf "Additional cloud-based MFA settings" geklickt.  
   [![Azure AD Admin Portal - Security - Open MFA](/images/2022/2022-02-02_Azure_Active_Directory_admin_center_MFA.png "Azure AD Admin Portal - Security - Open MFA")](/images/2022/2022-02-02_Azure_Active_Directory_admin_center_MFA.png)

1. Das klassische Active-Directory-/Office-365-Portal hat sich geöffnet. Ihr habt unter "Verification options" die gewünschten erlaubten Authentifizierungsmethoden ausgewählt. Ihr habt nicht vergessen, auf "Save" zu klicken.  
   [![Azure AD Classic MFA Admin Portal](/images/2022/2022-02-02_MFA_Portal_classic.png "Azure AD Classic MFA Admin Portal")](/images/2022/2022-02-02_MFA_Portal_classic.png)
