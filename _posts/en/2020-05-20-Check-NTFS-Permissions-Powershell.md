---
layout: post
title: "Check NTFS Permissions using Powershell"
lang: en
tags: [powershell, accessrights, acl, ntfs, windowsvirtualdesktop]
---
So I needed a quick way to check a few folders for correct permissions. We had Windows Virtual Desktop/FSLogix user profile containers in an Azure Files share. Some of these profile folders had wrong permissions.

The correct storage permissions are:

| test |   | 1 |    |   |
|------|---|---|----|---|
|      |   |   |    |   |
|      |   |   | 32 |   |
|      |   |   |    |   |

Official FSLogix documentation: [Configure storage permissions for use with Profile Containers and Office Containers](https://docs.microsoft.com/en-us/fslogix/fslogix-storage-config-ht){:target="_blank" rel="noopener noreferrer"}

I created a quick-and-dirty PowerShell script to check the permissions

You can find that setting for 3. in Azure AD under. 

## Link to the source code
[Documentation: Application management with Azure Active Directory (docs.microsoft.com)](https://docs.microsoft.com/en-us/azure/active-directory/manage-apps/what-is-application-management){:target="_blank" rel="noopener noreferrer"}

## y