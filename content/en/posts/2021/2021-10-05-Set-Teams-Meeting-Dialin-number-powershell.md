---
aliases:
    - set-teams-meeting-dialin-number-powershell
slug: Set-Teams-Meeting-Dialin-number-powershell
title: Set Teams Meeting Dial-in number using PowerShell
contenttags:
    [teams, microsoft teams, teams dial in number, teams audio conferencing]
image: /images/2021/2021-10-05_TeamsMeeting-DialIn-Number_thumbnail.png
imageAlt: A screenshot showing a Microsoft Teams Meeting invite with a dial-in phone number.
date: 2021-10-05
---

You can using Microsoft Teams Audio Conferencing licenses to get Dial-In phone numbers for your meetings. The license is needed per user that creates the meeting invites.

The phone number in the meeting invite is based on the UsageLocation attribute of the user - **once when the user gets enabled for Audio Conferencing**. So even if you fix a wrong UsageLocation, the user will still have the old dial-in number assigned.

## Use Teams Admin Center to change Dial-In Number for a single user

Users ➔ Manage Users ➔ Click on any user ➔ Click on "Edit" next to "Audio Conferencing" ➔ Select "Toll number" according to User Location.

[![Microsoft Teams Admin Center with options to change the dialin number for a user.](/images/2021/2021-10-05_TeamsMeeting-DialIn-Number.png "Microsoft Teams Admin Center with options to change the dialin number for a user.")](/images/2021/2021-10-05_TeamsMeeting-DialIn-Number.png)

## Use PowerShell to change Dial-In Number for multiple users

**Note:** You need to have the [Microsoft Teams PowerShell module](https://docs.microsoft.com/en-us/microsoftteams/teams-powershell-install) installed.

I call these numbers "Dial-In numbers", but the internal name is "ServiceNumber". You can get a list of all available numbers using `Get-CsOnlineDialInConferencingServiceNumber`.

```powershell
# Connect to MS Teams
Connect-MicrosoftTeams

# List all available dial-in numbers
Get-CsOnlineDialInConferencingServiceNumber

# Set Dial-in number. This is an example value. Yes, we omit the leading +plus symbol.
$dialInNumber = 1234567890

# Get all users that you want to change. This is an example that gets all users with UsageLocation "US" - change accordingly to your needs with other filters
$users = Get-CsOnlineUser -Filter 'UsageLocation -eq "US"' -ResultSize Unlimited

# Loop through the users
foreach($user in $users) {
 # Apply new dial-in number for meetings for each user
 Set-CsOnlineDialInConferencingUser -Identity $user.Identity -ServiceNumber $dialInNumber
}
```

## Source

[Initial assignment of phone numbers](https://docs.microsoft.com/en-us/microsoftteams/set-the-phone-numbers-included-on-invites-in-teams#initial-assignment-of-phone-numbers-that-are-included-in-the-meeting-invites-for-new-users)
