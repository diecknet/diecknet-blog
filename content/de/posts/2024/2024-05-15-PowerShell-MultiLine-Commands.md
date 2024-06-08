---
slug: "powershell-multiline-commands"
title: "PowerShell Befehle auf mehrere Zeilen aufteilen"
subtitle: "... um die Lesbarkeit zu erhöhen"
date: 2024-05-15
comments: true
tags: [powershell]
---
PowerShell Befehle mit vielen Parametern können die Lesbarkeit vom Code verschlechtern. Zum Beispiel habe ich im nachfolgenden Codeabschnitt in Zeile 5 das Cmdlet `New-ADUser` verwendet und dabei 7 Parameter angegeben. Das ist sehr schwer auf einer Zeile zu lesen, selbst wenn ihr einen Ultra-Wide Monitor verwendet.

```powershell {hl_lines=5}
$CSVFile = Import-Csv .\NeueUser.csv

foreach($User in $CSVFile) {
    $Manager = Get-ADUser -Filter "mail -eq '$($User.Manager)'"
    New-ADUser -Name "$($User.Vorname) $($User.Nachname)" -Surname $User.Nachname -GivenName $User.Vorname -UserPrincipalName "$($User.Vorname).$($User.Nachname)@demotenant.de" -Department $User.Abteilung -Company "Demotenant" -Path "OU=User,OU=Demotenant,DC=lan,DC=demotenant,DC=de"
}
```

Es würde die Lesbarkeit erhöhen, wenn wir den Befehl auf mehrere Zeilen aufteilen können.
Deshalb zeige ich euch in diesem Artikel zwei Möglichkeiten um eure PowerShell Befehle auf mehrere Zeilen aufzuteilen.

**🎬 Ich habe übrigens auch ein [Video zu dem Thema erstellt.](https://www.youtube.com/watch?v=dMR0rrC_xIw)**  

## Backticks

Die erste Möglichkeit sind Backticks `` ` `` vor Zeilenumbrüchen. Das Backtick könnt ihr eingeben, indem ihr auf einer deutschen Tastatur die Umschalttaste gedrückt haltet und dann oben rechts auf die Taste mit den zwei Akzentzeichen drückt. Mit dem Zeichen können in der PowerShell auch noch andere Sachen gemacht werden, aber wir verwenden es jetzt um das nachfolgende Zeichen, also den Zeilenumbruch zu escapen. Dadurch wird der Zeilenumbruch nicht als Ende des Befehls gewertet und wir können in der nächsten Zeile weiter machen. 👍

Theoretisch könnt ihr trotzdem mehrere Parameter auf eine Zeile packen, aber ich finde es so am schönsten: Erst den Cmdlet Namen in die erste Zeile, dann Leerzeichen, Backtick, neuer Zeilenumbruch. Anschließend rücke ich mit einem Druck auf die Tab-Taste den Code ein Stück ein - das ist nur Optik, aber ich finde es dadurch besser lesbar. Also es wird dadurch besser erkennbar, dass diese neue Zeile zum Cmdlet dadrüber gehört. Nun folgt pro Zeile ein Parameter mit Parameterwert und jeweils ein Leerzeichen und ein Backtick, falls noch ein weiterer Parameter in der nächsten Zeile folgen soll.

Der Code vom Anfang des Artikels umgebaut mit Backticks würde dann so aussehen:

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

Dieser Code ist weitaus besser lesbar, funktioniert aber genauso wie das Original.

Grundsätzlich finde ich diese Backtick Methode nicht so toll, weil diese Backticks so unscheinbar sind. Ich habe da immer Bedenken, dass sie dann später übersehen werden, wenn ich oder jemand anderes dieses Skript später bearbeitet. Aber die Methode ist einfach umzusetzen und funktioniert.

### Hinweis zu langen Pipelines

Wenn ihr einen verketteten Befehl mit Pipes verwendet, dann könnt ihr auch das Pipe-Symbol jeweils an das Ende der Zeile setzen. Und dann fügt ihr einen Zeilenumbruch ein - **es ist kein Backtick notwendig** - und schreibt den nächsten Befehl der Pipeline in die nächste Zeile. Und wenn dann noch mehr Pipes folgen, dann könnt ihr das natürlich auch beliebig oft machen. Auch hier würde ich aber zwecks Lesbarkeit empfehlen, ab der zweiten Zeile den Code einzurücken.

```powershell
# Originale Pipeline
Get-Service | Where-Object {$_.Name -eq "wuauserv"} | Stop-Service

# Mehrzeilige Pipeline
Get-Service |
    Where-Object {$_.Name -eq "wuauserv"} |
    Stop-Service

```

## Splatting

Eine Alternative zu den Backticks ist das sogenannte Splatting. Um das zu nutzen schreiben wir unsere Cmdlet Parameter als Sammlung in eine Variable und können sie dann einfach an unser Cmdlet ransplatten. Das ursprüngliche Beispiel vom Anfang dieses Artikels würde damit wie folgt aussehen:

```powershell {hl_lines="5-14"}
$CSVFile = Import-Csv .\NeueUser.csv

foreach($User in $CSVFile) {
    $Manager = Get-ADUser -Filter "mail -eq '$($User.Manager)'"
    $MeineParameter = @{
        Name                = "$($User.Vorname) $($User.Nachname)"
        Surname             = $User.Nachname
        GivenName           = $User.Vorname
        UserPrincipalName   = "$($User.Vorname).$($User.Nachname)@demotenant.de" 
        Department          = $User.Abteilung 
        Company             = "Demotenant" 
        Path                = "OU=User,OU=Demotenant,DC=lan,DC=demotenant,DC=de"
    }
    New-ADUser @MeineParameter
}
```

Hier habe ich also zunächst einmal eine Hashtable mit dem Namen `$MeineParameter` erstellt (der Name ist frei wählbar). In der Hashtable ist jeweils ein Eintrag für einen Parameter inklusive des jeweiligen Parameterwerts. Um jetzt an einem Cmdlet eine gesplattete Variable als Parameter zu verwenden, muss diese mit einem `@`-Symbol anstatt des normalen `$`-Symbol für Variablen angegeben werden. Parameternamen müssen dann am Cmdlet nicht angegeben werden, denn die stehen ja alle in der Hashtable/Variable.

Das sind die Grundlagen und ich finde es so weitaus schöner anzusehen als mit Backticks.

### Tipps und Besonderheiten zum Splatting

#### Mehrfach splatten

Ihr könnt mehrfach splatten, also zwei oder mehr Hashtables verwenden (z.B. eine für Standardwerte wie OU). Am Cmdlet nennt ihr dann einfach mehrere Variablen mit der `@`-Schreibweise.

```powershell {hl_lines=["5-7","16"]}
$CSVFile = Import-Csv .\NeueUser.csv

foreach($User in $CSVFile) {
    $Manager = Get-ADUser -Filter "mail -eq '$($User.Manager)'"
    $StandardWerte =  @{
        Path                = "OU=User,OU=Demotenant,DC=lan,DC=demotenant,DC=de"
    }
    $MeineParameter = @{
        Name                = "$($User.Vorname) $($User.Nachname)"
        Surname             = $User.Nachname
        GivenName           = $User.Vorname
        UserPrincipalName   = "$($User.Vorname).$($User.Nachname)@demotenant.de" 
        Department          = $User.Abteilung 
        Company             = "Demotenant" 
    }
    New-ADUser @MeineParameter @StandardWerte
}
```

#### Weitere Parameter manuell angeben

Wenn ihr Parameter an ein Cmdlet splattet, müsst ihr **nicht** ausschließlich splatten. Ihr dürft auch trotzdem noch Parameter direkt angeben. Zum Beispiel habe ich im folgenden Beispiel den Parameter `Department` nicht in der Hashtable definiert und gebe ihn stattdessen direkt am Cmdlet an:

```powershell {hl_lines="13"}
$CSVFile = Import-Csv .\NeueUser.csv

foreach($User in $CSVFile) {
    $Manager = Get-ADUser -Filter "mail -eq '$($User.Manager)'"
    $MeineParameter = @{
        Name                = "$($User.Vorname) $($User.Nachname)"
        Surname             = $User.Nachname
        GivenName           = $User.Vorname
        UserPrincipalName   = "$($User.Vorname).$($User.Nachname)@demotenant.de" 
        Company             = "Demotenant" 
        Path                = "OU=User,OU=Demotenant,DC=lan,DC=demotenant,DC=de"
    }
    New-ADUser @MeineParameter -Department "IT-Abteilung"
}
```

#### Gesplattete Werte überschreiben

In PowerShell 7 könnt ihr einen gesplatteten Wert auch manuell überschreiben. Ein direkt genannter Parameter hat Vorrang. In der Windows PowerShell geht das leider nicht. Im nachfolgenden Beispiel überschreibe ich den `Company` Wert direkt am Cmdlet - der Wert aus der Hashtable wird also ignoriert. Alle weiteren Werte gesplatteten Werte werden aber verwendet.

```powershell {hl_lines="14"}
$CSVFile = Import-Csv .\NeueUser.csv

foreach($User in $CSVFile) {
    $Manager = Get-ADUser -Filter "mail -eq '$($User.Manager)'"
    $MeineParameter = @{
        Name                = "$($User.Vorname) $($User.Nachname)"
        Surname             = $User.Nachname
        GivenName           = $User.Vorname
        UserPrincipalName   = "$($User.Vorname).$($User.Nachname)@demotenant.de" 
        Department          = $User.Abteilung 
        Company             = "Demotenant" 
        Path                = "OU=User,OU=Demotenant,DC=lan,DC=demotenant,DC=de"
    }
    New-ADUser @MeineParameter -Company "diecknet"
}
```

#### Array statt Hashtable

Theoretisch müsst ihr nicht mal eine Hashtable verwenden, es geht auch mit einem Array. Bei einem Array gibt aber ja gar keinen Namen für einen Eintrag, die sind einfach nur durchnummeriert von 0 bis unendlich. Deshalb funktioniert das nur für positionale Parameter. Nehmen wir mal einen anderen Befehl. Das Cmdlet `New-ADGroup` kann neue Gruppen im Active Directory anlegen. Und der Befehl unterstützt zwei positionale Parameter. Als ersten den Namen der Gruppe und als zweiten den GroupScope. Mit dem Wissen können wir wie folgt splatten:

```powershell
$MeinArray = "Meine lustige Gruppe", "DomainLocal"
New-ADGroup @MeinArray
```

Weitere Parameter könnte ich hier natürlich auch wieder direkt angeben, oder auch theoretisch noch zusätzlich eine Hashtable ransplatten. Aber dann hätte ich auch gleich nur eine Hashtable verwenden können 😒.

Grundsätzlich würde ich aber eigentlich immer eine Hashtable statt einem Array fürs Splatting verwenden, weil es einfach besser verständlich ist, wenn die Parameternamen auch sichtbar sind.

## Fazit

Ich hoffe das hat euch geholfen, euren PowerShell Code ein bisschen besser lesbar zu machen. Ich persönlich finde die Hashtable Schreibweise eigentlich besser, aber auch die Backtick-Methode hat seine Daseinsberechtigung.
