---
comments: true
aliases:
    - apple-internet-accounts-office365
slug: Apple-Internet-Accounts-Office365
layout: post
title: "Exchange Online: Apple Internet Accounts - Need admin approval"
subtitle: Enable iOS Access to Office 365 resources
date: 2020-05-10
tags:
    [
        exchange,
        exchangeonline,
        iphone,
        apple,
        azuread,
        ios,
        microsoft365,
        office365
    ]
cover:
    image: /images/2020/2020-05-07_Apple-Internet-Accounts-de_1.png
---

When the first users logged into Office 365 with his iPhone to sync his Contacts and Calendar, he got this dialogue:

> **Need admin approval**
> Apple Internet Accounts
> Apple Internet Accounts needs permission to access resources in your organization that only an admin can grant. Please ask an admin to grant permission to this app before you can use it.

By the way, the app used to be called "iOS Accounts" and was apparently renamed in early 2020. However, the previous AppID has remained the same.

## Cause

The following reasons have caused this message:

1. Apple Internet Accounts app is required by Apple iOS to access the user's Office 365 resources. Access to resources of an Office 365 Tenant by a third-party app is only possible after explicit approval.
2. No user or administrator approval has yet been granted for Apple Internet Accounts in this tenant.
3. The user approval is deactivated tenant wide. This recommended setting can be set so that end users cannot simply authorise third-party apps to access company data.

You can find that setting for 3. in Azure AD under ["Enterprise applications" -> "User settings"](https://portal.azure.com/#blade/Microsoft_AAD_IAM/StartboardApplicationsMenuBlade/UserSettings/menuId/). The option is called "Users can consent to apps accessing company data on their behalf". **This setting should be kept to "No"!** The fact that the end user is not allowed to allow any apps (and therefore can't get ahead here) is exactly what you want to protect company data from unauthorized access.

## Solution

There are several possible solutions without simply unlocking all third-party apps.

### Solution approach

**Update 2022-06-20: It's usually not necessary anymore to craft the url manually. Instead you can just click this link: [https://aka.ms/ConsentAppleApp. Steps 1 and 2 can be skipped then.](https://aka.ms/ConsentAppleApp)**

#### Step 1: Find out TenantID

First of all you have to find out the Tenant ID of the Azure AD Tenant. You'll find it on the ["Overview page in Azure Active Directory"](https://portal.azure.com/#blade/Microsoft_AAD_IAM/ActiveDirectoryMenuBlade/Overview) (marked red in the following screenshot).

![The Tenant ID can be found in Azure Active Directory on the Overview page.](/images/2020/2020-05-07_AzureAD_TenantID.png "The Tenant ID can be found in Azure Active Directory on the Overview page.")

#### Step 2: Craft URL

The placeholder `<TenantID>` has to get replaced with the actual TenantID from Step 1 in the following URL. The generated URL can then be accessed with Tenant Admin (Global Administrator) rights. The `client_id` in the URL is the ID of Apple Internet Accounts.

```plaintext
<https://login.microsoftonline.com/><TenantID>/oauth2/authorize?client_id=f8d98a96-0999-43f5-8af3-69971c7bb423&response_type=code&redirect_uri=<https://example.com&prompt=admin_consent>

```

#### Step 3: Grant permission as admin for the whole Tenant

The query "Permission requested - Accept for your organization - Apple Internet Accounts" must be confirmed with "Accept".

![Administrative Consent Request: Permissions requested - Accept for your organization - Apple Internet Accounts](/images/2020/2020-05-07_Apple-Internet-Accounts-de_2.png "Administrative Consent Request: Permissions requested - Accept for your organization - Apple Internet Accounts")

If you crafted the URL as described in Step 1 and 2, you'll receive an error now, because the redirect URL points to `https://example.com`. The error AADSTS900561 may be ignored in this case.

![Error: We couldn't log you in  - AADSTS900561: The endpoint only accepts POST requests. Received a GET request. May be ignored in this case.](/images/2020/2020-05-07_Apple-Internet-Accounts-de_3.png "Error: We couldn't log you in  - AADSTS900561: The endpoint only accepts POST requests. Received a GET request. May be ignored in this case.")

The app should be listed in Azure AD under "Enterprise applications" -> "All applications" now.

![List of allowed Enterprise Applications in Azure AD](/images/2020/2020-05-07_AzureAD_enterpriseapplicationslist.png "List of allowed Enterprise Applications in Azure AD")

#### Step 4: Test if it works

Afterwards the users should be able to access their Calendar/Contacts in Exchange Online using iOS.

### Solution approach 2: Enable Administrator Consent request

Alternatively, you can activate that users can request the approval of an app. This is also possible in addition to the one-time administrative approval from solution 1.

#### Step 1: Enable Admin Consent Requests

Open ["Enterprise applications" -> "User settings"](https://portal.azure.com/#blade/Microsoft_AAD_IAM/StartboardApplicationsMenuBlade/UserSettings/menuId/) in Azure AD as an Administrator. Under "Admin consent requests (Preview)" you can enable the option "Users can request admin consent to apps they are unable to consent to". Then click on "Select admin consent request reviewers" and select the Administrators, that should approve the requests. If required, you can enable to notify these administrators by email.
In Default the requests expire after 30 days, which can be adjusted aswell.

![Enable Enterprise Application Admin Consent Request in Azure AD](/images/2020/2020-05-07_EnterpriseApplication_AdminConsentRequest.png "Enable Enterprise Application Admin Consent Request in Azure AD")

#### Step 2: User requests Administrator-Consent

When a users wants to use a new app, he'll receive the info "**Approval Required**". The necessary permissions of the app are listed. The user must enter a reason for the application request. The approval request can then be sent.

![Notification for the enduser when trying to use a new app - Approval Required - The required permissions are listed. It's necessary to enter a reason for the request.](/images/2020/2020-05-07_RequestAdminConsent_as_enduser.png "Notification for the enduser when trying to use a new app - Approval Required - The required permissions are listed. It's necessary to enter a reason for the request.")

#### Step 3: Administrator reviews the Approval Request

The selected admins receive an E-Mail, which lists the details of the request. In that E-Mail they can click on "Review Request", to review more details. If they don't act until the expiration date, the request will get rejected automatically.

![E-Mail showing an Enterprise Application - Admin consent request](/images/2020/2020-05-07_EnterpriseApplication_AdminConsentRequest_by_mail.png "E-Mail showing an Enterprise Application - Admin consent request")

Alternatively the Administrator can review the list of open requests in Azure AD. Open ["Enterprise applications" -> "Admin consent requests"](https://portal.azure.com/#blade/Microsoft_AAD_IAM/StartboardApplicationsMenuBlade/AccessRequests/menuId/) to do so.

![List of Enterprise Application - Admin consent requests](/images/2020/2020-05-07_EnterpriseApplications_userreqeustlist.png "List of Enterprise Application - Admin consent requests")

Details like Name, Homepage URL, used Reply URLs can get reviewed. Under "Requested by" it lists the requesting user. The Administrator can review the permissions and approve the request ("Review permissions and consent") or "Deny" it. If the application should get blocked permanently, you can select "Block" - no further requests for this app are possible then.

![Retrieve details to the Enterprise Application Admin consent request](/images/2020/2020-05-07_EnterpriseApplication_AdminConsent_Actions_and_infos.png "Retrieve details to the Enterprise Application Admin consent request")

If the application was not approved, the user would get the message **AADSTS7000112**, when trying to use it next time.

![Applikation was blocked by Administrator or was not approved: AADSTS7000112 application is disabled](/images/2020/2020-05-07_AADSTS7000112_application_disabled.png "Applikation was blocked by Administrator or was not approved: AADSTS7000112 application is disabled")

#### Step 4: Test if it works after the consent

Afterwards the users should be able to use the requested and approved App.

## Disable an App that was allowed before

If an app has already been allowed, it can be deactivated again if required. To do this, select the application from "Enterprise applications" and under "Properties" set the option "Enabled for users to sign-in" to "No". If you click on "Delete" here instead, the users can request approval again.

![Disable a previously allowed Enterprise App: Set Enabled for users to sign-in to No.](/images/2020/2020-05-07_Disable_existing_enterpriseapp.png "Disable a previously allowed Enterprise App: Set Enabled for users to sign-in to No.")

## Related Links

-   [Documentation: Application management with Azure Active Directory (docs.microsoft.com)](https://docs.microsoft.com/en-us/azure/active-directory/manage-apps/what-is-application-management)
-   [Article: "iOS accounts needs permission to access Office 365 resources" (office365.thorpick.de)](https://office365.thorpick.de/ios-accounts-needs-permission-to-access-office-365-resources)
-   [Article in Exchange Team Blog: Microsoft and Apple Working Together to Improve Exchange Online Security](https://techcommunity.microsoft.com/t5/exchange-team-blog/microsoft-and-apple-working-together-to-improve-exchange-online/ba-p/3513846)
