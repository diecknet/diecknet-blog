---
slug: "powershell-show-adba-infos"
title: "Infos zu Active Directory Based Activation per PowerShell abrufen"
date: 2024-11-25
comments: true
tags: [powershell, adba, active directory]
ShowToc: false
---

Wenn ihr schnell Infos zu Active Directory Based Activation (ADBA) in eurer Domäne abrufen wollt, könnt ihr diesen PowerShell One-Liner verwenden:

```powershell
Get-ADDomain | %{Get-ADObject -SearchBase "CN=Activation Objects,CN=Microsoft SPP,CN=Services,CN=Configuration,$($_.DistinguishedName)" -LDAPFilter "(objectclass=msspp-activationobject)" -Properties * -ErrorAction SilentlyContinue | fl displayName,DistinguishedName,Name,msspp-csvlkpartialproductkey }
```

Ich habe es nicht in einer Multi-Domain-Umgebung getestet, aber ich denke, dass es funktionieren sollte.

## Erklärung

Der Code verwendet Aliase, die in Skripten nicht ideal sind, aber in One-Linern praktisch sind.
Er verwendet `Get-ADDomain`, um den Distinguished Name der Domäne zu ermitteln. Das macht den Code portabler.

Zu den Aliasen:

- `%` ist ein Alias für `ForEach-Object`
- `fl` ist ein Alias für `Format-List`
