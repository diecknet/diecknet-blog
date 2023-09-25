---
slug: "onedrive-for-business-auto-delegation-to-manager"
title: "OneDrive for Business - Delegation to Manager after employee leaves company"
date: 2023-09-25
comments: true
tags: [onedrive, onedrive for business, sharepoint online, my site]
---

Normally when a user leaves the Company their OneDrive for Business site gets automatically delegated to their manager. That means the manager gets SharePoint Site Collection admin rights to the OneDrive site of their subordinate. 

## Checking and Changing Access Delegation 

**⚠️ Access Delegation is enabled as default**. The setting can be found and changed here:

> 1. Go to **More features** in the new SharePoint admin center, and sign in with an account that has admin permissions for your organization.
> [...]
> 2. Under **User profiles**, select **Open**.
> 3. Under **My Site Settings**, select **Setup My Sites**.
> 4. Next to **My Site Cleanup**, make sure **Enable access delegation** is selected.

(Source: https://learn.microsoft.com/en-us/sharepoint/retention-and-deletion#configure-automatic-access-delegation)

In some companies this might not be desired, so you can change that option if you want to. To disable it, uncheck the box next to "Enable access delegation".

[![SharePoint Online - My Site settings - Cleanup](/images/2023/2023-09-25-MySiteSettings-Cleanup.jpg "SharePoint Online - My Site settings - Cleanup")](/images/2023/2023-09-25-MySiteSettings-Cleanup.jpg)

## How does it look?

When a user gets deleted and OneDrive access delegation is **enabled**, then the users' manager receives a mail. Atleast in my Test-Tenant the E-Mail lacks any professional design. It's just a wall of text:

[![Info E-Mail to a manager regarding OneDrive of a subordinate](/images/2023/2023-09-25_OneDrive-Delegation-Infomail1.jpg "Info E-Mail to a manager regarding OneDrive of a subordinate")](/images/2023/2023-09-25_OneDrive-Delegation-Infomail1.jpg)

> Adele Vance's account has been deleted from the Active Directory. Their OneDrive for Business will be preserved for 30 days. You're the temporary owner of all documents saved to their OneDrive for Business. If you would like to save content beyond the 30 day retention period, you can copy important documents to another location. You can also contact your administrator to reassign ownership to another OneDrive for Business owner. After 30 days, Adele Vance's OneDrive for Business will be permanently deleted. Go to Adele Vance's OneDrive for Business at https://diecknetdemotenant-my.sharepoint.com/personal/adelev_yr2z8_onmicrosoft_com/Documents/Forms/All.aspx

And then 7 days before the OneDrive gets deleted the manager receives a reminder:

[![Info E-Mail to a manager regarding expiring OneDrive of a subordinate](/images/2023/2023-09-25_OneDrive-Delegation-Infomail2.jpg "Info E-Mail to a manager regarding expiring OneDrive of a subordinate")](/images/2023/2023-09-25_OneDrive-Delegation-Infomail2.jpg)

> Adele Vance's OneDrive for Business is scheduled for permanent deletion in 7 days. You still have time to copy important documents to another location. After 7 days, Adele Vance's OneDrive for Business will be permanently deleted. Go to Adele Vance's OneDrive for Business at https://diecknetdemotenant-my.sharepoint.com/personal/adelev_yr2z8_onmicrosoft_com 

If they then open the link, they can access all data in the OneDrive site.

## Who changed the "Enable access delegation" setting?

If the setting in not in the state you expected, you might want to check the [Microsoft 365 Admin Audit Log](https://compliance.microsoft.com/auditlogsearch), if someone changed it in the past. Sadly the option is not available under "Activities - friendly names". You need to search by "Activities - operation names" for `AccessDelegationOnMySiteCleaneupEnabledSet`. 

|Activities - operation names|Option in the GUI|
|---|---|
|AccessDelegationOnMySiteCleaneupEnabledSet|Enable access delegation|
|SecondaryMySiteOwnerSet|Secondary Owner|

I put this here, because (once again) I didn't find proper Documentation from Microsoft regarding this topic.

[![Search the M365 Audit Log for SharePoint Online - My Site settings - Cleanup - Change events](/images/2023/2023-09-25-M365-audit-log-MySiteSettings-Cleanup.jpg "Search the M365 Audit Log for SharePoint Online - My Site settings - Cleanup - Change events")](/images/2023/2023-09-25-M365-audit-log-MySiteSettings-Cleanup.jpg)

## Reporting on delegated OneDrives

A client of mine stumbled about that setting and realized it was enabled, eventhough they have huge privacy concerns regarding it. It really depends on the company and their policies. They quickly changed the setting and asked me about a way to report which OneDrive sites are currently auto-delegated to a manager. And also to remove those delegations.

To gather the data I used PowerShell with the additional module `Microsoft.Online.SharePoint.PowerShell`. To compare it with the users in the tenant, I used the old `AzureAD` module. I also could've used the newer `Microsoft.Graph` module, but in this case it was easier to use the old stuff.

I had the "SharePoint Administrator" admin role in the tenant, but I couldn't read the permissions of the OneDrives sites with that. Apparently to even read the permissions of a SPO site, I had to add my admin account as a **Site Collection Admin** to every site. Kinda ironic that I had to do that, to find out about potential other admin assignments. I removed my permissions afterwards. So to collect all the data I used the following script.

```ps1
# Get-OneDriveOwner.ps1

# This script gathers info about additional (potentially unwanted) Site Collection Admin permissions for OneDrive for Business sites
# The script is not really polished, use on your own risk
Import-Module Microsoft.Online.SharePoint.PowerShell

# change the SPO tenant name accordingly. For example "demotenant"
$SPOTenantName = "<ENTER YOUR SHAREPOINT TENANT NAME HERE>"

# set this to your admin user. For example "admin@demotenant.de"
$SPOAdminUsername = "<ENTER YOUR SPO ADMIN UPN HERE>"

# output file path (CSV file)
$outputFile = "C:\temp\OneDriveAdditionalManagers-$($SPOTenantName)-$(Get-Date -Format "yyyy-MM-dd_HHmmss").csv"

# insert spo tenant name
Connect-SPOService -Url "https://$($SPOTenantName)-admin.sharepoint.com"

# List all OneDrive Sites
$AllOneDriveSites = Get-SPOSite -IncludePersonalSite $true -Limit all -Filter "Url -like '-my.sharepoint.com/personal/'" | Where-Object {$_.Title -ne "RedirectSite"}

foreach($site in $AllOneDriveSites) {
    # temporarily add admin user as SPO site admin; suppress output
    try {
        $null = Set-SPOUser -Site $site.Url -LoginName $SPOAdminUsername -IsSiteCollectionAdmin $True
    } catch {
        $txt = "Error while trying to add admin user $($SPOAdminUsername) to site $($site.Url)"
        Write-Host $txt
        $txt | Out-file -FilePath "$($outputFile)-LOG.txt" -Append -Encoding utf8
        # skip to next loop iteration
        continue
    }

    # get all user assignments for the current site
    $SiteUsers = Get-SPOUser -Site $site.Url -Limit All
    $additionalSiteUsers = $SiteUsers | Where-Object {
        $_.IsSiteAdmin -eq $true -and
        $_.LoginName -ne $SPOAdminUsername -and
        $_.DisplayName -ne $site.Title -and
        $_.IsGroup -eq $false
    }

    # Check if there are unexpected users added to the site
    if(($additionalSiteUsers | Measure-Object).Count -ne 0) {
        Write-Host "Site '$($site.Title)' has $($additionalSiteUsers.Count) additional users."
        foreach($additionalSiteUser in $additionalSiteUsers) {
            Write-Host "$($additionalSiteUser.DisplayName) ($($additionalSiteUser.LoginName))"

            # custom object for output to csv
            [PSCustomObject]@{
                "SiteURL" = $site.Url
                "SiteTitle" = $site.Title
                "AdditionalUserDisplayName" = $additionalSiteUser.DisplayName
                "AdditionalUserLoginName" = $additionalSiteUser.LoginName
            } | Export-Csv -Encoding utf8 -Delimiter ";" -Append -NoTypeInformation -Path $outputFile
        }
    }

    # remove admin user from SPO/Onedrive site (we only added it temporarily)
    try {
        $null = Set-SPOUser -Site $site.Url -LoginName $SPOAdminUsername -IsSiteCollectionAdmin $false
    } catch {
        $txt = "Error while trying to remove admin user $($SPOAdminUsername) from site $($site.Url)"
        Write-Host $txt
        $txt | Out-file -FilePath "$($outputFile)-LOG.txt" -Append -Encoding utf8
    }
}
```

I then had a CSV-file that I could check out in Excel. I realized that the file contains **ALL** additional assignments, even some legit ones. So I used the `AzureAD` PowerShell module to compare if the user account belonging to the OneDrive still existed. 
Normally a OneDrive4b site has the Name of the user as the site title. So I could use `Get-AzureADUser` to search for the SPO site title. `Get-AzureADUser` doesn't return deleted users. If a user existed, the assignment was treated as legit, because it shouldn't be an automatic delegation that happens when the user gets deleted. 

```ps1
# Compare-OneDriveSitesWithUsers.ps1

Connect-AzureAD

# I also filtered out a specific service accounts that had access to many OneDrives.
# if you don't have something similar, then you probably don't need the Where-Object part here
$sites = Import-csv "C:\temp\OneDriveAdditionalManagers-mytenant.csv" -Encoding utf8 -Delimiter ";" | Where-Object {$_.AdditionalUserLoginName -ne "some-service-account@example.com"}

# Try to get AAD Users for each SPO site
foreach($site in $sites) {
    Write-Host "Searching for user $($site.SiteTitle)..."
    # filtering out guests for some edge cases
    $user = Get-AzureADUser -SearchString $site.SiteTitle | Where-Object {$_.UserType -ne "Guest"}
    $resultCount = ($user | Measure-Object).Count
    if($resultCount -gt 1) { 
        Write-Host "$resultCount results for user $($site.SiteTitle)!"
        $user
    } elseif($resultCount -eq 1) {
        Write-Host "User exists! $($user.UserPrincipalName)"
        $site | Add-Member -NotePropertyName "UserStillExists" -NotePropertyValue $true -Force
    }    
}

# check
$sites | ft SiteTitle,UserStillExists

$sites | Where-Object {$_.UserStillExists -ne $true} | Measure-Object

$sites | Where-Object {$_.UserStillExists -ne $true} | Export-Csv -Path C:\temp\OneDriveAdditionalManagers-NonExistingUsers.csv -Delimiter ";" -Encoding utf8
```

## Removing additional admins from OneDrive sites

After checking that result, I used another script to actually remove the additional SPO site rights. Again I had to add my admin account as a SPO site collection admin. Then I first removed the site admin permissions of the manager user by calling `Set-SPOUser -Site $site.SiteURL -LoginName $SPOAdminUsername -IsSiteCollectionAdmin $True`. Afterwards I removed the user completely from the site with `Remove-SPOUser -Site $site.SiteURL -LoginName $site.AdditionalUserLoginName`. After being done with the site, I removed my admin permissions again.

```ps1
# Remove-AdditionalOneDriveOwners.ps1
Import-Module Microsoft.Online.SharePoint.PowerShell

# change the SPO tenant name accordingly. For example "demotenant"
$SPOTenantName = "<ENTER YOUR SHAREPOINT TENANT NAME HERE>"

# set this to your admin user. For example "admin@demotenant.de"
$SPOAdminUsername = "<ENTER YOUR SPO ADMIN UPN HERE>"

# output log file path
$outputFile = "C:\temp\OneDriveAdditionalManagers-Cleanup-$($SPOTenantName)-$(Get-Date -Format "yyyy-MM-dd_HHmmss").txt"

# insert spo tenant name
Connect-SPOService -Url "https://$($SPOTenantName)-admin.sharepoint.com"

# import sites to clean from CSV file
$SitesToClean = Import-Csv -Path "C:\temp\OneDriveSitesToCleanPermissions.csv" -Delimiter ";" -Encoding utf8

foreach($site in $SitesToClean) {
    # temporarily add admin user as SPO site admin; suppress output
    try {
        $null = Set-SPOUser -Site $site.SiteURL -LoginName $SPOAdminUsername -IsSiteCollectionAdmin $True
    } catch {
        $txt = "Error while trying to add admin user $($SPOAdminUsername) to site $($site.SiteURL)"
        Write-Host $txt
        $txt | Out-file -FilePath $outputFile -Append -Encoding utf8
        # skip to next loop iteration
        continue
    }

    # remove additional user from SPO site according to CSV file
    try {
        # first remove admin rights
        $null = Set-SPOUser -Site $site.SiteUrl -LoginName $site.AdditionalUserLoginName -IsSiteCollectionAdmin $false
        # then remove the user from the site
        Remove-SPOUser -Site $site.SiteURL -LoginName $site.AdditionalUserLoginName
        $txt = "Removed user $($site.AdditionalUserLoginName) from site $($site.SiteURL)."
        Write-Host $txt -ForegroundColor Green
        $txt | Out-file -FilePath $outputFile -Append -Encoding utf8
    } catch {
        $txt = "Error while trying to remove user $($site.AdditionalUserLoginName) from site $($site.SiteURL). Error details: $_"
        Write-Host $txt -ForegroundColor Red
        $txt | Out-file -FilePath $outputFile -Append -Encoding utf8
    }

    # remove admin user from SPO/Onedrive site (we only added it temporarily)
    try {
        $null = Set-SPOUser -Site $site.SiteURL -LoginName $SPOAdminUsername -IsSiteCollectionAdmin $false
    } catch {
        $txt = "Error while trying to remove admin user $($SPOAdminUsername) from site $($site.SiteURL)"
        Write-Host $txt
        $txt | Out-file -FilePath $outputFile -Append -Encoding utf8
    }

}

```

