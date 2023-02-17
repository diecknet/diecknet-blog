---
aliases:
    - how-to-configure-m365-azure-ad-mfa-methods
slug: How-to-configure-M365-azure-ad-MFA-methods
title: "How to configure MFA methods for Azure AD"
date: 2022-02-02
contenttags: [azure ad, microsoft 365, mfa, multi-factor-authentication]
image: /images/2022/2022-02-02_thumbnail.png
---

In my opinion the official Microsoft Documentation lacks of any clear information on where to configure the allowed MFA methods for Azure AD. So if you're also wondering on how to configure the allowed Multi-Factor-Authentication methods for Microsoft 365, you've come to right place.

So as of 2022-02-02 you'll find the settings here:

## Short answer

It's still in the classic MFA Azure AD Portal, here: [https://account.activedirectory.windowsazure.com/usermanagement/mfasettings.aspx](https://account.activedirectory.windowsazure.com/usermanagement/mfasettings.aspx)

## Long answer

If you don't trust me or that link above, you can manually click through to the right place:

1. Open the Azure AD Portal and open the Directory ("Azure Active Directory").  
   [![Azure AD Admin Portal](/images/2022/2022-02-02_Azure_Active_Directory_admin_center.png "Azure AD Admin Portal")](/images/2022/2022-02-02_Azure_Active_Directory_admin_center.png)

1. Open "Security".  
   [![Azure AD Admin Portal - Open Security](/images/2022/2022-02-02_Azure_Active_Directory_admin_center_2.png "Azure AD Admin Portal - Open Security")](/images/2022/2022-02-02_Azure_Active_Directory_admin_center_2.png)

1. Open "MFA".  
   [![Azure AD Admin Portal - Security - Open MFA](/images/2022/2022-02-02_Azure_Active_Directory_admin_center_Security.png "Azure AD Admin Portal - Security - Open MFA")](/images/2022/2022-02-02_Azure_Active_Directory_admin_center_Security.png)

1. Click on "Additional cloud-based MFA settings".  
   [![Azure AD Admin Portal - Security - Open MFA](/images/2022/2022-02-02_Azure_Active_Directory_admin_center_MFA.png "Azure AD Admin Portal - Security - Open MFA")](/images/2022/2022-02-02_Azure_Active_Directory_admin_center_MFA.png)

1. The classic Active Directory / Office 365 Portal opens. Choose the desired allowed Authentication Methods under "Verification options". Don't forget to click on "Save".  
   [![Azure AD Classic MFA Admin Portal](/images/2022/2022-02-02_MFA_Portal_classic.png "Azure AD Classic MFA Admin Portal")](/images/2022/2022-02-02_MFA_Portal_classic.png)

