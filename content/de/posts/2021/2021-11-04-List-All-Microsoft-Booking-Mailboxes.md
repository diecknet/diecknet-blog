---
comments: true
aliases:
    - list-all-microsoft-booking-mailboxes
slug: List-All-Microsoft-Booking-Mailboxes
title: "Alle Microsoft-Booking-Kalender auflisten"
date: 2021-11-12
tags:
    [exchange, exchange online, powershell, microsoft booking, booking calendar]
cover:
    image: /images/2021/2021-11-12_bookings-permissions.csv.png
---

Wenn ihr Microsoft Booking in eurem Microsoft-365-Tenant genutzt habt, wollt ihr vielleicht alle Booking-Kalender auflisten. Booking nutzt im Hintergrund Exchange-Online-Postfächer. Jeder Booking-Kalender hat ein entsprechendes Postfach vom Typ "SchedulingMailbox". Wenn einem Benutzer die Rolle "Administrator" für einen Booking-Kalender zugewiesen wurde, hat er "FullAccess"-Berechtigungen für das Scheduling-Postfach bekommen.

## Alle Booking-Kalender mit Berechtigungen auflisten

Ich habe ein PowerShell-Skript geschrieben, um alle Booking-Postfächer mit den Benutzern aufzulisten, die Zugriff haben.

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

Beispielergebnis:

In diesem Fall gab es zwei Booking-Postfächer im Tenant. Eines der Postfächer hatte zwei "Administrators" zugewiesen.

```csv
"Bookings Mailbox DisplayName";"Bookings Mailbox E-Mail-Address";"User";"AccessRights"
"Our Calendar";"OurCalendar@example.com";"max.mustermann@example.com";"Administrator"
"Our Calendar";"Feedbackgesprche@example.com";"andreas.testmann@example.com";"Administrator"
"Test";"test@example.com";"testuser@example.com";"Administrator"
```

## Alle Booking-Kalender auflisten

Wenn ihr nur die Kalender auflisten wollt, ersetzt die letzte Zeile des Skripts durch Folgendes:

```powershell
$BookingsMailboxesWithPermissions | Sort-Object -Property "Bookings Mailbox E-Mail-Address" -Unique | Export-Csv C:\temp\bookings-permissions.csv -Encoding utf8 -Delimiter ";" -NoTypeInformation
```
