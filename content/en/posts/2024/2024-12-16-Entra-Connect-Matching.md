---
slug: "entra-connect-soft-and-hard-match"
title: "Entra Connect: Soft Match and Hard Match"
date: 2024-12-16
comments: true
tags: [microsoft entra, active directory, entra connect]
---

In this post, I will explain how Entra Connect merges identities and then continues to track them in operation. Some points could be explored in more depth, but these are the most important fundamentals in my opinion.

Everything I describe here is usually relevant for both classic Entra Connect Sync and the newer Entra Cloud Sync. If something only applies to one of the two sync tools, I will point that out explicitly. Otherwise, for simplicity, I will just write Entra Connect below when I mean both.

This post is mainly intended as a companion to the [video on my YouTube channel](https://youtu.be/yxIHnydUytE) to share code examples, but it can also be read on its own 😉.

## Overview of how it works

When Entra Connect processes a user object from on-premises Active Directory, it first checks whether a hard match is possible. We will get to the exact behavior of the hard match later. For now, the important part is: Entra Connect can store information that an Entra object belongs to a specific object in the on-premises AD. If this information is found and the two objects match, we have a hard match.

If no hard match is possible, Entra Connect tries to perform a soft match. I will explain the behavior of the soft match in more detail later as well.

Regardless of how the match was performed, the previous cloud object is now marked as "synchronized" and receives the properties from the on-premises AD object. The object ID of the cloud user, user data such as mailboxes, OneDrive, Teams messages, and any existing permissions and cloud group memberships remain intact.

If neither a hard match nor a soft match is possible, the object is created anew in Entra. It is also stored that the new Entra object and the on-premises AD object belong together so that a hard match can be possible in the future.

## Soft Match

When Entra Connect detects a new on-premises Active Directory object, it checks whether there is a matching object in Entra that has the same **email address** or the same **UserPrincipalName**. In the documentation, the AD user property **ProxyAddresses** is usually mentioned for email addresses. By the way, only the primary email address is evaluated from the ProxyAddresses, specifically the entry with the prefix `SMTP:` written in uppercase.

[![Active Directory ProxyAddresses of a user](/images/2024/2024-12-16_AD-User-ProxyAddresses.jpg "Active Directory ProxyAddresses of a user")](/images/2024/2024-12-16_AD-User-ProxyAddresses.jpg)

Editing the ProxyAddresses attribute is officially supported only when done through the Exchange Management Tools, meaning the Exchange Management Shell or the Exchange Admin Center. However, matching also works via the field with the attribute name **mail**, which you can find in the Active Directory Users and Computers console on the "General" page in the user properties. This property can simply be changed here in the console.

[![Active Directory mail attribute of a user](/images/2024/2024-12-16_AD-User-Mail-Attribute.jpg "Active Directory mail attribute of a user")](/images/2024/2024-12-16_AD-User-Mail-Attribute.jpg)

⚠️ **Admin matching special case:** If a user has an admin role in Entra or Microsoft 365, soft matching does not work for security reasons.

And if a soft match has occurred, information is automatically stored so that a hard match can be possible in the future.

### 🎬 Soft Match examples

Here are 3 examples of soft matches:

#### UserPrincipalName

1. Initial state: A cloud-only user exists with the UserPrincipalName `SoftMatch1@demotenant.de`.
2. Entra Connect encounters a new Active Directory user with the same UPN `SoftMatch1@demotenant.de`.
3. The cloud user is converted into a synchronized user and receives the attributes from the AD user.

#### ProxyAddresses / PrimarySmtpAddress

1. Initial state: A cloud-only user exists with the UserPrincipalName `SoftMatch2@demotenant.de` and the PrimarySmtpAddress `hallo@demotenant.de`.
2. Entra Connect encounters a new Active Directory user with the UPN `beispiel@demotenant.de` and the PrimarySmtpAddress `hallo@demotenant.de` (the ProxyAddress attribute contains the entry `SMTP:hallo@demotenant.de`).
3. The cloud user is converted into a synchronized user and receives the attributes from the AD user, including the new UPN.

#### Mail attribute

1. Initial state: A cloud-only user exists with the UserPrincipalName `SoftMatch3@demotenant.de` and the PrimarySmtpAddress `ZZZ@demotenant.de`.
2. Entra Connect encounters a new Active Directory user with the UPN `AAA@demotenant.de` and the email address `ZZZ@demotenant.de` (the mail attribute contains the value `SMTP:ZZZ@demotenant.de`).
3. The cloud user is converted into a synchronized user and receives the attributes from the AD user, including the new UPN.

## Hard Match

To store the hard match information on the Entra object, a so-called "Immutable ID" is used. The attribute is also called the SourceAnchor.
If you use classic Entra Connect Sync, you can theoretically set which on-premises Active Directory attribute should be used as the Source Anchor during the initial configuration. The default value today is the attribute "ms-ds-ConsistencyGuid", and deviations are usually not recommended.

[![Configuration of the Source Anchor in Entra Connect Sync](/images/2024/2024-12-16-Entra-Connect-Source-Anchor.jpg "Configuration of the Source Anchor in Entra Connect Sync")](/images/2024/2024-12-16-Entra-Connect-Source-Anchor.jpg)

Now it gets a bit complicated: The actual value is based on the object GUID of the on-premises AD object. But it is not simply the GUID. The GUID is taken as a byte array and then base64 encoded.
If you use classic Entra Connect Sync and it is a user object, the property "ms-ds-ConsistencyGuid" is actually set by the sync process (usually after 2 sync cycles) and stored as a byte array. If you want to view the property, the Active Directory Users and Computers console is not very helpful. You can only see that the attribute has a value, but the actual value is not readable. However, the value can be read and converted with PowerShell.

```powershell
$User = Get-ADUser alexw -Properties mS-DS-ConsistencyGuid
[System.Convert]::ToBase64String($User.'mS-DS-ConsistencyGuid')
```

We can then compare this value with the one we see in Entra.

[![Immutable ID of a user in Entra and in Active Directory](/images/2024/2024-12-16_ImmutableID.jpg "Immutable ID of a user in Entra and in Active Directory")](/images/2024/2024-12-16_ImmutableID.jpg)

By the way, with the newer Entra Cloud Sync, you cannot select the Source Anchor. It always uses "ms-ds-ConsistencyGuid". However, the value is only calculated and the Immutable ID is stored in Entra accordingly. The value is not written back to the actual AD property "ms-ds-consistencyguid".
And if you synchronize other object types such as groups, "ms-ds-consistencyguid" is also not written back to the respective AD object. In all of these cases where the property is not written by Entra Connect, it is still evaluated. Only if it is empty is the GUID used as a byte array instead, meaning the value is calculated on the fly.

### Adjust the Source Anchor in AD

In the end, we can merge any objects if we edit the properties of the AD or Entra objects correctly. There are a few pitfalls, though:
If an object in Entra already has an Immutable ID and it is synchronized, we cannot simply adjust the Immutable ID in Entra. My recommendation is therefore: if possible, the Source Anchor should be adjusted in the on-premises AD.

Let us take my already synchronized test user named Hard Match #1 as an example.

[![Example user Hard Match 1](/images/2024/2024-12-16-Hard-Match-User-1a.jpg "Example user Hard Match 1")](/images/2024/2024-12-16-Hard-Match-User-1a.jpg)

If I want a different or new on-premises AD user named "Hard Match #1 NEW" to be used as the source instead, I could proceed as follows:

**Step 1:** First, I create my new on-premises AD user if it does not already exist. It would be best to create the user in an organizational unit that is not synchronized by Entra Connect. That way, we can prevent the user from already being created in M365.

⚠️ **If the new user "Hard Match #1 NEW" is already synchronized, that would not be a catastrophe, but then we would have to clean it up first: remove the user from the sync scope in on-premises AD, wait for the next synchronization cycle, and after the user has been automatically deleted in Entra, we would then need to remove it from "Deleted users" as well.**

**Step 2:** We need to find the Immutable ID of the cloud object. I simply copied it from the Entra portal from the properties of the user. The property name is "On-premises immutable ID".

**Step 3:** We need to add the Immutable ID to the on-premises object, meaning in my case the user "Hard Match #1 NEW". The only sensible way is via PowerShell with the Active Directory module. The Immutable ID from Entra is still base64 encoded, so we need to transform it back into a byte array.

```powershell
$ImmutableID = [System.Convert]::FromBase64String("6Ao63cWrYUewgqCMI5Fodw==")
Set-ADUser hardmatch1neu -Replace @{"mS-DS-ConsistencyGuid" = $ImmutableID}
```

**Step 4:** Now we can include the new object in the Entra sync scope, usually by moving it to the appropriate organizational unit. If there should be another original object that has the same Immutable ID, that other object should be deleted.

This approach should also work if you use a different on-premises Active Directory domain as the source and have completely new user objects there as well. Even if they have the same names, they will have new object GUIDs. To merge them sensibly, you take the Immutable IDs from the cloud objects and write them into the new on-premises AD objects.

It would also be possible to copy the "MS-DS-ConsistencyGUID" from one Active Directory object to another, whether from the same AD or from a different one. However, you must be careful that two objects are not simultaneously being synchronized with the same source anchor.

### Change the Immutable ID in Entra

If you have cloud users that already have an Immutable ID and you want to change or empty it, you will most likely run into an error. The trick is to delete the user and then restore it. And even that method only works for users, not for other object types such as groups, because they do not have an Immutable ID property in Entra that we can manipulate.

As an example, I have the already synchronized user "hardmatch2", but I want to use a different user named "Hard Match 2 NEW" as the source object instead. Unfortunately, that other user is also already synchronized.

[![Example user Hard Match 2](/images/2024/2024-12-16-Hard-Match-User-2.jpg "Example user Hard Match 2")](/images/2024/2024-12-16-Hard-Match-User-2.jpg)

The actual change to the Immutable ID must be made via the Graph API; there is no option for it in the Entra portal.
I use the Microsoft Graph PowerShell module for that, which you can install with `Install-Module Microsoft.Graph` (Windows PowerShell) or `Install-PSResource Microsoft.Graph` (PowerShell 7) if you do not already have it. By the way, you can do this on any system, not necessarily a domain controller or the Entra Connect server.

```powershell
# Once the installation is complete, you can connect with:
Connect-MgGraph -Scopes User.ReadWrite.All

# Then we can retrieve the user for testing:
Get-MgUser -UserId hardmatch2@demotenant.de

# We store the user information in a variable so we can access it easily:
$User = Get-MgUser -UserId hardmatch2@demotenant.de

# The actual reset of the Immutable ID:
Update-MgUser -UserId $User.Id -OnPremisesImmutableId $null
# => this will probably fail
```

To still be able to change the Immutable ID, we must temporarily delete the user. Do not worry, it will first land in a kind of recycle bin called "Deleted users".
Since the user is still being synchronized, we have to delete it at the source, meaning in on-premises AD. Then we need to wait for the next synchronization, until the user is automatically deleted in Entra.
After that, we can restore the user, for example via the Entra portal or also with MS Graph PowerShell:

```powershell
Restore-MgDirectoryDeletedItem -DirectoryObjectId $User.Id
# The previous Update-MgUser command should now work successfully
Update-MgUser -UserId $User.Id -OnPremisesImmutableId $null
# If that still does not work, try sending the request manually with "Invoke-GraphRequest":
Invoke-MgGraphRequest -Method PATCH -Uri "https://graph.microsoft.com/v1.0/users/$($User.Id)" -Body @{OnPremisesImmutableId = $null}
```

You could also enter a different Immutable ID here, depending on what you want to achieve. If you remove the Immutable ID completely, you could potentially perform a soft match again.
However, I wanted to adjust my hard match so that the user "Hard Match 2 NEW" would be used as the source in the future.
In that case, I do not need the previous "Hard Match 2 NEW" user in the cloud at all. The only thing I am interested in is its Immutable ID. I retrieve it once:

```powershell
$UserNEU = Get-MgUser -UserId hardmatch2NEU@demotenant.de -Property Id,OnPremisesImmutableID
$UserNEU | Select-Object OnPremisesImmutableId
```

And then I temporarily move the source object in on-premises AD into an organizational unit that is not synchronized with Entra. After the next synchronization, the object should be deleted in Entra. However, it will still be found in Deleted users, and as long as it is there I cannot reuse the Immutable ID. That will throw an error.

```powershell
# This will still throw an error:
Update-MgUser -UserId $User.Id -OnPremisesImmutableId $UserNEU.OnPremisesImmutableId

# Delete the user from "Deleted users":
Remove-MgDirectoryDeletedItem -DirectoryObjectId $UserNEU.Id

# Now update the old user for real:
Update-MgUser -UserId $User.Id -OnPremisesImmutableId $UserNEU.OnPremisesImmutableId
```

After that is done, I can move the user "Hard Match 2 NEW" back into the sync scope in on-premises AD by moving the object back into one of my normal OUs.
Then I wait for the next synchronization and the old Entra object for the user "Hard Match 2" should then be connected to the on-premises AD object "Hard Match 2 NEW". For example, the name will be different. However, the existing permissions and group memberships in the cloud and the object ID will still correspond to the old "Hard Match 2".

[![Example user Hard Match 2 after merge](/images/2024/2024-12-16-Hard-Match-User-2b.jpg "Example user Hard Match 2 after merge")](/images/2024/2024-12-16-Hard-Match-User-2b.jpg)

### Calculate and assign the MS-DS-ConsistencyGUID manually

Manually calculating and assigning the "MS-DS-ConsistencyGUID" property can be used, for example, to take over an existing cloud object via hard match. This is particularly useful if the properties of the cloud object and the AD object differ so much that no soft match would be possible.

I have a user named "Manuel Guido", who is currently still in an organizational unit that is not synchronized with Entra. The MS-DS-ConsistencyGUID is calculated from the GUID of the AD object, as already mentioned. You can do it yourself with the following code:

```powershell
$User = Get-ADUser -Identity 'Manuel.Guido' -Properties ObjectGUID
$GuidBytes = $User.ObjectGUID.ToByteArray()
Set-ADUser -Identity $User.SamAccountName -Replace @{"mS-DS-ConsistencyGuid" = $GuidBytes}
```

If you want to add this calculated "MS-DS-ConsistencyGuid" to an Entra object before synchronization, you first need to base64 encode the byte array:
`$ImmutableID = [System.Convert]::ToBase64String($GuidBytes)`

And then you can set the value for an Entra user with the Microsoft Graph PowerShell module, as I showed in the [previous section](#change-the-immutable-id-in-entra).

**Tip:** Manually calculating the "MS-DS-ConsistencyGuid" also works for other object types, for example groups. There is no visible Immutable ID property on the group object in the cloud, but the sync still considers the "MS-DS-ConsistencyGUID" of the on-premises object if it exists. This can be particularly helpful during a domain migration. Then you can calculate the correct "MS-DS-ConsistencyGUID" based on the group GUIDs from one domain and assign it in the other domain. The rough calculation is essentially the same as for user objects, except that we use PowerShell cmdlets for AD groups instead of AD users.

```powershell
$Group = Get-ADGroup Lager -Properties ObjectGUID
$GuidBytes = $Group.ObjectGUID.ToByteArray()
Set-ADGroup -Identity $Group.SamAccountName -Replace @{"mS-DS-ConsistencyGuid" = $GuidBytes}
```

### Convert the Immutable ID to the AD GUID

If you have seen an Immutable ID in Entra and want to find out which is the correct source object in on-premises AD, you can reverse these calculations.

```powershell
$ImmutableID = "tmFOcfhU+U6EHLPbM/yKyA=="
Get-ADObject ([guid][system.convert]::FromBase64String($ImmutableID))
```

This only works correctly if this Immutable ID was set completely automatically in Entra. If something has already been changed in the assignments, then it would only provide the information for which original object this Immutable ID was generated. But it is also possible to search the AD directly for the value of the attribute "MS-DS-ConsistencyGUID". That again only works if the attribute "MS-DS-ConsistencyGUID" is set, which, in the default case, is only true for user objects and only with classic Microsoft Entra Connect Sync.

For searching in AD by Immutable ID, I built a small function, [available on GitHub](https://github.com/diecknet/diecknet-scripts/blob/main/Active%20Directory%20Domain%20Services/Get-ADObjectByImmutableID.ps1).

```powershell
Get-ADObjectByImmutableID -ImmutableId "tmFOcfhU+U6EHLPbM/yKyA=="
```

[![Example of Get-ADObjectByImmutableID](/images/2024/2024-12-16_Get-ADObjectByImmutableID.jpg "Example of Get-ADObjectByImmutableID")](/images/2024/2024-12-16_Get-ADObjectByImmutableID.jpg)

## Recommended sync options

By the way, Microsoft recommends changing two default options for Entra Connect if they are not needed.
Once the option "BlockCloudObjectTakeoverThroughHardMatchEnabled" should be changed. If enabled, it prevents objects from being taken over via hard match. Existing hard matches continue to work, but the takeover of additional objects through the sync process is prevented.
And the option "BlockSoftMatchEnabled", which would prevent cloud-only objects from being taken over through soft match.
That can slightly increase security and of course also prevent cloud objects from being taken over accidentally if a matching object is created in on-premises AD.

You can also adjust the options with the Microsoft Graph PowerShell module:

```powershell
Connect-MgGraph -Scopes "OnPremDirectorySynchronization.ReadWrite.All"

$OnPremSync = Get-MgDirectoryOnPremiseSynchronization
$OnPremSync.Features # first check how it is configured now
$OnPremSync.Features.BlockCloudObjectTakeoverThroughHardMatchEnabled = $true
$OnPremSync.Features.BlockSoftMatchEnabled = $true
Update-MgDirectoryOnPremiseSynchronization -OnPremisesDirectorySynchronizationId $OnPremSync.Id -Features $OnPremSync.Features
```

So if you try the various points about soft match and hard match in this post and they do not work, check whether the block option may be enabled. If so, you will need to disable the relevant option at least temporarily so that soft match or the takeover of objects via hard match can work.

## Further reading

- My YouTube video on the topic: <https://youtu.be/yxIHnydUytE>
- Microsoft Entra Connect: When you have an existing tenant: <https://learn.microsoft.com/en-us/entra/identity/hybrid/connect/how-to-connect-install-existing-tenant>
- Sander Berkouwer: Explained: User Hard Matching and Soft Matching in Azure AD Connect: <https://dirteam.com/sander/2020/03/27/explained-user-hard-matching-and-soft-matching-in-azure-ad-connect/>
- MSXFAQ / Frank Carius: ADSync User Matching: <https://www.msxfaq.de/cloud/identity/adsync_matching.htm>
- Understanding errors during Microsoft Entra synchronization: <https://learn.microsoft.com/en-us/entra/identity/hybrid/connect/tshoot-connect-sync-errors>
- MSXFAQ / Frank Carius: Source Anchor: <https://www.msxfaq.de/cloud/identity/sourceanchor.htm>
- MSXFAQ / Frank Carius: Source Anchor User: <https://www.msxfaq.de/cloud/identity/sourceanchor_user.htm>
- MSXFAQ / Frank Carius: Source Anchor Groups: <https://www.msxfaq.de/cloud/identity/sourceanchor_gruppen.htm>
