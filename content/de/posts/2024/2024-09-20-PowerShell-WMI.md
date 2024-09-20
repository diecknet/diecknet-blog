---
slug: "powershell-wmi"
title: "WMI in PowerShell verwenden"
date: 2024-09-20
comments: true
tags: [powershell]
---

WMI ist eine mächtige Schnittstelle um Windows Systeme zu verwalten. Dadurch ist der Zugriff auf Dinge möglich, für die es vielleicht sonst gar keine eigenen PowerShell Cmdlets gibt. Teilweise können wir so mehr Infos abrufen, als die Standard-Cmdlets liefern. Das geht sowohl lokal, als auch remote.

## Deprecated: Die alten WMI Cmdlets

Es gibt ein paar ältere Cmdlets, die allerdings für Neuentwicklungen nicht empfohlen werden. Aber vielleicht stoßt ihr in älteren Skripten mal darüber, also jetzt habt ihr schon mal davon gehört - die existieren zumindest.

```powershell
Get-Command -Noun WMI*

<# Ausgabe:

CommandType     Name                                               Version    Source
-----------     ----                                               -------    ------
Cmdlet          Get-WmiObject                                      3.1.0.0    Microsoft.PowerShell.Management
Cmdlet          Invoke-WmiMethod                                   3.1.0.0    Microsoft.PowerShell.Management
Cmdlet          Register-WmiEvent                                  3.1.0.0    Microsoft.PowerShell.Management
Cmdlet          Remove-WmiObject                                   3.1.0.0    Microsoft.PowerShell.Management
Cmdlet          Set-WmiInstance                                    3.1.0.0    Microsoft.PowerShell.Management

#>
```

## CIM Cmdlets

Stattdessen macht es Sinn, bei Neuentwicklungen auf die CIM Cmdlets zu setzen. CIM steht für "Common Information Model" und ist quasi der eigentliche technische Standard. Und WMI ist die CIM Implementierung von Microsoft, die den Standard dann teilweise noch ein bisschen erweitert.

```powershell
Get-Command -Module CimCmdlets

<# Ausgabe

CommandType     Name                                               Version    Source
-----------     ----                                               -------    ------
Cmdlet          Export-BinaryMiLog                                 1.0.0.0    CimCmdlets
Cmdlet          Get-CimAssociatedInstance                          1.0.0.0    CimCmdlets
Cmdlet          Get-CimClass                                       1.0.0.0    CimCmdlets
Cmdlet          Get-CimInstance                                    1.0.0.0    CimCmdlets
Cmdlet          Get-CimSession                                     1.0.0.0    CimCmdlets
Cmdlet          Import-BinaryMiLog                                 1.0.0.0    CimCmdlets
Cmdlet          Invoke-CimMethod                                   1.0.0.0    CimCmdlets
Cmdlet          New-CimInstance                                    1.0.0.0    CimCmdlets
Cmdlet          New-CimSession                                     1.0.0.0    CimCmdlets
Cmdlet          New-CimSessionOption                               1.0.0.0    CimCmdlets
Cmdlet          Register-CimIndicationEvent                        1.0.0.0    CimCmdlets
Cmdlet          Remove-CimInstance                                 1.0.0.0    CimCmdlets
Cmdlet          Remove-CimSession                                  1.0.0.0    CimCmdlets
Cmdlet          Set-CimInstance                                    1.0.0.0    CimCmdlets

#>
```

Auch wenn da nur im Namen nur CIM steht und nicht WMI - damit können wir auf WMI zugreifen.

## WMI Daten abfragen

Es gibt verschiedene Möglichkeiten Infos per WMI abzufragen. Zum Beispiel mit der WMI Query Language kurz WQL - eine Art von SQL. Es gibt *einfachere* Wege um Infos per WMI abzufragen, aber WMI Queries wurden z.B. gerne in alten VB-Skripten verwendet, oder auch bei WMI Filtern für Gruppenrichtlinien. Wenn ihr also bereits einen WMI Query habt, dann könnt ihr den einfach in PowerShell weiterverwenden.

Eine Abfrage mit einem WMI Query könnt ihr mit dem Cmdlet `Get-CimInstance` ausführen.

```powershell
Get-CimInstance -Query "Select * from Win32_BIOS"
```

Das bedeutet im Grunde: Zeige mir alle Eigenschaften von allen Instanzen der Klasse `Win32_BIOS`.

Eine etwas PowerShelligere Möglichkeit um WMI abzufragen, wäre so:

```powershell
Get-CimInstance -ClassName Win32_BIOS
```

Bei beiden Varianten werden alle Eigenschaften zurückgeliefert - auch wenn das nicht sofort ersichtlich ist. Mit einer pipe zu `| Select-Object *` könnten alle Eigenschaften des zurückgelieferten Objekts sichtbar gemacht werden. Aber in der PowerShell gilt der Grundsatz: Wenn es möglich und sinnvoll ist, sollte soweit links wie es geht gefiltert werden. Das bezieht sich sowohl auf die Auswahl von Objekten, als auch auf die Auswahl der Objekteigenschaften.
Für die Auswahl der Objekteigenschaften können wir den Parameter `-Property` verwenden. Also z.B.:

```powershell
Get-CimInstance -ClassName Win32_Bios -Property ReleaseDate
```

Jetzt kann ich alles mögliche mit den abgerufenen Eigenschaften machen. Beispielsweise die Rückgabe in eine Variable laden oder direkt auf einzelne Eigenschaften der Rückgabe zugreifen.

```powershell
# WMI Daten in Variable ausgeben und die Variable ausgeben
$BIOSInfos = Get-CimInstance -ClassName Win32_Bios -Property ReleaseDate
$BiosInfos

# WMI Daten in der Pipeline verarbeiten und nur die Eigenschaft "ReleaseDate" ausgeben
Get-CimInstance -ClassName Win32_Bios -Property ReleaseDate | Select-Object -ExpandProperty ReleaseDate

# WMI Daten inline in einem anderen Cmdlet abfragen und als Parameterwert verwenden
New-TimeSpan -Start (Get-CimInstance -ClassName Win32_Bios -Property ReleaseDate).ReleaseDate -End (Get-Date)
```

## WMI Daten filtern

Wenn ihr bei einer WMI Abfrage genauer filtern möchtet, dann geht das wahlweise mit einem kompletten WMI Query, oder mit dem `-Filter` Parameter. Die Syntax von WMI Filtern ist anders als sonst in PowerShell. Meiner Meinung nach eigentlich sogar ein bisschen intuitiver. Aber wenn man die ganze Zeit PowerShell verwendet, dann ist es doch wieder etwas ungewohnt.

Es gibt die einfachen Vergleichsoperatoren:

| Operator       | Description              |
|----------------|--------------------------|
| =              | Equal to                 |
| <           | Less than                |
| >           | Greater than             |
| <=          | Less than or equal to    |
| >=          | Greater than or equal to |
| != or <> | Not equal to             |

Siehe dazu: <https://learn.microsoft.com/en-us/windows/win32/wmisdk/wql-operators>

Und auch den `LIKE` Operator für eine Platzhaltersuche. Siehe dazu: <https://learn.microsoft.com/en-us/windows/win32/wmisdk/like-operator>

```powershell
# Filtern mit Vergleichsoperator "Equal to" 
Get-CimInstance Win32_service -Filter "Name = 'wuauserv'"

# Filtern mit LIKE Operator
Get-CimInstance Win32_Service -Filter "Caption LIKE 'Windows%'"
```

Mit WQL geht noch weitaus mehr, ich habe aber das bisher noch nicht wirklich gebraucht. Falls ihr euch dafür interessiert, schaut mal in die Dokumentation bei Microsoft: <https://learn.microsoft.com/en-us/windows/win32/wmisdk/wql-sql-for-wmi>

## Verknüpfte Instanzen

Was auch noch hilfreich sein kann: Verknüpfte Klassen - beziehungsweise eigentlich asoziierte Instanzen.
Zum Beispiel rufe ich mir erstmal alle physischen Netzwerkkarten an meinem Gerät ab:

```powershell
# Nur physische Netzwerkkarten abrufen:
Get-CimInstance Win32_NetworkAdapter -Filter "PhysicalAdapter = 1"
```

Anschließend pipe ich mir das in `Get-CimAssociatedInstance` um alle damit zusammenhängenden Instanzen zu sehen:

```powershell
Get-CimInstance Win32_NetworkAdapter -Filter "PhysicalAdapter = 1" | Get-CimAssociatedInstance
```

Anhand der Daten die jetzt ausgegeben werden, kann ich vielleicht ja schon sehen, dass hier etwas interessantes vorliegt. Ansonsten können wir uns diese Ausgabe auch noch an `Select-Object` pipen, um z.B. nur die Namen der Klassen zu sehen:

```powershell
Get-CimInstance Win32_NetworkAdapter -Filter "PhysicalAdapter = 1" | Get-CimAssociatedInstance | Select-Object CimClass
```

Oder um alle Eigenschaften zu sehen, die waren nämlich vorher nicht alle zu sehen:

```powershell
Get-CimInstance Win32_NetworkAdapter -Filter "PhysicalAdapter = 1" | Get-CimAssociatedInstance | Select-Object *
```

Wenn wir dadurch herausgefunden haben, dass uns eine bestimmte Klasse interessiert, dann können wir unseren ursprünglichen Abruf von `Get-CimAssociatedInstance` anpassen und nur noch diese eine Klasse dadurch abrufen:

```powershell
Get-CimInstance Win32_NetworkAdapter -Filter "PhysicalAdapter = 1" | Get-CimAssociatedInstance -ResultClassName Win32_NetworkAdapterConfiguration
```

Dadurch konnte ich mir jetzt die Netzwerkkonfiguration für eine bestimmte Netzwerkkarte in meinem Computer anzeigen lassen.

## Remote WMI

Am einfachsten geht Remote WMI, wenn unser aktuell angemeldeter User auch Admin-Rechte auf dem Remote System hat. Zum Beispiel:

```powershell
Get-CimInstance -ClassName Win32_Desktop -ComputerName CL5
```

Alternativ können wir eine separate CimSession aufbauen und dabei dann andere Zugangsdaten angeben.

```powershell
# Credentials abfragen
$Credential = Get-Credential
# CIM Session aufbauen
$CimSession = New-CimSession -ComputerName CL5 -Credential $Credential

# CIM/WMI Abfrage ausführen
Get-CimInstance -ClassName Win32_Desktop -CimSession $CimSession | Select-Object Name,Wallpaper
```

Wenn ihr mehrere WMI Aktionen gegen ein Remote System ausführen wollt, dann ist es übrigens effizienter, erstmal eine Session aufzubauen und dann die ganzen Befehle mit dem `-CimSession` Parameter auszuführen. Wenn bei `Get-CimInstance` der `-ComputerName` Parameter genutzt wird, dann wird nämlich jedes mal neu eine Verbindung aufgebaut, sich authentifiziert, der Befehl ausgeführt und am Ende die Verbindung beendet. Eine CimSession hingegen besteht weiter, bis sie aktiv beendet wird.

### WSMAN und DCOM

WMI Remoting mit den CIM Befehlen verwendet im Hintergrund standardmäßig das WSMAN Protokoll. Falls Remote WMI bei euch noch nicht direkt funktioniert, dann könnt ihr es mit dem Cmdlet `Enable-PSRemoting` aktivieren. Die [älteren WMI-Cmdlets](#deprecated-die-alten-wmi-cmdlets) verwenden übrigens DCOM statt WSMAN, was aber unter modernen Systemen im Standard von der Windows Firewall blockiert wird. Es wäre aber auch mit den CIM-Cmdlets möglich DCOM zu verwenden, falls es nötig ist. Die Details dazu findet ihr bei [Microsoft Learn](https://learn.microsoft.com/en-us/powershell/scripting/learn/ps101/07-working-with-wmi?view=powershell-7.4).

### Mehrere Remote Systeme

Es ist auch möglich mit mehreren remote Systemen aufeinmal zu arbeiten. Dazu müsst ihr zunächst einmal mehrere CimSessions aufbauen, und sie dann an `Get-CimInstance` übergeben.

```powershell
$CimSession1 = New-CimSession -ComputerName CL5 -Credential (Get-Credential)
$CimSession2 = New-CimSession -ComputerName DC2 -Credential (Get-Credential)

Get-CimInstance -ClassName Win32_Desktop -CimSession $CimSession1,$CimSession2 | Select-Object Name,Wallpaper
```

### Verbindung trennen

Wenn ihr eure Remotetätigkeiten abgeschlossen habt, dann solltet ihr auch die Verbindungen wieder trennen. Am einfachsten geht das per:

```powershell
Get-CimSession | Remove-CimSession
```

## WMI Methoden ausführen

Mit WMI können wir aber nicht nur Infos abrufen, sondern auch Methoden ausführen. Teilweise überschneiden die sich inhaltlich auch mit normalen PowerShell Cmdlets oder mit Methoden die per .NET verfügbar sind. Es kann aber auch sein, dass genau die Sache die ihr machen wollt, nur per WMI verfügbar ist.

Zum Beispiel rufe ich mir erstmal eine CIM Instanz ab, die sich auf einen bestimmten Drucker bezieht. Anschließend pipe ich die Instanz an `Invoke-CimMethod` um den Drucker als Standarddrucker zu definieren.

```powershell
# Standarddrucker per WMI setzen: Mit 2 Cmdlets
Get-CimInstance -ClassName Win32_Printer -Filter "Name = 'Microsoft XPS Document Writer'" | Invoke-CimMethod -MethodName SetDefaultPrinter
```

Ich musste jetzt hier zwei Cmdlets verwenden, weil `Invoke-CimMethod` nicht den `-Filter` Parameter unterstützt, der bei `Get-CimInstance` verfügbar ist. Ich *könnte* aber den `-Query` Parameter verwenden und einen WMI Query angeben, das hingegen wird von `Invoke-CimMethod` unterstützt.

```powershell
# Standarddrucker per WMI setzen: Nur 1 Cmdlet
Invoke-CimMethod -Query "SELECT * FROM Win32_Printer WHERE Name = 'Microsoft XPS Document Writer'" -MethodName SetDefaultPrinter
```

Es muss aber auch nicht unbedingt eine bestimmte WMI Objektinstanz angesprochen werden. Einige Klassen unterstützen auch direkte Methodenaufrufe. Zum Beispiel:

```powershell
# Prozess starten per WMI
Invoke-CimMethod -ClassName Win32_Process -MethodName "Create" -Arguments @{CommandLine = 'notepad.exe'}
```

### WMI Remote Methodenaufrufe

Grundsätzlich unterstützt `Invoke-CimMethod` auch das zuvor gezeigte Remoting. Also auch hier könnte wahlweise `-ComputerName` oder `-CimSession` verwendet werden.

```powershell
# Beispiel für einen remote WMI Methodenaufruf
$MeineSession = New-CimSession -Credential (Get-Credential) -ComputerName dc2
Invoke-CimMethod -ClassName Win32_Process -MethodName "Create" -Arguments @{CommandLine = 'notepad.exe'} -CimSession $MeineSession
```

**Wichtig**: Wenn Prozesse remote gestartet werden, laufen die nicht sichtbar auf dem Desktop. Im Task Manager, oder zum Beispiel per `Get-Process` könnte man erkennen, dass die Prozesse laufen. Für das Beispiel `notepad.exe` ist das vielleicht nicht so sinnvoll, für andere Prozesse aber schon ✌️

### WMI Methoden herausfinden

Wenn ihr schon eine WMI-Objektinstanz habt, dann könnt ihr direkt in der PowerShell schauen, welche Methoden zur Verfügung stehen:

```powershell
# Laufende notepad.exe Prozesse per WMI finden:
$MeineCIMInstanz = Get-CimInstance Win32_Process -Filter "Name = 'notepad.exe'"

# Mit Get-Member können wir die leider NICHT sehen,
# da sie nicht als direkte Objektmethoden in PowerShell zur Verfügung stehen
$MeineCIMInstanz | Get-Member

# Stattdessen können wir auf die Eigenschaft CimClass.CimClassMehotds zugreifen
$MeineCIMInstanz.CimClass.CimClassMethods
```

## WMI Objektinstanzen löschen

Es gibt auch noch das Cmdlet `Remove-CimInstance` mit der WMI Objektinstanzen gelöscht werden *können*. Das ist in der Regel ein ⚠️ **destruktiver Vorgang** ⚠️, bei dem nicht einfach nur die Repräsentation des Objekts in der PowerShell entfernt wird, sondern das tatsächliche dahinterliegende Objekt wird zerstört. Also z.B. wenn ich die Objektinstanz eines laufenden Prozesses lösche, dann wird der Prozess beendet.

```powershell {hl_lines=[5]}
# Laufende notepad.exe Prozesse per WMI finden:
Get-CimInstance Win32_Process -Filter "name = 'notepad.exe'"

# Laufende notepad.exe Prozesse per WMI finden UND BEENDEN:
Get-CimInstance Win32_Process -Filter "name = 'notepad.exe'" | Remove-CimInstance
```

Was genau passiert, kommt natürlich auf die konkrete Klasse an. Aber am besten verwendet ihr das `Remove-CimInstance` Cmdlet mit äußerster Vorsicht.

## WMI Klassen, Eigenschaften und Methoden herausfinden

Um alle WMI Klassen aufzulisten, die es am System gibt, könnt ihr das Cmdlet `Get-CimClass` verwenden. Je nach System sind das auch unterschiedlich viele, aber auf einem modernen Windows 11 System locker über 2000. Und die ein oder andere Hard- oder Software bringt noch eigene Klassen mit.

```powershell
# Klassen auflisten
Get-CimClass

# Klassen zählen
Get-CimClass | Measure-Object
```

Zu den Namen der Klassen:

- Fängt mit `__` an: Systemklasse
- Fängt mit `MSFT` an: Systemklasse
- Fängt mit `CIM` an: Basis CIM Klasse (meist gibt es eine bessere `Win32` Klasse als Alternative)
- ⭐ Fängt mit `Win32` an: Erweiterte WMI Klasse (basiert auf CIM Standard-Klassen)
- Fängt mit `Win32_Perf` an: Performance Counter Klasse
- Fängt mit `Win32_PnPDevice` an: Plug and Play Device Klasse
- ⭐ Fängt komplett anders an: Könnte auch interessant sein

Siehe dazu auch: <https://learn.microsoft.com/en-us/windows/win32/wmisdk/wmi-classes>

Es gibt teilweise `CIM` und `Win32` Klassen die sich inhaltlich überschneiden. In der Regel ist die `Win32` Klasse dann mächtiger. Zum Beispiel hat die Klasse `Win32_Process` bei mir 45 Properties und 7 Methoden, im Gegensatz zur `CIM_Process` Klasse, die nur 18 Properties und gar keine Methoden hat.

Die Methoden und Eigenschaften einer Klasse sind in den Eigenschaften `CimClassMethods` und `CimClassProperties` aufgeführt.

```powershell
# Eigenschaften und Methoden der CIM_Process Klasse zählen:
Get-CimClass -ClassName Cim_Process | Select-Object -ExpandProperty CimClassProperties | Measure-Object
Get-CimClass -ClassName Cim_Process | Select-Object -ExpandProperty CimClassMethods | Measure-Object

# Eigenschaften und Methoden der Win32_Process Klasse zählen:
Get-CimClass -ClassName Win32_Process | Select-Object -ExpandProperty CimClassProperties | Measure-Object
Get-CimClass -ClassName Win32_Process | Select-Object -ExpandProperty CimClassMethods | Measure-Object
```

Ich bevorzuge es aber, mir die Infos in der offiziellen Dokumentation anzuschauen. Wenn ich einfach nach `Win32_Process` in einer Suchmaschine suche, dann lande ich schnell bei der [richtigen Dokumentation](https://learn.microsoft.com/en-us/windows/win32/cimwin32prov/win32-process). Vorteil ist: Dort gibt es in der Regel auch Beschreibungen und Beispiele für die Eigenschaften und Methoden.

### WMI Namespaces

Wie euch vielleicht bei der Rückgabe von `Get-CimClass` aufgefallen ist: Über der Liste der Ergebnisse steht noch: "NameSpace: ROOT/cimv2".

Die Klassen sind in sogenannten Namespaces einsortiert - so ähnlich wie Ordner im Dateisystem. Zusätzliche Hard- oder Softwares bringen teilweise eigene Namespaces mit, in denen dann zusätzliche WMI Klassen drin sind. `root/cimv2` ist einfach der Standard Namespace von Windows. Und wenn wir `Get-CimClass` ohne weitere Parameter aufrufen, dann werden uns nur die Klassen in diesem Standard Namespace aufgelistet. Es gibt aber noch mehr Namespaces.
Die Definition der Namespaces kann ich über die System Klasse `__Namespace` abrufen, muss aber auch mit angeben, dass ich diese Definition im Namespace `root` ansehen möchte (ohne `cimv2`, das ist nämlich schon ein Unter-Namespace von `root`):

```powershell
Get-CimInstance __NAMESPACE -Namespace root
```

Auf einem Domänencontroller habe ich auch schon andere Namespaces als auf einem Windows 11 Client. Zum Beispiel gibt es auf meinem DC den Namespace `MicrosoftActiveDirectory`.

```powershell
# Infos zur Klasse MicrosoftActiveDirectory im Namespace root abrufen:
Get-CimClass -Namespace root/MicrosoftActiveDirectory
```

Tatsächlich können Namespaces auch noch weitere Namespaces enthalten. Zum Beispiel sind im Standard Namespace `root/cimv2` auch noch weitere Unter-Namespaces vorhanden.
Mit einer kleinen selbstgeschriebenen Funktion können wir uns alle Namespaces auflisten.

```powershell
function Get-CimNamespace {
    # Funktion um CIM Namespaces rekursiv abzurufen
    param($NameSpace = "root")

    foreach($thisNamespace in (Get-CimInstance __NAMESPACE -Namespace $NameSpace)) {
        ($SubNameSpace = "{0}\{1}" -f $NameSpace,$thisNamespace.Name) # this line sets the var and also outputs it ;)
        Get-CimNamespace -NameSpace $SubNameSpace
    }
    
}
# Alle Namespaces in eine Variable laden
$AllCimNameSpaces = Get-CimNamespace

"Found $($AllCimNameSpaces.Count) NameSpaces."
$AllCimNameSpaces

# Alle Klassen aus allen Namespaces abrufen:
$AllCimClasses = $AllCimNameSpaces | ForEach-Object { Get-CimClass -Namespace $_ }
"Found $($AllCimClasses.Count) Classes:"
$AllCimClasses

# Doppelte Klassen herausfiltern und das Ergebnis zählen:
$AllCimClasses | Sort-Object -Property CimClassName -Unique | Measure-Object
```

Generell spielt sich - meiner Meinung nach - aber auch viel wichtiges in dem Standard Namespace `root/cimv2` ab. Aber das kommt natürlich darauf an, was ihr mit WMI gerade machen wollt.

### WMI Klassen finden

Falls ihr noch nicht wisst, welche Klasse ihr braucht, könnt ihr mit `Get-CimClass` auch suchen. Wenn ihr vermutet, dass der Name der Klasse ein bestimmtes Wort enthält, könnt ihr Wildcards verwenden und suchen:

```powershell
# Suche nach WMI/CIM Klassen die "process" im Namen haben
Get-CimClass -ClassName *process*

# Suche nach WMI/CIM Klassen, bei denen es eine Methode gibt,
# die "reboot" im Namen hat
Get-CimClass -MethodName *reboot*

# Suche nach WMI/CIM Klassen, bei denen es eine Property gibt,
# die "wallpaper" im Namen hat
Get-CimClass -PropertyName *wallpaper*
```

Ansonsten gibt es auch noch grafische Tools die dabei helfen können, wie z.B. den [WMI Explorer von Vinay Pamnani](https://github.com/vinaypamnani/wmie2).
