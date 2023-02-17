---
title: "Automate Exchange Online with Azure Automation in 2023"
date: 2023-01-09
contenttags: [microsoft365, office365, exchangeonline, powershell, exo, azure, azureautomation]
image: /images/2023/2023-AA-EXO.jpg
---

I'll try to keep it short:
If you want to manage Exchange Online via Azure Automation, **Managed Identities** is what you should use (as of early 2023).

## Legacy approach

In the past, RunAs Accounts or Plaintext Credentials (🤢) were also commonly used for this purpose, but this is now considered deprecated. RunAs accounts will be  discontinued by fall 2023. And I don't have to say anything about plaintext passwords, do I?
You could still use App Registrations in Azure AD, but if you really just want to automate some Exchange settings via Azure Automation, it's not really necessary.

## TL;DR Managed Identities + Exchange Online PowerShell

A **System Assigned Managed Identity** assigns an *identity* to an Azure Resource. This identity can be assigned rights, e.g. for the administration of Exchange Online or specific Azure Resources. The management of the identity is done automatically, so there is no need to change a password regularly or anything like that. And if the associated resource (in this case the Azure Automation account) is deleted, the System Assigned Managed Identity is automatically deleted as well.
The Exchange Online PowerShell module supports Managed Identities for authentication starting with version 3.

## Howto Video (German)

I created a [German Video](https://www.youtube.com/watch?v=unXf7ma1NR4) showing how Exchange Online can be controlled via Azure Automation. This involves using a System Assigned Managed Identity for the Azure Automation account and assigning Exchange management rights to this identity. You can probably use the automatic translated Subtitles on YouTube, if you don't speak German.

[![German Video: Manage Exchange Online via Azure Automation (YouTube)](/images/2023/2023-01-09_Azure_Automation_Exchange_online_thumbnail.png "German Video: Manage Exchange Online via Azure Automation (YouTube)")](https://www.youtube.com/watch?v=unXf7ma1NR4)

## Further links

The official Microsoft documentation for this can be found here: [https://learn.microsoft.com/en-us/powershell/exchange/connect-exo-powershell-managed-identity?view=exchange-ps](https://learn.microsoft.com/en-us/powershell/exchange/connect-exo-powershell-managed-identity?view=exchange-ps)
