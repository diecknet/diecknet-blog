---
slug: "powershell-calculated-properties"
title: "PowerShell Calculated Properties"
subtitle: "Formatting properties using Select-Object"
date: 2024-08-21
comments: true
tags: [powershell]
---
If you export data via PowerShell (for example to a CSV file via `Export-CSV`), the original property names of the PowerShell objects are used. However, if these are not fully fitting for your purpose, you can also customize them. So-called "Calculated Properties" and the cmdlet `Select-Object` can be used for this.

This can be used, for example, to

- Rename properties
- Format property values
- Create completely custom properties (e.g. by calling additional cmdlets)

## Output objects normally

As a reminder: The selection of object properties with `Select-Object` is possible with the `-Property` parameter. However, the parameter usually does not have to be named explicitly.

```powershell
# List all Windows services; only show the Name and Status properties
Get-Service | Select-Object -Property Name, Status

# Alternatively, without explicitly writing -Property
Get-Service | Select-Object Name, Status
```

## Rename properties

To rename a property, we need to specify a hashtable instead of a simple parameter name.
The hashtable has two entries:

|Entry|Meaning|
|---|---|
|`Name` (or `Label`)|Name of the new property|
|`Expression`|Script block that creates the value|

For example, to create the property "Service name", which contains the name of a Windows service:

```powershell
Get-Service | Select-Object @{Name = "Service name"; Expression = { $_.Name } }, Status

# Return
Service name     Status
----------       ------
[...]
wuauserv         Stopped
[...]
```

Normal parameters can also still be used. In this example, I also output the "Status" property.

## Format string properties / combine several properties

But we can not only rename properties, we can also format them as we wish. For example, if I want a property to display both the display name and the internal name of a Windows service combined.

```powershell
Get-Service | Select-Object -Property @{Name = "Service name"; Expression = { "$($_.DisplayName) ($($_.Name))" } }, Status

# Return:
Service name                 Status
----------                   ------
[...]
Windows Update (wuauserv)    Stopped
[...]
```

## Include If-Condition

It is also possible to integrate logic with an If statement. For example, in this case it is checked whether an Active Directory user is a member of a security group that corresponds to the wildcard pattern `*VIP-User*`. If this is the case, "Yes" is written to the new property "VIP". If not, "No" is written instead.

```powershell
$User = Get-ADUser -Property MemberOf -Filter *
$User | Select-Object -Property UserPrincipalName, @{Name = "VIP"; Expression = { if ($_.MemberOf -like "*VIP-User*") { "Yes" } else { "No" } } }

# Return
UserPrincipalName                 VIP
-----------------                 ---
[...]
testuser12345@demotenant.de       No
alexw@demotenant.de               Yes
andreas.dieckmann@demotenant.de   No
soenderzoichuenss@demotenant.de   Yes
[...]
```

## Using additional Cmdlets

Apart from If statements, we can also use entire cmdlets to retrieve additional information.
In this example, I first use `Get-ADUser` to list all users in an organizational unit in my Active Directory. Then I want to list the corresponding manager of the users.

```powershell
$User = Get-ADUser -Property Manager -Filter * -Searchbase "OU=User,OU=DemoTenant,DC=lan,DC=demotenant,DC=de"
# Normal listing of the managers
$User | Select-Object -Property Name, Manager

# Return
Name              Manager
----              -------
Adam Steward      CN=Charles Walker,OU=User,OU=DemoTenant,DC=lan,DC=demotenant,DC=en
Charles Walker    CN=Andreas Dieckmann,OU=User,OU=DemoTenant,DC=lan,DC=demotenant...
Alex Wilber       CN=Charles Walker,OU=User,OU=DemoTenant,DC=lan,DC=demotenant,DC=en
Andreas Dieckmann
Söndèr Zöichünß   CN=Charles Walker,OU=User,OU=DemoTenant,DC=lan,DC=demotenant,DC=en
```

By default, the "Distinguished Name" (DN) of the managers are listed here. Not particularly presentable. But we can execute `Get-ADUser` again in the expression for the calculated property to get information about each manager.

```powershell
$User = Get-ADUser -Property Manager -Filter * -Searchbase "OU=User,OU=DemoTenant,DC=lan,DC=demotenant,DC=de"
$User | Select-Object -Property Name, @{Name = "Manager"; Expression = {
        if ($_.Manager) {
            (Get-ADUser $_.Manager).Name
        } else {
            "*nobody*"
        }
    }
}

# Return
Name              Manager
----              -------
Adam Steward      Charles Walker
Charles Walker    Andreas Dieckmann
Alex Wilber       Charles Walker
Andreas Dieckmann *nobody*
Söndèr Zöichünß   Charles Walker
```

In this example, I have also split the expression over several lines. That's no problem, as it is clearly recognizable and enclosed in `{`curly brackets`}`.

By the way: If you are working in the console, you can press `[Shift] + [Enter]` to continue writing on a new line without already executing the command.

## Convert Array to String

If you want to export an object property that consists of an array, the export usually does not work well. In the console, the values in the array property are enclosed in `{`curly brackets`}`. For example, I query all domain controllers in my Active Directory here and list the FSMO roles.

```powershell
Get-ADDomainController | Select-Object Name,OperationMasterRoles

# Return
Name OperationMasterRoles
---- --------------------
DC2  {SchemaMaster, DomainNamingMaster, PDCEmulator, RIDMaster...}
```

In my console, the output was even truncated a bit, so I can't even see all the roles. When I try to export such an array via `Export-CSV`, the result is completely unusable by default:

```powershell
Get-ADDomainController | Select-Object Name,OperationMasterRoles | Export-Csv c:\diecknet\ad.csv
Get-Content C:\diecknet\ad.csv

# Return
"Name","OperationMasterRoles"
"DC2","Microsoft.ActiveDirectory.Management.ADPropertyValueCollection"
```

The array was not converted to a string, but instead it says `Microsoft.ActiveDirectory.Management.ADPropertyValueCollection`.

The solution: Calculated Properties and the `-join` operator. In the following example, the entries in the array are merged into a string and separated by a space and a comma (`, `).

```powershell
Get-ADDomainController | Select-Object Name,@{Label="FSMO-Roles";Expression={$_.OperationMasterRoles -join ", "}}

# Return
Name FSMO-Roles
---- -----------
DC2  SchemaMaster, DomainNamingMaster, PDCEmulator, RIDMaster, InfrastructureMaster
```

## Further tips and advice

Here are a few general tips and advice on Calculated Properties.

### Name VS. Label

You may have noticed in the last example that I suddenly used `@{Label=` instead of `@{Name=` in the hashtable. In fact, `Name` and `Label` are interchangeable in this case. It works both ways, makes no difference.

```powershell
# Both variants create the same result
Get-ADDomainController | Select-Object Name,@{Label="FSMO-Roles"; Expression={$_.OperationMasterRoles -join ", "}}
Get-ADDomainController | Select-Object Name,@{Name="FSMO-Roles"; Expression={$_.OperationMasterRoles -join ", "}}
```

### Increase readability by using hashtable splatting

[In the section "Using additional Cmdlets"](#using-additional-cmdlets) I had already split the expression script block into several lines. But another way to increase readability is splatting. The cmdlet parameters are written to a hashtable.

In the following example, I have also named the hashtable variable for formatting `$Format` for the sake of simplicity. However, the name is of course freely configurable. In the hashtable there is the key `Property`, which in turn is an array. This array must contain the properties that should be output. I have used two more sub-hashtables here (calculated properties) and a string (normal property of the object). 

```powershell
$Format = @{
    Property = (
        @{
            Name       = "Service name"
            Expression = { $_.Name }
        },
        @{
            Name       = "Service status"
            Expression = { $_.Status }
        },
        # Important: Normal properties must be in quotes in the hashtable!
        "StartType" # Example for a normal property (not a Calculated Property)
    )
}
Get-Service | Select-Object @Format

# Return
Service name Service status StartType
----------   ------------   ---------
[...]
wuauserv     Running        Manual
[...]
```

### Short-form of the hashtable names are allowed

Instead of the fully written out hashtable keys `Name`/`Label` and `Expression`, the shortened syntax `N`, `L` and `E` can also be used.

```powershell
# Normal spelling
Get-Service | Select-Object -Property @{Name = "Service name"; Expression = { $_.Name } }, Status
# Short spelling (both variants work: N=Name, L=Label)
Get-Service | Select-Object -Property @{N = "Service name"; E = { $_.Name } }, Status
Get-Service | Select-Object -Property @{L = "Service name"; E = { $_.Name } }, Status
```

### The label is actually optional

Actually, the label/name is optional. It would also be possible to **not** use a hashtable, but instead simply specify a script block for the calculated property. In this case, however, the calculated property is given the ScriptBlock as its name, which looks strange. I would not recommend this.

```powershell
Get-ADDomainController | Select-Object Name,{$_.OperationMasterRoles -join ", "}

# Return
Name $_.OperationMasterRoles -join ", "
---- ----------------------------------
DC2  SchemaMaster, DomainNamingMaster, PDCEmulator, RIDMaster, InfrastructureMaster
```