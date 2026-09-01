---
slug: "powershell-multiline-commands"
title: "Split PowerShell Commands Across Multiple Lines"
subtitle: "... to improve readability"
date: 2024-05-15
comments: true
tags: [powershell]
---
PowerShell commands with many parameters can make the code harder to read. For example, in the code snippet below, in line 5 I used the `New-ADUser` cmdlet and specified 7 parameters. That is very hard to read on one line, even if you use an ultra-wide monitor.

```powershell {hl_lines=5}
$CSVFile = Import-Csv .\NeueUser.csv

foreach($User in $CSVFile) {
    $Manager = Get-ADUser -Filter "mail -eq '$($User.Manager)'"
    New-ADUser -Name "$($User.Vorname) $($User.Nachname)" -Surname $User.Nachname -GivenName $User.Vorname -UserPrincipalName "$($User.Vorname).$($User.Nachname)@demotenant.de" -Department $User.Abteilung -Company "Demotenant" -Path "OU=User,OU=Demotenant,DC=lan,DC=demotenant,DC=de"
}
```

It would improve readability if we could split the command across multiple lines.
That is why I will show you two ways to split your PowerShell commands across multiple lines in this article.

**🎬 I also created a [video on this topic](https://www.youtube.com/watch?v=dMR0rrC_xIw).**  

## Backticks

The first option is to use backticks `` ` `` before line breaks. This character can also be used for other things in PowerShell, but we will use it now to escape the following character, which is the line break. This way, the line break is not treated as the end of the command, and we can continue on the next line. 👍

In theory, you could still put several parameters on one line, but I think this looks best: first put the cmdlet name on the first line, then a space, a backtick, a new line break. Then I indent the code a bit by pressing the Tab key. That is only cosmetic, but I find it makes it easier to read. It makes it more obvious that this new line belongs to the cmdlet above it. Now each line contains one parameter with its parameter value, and each line ends with a space and a backtick if another parameter follows on the next line.

The code from the start of the article rewritten with backticks would then look like this:

```powershell {hl_lines="5-12"}
$CSVFile = Import-Csv .\NeueUser.csv

foreach($User in $CSVFile) {
    $Manager = Get-ADUser -Filter "mail -eq '$($User.Manager)'"
    New-ADUser `
        -Name "$($User.Vorname) $($User.Nachname)" `
        -Surname $User.Nachname `
        -GivenName $User.Vorname `
        -UserPrincipalName "$($User.Vorname).$($User.Nachname)@demotenant.de" `
        -Department $User.Abteilung `
        -Company "Demotenant" `
        -Path "OU=User,OU=Demotenant,DC=lan,DC=demotenant,DC=de"
}
```

This code is much easier to read and works the same as the original.

In general, I do not like this backtick method that much, because these backticks are so inconspicuous. I always worry that they might be overlooked later when I or someone else edits this script. But the method is easy to apply and works.

### Note on long pipelines

If you use a chained command with pipes, you can also place the pipe symbol at the end of each line. Then add a line break, and you do not need a backtick. Write the next command of the pipeline on the next line. If more pipes follow, you can repeat that as often as you like. Here too, I would recommend indenting the code from the second line onward for readability.

```powershell
# Original pipeline
Get-Service | Where-Object {$_.Name -eq "wuauserv"} | Stop-Service

# Multi-line pipeline
Get-Service |
    Where-Object {$_.Name -eq "wuauserv"} |
    Stop-Service

```

## Splatting

An alternative to backticks is the so-called splatting. To use it, we write the cmdlet parameters as a collection in a variable and can then simply pass them to our cmdlet. The original example from the beginning of this article would look like this:

```powershell {hl_lines="5-14"}
$CSVFile = Import-Csv .\NeueUser.csv

foreach($User in $CSVFile) {
    $Manager = Get-ADUser -Filter "mail -eq '$($User.Manager)'"
    $MyParameter = @{
        Name                = "$($User.Vorname) $($User.Nachname)"
        Surname             = $User.Nachname
        GivenName           = $User.Vorname
        UserPrincipalName   = "$($User.Vorname).$($User.Nachname)@demotenant.de" 
        Department          = $User.Abteilung 
        Company             = "Demotenant" 
        Path                = "OU=User,OU=Demotenant,DC=lan,DC=demotenant,DC=de"
    }
    New-ADUser @MyParameter
}
```

So I first created a hashtable with the name `$MyParameter` (the name is arbitrary). The hashtable contains one entry for each parameter, including the respective parameter value. To use a splatted variable as a parameter for a cmdlet, it must be specified with an `@` symbol instead of the normal `$` symbol for variables. The parameter names do not need to be specified on the cmdlet, because they are all in the hashtable or variable.

These are the basics, and I think this looks much nicer than using backticks.

### Tips and quirks of splatting

#### Splat multiple times

You can splat multiple times, meaning you can use two or more hashtables (for example, one for default values such as OU). Then you simply specify multiple variables with the `@` syntax on the cmdlet.

```powershell {hl_lines=["5-7","16"]}
$CSVFile = Import-Csv .\NeueUser.csv

foreach($User in $CSVFile) {
    $Manager = Get-ADUser -Filter "mail -eq '$($User.Manager)'"
    $DefaultValues =  @{
        Path                = "OU=User,OU=Demotenant,DC=lan,DC=demotenant,DC=de"
    }
    $MyParameter = @{
        Name                = "$($User.Vorname) $($User.Nachname)"
        Surname             = $User.Nachname
        GivenName           = $User.Vorname
        UserPrincipalName   = "$($User.Vorname).$($User.Nachname)@demotenant.de" 
        Department          = $User.Abteilung 
        Company             = "Demotenant" 
    }
    New-ADUser @MyParameter @DefaultValues
}
```

#### Pass additional parameters manually

If you splat parameters to a cmdlet, you do not have to splat exclusively. You can still pass parameters directly. For example, in the following example I did not define the `Department` parameter in the hashtable and instead passed it directly to the cmdlet:

```powershell {hl_lines="13"}
$CSVFile = Import-Csv .\NeueUser.csv

foreach($User in $CSVFile) {
    $Manager = Get-ADUser -Filter "mail -eq '$($User.Manager)'"
    $MyParameter = @{
        Name                = "$($User.Vorname) $($User.Nachname)"
        Surname             = $User.Nachname
        GivenName           = $User.Vorname
        UserPrincipalName   = "$($User.Vorname).$($User.Nachname)@demotenant.de" 
        Company             = "Demotenant" 
        Path                = "OU=User,OU=Demotenant,DC=lan,DC=demotenant,DC=de"
    }
    New-ADUser @MyParameter -Department "IT Department"
}
```

#### Splat values override

In PowerShell 7, you can also override a splatted value manually. A parameter specified directly takes precedence. That does not work in Windows PowerShell. In the following example, I override the `Company` value directly on the cmdlet, so the value from the hashtable is ignored. All other splatted values are still used.

```powershell {hl_lines="14"}
$CSVFile = Import-Csv .\NeueUser.csv

foreach($User in $CSVFile) {
    $Manager = Get-ADUser -Filter "mail -eq '$($User.Manager)'"
    $MyParameter = @{
        Name                = "$($User.Vorname) $($User.Nachname)"
        Surname             = $User.Nachname
        GivenName           = $User.Vorname
        UserPrincipalName   = "$($User.Vorname).$($User.Nachname)@demotenant.de" 
        Department          = $User.Abteilung 
        Company             = "Demotenant" 
        Path                = "OU=User,OU=Demotenant,DC=lan,DC=demotenant,DC=de"
    }
    New-ADUser @MyParameter -Company "diecknet"
}
```

#### Array instead of hashtable

In theory, you do not even need to use a hashtable. An array would also work. However, an array does not have names for entries. They are simply numbered from 0 to infinity. That means this only works for positional parameters. Let us take a different command. The `New-ADGroup` cmdlet can create new groups in Active Directory. And the command supports two positional parameters. The first is the name of the group and the second is the GroupScope. With that knowledge, we can splat as follows:

```powershell
$MeinArray = "My funny Group", "DomainLocal"
New-ADGroup @MeinArray
```

Of course, I could also specify additional parameters directly here, or theoretically also splat an additional hashtable. But then I could just have used a hashtable from the start 😒.

In general, I would actually always use a hashtable rather than an array for splatting, because it is simply easier to understand when the parameter names are visible.

## Conclusion

I hope this helped you make your PowerShell code a little easier to read. I personally find the hashtable syntax nicer, but the backtick method also has its place.
