---
slug: "powershell-remote-script-development"
title: "PowerShell Skripte remote entwickeln"
date: 2024-04-23
comments: true
tags: [powershell]
---

Es ist möglich PowerShell Skripte remote zu entwickeln. Also das Skript wird auf einem remote Computer gespeichert und ausgeführt, aber die Eingabe erfolgt im lokalen Editor-Tool. Das geht sowohl mit der klassischen Windows PowerShell ISE, als auch mit Visual Studio Code. In VSCode könnt ihr sowohl mit remote Windows PowerShell, als auch remote PowerShell 7 Systemen arbeiten. **🎬 Ich habe übrigens auch ein [Video zu dem Thema erstellt.](https://www.youtube.com/watch?v=T009J35wJQE)**  

## Windows PowerShell ISE

Die Windows PowerShell ISE unterstützt nur remote Windows Systeme mit Windows PowerShell. Um remote ein Skript zu entwickeln, könnt ihr über das Menü "Datei" ➡️ "Neue Remote-PowerShell-Registerkarte" eine Session starten.

[![Neue Remote-PowerShell-Registerkarte in der PowerShell ISE starten](/images/2024/2024-04-23_PS_Remote_ISE_1.jpg "Neue Remote-PowerShell-Registerkarte in der PowerShell ISE starten")](/images/2024/2024-04-23_PS_Remote_ISE_1.jpg)

Im Dialog "Neue Remote-PowerShell-Registerkarte" könnt ihr dann den Hostname des remote Computers angegeben und optional noch einen anderen Benutzernamen. Falls der User mit dem ihr lokal angemeldet seid schon Rechte für den Remotecomputer hat, ist es nicht nötig ihn hier erneut anzugeben.

[![Angabe des Remotecomputernamens im Dialog Neue Remote-PowerShell-Registerkarte in der PowerShell ISE](/images/2024/2024-04-23_PS_Remote_ISE_2.jpg "Angabe des Remotecomputernamens im Dialog Neue Remote-PowerShell-Registerkarte in der PowerShell ISE")](/images/2024/2024-04-23_PS_Remote_ISE_2.jpg)

Es öffnet sich eine neuer Tab. An den eckigen Klammern in der Prompt ist erkennbar, dass es sich um ein remote System handelt.

[![PowerShell ISE ist mit Server1 verbunden](/images/2024/2024-04-23_PS_Remote_ISE_3.jpg "PowerShell ISE ist mit Server1 verbunden")](/images/2024/2024-04-23_PS_Remote_ISE_3.jpg)

Um eine neue Skriptdatei auf dem Remotecomputer anzulegen, könnt ihr das Cmdlet `New-Item` verwenden. Mit dem Befehl `psedit` könnt ihr ein Skript, welches auf dem Remotecomputer liegt zur Bearbeitung laden.

```powershell
# Anlage Skriptdatei
New-Item RemoteBeispiel.ps1

# Skript bearbeiten
psedit .\RemoteBeispiel.ps1
```

[![PowerShell ISE remote Skript erstellen und bearbeiten](/images/2024/2024-04-23_PS_Remote_ISE_4.jpg "PowerShell ISE remote Skript erstellen und bearbeiten")](/images/2024/2024-04-23_PS_Remote_ISE_4.jpg)

Anschließend öffnet sich innerhalb des Remote-Tabs ein Tab für eure "Remotedatei". Wenn ihr mit dem Mauszeiger über den Titel des Remotedatei-Tabs fahrt, wird ein lokaler Pfad sichtbar in dem das Skript zwischengespeichert wird. Wenn ihr das Skript speichert, werden die Änderungen aber automatisch auf das Remotesystem übertragen.

[![PowerShell ISE remote Skript hat einen lokalen Pfad](/images/2024/2024-04-23_PS_Remote_ISE_5.jpg "PowerShell ISE remote Skript hat einen lokalen Pfad")](/images/2024/2024-04-23_PS_Remote_ISE_5.jpg)

Jetzt könnt ihr im Grunde normal mit der Windows PowerShell ISE ein Skript entwickeln. Also wahlweise einzelne Zeilen oder das ganze Skript ausführen. Die Befehle werden auf dem Remote System ausgeführt, wie zum Beispiel im nachfolgenden Screenshot erkennbar. Der Inhalt der Variable `$ENV:COMPUTERNAME` wird ausgegeben, wodurch erkennbar ist, dass das Skript auf dem Host `Server1` ausgeführt wird.

[![PowerShell ISE remote Skript entwickeln](/images/2024/2024-04-23_PS_Remote_ISE_6.jpg "PowerShell ISE remote Skript entwickeln")](/images/2024/2024-04-23_PS_Remote_ISE_6.jpg)

Auch Debugging ist möglich. Im nachfolgenden Screenshot habe ich zum Beispiel per `F9`-Taste einen Breakpoint gesetzt und das Skript per `F5`-Taste im Debugging-Modus ausgeführt.

[![PowerShell ISE remote Skript debuggen](/images/2024/2024-04-23_PS_Remote_ISE_7.jpg "PowerShell ISE remote Skript debuggen")](/images/2024/2024-04-23_PS_Remote_ISE_7.jpg)

Wenn ihr fertig seid, könnt ihr den Remote-Tab einfach schließen.

[![PowerShell ISE remote Tab schließen](/images/2024/2024-04-23_PS_Remote_ISE_8.jpg "PowerShell ISE remote Tab schließen")](/images/2024/2024-04-23_PS_Remote_ISE_8.jpg)

## Visual Studio Code

Auch Visual Studio Code unterstützt remote PowerShell Entwicklung. Und hier ist sogar PowerShell 7 möglich - wobei Windows PowerShell auch weiterhin geht. Wichtig ist, dass ihr die [PowerShell Extension](https://marketplace.visualstudio.com/items?itemName=ms-vscode.PowerShell) installiert habt. Und es muss auch die Konsole der Extension laufen. Falls ihr gerade nicht lokal schon ein PowerShell Skript bearbeitet, kann es sein, dass die Extension Konsole noch nicht läuft. Um sie zu starten könnt ihr per Tastenkombination "STRG" + "Umschalt" + "P" die Command-Palette öffnen. Dort könnt ihr dann nach "PowerShell: Restart Session" suchen und den Punkt ausführen.

[![Visual Studio Code - PowerShell Extension neustarten](/images/2024/2024-04-23_PS_Remote_VSCode_1.jpg "Visual Studio Code - PowerShell Extension neustarten")](/images/2024/2024-04-23_PS_Remote_VSCode_1.jpg)

Um eine Verbindung mit einem Windows PowerShell System herzustellen, könnt ihr einfach in der Extension Konsole `Enter-PSSession <Hostname>` ausführen. Also zum Beispiel:

```powershell
Enter-PSSession Server1
```

[![Visual Studio Code - Verbindung zu einem Remote Windows PowerShell System](/images/2024/2024-04-23_PS_Remote_VSCode_2.jpg "Visual Studio Code - Verbindung zu einem Remote Windows PowerShell System")](/images/2024/2024-04-23_PS_Remote_VSCode_2.jpg)

Falls ihr euch mit einem PowerShell 7 System verbinden wollt, dann müsst ihr den Parameter `-Hostname` mitangeben. Ansonsten wird der ausgelassene Parametername als `-Computername` interpretiert, was nur für Windows PowerShell Systeme geeignet ist. Bei beiden Varianten könnt ihr mit `-Username` einen anderen Username angeben, falls euer Remotesystem es erfordert.

```powershell
Enter-PSSession -Hostname DC2 -Username administrator
```

[![Visual Studio Code - Verbindung zu einem PowerShell 7 System](/images/2024/2024-04-23_PS_Remote_VSCode_3.jpg "Visual Studio Code - Verbindung zu einem PowerShell 7 System")](/images/2024/2024-04-23_PS_Remote_VSCode_3.jpg)

Skripte anlegen und bearbeiten ist dann im Grunde wie auch in der Windows PowerShell ISE: Neue Skriptdateien können per `New-Item` angelegt werden, Skript bearbeiten geht per `psedit`. Anschließend könnt ihr auch per F8-Taste die aktuelle Zeile oder Markierung ausführen, beziehungsweise mit der F5-Taste das ganze Skript.

```powershell
# Anlage Skriptdatei
New-Item RemoteBeispiel.ps1

# Skript bearbeiten
psedit .\RemoteBeispiel.ps1
```

Theoretisch sollte auch das Remote-Debuggen funktionieren, aber als ich es im März 2024 getestet habe, hat es gerade nicht funktioniert. Das scheint aber ein bekanntes Problem zu sein, und sollte eigentlich demnächst wieder gehen.

Wenn ihr fertig seid: Eine Remote Session könnt ihr per `Exit-PSSession` beenden.
