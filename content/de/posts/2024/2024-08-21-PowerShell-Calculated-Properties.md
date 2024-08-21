---
slug: "powershell-calculated-properties"
title: "PowerShell Calculated Properties"
subtitle: "Eigenschaften per Select-Object formatieren"
date: 2024-08-21
comments: true
tags: [powershell]
---
Wenn ihr per PowerShell Daten exportiert (zum Beispiel in eine CSV-Datei per `Export-CSV`), dann werden die originalen Eigenschaftsnamen von den PowerShell Objekten verwendet. Wenn die aber nicht ganz passend für euren Zweck sind, dann könnt ihr sie auch anpassen. Dafür können sogenannte "Calculcated Properties" und das Cmdlet `Select-Object` verwendet werden.

Damit können zum Beispiel:

- Eigenschaften umbenannt werden
- Eigenschaftswerte formatiert werden
- Komplett eigene Eigenschaften erzeugt werden (z.B. durch den Aufruf zusätzlicher Cmdlets)

## Objekte normal ausgeben

Zur Erinnerung: Die Auswahl von Objekteigenschaften bei `Select-Object` ist mit dem Parameter `-Property` möglich. Wobei der Parameter in der Regel auch nicht explizit benannt werden muss.

```powershell
# Alle Windows Dienste auflisten; nur die Eigenschaften Name und Status zeigen
Get-Service | Select-Object -Property Name, Status

# Alternativ ohne -Property explizit zu nennen
Get-Service | Select-Object Name, Status
```

## Eigenschaft umbenennen

Um eine Eigenschaft umzubennen, müssen wir eine Hashtable statt eines einfachen Parameternamens angeben.
Die Hashtable hat zwei Einträge:

|Bezeichner|Bedeutung|
|---|---|
|`Name` (oder `Label`)|Name der neuen Eigenschaft|
|`Expression`|Scriptblock, der den Wert erzeugt|

Beispielsweise um die Eigenschaft "Dienstname" zu erzeugen, die den Namen eines Windows Dienstes enthält:

```powershell
Get-Service | Select-Object @{Name = "Dienstname"; Expression = { $_.Name } }, Status

# Rückgabe
Dienstname      Status
----------      ------
[...]
wuauserv        Stopped
[...]
```

Zusätzlich können normale Parameter auch verwendet werden. In diesem Beispiel habe ich auch noch die Eigenschaft "Status" mit ausgegeben.

## String Eigenschaft formatieren / mehrere Eigenschaften zusammenfassen

Aber wir können Eigenschaften nicht nur umbenennen, sondern auch beliebig formatieren. Zum Beispiel, wenn ich möchte, dass in einer Eigenschaft sowohl der Anzeigename, als auch der interne Name eines Windows Dienstes angezeigt wird.

```powershell
Get-Service | Select-Object -Property @{Name = "Dienstname"; Expression = { "$($_.DisplayName) ($($_.Name))" } }, Status

# Rückgabe:
Dienstname                                      Status
----------                                      ------
[...]
Windows Update (wuauserv)                      Stopped
[...]
```

## If-Abfrage einbauen

Es ist auch möglich, Logik mit einer If-Abfrage zu integrieren. Zum Beispiel wird hier geprüft, ob ein Active Directory User Mitglied in einer Sicherheitsgruppe ist, die dem Wildcard Muster `*VIP-User*` entspricht. Falls dem so ist, wird "Ja" in die neue Eigenschaft "VIP" hineingeschrieben. Falls nicht, wird stattdessen "Nein" hineingeschrieben.

```powershell
$User = Get-ADUser -Property MemberOf -Filter *
$User | Select-Object -Property UserPrincipalName, @{Name = "VIP"; Expression = { if ($_.MemberOf -like "*VIP-User*") { "Ja" } else { "Nein" } } }

# Rückgabe
UserPrincipalName                                                           VIP
-----------------                                                           ---
[...]
testuser12345@demotenant.de                                                 Nein
alexw@demotenant.de                                                         Ja
andreas.dieckmann@demotenant.de                                             Nein
soenderzoichuenss@demotenant.de                                             Ja
[...]
```

## Zusätzliche Cmdlets verwenden

Abgesehen von If-Abfragen können wir auch ganze Cmdlets verwenden, um zusätzliche Informationen abzufragen.
In diesem Beispiel verwende ich erstmal `Get-ADUser`, um alle User in einer Organisationseinheit im Active Directory aufzulisten. Anschließend möchte ich den jeweiligen Manager (Vorgesetzten) von den Usern auflisten.

```powershell
$User = Get-ADUser -Property Manager -Filter * -Searchbase "OU=User,OU=DemoTenant,DC=lan,DC=demotenant,DC=de"
# Normale Auflistung der Manager
$User | Select-Object -Property Name, Manager

# Rückgabe
Name              Manager
----              -------
Adam Steward      CN=Charles Walker,OU=User,OU=DemoTenant,DC=lan,DC=demotenant,DC=de
Charles Walker    CN=Andreas Dieckmann,OU=User,OU=DemoTenant,DC=lan,DC=demotenant...
Alex Wilber       CN=Charles Walker,OU=User,OU=DemoTenant,DC=lan,DC=demotenant,DC=de
Andreas Dieckmann
Söndèr Zöichünß   CN=Charles Walker,OU=User,OU=DemoTenant,DC=lan,DC=demotenant,DC=de
```

Im Standard wird uns hier der "Distinguished Name" (DN) des Managers aufgelistet. Nicht besonders ansehlich. Aber wir können in der Expression für die Calculated Property ein weiteres mal `Get-ADUser` ausführen, um Infos zu dem Manager zu erhalten.

```powershell
$User = Get-ADUser -Property Manager -Filter * -Searchbase "OU=User,OU=DemoTenant,DC=lan,DC=demotenant,DC=de"
$User | Select-Object -Property Name, @{Name = "Manager"; Expression = {
        if ($_.Manager) {
            (Get-ADUser $_.Manager).Name
        } else {
            "*niemand*"
        }
    }
}

# Rückgabe
Name              Manager
----              -------
Adam Steward      Charles Walker
Charles Walker    Andreas Dieckmann
Alex Wilber       Charles Walker
Andreas Dieckmann *niemand*
Söndèr Zöichünß   Charles Walker
```

In diesem Beispiel habe ich die Expression auch auf mehrere Zeilen aufgeteilt. Das ist problemlos möglich, da sie eindeutig erkennbar mit `{`geschweiften Klammern`}` umschlossen ist.

Übrigens: Falls ihr in der Konsole arbeitet, könnt ihr auch `[Umschalt] + [Enter]` drücken, um in einer neuen Zeile weiter zu schreiben, ohne den Befehl bereits auszuführen.

## Array zu String umwandeln

Falls ihr eine Objekteigenschaft exportieren wollt, die aus einem Array besteht, funktioniert der Export normalerweise nicht so gut. In der Konsole sind die Werte in der Array-Eigenschaft mit `{`geschweiften Klammern`}` umschlossen. Zum Beispiel frage ich hier alle Domain Controller in meinem Active Directory ab und lasse die FSMO-Rollen auflisten.

```powershell
Get-ADDomainController | Select-Object Name,OperationMasterRoles

# Rückgabe
Name OperationMasterRoles
---- --------------------
DC2  {SchemaMaster, DomainNamingMaster, PDCEmulator, RIDMaster...}
```

In meiner Konsole wurde die Ausgabe sogar ein bisschen abgeschnitten, sodass ich gar nicht alle Rollen sehe. Wenn ich versuche ein derartiges Array per `Export-CSV` zu exportieren, ist das Ergebnis im Standard komplett unbrauchbar:

```powershell
Get-ADDomainController | Select-Object Name,OperationMasterRoles | Export-Csv c:\diecknet\ad.csv
Get-Content C:\diecknet\ad.csv

# Rückgabe
"Name","OperationMasterRoles"
"DC2","Microsoft.ActiveDirectory.Management.ADPropertyValueCollection"
```

Das Array wurde also nicht zu einem String umgewandelt, sondern stattdessen steht dort `Microsoft.ActiveDirectory.Management.ADPropertyValueCollection`.

Die Lösung: Calculated Properties und der `-join` Operator. Im folgenden Beispiel werden die Einträge im Array zu einem String zusammengeführt und jeweils mit einem Leerzeichen und Komma getrennt (`, `).

```powershell
Get-ADDomainController | Select-Object Name,@{Label="FSMO-Rollen";Expression={$_.OperationMasterRoles -join ", "}}

# Rückgabe
Name FSMO-Rollen
---- -----------
DC2  SchemaMaster, DomainNamingMaster, PDCEmulator, RIDMaster, InfrastructureMaster
```

## Weitere Tipps und Hinweise

Hier noch ein paar allgemeine Tipps und Hinweise zu Calculated Properties.

### Name VS. Label

Vielleicht ist euch im vorherigen Beispiel aufgefallen, dass ich auf einmal `@{Label=` statt `@{Name=` in der Hashtable verwendet habe. Tatsächlich sind hier `Name` und `Label` beliebig miteinander austauschbar. Es geht beides, macht keinen Unterschied.

```powershell
# Beides Varianten erzeugen das gleiche Ergebnis
Get-ADDomainController | Select-Object Name,@{Label="FSMO-Rollen"; Expression={$_.OperationMasterRoles -join ", "}}
Get-ADDomainController | Select-Object Name,@{Name="FSMO-Rollen"; Expression={$_.OperationMasterRoles -join ", "}}
```

### Lesbarkeit erhöhen mit Hashtable Splatting

[Im Abschnitt "Zusätzliche Cmdlets verwenden"](#zusätzliche-cmdlets-verwenden) hatte ich ja den Expression Scriptblock auch schon mal aufgeteilt auf mehrere Zeilen. Eine weitere Möglichkeit die Lesbarkeit zu erhöhen ist das Splatting. Dabei werden die Cmdlet Parameter in eine Hashtable geschrieben.

Im folgenden Beispiel habe ich die Hashtable-Variable für die Formatierung der Einfachheit halber auch `$Formatierung` genannt. Der Name ist aber natürlich frei wählbar. In der Hashtable gibt es dann den Key `Property`, der wiederum ein Array ist. In diesem Array müssen die Properties stehen, die ausgegeben werden sollen. Ich habe hier zwei weitere Hashtables verwendet (Calculated Properties) und einen String (normale Property vom Objekt). 

```powershell
$Formatierung = @{
    Property = (
        @{
            Name       = "Dienstname"
            Expression = { $_.Name }
        },
        @{
            Name       = "Dienststatus"
            Expression = { $_.Status }
        },
        # Wichtig: Normale Eigenschaften müssen in der Hashtable in Anführungszeichen stehen!
        "StartType" # Beispiel für normale Eigenschaft (keine Calculated Property)
    )
}
Get-Service | Select-Object @Formatierung

# Rückgabe
Dienstname Dienststatus StartType
---------- ------------ ---------
[...]
wuauserv        Running    Manual
[...]
```

### Kurzform der Hashtable Namen erlaubt

Statt der vollständig ausgeschriebenen Hashtable-Keys `Name`/`Label` und `Expression` können auch die Kurzschreibweisen `N`,`L` und `E` verwendet werden.

```powershell
# Normale Schreibweise
Get-Service | Select-Object -Property @{Name = "Dienstname"; Expression = { $_.Name } }, Status
# Kurze Schreibweise
Get-Service | Select-Object -Property @{N = "Dienstname"; E = { $_.Name } }, Status
Get-Service | Select-Object -Property @{L = "Dienstname"; E = { $_.Name } }, Status
```

### Das Label ist eigentlich optional

Tatsächlich ist das Label beziehungsweise der Name optional. Es wäre auch möglich **keine** Hashtable zu verwenden, sondern einfach nur einen Scriptblock für die Calculated Property anzugeben. In dem Fall erhält die Calculated Property aber den ScriptBlock als Namen, was komisch aussieht. Ich würde das nicht empfehlen.

```powershell
Get-ADDomainController | Select-Object Name,{$_.OperationMasterRoles -join ", "}

# Rückgabe
Name $_.OperationMasterRoles -join ", "
---- ----------------------------------
DC2  SchemaMaster, DomainNamingMaster, PDCEmulator, RIDMaster, InfrastructureMaster
```