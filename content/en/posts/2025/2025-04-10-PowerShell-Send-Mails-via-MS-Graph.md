---
slug: "powershell-send-mails-via-ms-graph"
title: "Send emails with PowerShell and Microsoft Graph"
date: 2025-04-10
tags: [powershell, microsoft graph, exchange]
---
Sending emails via PowerShell and the Microsoft Graph API is unfortunately not as simple as with the classic `Send-MailMessage` cmdlet. I also recently published [a blog post about the classic approach]( {{< ref "2025-03-23-PowerShell-Send-MailMessage.md" >}}).

Nevertheless, there are several reasons to prefer sending mail via Microsoft Graph. In October 2025, plaintext authentication (Basic Authentication) for SMTP sending in Exchange Online is expected to be turned off. So if Exchange Online is your only email system, but you want to send emails automatically, MS Graph is the right choice. Alternatively, of course, you could also purchase (or host) an additional email system.

I think it is quite charming to send emails with PowerShell while using the Exchange Online infrastructure, including any transport rules and existing DKIM/DMARC/SPF setup, and so on.

I also made a video about sending emails via MS Graph: <https://youtu.be/0kgKD3XsEXU>

## The challenge

Sending mail via Microsoft Graph is more complex than the simple `Send-MailMessage`:

1. Authentication
    - Authentication as an app is possible
        - via Managed Identity, certificate, or client secret
        - usually without restrictions from Conditional Access policies
    - For testing purposes: authentication as a user is also possible
2. Syntax
    - Although the Microsoft Graph PowerShell SDK offers the `Send-MgUserMail` cmdlet, even the simplest parameters have to be provided as awkward hashtables instead of regular PowerShell cmdlet parameters 😓

## PowerShell modules...

It is also possible to use the Microsoft Graph API in PowerShell without any additional modules. In that case, you would have to build the HTTP requests yourself and send them with `Invoke-RestMethod`. The authentication is a bit trickier in that case.

The PowerShell Graph SDK is the official toolkit from Microsoft for using the Microsoft Graph API in PowerShell. Unfortunately, it is not especially good. It is automatically generated from the API specifications. As a result, the cmdlet names are sometimes long and awkward, and the parameters often have to be passed as complex hashtables or JSON instead of simple PowerShell cmdlet parameters. There are also third-party modules for the Graph API that offer advantages such as improved speed.

**But** the PowerShell Graph SDK is from Microsoft. So it is a first-party module, and I would place more trust in it. You could also describe it as the standard approach.

I personally do not have anything against PowerShell modules that do not come from Microsoft. But for some organizations, that matters.

### ... for sending email

On the automation host, you need the `Microsoft.Graph.Users.Actions` module for sending email.

```powershell
# With PowerShell 7 or with PSResourceGet
Install-PSResource Microsoft.Graph.Users.Actions

# With Windows PowerShell 5.1 or with PowerShellGet
Install-Module Microsoft.Graph.Users.Actions
```

### ... for setup

These modules do not necessarily need to be installed on the system that runs the automation. They are only needed to configure permissions and could be installed on an admin workstation, for example.

- `Microsoft.Graph.Applications` - to grant the app registration or Managed Identity the necessary permissions to send mail
- `ExchangeOnlineManagement` - to restrict sending mail to specific senders

```powershell
# With PowerShell 7 or with PSResourceGet
Install-PSResource Microsoft.Graph.Applications
Install-PSResource ExchangeOnlineManagement

# With Windows PowerShell 5.1 or with PowerShellGet
Install-Module Microsoft.Graph.Applications
Install-Module ExchangeOnlineManagement
```

## Authentication and permissions

Before we can send emails, we need to authenticate.

### For simple tests: as a user

For simple test purposes, we can authenticate as a user and then send emails on our own behalf. If the PowerShell script is expected to run regularly without supervision, this approach is not suitable.

```powershell
Connect-MgGraph -Scopes "Mail.Send"
```

After you have authenticated in general, you will likely still be asked whether you agree to the permissions. If the rights are restricted in your tenant, you may not be able to consent as a regular user.

If you are currently authenticated as an administrator, there is also a checkbox for "Consent on behalf of your organization". You should normally not check it. If you enable that option, then from now on **all users** in your tenant could use the PowerShell Graph SDK to send emails.

[![Permissions requested for Microsoft Graph mail sending](/images/2025/2025-04-10_MSGraphPermissions.jpg "Permissions requested for Microsoft Graph mail sending")](/images/2025/2025-04-10_MSGraphPermissions.jpg)

### Secure and simple: Managed Identity

The **best option for production purposes is, in my opinion, a Managed Identity**. In this case, the credentials are managed automatically by Microsoft Entra ID. This works only for Azure resources such as Azure VMs, Azure Automation Accounts, or systems connected to Azure via Azure Arc.

For this, you first need to assign a Managed Identity to your Azure resource. This can often be done during creation, but of course also later.

[![Example: enabling a system-assigned Managed Identity for an Azure Virtual Machine under Security - Identity by setting the Status to On. A Managed Identity object ID is then shown.](/images/2025/2025-04-10_ManagedIdentityForVM.jpg "Example: enabling a system-assigned Managed Identity for an Azure Virtual Machine under Security - Identity by setting the Status to On. A Managed Identity object ID is then shown.")](/images/2025/2025-04-10_ManagedIdentityForVM.jpg)

The Managed Identity then has a service principal with an object ID and can receive permissions through it. You can assign the permission to send mail with the following PowerShell code. This setup does not need to be performed on the automation host, but can, for example, be done on an admin system (see also: [PowerShell modules for setup](#-for-setup)).

You should of course set the values for the variables `$TenantId` and `$managedIdentityObjectId` to match your environment. If needed, you could assign additional Graph permissions to the app by adding more entries to the `$appRoleNames` array.

**⚠️ Important:** By default, the Managed Identity may initially be allowed to send from all Exchange senders in your environment. You should restrict these permissions, and I explain how to do that in the section [Restrict mail sending to specific senders](#restrict-mail-sending-to-specific-senders).

```powershell
# The tenant ID
$TenantId = ""

# The name of the app role that the managed identity should be assigned to.
$appRoleNames = @("Mail.Send")

# Set the managed identity's object ID.
$managedIdentityObjectId = ""

Connect-MgGraph -TenantId $TenantId -Scopes 'Application.Read.All', 'AppRoleAssignment.ReadWrite.All'

# Get Microsoft Graph app's service principal and app role.
$serverApplicationName = "Microsoft Graph"
$serverServicePrincipal = (Get-MgServicePrincipal -Filter "DisplayName eq '$serverApplicationName'")
$serverServicePrincipalObjectId = $serverServicePrincipal.Id


# Assign the managed identity access to the app role.
foreach ($appRoleName in $appRoleNames) {
    $currAppRoleId = ($serverServicePrincipal.AppRoles | Where-Object { $_.Value -eq $appRoleName }).Id
    New-MgServicePrincipalAppRoleAssignment `
        -ServicePrincipalId $managedIdentityObjectId `
        -PrincipalId $managedIdentityObjectId `
        -ResourceId $serverServicePrincipalObjectId `
        -AppRoleId $currAppRoleId
}
```

It can sometimes take some time before the permission becomes active. I tried again the next morning and then it worked. I would normally expect to allow about 1 hour.

The actual authentication in your PowerShell script (the one that sends emails) is as simple as this:

```powershell
Connect-MgGraph -Identity
```

So you do not need to reference any credentials in the code at all 👍

### App registration and certificate or client secret

If Managed Identities are not an option for you, there is also the possibility of creating an app registration in Entra ID and then authenticating either with a certificate (better) or a client secret (worse). The setup is done, for example, in the Entra Admin Center under "Applications" - "App Registrations" by clicking the "New registration" button.

**⚠️ Important:** By default, the app or service principal (after the following configuration) may initially be allowed to send from all Exchange senders in your environment. You should restrict these permissions, and I explain how to do that in the section [Restrict mail sending to specific senders](#restrict-mail-sending-to-specific-senders).

[![Create a new app registration in the Entra portal under Applications - App Registrations](/images/2025/2025-04-10_NewAppRegistration.jpg "Create a new app registration in the Entra portal under Applications - App Registrations")](/images/2025/2025-04-10_NewAppRegistration.jpg)

The app name is essentially up to you. Keep the default "Accounts in this organizational directory only [...]" for "Supported Account Types". You do not need to enter a redirect URI.

[![The app name is essentially up to you. Keep the default Accounts in this organizational directory only for Supported Account Types. You do not need to enter a redirect URI.](/images/2025/2025-04-10_AppRegistrationSettings.jpg "The app name is essentially up to you. Keep the default Accounts in this organizational directory only for Supported Account Types. You do not need to enter a redirect URI.")](/images/2025/2025-04-10_AppRegistrationSettings.jpg)

After creating the app, it still needs permissions. For the Managed Identity in the previous section, we used PowerShell. Here is how to do it via the GUI:

Under "API Permissions", click "Add a permission".

[![After creating the app: Add a permission under API Permissions](/images/2025/2025-04-10_AppRegistrationApiPermissions.jpg "After creating the app: Add a permission under API Permissions")](/images/2025/2025-04-10_AppRegistrationApiPermissions.jpg)

In the selection "Select an API", choose the option "Microsoft Graph".

[![In the selection Select an API, choose the option Microsoft Graph.](/images/2025/2025-04-10_AppRegistrationApiPermissionsSelectAnApi.jpg "In the selection Select an API, choose the option Microsoft Graph.")](/images/2025/2025-04-10_AppRegistrationApiPermissionsSelectAnApi.jpg)

In the selection "What type of permissions does your application require?", choose the option "Application permissions".

[![In the selection What type of permissions does your application require?, choose the option Application permissions.](/images/2025/2025-04-10_AppRegistrationApiPermissionsRequestApiPermissions.jpg "In the selection What type of permissions does your application require?, choose the option Application permissions.")](/images/2025/2025-04-10_AppRegistrationApiPermissionsRequestApiPermissions.jpg)

In the selection "Select permission", find and select the permission "Mail.Send".

[![In the selection Select permission, find and select the permission Mail.Send.](/images/2025/2025-04-10_AppRegistrationApiPermissionsSelectPermissions.jpg "In the selection Select permission, find and select the permission Mail.Send.")](/images/2025/2025-04-10_AppRegistrationApiPermissionsSelectPermissions.jpg)

The default permission "User.Read" of type "Delegated" can be removed, by the way. It is not needed for sending emails.

[![The default permission User.Read of type Delegated can be removed, by the way. It is not needed for sending emails.](/images/2025/2025-04-10_AppRegistrationApiPermissionsRemoveUserRead.jpg "The default permission User.Read of type Delegated can be removed, by the way. It is not needed for sending emails.")](/images/2025/2025-04-10_AppRegistrationApiPermissionsRemoveUserRead.jpg)

Then grant consent for the new API permission on behalf of the organization by clicking "Grant admin consent for TENANTNAME" and then confirm with "Yes".

[![In the selection Select permission, find and select the permission Mail.Send.](/images/2025/2025-04-10_AppRegistrationApiPermissionsGrantConsent.jpg "In the selection Select permission, find and select the permission Mail.Send.")](/images/2025/2025-04-10_AppRegistrationApiPermissionsGrantConsent.jpg)

#### Certificate

If you want to authenticate with a certificate, take a look at Microsoft's documentation: <https://learn.microsoft.com/en-us/entra/identity-platform/howto-create-self-signed-certificate?wt.mc_id=MVP_330618>

#### Client secret

If you want to authenticate with a client secret, you first need to create a secret. This is done under "Certificates & Secrets" and then under "Client secrets" by clicking "New client secret".

[![Add a new secret: Certificates & secrets - Client secrets - New client secret.](/images/2025/2025-04-10_NewAppRegistrationClientSecret1.jpg "Add a new secret: Certificates & secrets - Client secrets - New client secret.")](/images/2025/2025-04-10_NewAppRegistrationClientSecret1.jpg)

In general, it is recommended for security reasons not to choose a very long validity period. I therefore kept the default value of 180 days.

[![Description is free to choose, expiration date should not be too far in the future](/images/2025/2025-04-10_NewAppRegistrationClientSecret2.jpg "Description is free to choose, expiration date should not be too far in the future")](/images/2025/2025-04-10_NewAppRegistrationClientSecret2.jpg)

The secret value is only shown once. You should therefore copy it immediately. If you come back to the page later, it will not be shown again. The secret should be treated like a password and should not be stored in plain text in documentation or in PowerShell code.

The secret shown in the screenshot is not valid anymore, of course 😉

[![The secret should be copied immediately and treated like a password](/images/2025/2025-04-10_NewAppRegistrationClientSecret3.jpg "The secret should be copied immediately and treated like a password")](/images/2025/2025-04-10_NewAppRegistrationClientSecret3.jpg)

One way to store the secret more securely would be as an exported PowerShell credential object. This can only be decrypted by the user (on the same computer) who also encrypted it.
Alternatively, the [PowerShell SecretManagement module](https://learn.microsoft.com/en-us/powershell/module/microsoft.powershell.secretmanagement/?view=ps-modules&wt.mc_id=MVP_330618) is also an interesting approach.

You can query and save the credentials like this, using the application ID from the app registration overview page as the username.

```powershell
$Credential = Get-Credential
$Credential | Export-CliXml Credential.xml
```

And later in your script, you can import it and use it to authenticate to MS Graph. Please also remember to enter the TenantId:

```powershell
$Credential = Import-Clixml .\Credential.xml
Connect-MgGraph -ClientSecretCredential $Credential -TenantId "enter your tenant ID here"
```

### Restrict mail sending to specific senders

As already mentioned, a service principal or Managed Identity with the `Mail.Send` permission may initially be able to use all Exchange objects in your environment as senders. I would recommend always [restricting](https://learn.microsoft.com/en-us/graph/auth-limit-mailbox-access?wt.mc_id=MVP_330618) these permissions so that sending is allowed only from certain senders.

The configuration of such a restriction is done with Exchange Online PowerShell. This does not need to be done on the automation host and can also be done from an admin VM or similar (see also: [PowerShell modules for setup](#-for-setup)).

Here are the values for the [`New-ApplicationAccessPolicy`](https://learn.microsoft.com/en-us/powershell/module/exchange/new-applicationaccesspolicy?view=exchange-ps&wt.mc_id=MVP_330618) parameters:

- `-AppId` the application ID (also called the Client ID) of your app registration or Managed Identity
- `-PolicyGroupScopeId` either a single mailbox (shared mailboxes are also supported) or a mail-enabled security group containing the Exchange objects that may send mail
- `-Description` the description is free to choose
- `-AccessRight` the value `RestrictAccess` ensures that the app may only access the mailboxes specified in `-PolicyGroupScopeId`

```powershell
Connect-ExchangeOnline

New-ApplicationAccessPolicy -AppId "enter app ID here" -PolicyScopeGroupId "enter the group or mailbox that may send here" -AccessRight RestrictAccess -Description "The description is also free to choose"
```

*The application ID of your Managed Identity is not the object ID. If you want to find the application ID, look in the Entra portal under "Enterprise Applications" and change the filter "Application type" to "Managed Identities".

[![Change the Application Type filter to Managed Identities under Enterprise Applications in Entra ID to find the application ID of a Managed Identity](/images/2025/2025-04-10_ManagedIdentityApplicationID.jpg "Change the Application Type filter to Managed Identities under Enterprise Applications in Entra ID to find the application ID of a Managed Identity")](/images/2025/2025-04-10_ManagedIdentityApplicationID.jpg)

## Examples for sending email

Phew... So we now have authentication and restrictions for specific sender addresses. Here are a few examples for the actual sending of emails.

There are many more options you can adjust in the `$params` hashtable. These "complex parameters" are listed in the documentation for the `Send-MgUserMail` cmdlet in the [Notes section](https://learn.microsoft.com/en-us/powershell/module/microsoft.graph.users.actions/send-mgusermail?view=graph-powershell-1.0&wt.mc_id=MVP_330618#notes).

### Example 1: Plain-text email

```powershell
$params = @{
	message = @{
		subject = "Test email via MS Graph"
		body = @{
			contentType = "Text"
			content = "Greetings from PowerShell (via Graph)"
		}
		toRecipients = @(
			@{
				emailAddress = @{
					address = "hans.maulwurf@demotenant.de"
				}
			}
		)
	}
}

Send-MgUserMail -UserId "diecknet-adm@diecknetdemotenant.onmicrosoft.com" -BodyParameter $params
```

### Example 2: HTML email

```powershell
$params = @{
	message = @{
		subject = "Test HTML email via MS Graph"
		body = @{
			contentType = "html"
			content = @"
				<h1>Greetings from PowerShell (via Graph)</h1>
				<a href="https://youtube.com/@diecknet">Subscribe to the channel :)</a><br>
				<b>Thank you!</b>
			"@
		}
		toRecipients = @(
			@{
				emailAddress = @{
					address = "hans.maulwurf@demotenant.de"
				}
			}
		)
	}
}
Send-MgUserMail -UserId "departmentmailbox@demotenant.de" -BodyParameter $params
```

### Example 3: Multiple recipients

The syntax for multiple recipients is a little quirky. Here is an example with two recipients:

The property `toRecipients` is an array that contains two hashtables (one per recipient), each of which contains a hashtable. Nice 😐

```powershell
$params = @{
	message = @{
		subject = "Test email to multiple people"
		body = @{
			contentType = "html"
			content = @"
				<h1>Greetings from PowerShell (via Graph)</h1>
				Now to multiple recipients :)
			"@
		}
		toRecipients = @(
			@{
				emailAddress = @{
					address = "hans.maulwurf@demotenant.de"
				}
			},
			@{
				emailAddress = @{
					address = "alexw@demotenant.de"
				}
			}
		)
	}
}
Send-MgUserMail -UserId "departmentmailbox@demotenant.de" -BodyParameter $params
```

## Alternatives

Since dealing with hashtables is a bit cumbersome, there are some alternative modules from the community.

For example, [Mailozaurr by Microsoft MVP Przemysław Kłys](https://github.com/EvotecIT/Mailozaurr) is quite cool. The module provides the new cmdlet `Send-EmailMessage` (instead of the standard `Send-MailMessage`). It also supports other protocols and authentication methods (not just MS Graph). Unfortunately, Managed Identities are not currently supported, so I only used it briefly for testing purposes.
