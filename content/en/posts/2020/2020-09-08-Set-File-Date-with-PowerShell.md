---
comments: true
aliases:
    - set-file-date-with-powershell
slug: Set-File-Date-with-PowerShell
title: "Set a File Date with PowerShell"
subtitle: "Time travel with PowerShell?"
date: 2020-09-08
tags: [powershell, ntfs, windowsserver, powershellsnips]
cover:
    image: /images/2020/2020-09-08_FileDate.png
---

The date of a file can be set or manipulated arbitrarily with PowerShell. In the screenshot you can see a few example values that have been set arbitrarily. The procedure has been tested with Windows PowerShell 5.1.

With `Get-Member` you can display the time attributes of a file.

```powershell
Get-Item example.txt | Get-Member *time*
```

![File date attributes displayed](/images/2020/2020-09-08_DateAttributes.png "File date attributes displayed")

The interesting attributes are:

-   CreationTime (when the file was created)
-   LastAccessTime (when the file was last accessed)
-   LastWriteTime (when the file was last modified)

As you can see from the `{get;set;}` at the end, you can not only read these attributes, but also set them.

## Examples

In the following examples I show how to change the modification date, the last access time, and the creation timestamp for individual files or all files in a folder.

### Notes on the examples

#### Generate a date

I prefer to generate the date in the following format: `2020-09-13T13:37:37` (see also [ISO 8601](https://en.wikipedia.org/wiki/ISO_8601#:~:text=The%20most%20common%20time%20format%20in%20the%20standard,%2D14T23%3A34%3A30.)), or alternatively simplified as `2020-09-13 13:37`. This standardized format works independently of OS localization.

#### Abbreviations and aliases

With `gci` (abbreviation/alias for `Get-ChildItem`) we read all items (folders and files) in the current folder.
With `%` (alias for `ForEach-Object`) we iterate through all items.

### Change the creation date

Examples for changing the creation date ("Created"):

```powershell
# Set the creation date of all items in the current folder to 1991-11-06 12:03
gci | %{$_.CreationTime=(Get-Date "1991-11-06 12:03")}

# Set the creation date of a specific file to 1991-11-06 12:03
Get-Item "Example.txt" | %{$_.CreationTime=(Get-Date "1991-11-06 12:03")}
```

### Change the modification date

Examples for changing the modification date ("Modified"):

```powershell
# Set the modification date of all items in the current folder to 2021-05-01 17:01
gci | %{$_.LastWriteTime=Get-Date "2021-05-01 17:01"}

# Set the modification date of a specific file in the current folder to 2021-05-01 17:01
Get-Item "Example.txt" | %{$_.LastWriteTime=Get-Date "2021-05-01 17:01"}
```

### Change the last access date

Examples for changing the access timestamp ("Last Access"):

```powershell
# Set the access date of all items in the current folder to 2019-01-06 08:03
gci | %{$_.LastAccessTime=(Get-Date "2019-01-06 08:03")}

# Set the access date of a specific item in the current folder to 2019-01-06 08:03
Get-Item "Example.txt" | %{$_.LastAccessTime=(Get-Date "2019-01-06 08:03")}
```

## Conclusion

Because the time attributes of files can be manipulated arbitrarily, they should not be trusted. They can at best be used as a clue for an action in a system. But they are definitely not proof.
