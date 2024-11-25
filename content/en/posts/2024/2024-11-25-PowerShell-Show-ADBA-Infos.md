---
slug: "powershell-show-adba-infos"
title: "Retrieve infos about Active Directory Based Activation via PowerShell"
date: 2024-11-25
comments: true
tags: [powershell, adba, active directory]
ShowToc: false
---

If you quickly want to retrieve infos about Active Directory Based Activation (ADBA) in your domain, you can use this PowerShell One-liner:

```powershell
Get-ADDomain | %{Get-ADObject -SearchBase "CN=Activation Objects,CN=Microsoft SPP,CN=Services,CN=Configuration,$($_.DistinguishedName)" -LDAPFilter "(objectclass=msspp-activationobject)" -Properties * -ErrorAction SilentlyContinue | fl displayName,DistinguishedName,Name,msspp-csvlkpartialproductkey }
```

I haven't tested it in a multi-domain environment, but I think it should work.

## Explanation

The code uses aliases, which are not great in scripts, but neat in One-Liners.
It uses `Get-ADDomain` to determine the Distinguished Name for the Domain. This should make the code portable.

Regarding the aliases:

- `%` is an alias for `ForEach-Object`
- `fl` is an alias for `Format-List`
