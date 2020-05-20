---
layout: post
title: "Check NTFS Permissions using Powershell"
lang: en
tags: [powershell, accessrights, acl, ntfs, windowsvirtualdesktop]
---
So I needed a quick way to check a few folders for correct permissions. We had Windows Virtual Desktop/FSLogix user profile containers in an Azure Files share. Some of these profile folders had wrong permissions.

The correct storage permissions are:

| User Account             | Folder                             | Permissions  |
|--------------------------|------------------------------------|--------------|
| Users                    | This Folder Only                   | Modify       |
| Creator / Owner          | Subfolders and Files Only          | Modify       |
| Administrator (optional) | This Folder, Subfolders, and Files | Full Control |

Official FSLogix documentation: [Configure storage permissions for use with Profile Containers and Office Containers](https://docs.microsoft.com/en-us/fslogix/fslogix-storage-config-ht){:target="_blank" rel="noopener noreferrer"}

## The environment

In this environment every user has their own subfolder in the share. The user created the subfolder (at their first logon to Windows Virtual Desktop), so they're the owner. Since they're owner, they have "Modify" rights to (sub-)subfolders and files in their subfolder. FSLogix creates a profile container vhd(x)-file in the user's folder.

## Check Permissions with PowerShell

You can check Permissions using PowerShell with {% ihighlight powershell %}Get-Acl{% endihighlight %}.

I created a quick-and-dirty PowerShell script to check the permissions. It's not attempting any automatic fixes. It just lists the folders with faulty permissions. You could either manually fix the permissions using the GUI, or take the ACL-Object of the subfolder and apply it to the files using {% ihighlight powershell %}Set-Acl{% endihighlight %}.

## Download Script
[CheckProfileStoragePermissions.ps1 (Github)](https://gist.github.com/diecknet/8a36e9551cf5a08c03779e9f7d13d05e){:target="_blank" rel="noopener noreferrer"}