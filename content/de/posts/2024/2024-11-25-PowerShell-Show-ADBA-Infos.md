---
slug: "powershell-show-adba-infos"
title: "Infos zu Active Directory Based Activation per PowerShell abrufen"
date: 2024-11-25
comments: true
tags: [powershell, adba, active directory]
ShowToc: false
---

Wenn ihr schnell Infos zu Active Directory Based Activation (ADBA) in eurer Domäne abrufen wolltet, habt ihr diesen PowerShell One-Liner verwenden können:

```powershell
Get-ADDomain | %{Get-ADObject -SearchBase "CN=Activation Objects,CN=Microsoft SPP,CN=Services,CN=Configuration,$($_.DistinguishedName)" -LDAPFilter "(objectclass=msspp-activationobject)" -Properties * -ErrorAction SilentlyContinue | fl displayName,DistinguishedName,Name,msspp-csvlkpartialproductkey }
```

Ich habe es nicht in einer Multi-Domain-Umgebung getestet, aber ich habe gedacht, dass es funktionieren sollte.

## Erklärung

Der Code hat Aliase verwendet, die in Skripten nicht ideal sind, aber in One-Linern praktisch gewesen sind.
Er hat `Get-ADDomain` verwendet, um den Distinguished Name der Domäne zu ermitteln. Dadurch ist der Code portabler gewesen.

Zu den Aliasen:

- `%` ist ein Alias für `ForEach-Object`
- `fl` ist ein Alias für `Format-List`
