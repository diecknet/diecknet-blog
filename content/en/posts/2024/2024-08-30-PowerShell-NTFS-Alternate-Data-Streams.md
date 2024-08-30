---
slug: "powershell-ntfs-alternate-data-streams"
title: "PowerShell NTFS Alternate Data Streams"
date: 2024-08-30
comments: true
tags: [powershell, ntfs]
draft: true
---
The NTFS file system is used by default in Windows. And normally a file has only one associated normal data stream with the name `:$DATA`. But there are also the so-called "Alternate Data Streams" (ADS), which can contain additional data. These ADS are not visible in the Windows Explorer or most other applications.

ADS are sometimes used by the system, but could also be used by attackers to hide data.

## Read NTFS Alternate Data Streams

Many web browsers on windows stamp downloaded files from the Internet with a "Mark of the web" (MOTW) in the `Zone.Identifier` stream. This stream contains information about the source of the file - e.g. that it was downloaded from the Internet.
To read the content of an ADS, you can simply use `Get-Content` with the `-Stream` parameter and the stream name. Alternatively, `:<name of stream>` can be appended to the file name.

```powershell
# Two variants to read the Zone.Identifier Stream
Get-Content .\Example.txt -Stream Zone.Identifier
Get-Content .\Example.txt:Zone.Identifier

# Return
[ZoneTransfer]
ZoneId=3
ReferrerUrl=https://diecknet.de
HostUrl=https://github.com
```

The actual content of `Zone.Identifier` can vary. Sometimes it contains more or less information. However, the information on the `ZoneId` should always be included. The following values are possible for the zone:

| Value | Meaning               |
|-------|-----------------------|
| 0     | My Computer           |
| 1     | Local Intranet Zone   |
| 2     | Trusted sites Zone    |
| 3     | Internet Zone         |
| 4     | Restricted Sites Zone |

Source: <https://learn.microsoft.com/en-us/previous-versions/troubleshoot/browsers/security-privacy/ie-security-zones-registry-entries#zones>

The Windows Smartscreen Filter sometimes also creates its own ADS called `SmartScreen`. If it contains `Anaheim`, the file has been classified as unsafe.

```powershell
Get-Content .\Example.exe -Stream Smartscreen

# Return
Anaheim
```

And if there are any other streams, you can of course read them using the same procedure.

### Remove the Mark of the web

The regular way to remove the "Mark of the web" is via `Unblock-File` or via the properties dialog of the file.

```powershell
Unblock-File .\MyFile.docx
```

[![Setting the checkmark 'Unblock' in the file properties, removes the Mark of the web](/images/2024/2024-08-30_NTFS_ADS_Properties.jpg "Setting the checkmark 'Unblock' in the file properties, removes the Mark of the web")](/images/2024/2024-08-30_NTFS_ADS_Properties.jpg)

## Find NTFS Alternate Data Streams

To find out which Alternate Data Streams are available, the `-Stream` parameter of the `Get-Item` cmdlet can be used. With `*` as a placeholder, we can find all ADS.

```powershell
# List all streams of all data in the current directory
Get-Item * -Stream *
```

We can also filter out the information that the standard `:$DATA` stream is available:

```powershell
Get-Item * -Stream * | Where-Object {$_.Stream -ne ':$DATA' }
```

With my [`Get-NTFSADS.ps1 script`](https://github.com/diecknet/diecknet-scripts/blob/main/Windows/Get-NTFSADS.ps1) it's even a bit easier and prettier. Check it out on [Github](https://github.com/diecknet/diecknet-scripts/blob/main/Windows/Get-NTFSADS.ps1).

## Write NTFS Alternate Data Streams

It is possible to write your own data into ADS. For example, `Set-Content`/`Add-Content` can be used for this.

```powershell
# Two variants to set the example stream, it may be overwritten
Set-Content .\MyFile.docx -Stream "Example" -Value "Hello PowerShell!"
Set-Content .\MyFile.docx:Example -Value "Hello PowerShell!"

# Two variants to add to the example stream
Add-Content .\MyFile.docx -Stream "Beispiel" -Value "Hello PowerShell!"
Add-Content .\MyFile.docx:Example -Value "Hello PowerShell!"
```

## Delete NTFS Alternate Data Streams

ADS can also be deleted via `Remove-Item` like normal files. The file and the `:$DATA` stream would continue to exist in the following example:

```powershell
Remove-Item .\MyFile.docx -Stream "Example"
```

## Conclusion

NTFS Alternate Data Streams are an interesting function. They are less suitable as a gateway for attackers, as no additional data streams can be transferred during a normal download. However, ADS could still be transferred in some container formats, e.g. within `.vhdx` files for virtual hard disk images. However, the use of an ADS-capable container would also be very suspicious.

I think that ADS could rather be used by attackers if they have already infiltrated a system. Malicious code or other data could then be hidden. However, modern EDR solutions should (in my opinion) take action if ADS is used. Technically, this would be possible via Sysmon logging, for example.
