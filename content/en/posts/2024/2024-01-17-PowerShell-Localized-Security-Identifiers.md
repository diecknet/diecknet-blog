---
slug: "powershell-localized-security-identifiers"
title: "Finding localized Security Identifier names in PowerShell"
date: 2024-01-17
comments: true
tags: [powershell, security identifiers, windows]
cover: 
    image: "/images/2024/2024-01-17_LocalizedSID.jpg"
---

Security Identifiers are used to identify specific security principals or groups in Windows. Unfortunately, their names are localized, so for example they differ between a German and an English system.

For example, the built-in Administrators group is called `BUILTIN\ADMINISTRATORS` in English and `VORDEFINIERT\Administratoren` in German. Or the English `NT AUTHORITY\SYSTEM` becomes `NT-AUTORITÄT\SYSTEM` on a German system. **I think that is really weird.** Suddenly a space is replaced by a hyphen. Well, whatever.

These different names can be problematic when they are hardcoded in scripts. And if the script is then run on a system with a different language, it fails, at least partially, depending on the script. That was the case, for example, in [this script from the Microsoft FastTrack team](https://github.com/microsoft/FastTrack/blob/master/scripts/Find-MailboxDelegates/Find-MailboxDelegates.ps1), which was meant to help with migrations to Exchange Online. I then submitted [a code change](https://github.com/microsoft/FastTrack/commit/ff6532501fc68f6c99a8b4447b1efb72158f1315), which was accepted.

## Converting a SID to a name

So here is the solution: Instead of hardcoding the security principal name in every language imaginable in the code, a .NET method can be used. For example, to find the correct name for `NT AUTHORITY\SYSTEM` on the current system:

```powershell
# Get the localized name of "NT AUTHORITY\SYSTEM" for the current user's language
# for example on a German system it would return "NT-AUTORITÄT\SYSTEM"
([System.Security.Principal.SecurityIdentifier]::new("S-1-5-18")).Translate([System.Security.Principal.NTAccount]).Value
```

If you want to find the name for a different Security Identifier, I have put [a few code snippets on GitHub](https://github.com/diecknet/diecknet-scripts/blob/main/Snips/Get-LocalizedNTAuthority.ps1). But basically you only need to replace the SID that is used as the parameter for the `new()` method. You can find many more SIDs here at Microsoft: [https://learn.microsoft.com/en-us/windows-server/identity/ad-ds/manage/understand-security-identifiers](https://learn.microsoft.com/en-us/windows-server/identity/ad-ds/manage/understand-security-identifiers)
