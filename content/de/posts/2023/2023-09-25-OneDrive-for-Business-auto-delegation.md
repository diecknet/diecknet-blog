---
slug: "onedrive-for-business-auto-delegation-to-manager"
title: "OneDrive for Business - Delegierung an Vorgesetzte nach Austritt von Mitarbeitenden"
date: 2023-09-25
comments: true
tags: [onedrive, onedrive for business, sharepoint online, my site]
---

Normalerweise wird bei einem Benutzer, der die Firma verlässt, dessen OneDrive-for-Business-Seite automatisch an den Vorgesetzten delegiert. Das bedeutet, dass der Vorgesetzte SharePoint Site Collection Admin-Rechte auf die OneDrive-Seite des Mitarbeiters erhalten hat.

## Zugriffsdelegierung prüfen und ändern

**⚠️ Die Zugriffsdelegierung ist standardmäßig aktiviert gewesen**. Die Einstellung kann man hier finden und ändern:

> 1. Go to **More features** in the new SharePoint admin center, and sign in with an account that has admin permissions for your organization.
> [...]
> 2. Under **User profiles**, select **Open**.
> 3. Under **My Site Settings**, select **Setup My Sites**.
> 4. Next to **My Site Cleanup**, make sure **Enable access delegation** is selected.

(Quelle: https://learn.microsoft.com/en-us/sharepoint/retention-and-deletion#configure-automatic-access-delegation)

In manchen Firmen ist das nicht gewünscht, daher könnt ihr diese Option bei Bedarf ändern. Um sie zu deaktivieren, entfernt den Haken bei „Enable access delegation“.

[![SharePoint Online - My Site settings - Cleanup](/images/2023/2023-09-25-MySiteSettings-Cleanup.jpg "SharePoint Online - My Site settings - Cleanup")](/images/2023/2023-09-25-MySiteSettings-Cleanup.jpg)

## Wie sieht das aus?

Wenn ein Benutzer gelöscht wird und die OneDrive-Zugriffsdelegierung **aktiviert** ist, erhält der Vorgesetzte eine E-Mail. Zumindest in meinem Test-Tenant hat die E-Mail kein professionelles Design gehabt. Das ist einfach eine Textwand gewesen:

[![Info-E-Mail an einen Manager bezüglich OneDrive eines Mitarbeiters](/images/2023/2023-09-25_OneDrive-Delegation-Infomail1.jpg "Info-E-Mail an einen Manager bezüglich OneDrive eines Mitarbeiters")](/images/2023/2023-09-25_OneDrive-Delegation-Infomail1.jpg)

> Adele Vance's account has been deleted from the Active Directory. Their OneDrive for Business will be preserved for 30 days. You're the temporary owner of all documents saved to their OneDrive for Business. If you would like to save content beyond the 30 day retention period, you can copy important documents to another location. You can also contact your administrator to reassign ownership to another OneDrive for Business owner. After 30 days, Adele Vance's OneDrive for Business will be permanently deleted. Go to Adele Vance's OneDrive for Business at https://diecknetdemotenant-my.sharepoint.com/personal/adelev_yr2z8_onmicrosoft_com/Documents/Forms/All.aspx

Und dann hat der Vorgesetzte 7 Tage vor der Löschung von OneDrive eine Erinnerung erhalten:

[![Info-E-Mail an einen Manager zum bald ablaufenden OneDrive eines Mitarbeiters](/images/2023/2023-09-25_OneDrive-Delegation-Infomail2.jpg "Info-E-Mail an einen Manager zum bald ablaufenden OneDrive eines Mitarbeiters")](/images/2023/2023-09-25_OneDrive-Delegation-Infomail2.jpg)

> Adele Vance's OneDrive for Business is scheduled for permanent deletion in 7 days. You still have time to copy important documents to another location. After 7 days, Adele Vance's OneDrive for Business will be permanently deleted. Go to Adele Vance's OneDrive for Business at https://diecknetdemotenant-my.sharepoint.com/personal/adelev_yr2z8_onmicrosoft_com 

Wenn der Vorgesetzte den Link öffnet, kann er auf alle Daten der OneDrive-Seite zugreifen.

## Wer hat die Einstellung „Enable access delegation“ geändert?

Wenn die Einstellung nicht im erwarteten Zustand ist, solltet ihr im [Microsoft 365 Admin Audit Log](https://compliance.microsoft.com/auditlogsearch) prüfen, ob sie in der Vergangenheit geändert wurde. Leider ist die Option nicht unter „Activities - friendly names“ verfügbar. Ihr müsst bei „Activities - operation names“ nach `AccessDelegationOnMySiteCleaneupEnabledSet` suchen.

|Activities - operation names|Option in der GUI|
|---|---|
|AccessDelegationOnMySiteCleaneupEnabledSet|Enable access delegation|
|SecondaryMySiteOwnerSet|Secondary Owner|

Ich habe das hier dokumentiert, weil ich (mal wieder) keine vernünftige Microsoft-Dokumentation zu diesem Thema gefunden habe.

[![M365 Audit Log für SharePoint Online - My Site settings - Cleanup - Änderungen durchsuchen](/images/2023/2023-09-25-M365-audit-log-MySiteSettings-Cleanup.jpg "M365 Audit Log für SharePoint Online - My Site settings - Cleanup - Änderungen durchsuchen")](/images/2023/2023-09-25-M365-audit-log-MySiteSettings-Cleanup.jpg)

## Bericht zu delegierten OneDrives erstellen

Ein Kunde von mir ist über diese Einstellung gestolpert und hat festgestellt, dass sie aktiviert war, obwohl große Datenschutzbedenken bestanden haben. Das hängt stark von der jeweiligen Firma und deren Richtlinien ab. Die Einstellung wurde schnell geändert und ich wurde nach einer Möglichkeit gefragt, zu melden, welche OneDrive-Seiten aktuell automatisch an einen Vorgesetzten delegiert sind. Und auch, wie man diese Delegierungen wieder entfernt.

Zum Sammeln der Daten habe ich PowerShell mit dem zusätzlichen Modul `Microsoft.Online.SharePoint.PowerShell` genutzt. Für den Abgleich mit den Benutzern im Tenant habe ich das alte Modul `AzureAD` genutzt. Ich hätte auch das neuere `Microsoft.Graph`-Modul nutzen können, aber in diesem Fall war es mit dem alten Kram einfacher.

Ich habe die Admin-Rolle „SharePoint Administrator“ im Tenant gehabt, konnte damit aber die Berechtigungen der OneDrive-Seiten nicht lesen. Offenbar musste ich mein Admin-Konto zuerst auf jeder Seite als **Site Collection Admin** hinzufügen, um die Berechtigungen überhaupt lesen zu können. Irgendwie ironisch, dass ich das machen musste, um mögliche andere Admin-Zuweisungen herauszufinden. Meine Berechtigungen habe ich anschließend wieder entfernt. Um alle Daten einzusammeln, habe ich folgendes Skript verwendet.

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

Danach habe ich eine CSV-Datei gehabt, die ich in Excel prüfen konnte. Ich habe festgestellt, dass die Datei **ALLE** zusätzlichen Zuweisungen enthält, auch einige legitime. Also habe ich das PowerShell-Modul `AzureAD` genutzt, um zu vergleichen, ob das Benutzerkonto zur jeweiligen OneDrive-Seite noch existiert hat.
Normalerweise trägt eine OneDrive-Seite den Namen des Benutzers als Seitentitel. Deshalb konnte ich `Get-AzureADUser` verwenden, um nach dem SPO-Seitentitel zu suchen. `Get-AzureADUser` liefert keine gelöschten Benutzer zurück. Wenn ein Benutzer existiert hat, habe ich die Zuweisung als legitim behandelt, weil es dann keine automatische Delegierung durch eine Löschung gewesen sein sollte.

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

## Zusätzliche Admins von OneDrive-Seiten entfernen

Nachdem ich das Ergebnis geprüft hatte, habe ich ein weiteres Skript verwendet, um die zusätzlichen SPO-Berechtigungen tatsächlich zu entfernen. Wieder musste ich mein Admin-Konto zuerst als SPO Site Collection Admin hinzufügen. Danach habe ich zuerst die Site-Admin-Rechte des Manager-Benutzers mit `Set-SPOUser -Site $site.SiteURL -LoginName $SPOAdminUsername -IsSiteCollectionAdmin $True` entfernt. Anschließend habe ich den Benutzer mit `Remove-SPOUser -Site $site.SiteURL -LoginName $site.AdditionalUserLoginName` komplett von der Seite entfernt. Nachdem ich mit der Seite fertig gewesen bin, habe ich meine Admin-Berechtigungen wieder entfernt.

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
