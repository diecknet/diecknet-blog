---
slug: "powershell-find-process-listening-port"
title: "Herausfinden welcher Prozess auf einem bestimmten Port lauscht (PowerShell)"
date: 2026-04-14
tags: [powershell, windows]
cover: 
    image: "/images/2026/2026-04-14_Get-NetTCPConnection.jpg"
---

Wenn ihr herausfinden möchtet, welcher Prozess auf einem bestimmten TCP/UDP Port lauscht dann könnt ihr unter Windows dafür auch PowerShell verwenden. Ich finde das angenehmer, als die Ausgabe von `netstat` auszuwerten.

Ich demonstriere die nachfolgenden Möglichkeiten auch [in diesem Video hier auf YouTube](https://youtu.be/SGvbBbsIpjw).

## Für TCP: Get-NetTCPConnection

Für TCP-Verbindungen gibt es das Cmdlet `Get-NetTCPConnection`. Es liefert allerdings nur die ID des laufenden Prozesses zurück (Eigenschaft `OwningProcess`), aber die können wir mit `Get-Process` auflösen. Manuell würde das so gehen:

```powershell
Get-NetTCPConnection -LocalPort 1337

# Beispiel Rückgabe
# LocalAddress                        LocalPort RemoteAddress                       RemotePort State       AppliedSetting OwningProcess
# ------------                        --------- -------------                       ---------- -----       -------------- -------------
# 0.0.0.0                             1337      0.0.0.0                             0          Listen                     1712 

Get-Process -Id 1712
```

PowerShell Cmdlets können aber geschickt kombiniert werden, um daraus einen One-Liner zu machen. Da gibt es natürlich verschiedene Möglichkeiten den Code zu verkleinern oder individuell zu gestalten. Hier mal ein paar Beispiele, die alle im Grunde das gleiche machen, aber auf verschiedenen Wegen.

```powershell
# Mit Klammern
Get-Process -Id (Get-NetTCPConnection -LocalPort 1337).OwningProcess

# Mit Pipe (% ist ein Alias für ForEach-Object)
Get-NetTCPConnection -LocalPort 1337 | % { Get-Process -Id $_.OwningProcess }

# Abgekürzte Variante
ps -Id (Get-NetTCPConnection -localp 135).OwningProcess
```

Die Rückgabe ist dann ein `[System.Diagnostics.Process]` Objekt mit verschiedenen Eigenschaften. Auf den ersten Blick ist `ProcessName` am interessantesten.

[![Beispiel für Get-NetTCPConnection](/images/2026/2026-04-14_Get-NetTCPConnection.jpg "Beispiel für Get-NetTCPConnection")](/images/2026/2026-04-14_Get-NetTCPConnection.jpg)

Es gibt aber auch noch die Möglichkeit mehr Infos zum Programm auf der Festplatte herauszufinden, wenn `Get-Process` mit dem Parameter `-FileVersionInfo` ausgeführt wird. Dadurch wird übrigens stattdessen ein `[System.Diagnostics.FileVersionInfo]` Objekt zurückgegeben.

```powershell
Get-Process -FileVersionInfo -Id (Get-NetTCPConnection -LocalPort 1337).OwningProcess

# Beispiel Rückgabe
# ProductVersion   FileVersion      FileName
# --------------   -----------      --------
# 1.3.3.7          1.3.3.7          C:\Example\SomeExample.exe
```

## Für UDP: Get-NetUDPEndpoint

Für UDP wird ein anderes Cmdlet benötigt: `Get-NetUDPEndpoint`  
In der Standardausgabe wird bei mir die Eigenschaft `OwningProcess` nicht angezeigt, aber sie existiert dennoch.

```powershell
Get-NetUdpEndpoint -LocalPort 31337

# Beispiel Rückgabe
# LocalAddress                             LocalPort
# ------------                             ---------
# 0.0.0.0                                  31337
```

Die manuelle Abfrage in zwei Schritten spare ich uns mal, stattdessen wieder ein paar Möglichkeiten für One-Liner:

```powershell
# Mit Klammern
Get-Process -Id (Get-NetUDPEndpoint -LocalPort 31337).OwningProcess

# Mit Pipe (% ist ein Alias für ForEach-Object)
Get-NetUDPEndpoint -LocalPort 31337 | % { Get-Process -Id $_.OwningProcess }

# Abgekürzte Variante
ps -Id (Get-NetUDPEndpoint -localp 31337).OwningProcess
```

Wie auch bei den Beispielen für TCP, liefert `Get-Process` ein `[System.Diagnostics.Process]` Objekt für den Prozess zurück.

[![Beispiel für Get-NetUDPEndpoint](/images/2026/2026-04-14_Get-NetUDPEndpoint.jpg "Beispiel für Get-NetUDPEndpoint")](/images/2026/2026-04-14_Get-NetUDPEndpoint.jpg)

Auch hier kann natürlich `Get-Process` um den `-FileVersionInfo` Parameter ergänzt werden, um unter anderem den vollständigen Pfad auf der Festplatte herauszufinden.

```powershell
Get-Process -FileVersionInfo -Id (Get-NetUDPEndpoint -LocalPort 31337).OwningProcess

# Beispiel Rückgabe
# ProductVersion   FileVersion      FileName
# --------------   -----------      --------
# 1.3.3.7          1.3.3.7          C:\Example\SomeOtherExample.exe
```
