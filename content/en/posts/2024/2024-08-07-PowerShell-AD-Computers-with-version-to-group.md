---
slug: "powershell-active-directory-computers-filtering"
title: "PowerShell: Filter Active Directory Computers"
date: 2024-08-07
comments: true
tags: [powershell, active directory]
---
I recently worked on a client project, where I had to do some work around Active Directory Computers. I used PowerShell and some light filtering and processing. And now I share those examples, and hopefully someone finds them interesting or helpful. Maybe it will be me, who finds it interesting in the future. In that case: Moin Andi! 👋

## Example 1: Filter Computer by Operating System Version

The AD attribute `OperatingSystemVersion` holds the OS version with the build number in a format like this: `10.0 (19041)`

I needed to find some older devices, but it's not possible to compare with a "less than" operator against the attribute value. So I only extracted the actual build number in the parenthesis using the `-match` operator and a Regular Expression. If the RegEx matches, the extracted result is extracted into the automatic variable `$Matches`.

Then I could eventually compare the build number using the "less than" (`-lt`) operator. If the device was using a older build version than `19042`, I added the computer to a specific security group.

```powershell
$ADComputers = Get-ADComputer -Filter * -Properties OperatingSystemVersion

foreach($ADComputer in $ADComputers) {
    if($ADComputer.OperatingSystemVersion -match "\d+\.\d? \((\d+)\)") {
        if($Matches[1] -lt 19042) {
            Add-ADGroupMember -Identity "My-Group-with-old-devices" -Members $ADComputer.DistinguishedName
            $ADComputer.Name # just outputting this, so I know where I'm currently at
        }
    }
}
```

## Example 2: Retrieve only Windows Client Computers

Since the client also had Windows Servers and other non-Windows devices joined to AD, I used the following code to retrieve only Windows **Clients**:

```powershell
$ADComputers = Get-ADComputer -Filter "OperatingSystem -notlike '*Server*' -and OperatingSystem -like '*Windows*'" -Properties OperatingSystemVersion,OperatingSystem
```

## Example 3: List all Computers which are not managed by Intune

I also wanted to compare which devices from AD are not managed via Microsoft Intune. I exported a list of Windows devices from Intune, using the Intune Admin Center. 

[![Export Windows Devices list via Intune in CSV format](/images/2024/2024-08-07-Intune-Export-Devices.jpg "Export Windows Devices list via Intune in CSV format")](/images/2024/2024-08-07-Intune-Export-Devices.jpg)

Then I imported that list (CSV format) into PowerShell and compared it against a list of AD computers using the `-notin` operator. All devices that are returned then, are **not** in Intune, but only in Active Directory.

```powershell
$IntuneDevices = Import-Csv IntuneExportDownloadedFromThePortal.csv
$NonIntuneDevices = foreach($ADComputer in $ADComputers) {
    if($ADComputer.Name -notin $IntuneDevices."Device name") {
        $ADComputer | Select-Object -Property Name,Enabled,OperatingSystem,OperatingSystemVersion
    }
}
$NonIntuneDevices | Export-Csv -Path .\NonIntuneDevices.csv -NoTypeInformation -Encoding utf8
```
