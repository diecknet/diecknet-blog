---
title: "List all Microsoft Booking Calendars"
date: 2021-11-12
contenttags:
    [exchange, exchange online, powershell, microsoft booking, booking calendar]
image: /images/2021/2021-11-12_bookings-permissions.csv.png
---

If you're using Microsoft Booking in your Microsoft 365 Tenant, you might want to list all of the Booking calendars. Booking uses Exchange Online Mailboxes in the background. Every Booking Calendar has a corresponding Mailbox of the type "SchedulingMailbox". If an user gets assigned "Administrator" for a Booking Calendar, they get "FullAccess" permissions for the Scheduling Mailbox.

## List all Booking Calendars with permission

I wrote a PowerShell script to list all the Booking Mailboxes with the users that have access.

```powershell
# prerequisite: Exchange Online v2 PowerShell module, must be connected to the service

$BookingsMailboxesWithPermissions = New-Object 'System.Collections.Generic.List[System.Object]'
# Get all Booking Mailboxes
$allBookingsMailboxes = Get-ExoMailbox -RecipientTypeDetails SchedulingMailbox -ResultSize:Unlimited

# Loop through the list of Mailboxes
$BookingsMailboxesWithPermissions = foreach($bookingsMailbox in $allBookingsMailboxes) {
    # Get Permissions for this Mailbox
    $allPermissionsForThisMailbox = Get-ExoMailboxPermission -UserPrincipalName $bookingsMailbox.UserPrincipalName -ResultSize:Unlimited | Where-Object {($_.User -like '*@*') -and ($_.AccessRights -eq "FullAccess")}
    foreach($permission in $allPermissionsForThisMailbox) {
        # Output PSCustomObject with infos to the foreach loop, so it gets saved into $BookingsMailboxesWithPermissions
        [PSCustomObject]@{
            'Bookings Mailbox DisplayName' = $bookingsMailbox.DisplayName
            'Bookings Mailbox E-Mail-Address' = $bookingsMailbox.PrimarySmtpAddress
            'User' = $permission.User
            'AccessRights' = "Administrator"
            }
    }
}
$BookingsMailboxesWithPermissions | Export-Csv C:\temp\bookings-permissions.csv -Encoding utf8 -Delimiter ";" -NoTypeInformation
```

Example of result:

In this case, there are two Booking Mailboxes in the tenant. One of the Mailboxes has two "Administrators" assigned.

```csv
"Bookings Mailbox DisplayName";"Bookings Mailbox E-Mail-Address";"User";"AccessRights"
"Our Calendar";"OurCalendar@example.com";"max.mustermann@example.com";"Administrator"
"Our Calendar";"Feedbackgesprche@example.com";"andreas.testmann@example.com";"Administrator"
"Test";"test@example.com";"testuser@example.com";"Administrator"
```

## List all Booking Calendars

If you only want to list the calendars, replace the last line of the script with the following:

```powershell
$BookingsMailboxesWithPermissions | Sort-Object -Property "Bookings Mailbox E-Mail-Address" -Unique | Export-Csv C:\temp\bookings-permissions.csv -Encoding utf8 -Delimiter ";" -NoTypeInformation
```
