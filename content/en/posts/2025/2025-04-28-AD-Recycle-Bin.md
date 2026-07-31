---
slug: "active-directory-recycle-bin"
title: "Enable, configure, and restore objects from the Active Directory Recycle Bin"
date: 2025-04-28
tags: [powershell, active directory]
---

If you use Active Directory Domain Services, you should definitely check whether the AD Recycle Bin is enabled in your environment.

## What is the AD Recycle Bin?

The AD Recycle Bin works similarly to the Recycle Bin in the file system:
**Deleted objects** (users, groups, and so on) are first moved to the Recycle Bin and can be restored easily.

This is especially useful for:

- accidental deletions
- intentional deletions that need to be undone
- missing AD backups (which do not replace a backup)

The AD Recycle Bin was introduced with **Windows Server 2008 R2**.
Requirement: your AD forest must have at least the **Windows Server 2008 R2 functional level**.

Without an enabled AD Recycle Bin, restoring deleted objects is much more difficult (see the section [Restoring without the AD Recycle Bin](#restoring-without-the-ad-recycle-bin)).

### Important notes

In general, enabling the AD Recycle Bin is recommended. However:

- **Important:** Enabling it **cannot be undone**.
- Objects that were already deleted are **not** made more recoverable afterward.
  - On the contrary, there is also a rudimentary recovery option without the AD Recycle Bin (see section [Restoring without the AD Recycle Bin](#restoring-without-the-ad-recycle-bin)). If you simply enable the AD Recycle Bin now, objects that were deleted earlier will be lost permanently.

### Restoring without the AD Recycle Bin

Even without the AD Recycle Bin, deleted objects can be restored in a rudimentary way, but:

- Most properties are **lost** (they were discarded at the moment the object was deleted)
- Only the ObjectSID, ObjectGUID, and DistinguishedName are preserved (useful if the deleted object appears in permissions ACLs)

Example: restoration with PowerShell:

```powershell
Get-ADObject -Filter 'isDeleted -eq $true' -IncludeDeletedObjects

<# Example output:
[...]
ObjectGUID: 4ed8fada-a248-49fc-bca9-5b920231bd5b
#>

# Then provide the ObjectGUID to Restore-ADObject:
Restore-ADObject -Identity 4ed8fada-a248-49fc-bca9-5b920231bd5b
```

## Enable the AD Recycle Bin

You can enable the Active Directory Recycle Bin either through the GUI (Active Directory Administrative Center) or with PowerShell.

### Through the Active Directory Administrative Center

1. Open the **Active Directory Administrative Center**.
2. Click your **domain**.
3. The option **Enable Recycle Bin** appears on the right. Click it and confirm.

If the option is grayed out, the AD Recycle Bin is probably already enabled. If you are not sure, check whether the container "Deleted Objects" exists in AD. It should only exist if the AD Recycle Bin is enabled.

[![Active Directory Admin Center: Check whether the AD Recycle Bin is enabled](/images/2025/2025-04-28_AD-Papierkorb.jpg "Active Directory Admin Center: Check whether the AD Recycle Bin is enabled")](/images/2025/2025-04-28_AD-Papierkorb.jpg)

### With PowerShell

You can also enable the Recycle Bin with PowerShell. For my domain "lan.demotenant.de", I used the following command. For the `-Identity` and `-Target` parameters, you need to enter values that match your environment:

```powershell
Enable-ADOptionalFeature -Identity 'CN=Recycle Bin Feature,CN=Optional Features,CN=Directory Service,CN=Windows NT,CN=Services,CN=Configuration,DC=lan,DC=demotenant,DC=de' -Scope ForestOrConfigurationSet -Target 'lan.demotenant.de'
```

You will receive a warning that the change cannot be undone. You should confirm it.

## Restore objects from the AD Recycle Bin

In addition to the object properties that are now preserved, restoring from the AD Recycle Bin has another advantage:
The objects can also be restored through the GUI (via the Active Directory Administrative Center).

### Restore via the Active Directory Administrative Center

- Click the **Deleted Objects** container.
- Select the object and click **Restore** to restore it to its original organizational unit, or **Restore to...** to restore it to another container.

[![Active Directory Admin Center: Restore a deleted object](/images/2025/2025-04-28_AD-Papierkorb-Restore.jpg "Active Directory Admin Center: Restore a deleted object")](/images/2025/2025-04-28_AD-Papierkorb-Restore.jpg)

### Restore via PowerShell

```powershell
# First search for the deleted object, for example here for *test*
Get-ADObject -Filter 'isDeleted -eq $true -and Name -like "*Test*"' -IncludeDeletedObjects

# If this matches and only one object is returned,
# we can pipe the result to Restore-ADObject:
Get-ADObject -Filter 'isDeleted -eq $true -and Name -like "*Test*"' -IncludeDeletedObjects | Restore-ADObject
```

Optional: restore to a different OU or container:

```powershell
Restore-ADObject -Identity <ObjectGUID> -TargetPath "OU=Example,DC=lan,DC=demotenant,DC=de"
```

## Retention period for deleted objects

By default, deleted objects remain in AD for **180 days**.
This value is controlled by the **Tombstone Lifetime** attribute. In older domains, however, you may still have a lower default value.

You can check this with ADSI Edit:

1. Open ADSI Editor.
2. Connect to **Configuration**.
3. Path: `CN=Configuration [...] -> CN=Services [...] -> CN=Windows NT [...] -> CN=Directory Services [...]`. Right-click `CN=Directory Services [...]` and open **Properties** from the context menu.
4. In the Attribute Editor, check the **tombstoneLifetime** attribute. This is the retention time in days.

If `msDS-DeletedObjectLifetime` is explicitly set, that value is used instead. By default, the value is empty.
If it is not set, the value from `tombstoneLifetime` is used.

## Further reading

- Video about this on my YouTube channel: <https://youtu.be/3f5Nozh9ny4>
- Microsoft documentation - Enable and use Active Directory Recycle Bin: <https://learn.microsoft.com/en-us/windows-server/identity/ad-ds/get-started/adac/active-directory-recycle-bin?tabs=powershell>
