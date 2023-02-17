---
slug: Outlook-Certificate-Warning-after-Office-365-Migration
layout: post
title: Outlook Certificate Warning after Office 365 Migration
date: 2019-12-18
contenttags: [office365, exchange, exchangeonline, exchange2010]
image: /images/2019-12-18-Certificate-Warning-outlook.png
---

> Outlook Certificate Warning after Office 365 Migration  
> Security Alert: svr1.example.com  
> The security certificate has expired or is not valid yet

I recently received a request from a customer who still received certificate warnings (expired certificate) for the old Exchange Server after migrating to Office 365. Since I was not involved in the migration, I had to get an overview first:  
The On-Premise Exchange Server 2010 was still online - of course, otherwise a certificate warning would hardly have appeared. However, not all users received this message. This affected migrated users as well as users whose mailboxes were created directly in Office 365.

![Outlook Connection Status: Outlook is still using resources from the local exchange server svr1.example.com](/images/2019-12-18-Outlook-connection-status.png "Outlook Connection Status: Outlook is still using resources from the local exchange server svr1.example.com")  
For an affected user, we have retrieved the "Connection status" via CTRL+right-click on the Outlook icon in the tray in the menu. It quickly became apparent that the user was actually still accessing resources from the local On-Premise Exchange system: an IT employee created new resource mailboxes on the Exchange Server and granted users access.  
As a workaround, the server's certificate could be renewed. The actual solution, to migrate the resource mailbox to Office 365 as well, could not be implemented in a timely manner for organizational reasons.

