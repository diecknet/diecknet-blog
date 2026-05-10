---
slug: "powershell-screenshots"
title: "Screenshots per PowerShell erstellen"
date: 2026-05-10
tags: [powershell, windows]
---

Wenn ihr Screenshots per PowerShell erstellen wollt, dann müsst ihr .NET verwenden. Den passenden Code dazu zeige ich im folgenden. Aber falls ihr das einfacher machen möchtet, könnt ihr auch [mein Screenshot PowerShell Modul](https://github.com/diecknet/PSScreenshot) verwenden (mehr Infos dazu weiter unten).

Ich demonstriere die nachfolgenden Möglichkeiten auch [in diesem Video hier auf YouTube](https://youtu.be/wcEcqw89si8).

## Warum eigentlich?

Natürlich können Screenshots einfach manuell erstellt werden (z.B. per Screenshot-Taste auf der Tastatur) und es gibt auch gute Tools für die Bearbeitung von Screenshots (z.B. Greenshot). Aber falls ihr etwas mit PowerShell automatisiert und dabei Screenshots automatisch erstellen könnt, kann das hilfreich z.B. zu Dokumentationszwecken sein.

## Hinweis: Funktioniert nur unter Windows

Der Code aus diesem Post funktioniert nur unter Windows.

## Screenshot über alle Bildschirme

Mit folgendem Code könnt ihr einen Screenshot über alle Bildschirme hinweg erstellen. Im Gegensatz zu vielen anderen Beispielcodes aus dem Internet, wird hier direkt im JPEG Format gespeichert anstatt als BMP. Das spart immens Speicherplatz.

```powershell
Add-Type -AssemblyName System.Windows.Forms,System.Drawing

$Screen = [System.Windows.Forms.SystemInformation]::VirtualScreen
$Bitmap = [System.Drawing.Bitmap]::new($Screen.Width, $Screen.Height)
$Graphic = [System.Drawing.Graphics]::FromImage($bitmap)
$Graphic.CopyFromScreen(0, 0, 0, 0, $Screen.Size)
$Bitmap.Save("C:\temp\Diecknet.jpg", [System.Drawing.Imaging.ImageFormat]::Jpeg)
```

## Screenshot von bestimmten Koordinaten

Falls ihr nicht den gesamten Bildschirm screenshotten wollt, dann könnt ihr auch mit Koordinaten arbeiten. Ich habe hier mal eine kleine Helferfunktion gebaut (`New-DiecknetScreenshot`). Sie nimmt die Parameter `-X` und `-Y` für die Startposition entgegen und `-Width` und `-Height` für Breite und Höhe. Außerdem wird der Dateiname mit der aktuellen Zeitinformation generiert.

```powershell
Add-Type -AssemblyName System.Windows.Forms,System.Drawing

function New-DiecknetScreenshot {
    param($X, $Y, $Width, $Height)
    $Bitmap = [System.Drawing.Bitmap]::new($Width, $Height)
    $Graphic = [System.Drawing.Graphics]::FromImage($bitmap)
    $Graphic.CopyFromScreen($X, $Y, 0, 0, [System.Drawing.Size]::new($Width, $Height))
    $Bitmap.Save("C:\temp\Diecknet_$(Get-Date -Format 'yyyyMMdd_HHmmss').jpg", [System.Drawing.Imaging.ImageFormat]::Jpeg) 
}

New-DiecknetScreenshot -X 100 -Y 100 -Width 500 -Height 500
```

## Screenshot von einem bestimmten Prozess

Mit dem folgenden Code könnt ihr *theoretisch* einen bestimmten Prozess screenshotten. Das funktioniert aber nicht wirklich zuverlässig, würde ich nicht empfehlen. Ich führe ihn hier nur der Vollständigkeit halber auf, weil ich ihn auch [im Video](https://youtu.be/wcEcqw89si8) zeige.

Das Problem ist, dass ein Prozess mehrere Fenster haben kann und ihr deshalb eventuell nicht das richtige Fenster screenshottet. Deshalb würde ich eher den Code aus dem Abschnitt [Screenshot von bestimmten Fenster](#screenshot-von-bestimmten-fenster) empfehlen.

```powershell
Add-Type @"
    using System;
    using System.Runtime.InteropServices;

    // From Boe Prox (Hey, Scripting Guys! Blog): https://devblogs.microsoft.com/scripting/weekend-scripter-manage-window-placement-by-using-pinvoke/

    public class Window {
        [DllImport("user32.dll")]
        [return: MarshalAs(UnmanagedType.Bool)]
        public static extern bool GetWindowRect(IntPtr hWnd, out RECT lpRect);
    }

    public struct RECT {
        public int Left;        // x position of upper-left corner
        public int Top;         // y position of upper-left corner
        public int Right;       // x position of lower-right corner
        public int Bottom;      // y position of lower-right corner
    }
"@

function New-DiecknetScreenshot {
    param($X, $Y, $Width, $Height)
    $Bitmap = [System.Drawing.Bitmap]::new($Width, $Height)
    $Graphic = [System.Drawing.Graphics]::FromImage($bitmap)
    $Graphic.CopyFromScreen($X, $Y, 0, 0, [System.Drawing.Size]::new($Width, $Height))
    $Bitmap.Save("C:\temp\Diecknet_$(Get-Date -Format 'yyyyMMdd_HHmmss').jpg", [System.Drawing.Imaging.ImageFormat]::Jpeg) 
}

$Rectangle = [Rect]::New()
[Window]::GetWindowRect((Get-Process notepad).MainWindowHandle, [ref]$Rectangle)
$Rectangle

New-DiecknetScreenshot -X $Rectangle.Left -Y $Rectangle.Top -Width ($Rectangle.Right - $Rectangle.Left) -Height ($Rectangle.Bottom - $Rectangle.Top)
```

## Screenshot von bestimmten Fenster

Um ein bestimmtes Fenster anhand des Fenstertitels zu screenshotten, könnt ihr folgenden Code verwenden:

```powershell
Add-Type @"
    using System;
    using System.Runtime.InteropServices;

    public class Window {
        [DllImport("user32.dll")]
        [return: MarshalAs(UnmanagedType.Bool)]
        public static extern bool GetWindowRect(IntPtr hWnd, out RECT lpRect);

        // From an unknown user on Reddit: https://www.reddit.com/r/PowerShell/comments/2llb4u/comment/cm0e8fi/
        private class unmanaged {
            // FindWindowByCaption
            [DllImport("user32.dll", EntryPoint="FindWindow", SetLastError = true)]
            internal static extern IntPtr FindWindowByCaption(IntPtr ZeroOnly, string lpWindowName);

        }

        // FindWindowByCaption
        public static IntPtr FindWindowByCaption(string Title) {
            return unmanaged.FindWindowByCaption(IntPtr.Zero, Title);
        }    
    }

    public struct RECT {
        public int Left;        // x position of upper-left corner
        public int Top;         // y position of upper-left corner
        public int Right;       // x position of lower-right corner
        public int Bottom;      // y position of lower-right corner
    }
"@

function New-DiecknetScreenshot {
    param($X, $Y, $Width, $Height)
    $Bitmap = [System.Drawing.Bitmap]::new($Width, $Height)
    $Graphic = [System.Drawing.Graphics]::FromImage($bitmap)
    $Graphic.CopyFromScreen($X, $Y, 0, 0, [System.Drawing.Size]::new($Width, $Height))
    $Bitmap.Save("C:\temp\Diecknet_$(Get-Date -Format 'yyyyMMdd_HHmmss').jpg", [System.Drawing.Imaging.ImageFormat]::Jpeg) 
}

$ProcessHandle = [Window]::FindWindowByCaption("file1.txt - Notepad")
$Rectangle = [Rect]::New()
$null = [Window]::GetWindowRect($ProcessHandle, [ref]$Rectangle)

New-DiecknetScreenshot -X $Rectangle.Left -Y $Rectangle.Top -Width ($Rectangle.Right - $Rectangle.Left) -Height ($Rectangle.Bottom - $Rectangle.Top)
```

## PowerShell Modul für Screenshots

Ich habe auch [ein PowerShell Modul](https://github.com/diecknet/PSScreenshot) erstellt, mit dem ihr Screenshots erstellen könnt. Der Code der im Hintergrund verwendet wird, ist im Grunde das was ich hier im Beitrag bereits gezeigt habe. Aber ihr müsst euch dann nicht mit dem .NET Boilerplate Code rumschlagen 😉.

### Installation

Je nach System könnt ihr das Modul per `Install-Module` oder per `Install-PSResource` aus der [PowerShell Gallery](https://www.powershellgallery.com/packages/Screenshot) installieren:

```powershell
# Unter PowerShell 7 sollte funktionieren:
Install-PSResource Screenshot -Repository PSGallery
# Oder für Windows PowerShell 5.1:
Install-Module Screenshot -Repository PSGallery
```

### Beispiel 1: Screenshot erstellen

Um einen einfachen Screenshot von allen Bildschirmen zu erstellen, könnt ihr den nachfolgenden Befehl ausführen. Der Screenshot landet im aktuellen Verzeichnis.

```powershell
New-Screenshot
```

### Beispiel 2: Screenshot erstellen und Pfad anpassen

```powershell
New-Screenshot -Path C:\temp\Screenshots\
```

### Beispiel 3: Screenshot erstellen und Dateinamen anpassen

```powershell
New-Screenshot -FileName "MyCoolScreenshot.jpg"
```

### Beispiel 4: Screenshot von einem bestimmten Fenster erstellen

```powershell
New-Screenshot -WindowTitle "file1.txt - Notepad"
```

### Beispiel 5: Screenshot von bestimmten Koordinaten erstellen

```powershell
New-Screenshot -X 300 -Y 500
```

### Beispiel 6: Screenshot von bestimmten Koordinaten erstellen und Höhe/Breite anpassen

```powershell
New-Screenshot -X 300 -Y 500 -Height 250 -Width 250
```

### Rückgabe

Das Cmdlet `New-Screenshot` aus meinem Screenshot Modul liefert die Screenshot-Datei als Objekt zurück. Das bedeutet, dass ihr den Screenshot auch weiterverarbeiten oder öffnen könnt.

```powershell
# Erstellt einen Screenshot und öffnet ihn direkt mit der Standard-Applikation:
New-Screenshot | Invoke-Item
```
