---
slug: "powershell-profiles"
title: "PowerShell Profile erklärt (mit Beispielen)"
date: 2024-03-05
comments: true
tags: [powershell, profiles, customization]
---

Mit PowerShell Profilen könnt ihr eure PowerShell anpassen. Also zum Beispiel, dass sie so aussieht:

[![PowerShell Konsole angepasst mit Oh My Posh und dem Theme Blue Owl](/images/2024/2024-03-05_PSProfiles_OhMyPosh.jpg "PowerShell Konsole angepasst mit Oh My Posh und dem Theme Blue Owl")](/images/2024/2024-03-05_PSProfiles_OhMyPosh.jpg)

Oder ihr könnt einstellen, dass beim Start so ein Splash-Screen angezeigt (winfetch) wird:

[![Beispiel für Winfetch Infobildschirm](/images/2024/2024-03-05_PSProfiles_Winfetch.jpg "Beispiel für Winfetch Infobildschirm")](/images/2024/2024-03-05_PSProfiles_Winfetch.jpg)

Oder ihr könnt auch eigene Funktionen und Variablen hinterlegen, sodass diese immer sofort verfügbar sind, wenn ihr die PowerShell startet.

**🎬 Ich habe übrigens auch ein [Video zu dem Thema erstellt.](https://www.youtube.com/watch?v=vtqrZjofJ40)**

Letztendlich ist ein PowerShell Profil einfach ein PowerShell Skript, was automatisch ausgeführt wird, wenn ihr die PowerShell startet. Die PowerShell schaut beim Start automatisch in bestimmten Pfaden, ob eine Profildatei vorhanden ist. Es können aber auch mehrere Profile vorhanden sein.
So kann dann zum Beispiel ein User-spezifisches Profil angelegt werden und auch ein systemweites. Außerdem können unterschiedliche PowerShell Konsolenhosts auch noch separate Profile haben. So kann dann zum Beispiel VSCode oder die PowerShell ISE anders konfiguriert werden, als die normale PowerShell Konsole (falls es gewünscht ist). Und die Windows PowerShell hat auch nochmal Profile die unabhängig sind von der PowerShell 7. Also es gibt sehr viele Orte wo ein Profil liegen kann.

## Tipp: PowerShell ohne Profile starten

Übrigens die PowerShell versucht normalerweise immer Profile zu laden *wenn sie gestartet wird*. Aber es ist auch möglich die PowerShell mit dem zusätzlichen Parameter `-NoProfile` zu starten und dann wird sie ganz ohne Profile gestartet - kann manchmal nützlich sein.

```powershell
# Für Windows PowerShell
powershell.exe -NoProfile

# Für PowerShell 7
pwsh -NoProfile
```

## Profil Speicherorte

Die genauen Profil Speicherorte sind bei Microsoft dokumentiert. Hier die Infos zu [PowerShell 7.4](https://learn.microsoft.com/en-us/powershell/module/microsoft.powershell.core/about/about_profiles?view=powershell-7.4#profile-types-and-locations) und hier für die [Windows PowerShell 5.1](https://learn.microsoft.com/en-us/powershell/module/microsoft.powershell.core/about/about_profiles?view=powershell-5.1#profile-types-and-locations).

Aber die Pfade sind auch einfach per PowerShell abrufbar - dafür gibt es in der PowerShell eine automatische Variable names `$PROFILE`. Die zeigt erstmal den Profilpfad zu "Current user, current host", also das Profil was so spezifisch ist wie es geht. Aber auch die anderen Pfade sind darüber abrufbar. Dafür könnt ihr die Variable einmal in `Select-Object` pipen. Beispielsweise wird mir in der Windows PowerShell 5.1 folgendes zurückgegeben:

```powershell
$PROFILE | Select-Object *

<# Beispiel Rückgabe aus Windows PowerShell 5.1:

AllUsersAllHosts       : C:\Windows\System32\WindowsPowerShell\v1.0\profile.ps1
AllUsersCurrentHost    : C:\Windows\System32\WindowsPowerShell\v1.0\Microsoft.PowerShell_profile.ps1
CurrentUserAllHosts    : C:\Users\diecknet\Documents\WindowsPowerShell\profile.ps1
CurrentUserCurrentHost : C:\Users\diecknet\Documents\WindowsPowerShell\\Microsoft.PowerShell_profile.ps1
Length                 : 78

#>
```

Und in PowerShell 7.4 erhalte ich folgende Rückgabe:

```powershell
$PROFILE | Select-Object *

<# Beispiel Rückgabe aus PowerShell 7.4:

AllUsersAllHosts       : C:\Program Files\PowerShell\7\profile.ps1
AllUsersCurrentHost    : C:\Program Files\PowerShell\7\Microsoft.PowerShell_profile.ps1
CurrentUserAllHosts    : C:\Users\diecknet\Documents\PowerShell\profile.ps1
CurrentUserCurrentHost : C:\Users\diecknet\Documents\PowerShell\Microsoft.PowerShell_profile.ps1
Length                 : 71

#>
```

Wenn ihr jetzt ein Profil bearbeiten wollt, dann könnt ihr direkt aus der PowerShell `notepad` oder VSCode mit `$PROFILE` als Parameterwert aufrufen. Dadurch öffnet sich euer Bearbeitungsprogramm direkt mit der Profildatei. Die meisten modernen Editoren können dann die Profildatei direkt erstellen, falls sie noch nicht vorhanden sein sollte. Manche ältere Editoren geben aber nur eine Fehlermeldung zurück, falls die Datei noch gar nicht existiert.

```powershell
# Das "Current User, Current Host" Profil per Visual Studio Code bearbeiten:
code $PROFILE

# Das "Current User, All Hosts" Profil per notepad bearbeiten:
notepad $PROFILE.CurrentUserAllHosts
```

Wenn ihr ein "All Users" Profil bearbeiten wollt, dann müsst ihr übrigens den Editor dafür mit Admin-Rechten starten. Beziehungsweise wenn ihr direkt per PowerShell euren Editor starten wollt und die Profildatei laden wollt, dann sollte die PowerShell schon mit Adminrechten laufen.

## Profil Beispiele

Hier ein paar Beispiele für Konfigurationen, die man in einem PowerShell Profil setzen könnte.  
**Wichtig: Damit die Profiländerungen aktiv werden, müsst ihr die PowerShell einmal neustarten.**

### PSReadLine Optionen

Ich habe bei mir in meiner Demo-VM eingestellt, dass keine Autovervollständigung in der PowerShell passieren soll. Finde ich sonst nämlich nervig bei der Erstellung von Videos und Blog Posts.
Dafür habe ich in meinem Profil folgendes stehen:

```powershell
Set-PSReadLineOption -PredictionSource None
```

Diese Einstellung läuft über das Modul `PSReadLine`. Das Modul kann genutzt werden, um die PowerShell Konsole vielfältig anzupassen. Es können zum Beispiel auch Tastenkombinationen eingestellt werden. Oder hier ein cooles Beispiel von der [PSReadLine GitHub Projektseite](https://github.com/PowerShell/PSReadLine?tab=readme-ov-file#usage):

```powershell
Set-PSReadLineKeyHandler -Chord '"',"'" `
                         -BriefDescription SmartInsertQuote `
                         -LongDescription "Insert paired quotes if not already on a quote" `
                         -ScriptBlock {
    param($key, $arg)

    $line = $null
    $cursor = $null
    [Microsoft.PowerShell.PSConsoleReadLine]::GetBufferState([ref]$line, [ref]$cursor)

    if ($line.Length -gt $cursor -and $line[$cursor] -eq $key.KeyChar) {
        # Just move the cursor
        [Microsoft.PowerShell.PSConsoleReadLine]::SetCursorPosition($cursor + 1)
    }
    else {
        # Insert matching quotes, move cursor to be in between the quotes
        [Microsoft.PowerShell.PSConsoleReadLine]::Insert("$($key.KeyChar)" * 2)
        [Microsoft.PowerShell.PSConsoleReadLine]::GetBufferState([ref]$line, [ref]$cursor)
        [Microsoft.PowerShell.PSConsoleReadLine]::SetCursorPosition($cursor - 1)
    }
}
```

Das sorgt dafür, dass wenn man ein Anführungszeichen in der Shell eingibt, automatisch ein schließendes Anführungszeichen eingefügt wird - und der Cursor wird dazwischen platziert. Wenn ihr mehr zu [PSReadLine](https://learn.microsoft.com/en-us/powershell/module/psreadline/about/about_psreadline?view=powershell-7.4) wissen wollt, dann schaut mal in [die Dokumentation dazu](https://learn.microsoft.com/en-us/powershell/module/psreadline/about/about_psreadline?view=powershell-7.4).

### Eigene Cmdlets und Aliase

Wenn ihr wollt, könnt ihr auch eigene Cmdlets oder Aliase im PowerShell Profil definieren, die dann automatisch in eurer PowerShell Session verfügbar sind. Zum Beispiel:

```powershell
function blog {
    Set-Location C:\dev\diecknet-blog
}
```

Dadurch kann ich schnell und einfach mit dem Befehl `blog` in mein lokales Verzeichnis wechseln, wo der Quellcode zu meinem Blog liegt. Oder ich kann mir den Alias `reboot` anlegen, der auf das Cmdlet `Restart-Computer` zeigt.

```powershell
New-Alias -Name reboot -Value Restart-Computer
```

### Standardwerte für Cmdlets festlegen

Ihr könnt auch Standardwerte für bestimmte Cmdlet-Parameter festlegen. Das geht mit der Variable `$PSDefaultParameterValues` - das ist eine Hashtable in die bei Bedarf Einträge mit Cmdlet und Parameternamen eingetragen werden können.

```powershell
# Das Schema ist wie folgt:
$PSDefaultParameterValues["CmdletName:ParameterName"]="Standardwert"

# also zum Beispiel
$PSDefaultParameterValues["Select-Object:Property"]="*"
```

Aber diese Standard-Werte können natürlich bei der Ausführung von Cmdlets immer auch explizit überschrieben werden. Also wenn ich beim Aufruf von `Select-Object` einen anderen `-Property` Wert festlege, dann wird der Befehl trotzdem noch richtig ausgeführt. Und Standardwerte könnt ihr übrigens mit dieser Variable auch außerhalb von Profilen festlegen. Also das geht auch zum Beispiel in Skripten oder in eigenen Funktionen.

### Cmdlets automatisch ausführen

Ihr könnt auch bestimmte Befehle in euer PowerShell Profil eintragen und diese werden dann automatisch ausgeführt, wenn die PowerShell gestartet wird.

```powershell
# Beispiel: Aktuellen Wochentag ausgeben, wenn die PowerShell gestartet wird
Write-Host "Heute ist $(Get-Date -Format "dddd")"

<# Beispiel Rückgabe:

Heute ist Freitag
#>
```

Oder die PowerShell 7 zeigt ja beim Start immer die Version an. Die Windows PowerShell macht das aber nicht. Wenn ihr wollt, könnt ihr in eurem Windows PowerShell Profil folgende Zeile hinzufügen, damit auch dort eine Versionsinfo angezeigt wird:

```powershell
"Windows PowerShell $($PSVersionTable.PSVersion.Major).$($PSVersionTable.PSVersion.Minor)"

<# Beispiel Rückgabe:

Windows PowerShell 5.1
#> 
```

Aber zu lange Befehle solltet ihr so lieber nicht ausführen, weil das sonst den Start von jeder PowerShell Session verlangsamt. Und wenn das Laden von allen Profilen zusammen mehr als 500ms dauert, dann eine Warnungsmeldung angezeigt.
[![Beispiel für Warnungsmeldung wenn ein PowerShell Profil länger als 500ms lädt - Das Laden von persönlichen und Systemprofilen dauerte 619 ms.](/images/2024/2024-03-05_PSProfiles_LoadingTime.jpg "Beispiel für Warnungsmeldung wenn ein PowerShell Profil länger als 500ms lädt - Das Laden von persönlichen und Systemprofilen dauerte 619 ms.")](/images/2024/2024-03-05_PSProfiles_LoadingTime.jpg)

### Prompt anpassen

Ihr könnt auch eure Prompt, also den Eingabebereich in der Konsole anpassen. Dafür verwendet die PowerShell die Standardfunktion `prompt`. Und den Code können wir mit unserem PowerShell Profil überschreiben. Schauen wir uns erstmal den Standard-Code an:

```powershell
(Get-Command Prompt).ScriptBlock

<# Rückgabe:

"PS $($executionContext.SessionState.Path.CurrentLocation)$('>' * ($nestedPromptLevel +
1)) ";
# .Link
# https://go.microsoft.com/fwlink/?LinkID=225750
# .ExternalHelp System.Management.Automation.dll-help.xml

#>
```

Ich würde mich erstmal an diesem Standard orientieren, anstatt von null anzufangen. Wir können das zum Beispiel ergänzen durch die Info, welcher User hier gerade angemeldet ist.

```powershell
function prompt {
    "$($env:username)@$($env:computername) PS $($executionContext.SessionState.Path.CurrentLocation)$('>' * ($nestedPromptLevel + 1)) "
}
```

Das Ergebnis:
[![Beispiel für eine angepasst Prompt](/images/2024/2024-03-05_PSProfiles_Prompt.jpg "Beispiel für eine angepasst Prompt")](/images/2024/2024-03-05_PSProfiles_Prompt.jpg)

Oder mit diesem Beispiel [aus der Microsoft Dokumentation](https://learn.microsoft.com/en-us/powershell/module/microsoft.powershell.core/about/about_prompts?view=powershell-7.4#how-to-customize-the-prompt) kann interaktiv angezeigt werden, ob die PowerShell mit Adminrechte läuft:

```powershell
function prompt {
  $identity = [Security.Principal.WindowsIdentity]::GetCurrent()
  $principal = [Security.Principal.WindowsPrincipal] $identity
  $adminRole = [Security.Principal.WindowsBuiltInRole]::Administrator

  $(if (Test-Path variable:/PSDebugContext) { '[DBG]: ' }
    elseif($principal.IsInRole($adminRole)) { "[ADMIN]: " }
    else { '' }
  ) + 'PS ' + $(Get-Location) +
    $(if ($NestedPromptLevel -ge 1) { '>>' }) + '> '
}
```

Das Ergebnis:
[![Weiteres Beispiel für eine angepasst Prompt](/images/2024/2024-03-05_PSProfiles_Prompt2.jpg "Weiteres Beispiel für eine angepasst Prompt")](/images/2024/2024-03-05_PSProfiles_Prompt2.jpg)

### Oh My Posh

Wenn ihr Lust habt, eure PowerShell Konsole noch stärker anzupassen, dann empfehle ich [Oh My Posh](https://ohmyposh.dev/). Es gibt da schon viele vorgefertigte Themes, die direkt übernommen werden können. Oder ihr könnt eigene Themes erstellen und dabei vielleicht nur ein bestehendes Theme als Grundlage nehmen.

Ich habe mir Oh My Posh per `winget` installiert, aber ihr könnt es auch anders installieren, schaut dafür in die [Dokumentation](https://ohmyposh.dev/docs/installation/windows). Und Oh My Posh ist auch für [macOS](https://ohmyposh.dev/docs/installation/macos) und [Linux](https://ohmyposh.dev/docs/installation/linux) verfügbar!

```powershell
winget install JanDeDobbeleer.OhMyPosh -s winget
```

Für viele Themes macht es Sinn, noch ein "Nerd Font" Schriftarten-Paket zu installieren. Das sind Schriftarten die zusätzlich zu normalen Zeichen auch noch Icons enthalten. In der [Oh My Posh Dokumentation](https://ohmyposh.dev/docs/installation/fonts) wird die Schriftart "Meslo LGM NF" empfohlen, der Download Link ist auch [dort](https://ohmyposh.dev/docs/installation/fonts) zu finden.
Anschließend muss die Schriftart im Windows Terminal aktiviert werden. Und wenn ihr VSCode verwendet, dann macht es auch Sinn, die Schriftart für das dortige Terminal anzupassen.

Um Oh My Posh jetzt auch tatsächlich zu verwenden, müssen wir eine Zeile in unserem PowerShell Profil hinzufügen.

```powershell
oh-my-posh init pwsh | Invoke-Expression
```

Dadurch haben wir jetzt ein Standard-Theme in Verwendung. Eine [Übersicht von anderen Themes könnt ihr auf der Oh My Posh Webseite ansehen](https://ohmyposh.dev/docs/themes). Oder wenn ihr Oh My Posh schon geladen habt, könnt ihr in der Shell mit dem Befehl `Get-PoshThemes` eine Übersicht erhalten. Themes mit dem Zusatz "minimal" im Namen benötigen übrigens keine Nerd Fonts. Ich fand "blue-owl" ganz cool. Um das Theme zu nutzen, müssen wir den Befehl im PowerShell Profil anpassen.

```powershell
oh-my-posh init pwsh --config "$($env:POSH_THEMES_PATH)\blue-owl.omp.json" | Invoke-Expression
```

Das Ergebnis:
[![PowerShell Konsole angepasst mit Oh My Posh und dem Theme Blue Owl](/images/2024/2024-03-05_PSProfiles_OhMyPosh.jpg "PowerShell Konsole angepasst mit Oh My Posh und dem Theme Blue Owl")](/images/2024/2024-03-05_PSProfiles_OhMyPosh.jpg)

## Winfetch

Was auch noch zum Thema Customizing passt ist [Winfetch](https://github.com/lptstr/winfetch). Mit Winfetch könnt ihr euch so einen Infoscreen anzeigen, wenn ihr die PowerShell startet:

[![Beispiel für Winfetch Infobildschirm](/images/2024/2024-03-05_PSProfiles_Winfetch.jpg "Beispiel für Winfetch Infobildschirm")](/images/2024/2024-03-05_PSProfiles_Winfetch.jpg)

Allerdings habe ich mir Winfetch **nicht** im PowerShell Profil eingetragen, sondern nur als Startoption im Windows Terminal hinzugefügt. Dadurch wird verhindert, dass Winfetch ausgeführt wird, wenn ich z.B. aus der `cmd.exe` die PowerShell starte oder ähnliches.

Winfetch ist unter anderem über PowerShell Gallery verfügbar, kann also zum Beispiel mit folgendem Befehl installiert werden:

```powershell
Install-Script winfetch
```

Bei der Installation werdet ihr möglicherweise gefragt, ob ihr den PowerShell Skriptpfad zu eurer `PATH` Umgebungsvariable hinzufügen wollt. Ich würde das mit "Ja" bestätigen, weil ihr das Skript dadurch einfach mit dem Befehl `winfetch` aufrufen könnt. Ansonsten müsst ihr eventuell mit dem absoluten Pfad des Skripts arbeiten. Damit die `PATH` Änderung aktiv wird, müsst ihr einmal die PowerShell Konsole neustarten. Anschließend könnt ihr mit dem Befehl `winfetch` den Standard Infoscreen anzeigen. Wenn ihr wollt, könnt ihr aber auch eine eigene Konfiguration anlegen und bearbeiten:

```powershell
winfetch -genconf
code $env:USERPROFILE/.config/winfetch/config.ps1
```

Guckt euch am besten die Konfig-Datei an, die generiert wurde. Da stehen eigentlich alle möglichen Optionen drin, wo dann nur die Auskommentierung entfernt, oder ein Wert angepasst werden muss. Ihr könnt zum Beispiel das Logo ändern oder abschalten, oder auch komplett eigene Info-Zeilen hinzufügen.
  
Um das Skript jetzt automatisch beim Start der PowerShell auszuführen, ohne es im PowerShell Profil einzutragen, könnt ihr es in den "Command Line" Einstellungen von euren Windows Terminal Profilen eintragen.

[![Konfiguration Winfetch im Windows Terminal](/images/2024/2024-03-05_PSProfiles_Winfetch_SetupWindowsTerminal.jpg "Konfiguration Winfetch im Windows Terminal")](/images/2024/2024-03-05_PSProfiles_Winfetch_SetupWindowsTerminal.jpg)

```powershell
powershell.exe -NoLogo -NoExit -File "C:\Program Files\WindowsPowerShell\Scripts\winfetch.ps1"

pwsh.exe -NoLogo -NoExit -File "C:\Program Files\WindowsPowerShell\Scripts\winfetch.ps1"
```

Empfehlenswert ist es auch, die Einstellung dann sowohl für das Profil "Windows PowerShell" als auch "PowerShell" (also für PowerShell 7) zu setzen. Wenn ihr jetzt die PowerShell im Windows Terminal startet, dann wird winfetch ausgeführt, aber wenn ihr aus einer anderen Prompt die PowerShell startet, passiert nix 😎.

## Anregungen?

Wenn ihr Ideen für nützliche PowerShell Profil Anpassungen habt, lasst es mich gerne in den Kommentaren wissen! ⬇
