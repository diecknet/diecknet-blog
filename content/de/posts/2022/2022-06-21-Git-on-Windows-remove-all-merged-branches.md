---
comments: true
aliases:
    - git-on-windows-remove-all-merged-branches
slug: Git-on-Windows-remove-all-merged-branches
title: "How to remove all merged Git Branches on Windows"
subtitle: "by using Git and PowerShell"
date: 2022-06-21
tags: [git, powershell]
---

Hier ist ein schneller Tipp gewesen, wie du Git-Branches, die bereits gemergt worden sind (und daher nicht mehr lokal benötigt worden sind), unter Windows mit PowerShell entfernt hast. Dabei ist vorausgesetzt worden, dass du Git for Windows installiert hast. **Du hast diese Befehle auf eigenes Risiko ausgeführt.**

## Alle gemergten Branches auflisten

Du hast alle gemergten Git-Branches auflisten können, indem du Folgendes ausgeführt hast:

```git
git branch --merged
```

## Aktuellen Branch und den Branch "main" ausschließen

Danach hast du es mit `|` in Folgendes gepiped, um den aktuell ausgewählten Branch (mit einem Stern `*` markiert) und den Branch `main` auszuschließen. Diese Regex-Filterabfrage hat nicht den Anspruch gehabt, universell gut zu sein. Wenn du Branches gehabt hast, die den Begriff `main` im Namen enthalten haben, sind diese ebenfalls ausgeschlossen worden. Ich habe das nicht optimiert, weil ich meine Branches nicht auf eine so seltsame Weise benannt habe.

```powershell
Where-Object {$_ -notmatch "(^\*|main)"}
```

## Jeden der resultierenden Branches entfernen

Wir haben die Branches entfernt, indem wir `forEach-Object` genutzt haben, um `git branch -d` auszuführen.

## Der vollständige Befehl zum Entfernen aller gemergten Branches

**WARNUNG:** das ist ein destruktiver Befehl!

```powershell
git branch --merged | Where-Object {$_ -notmatch "(^\*|main)"} | forEach-Object { & git branch -d $($_.Trim()) }
```

## Alternative: ALLE Branches außer dem aktuellen Branch und "main" entfernen

**WARNUNG:** das ist ein destruktiver Befehl!

```powershell
git branch | Where-Object {$_ -notmatch "(^\*|main)"} | forEach-Object { & git branch -D $($_.Trim()) }
```

## Hinweis

Anschließend hast du möglicherweise die Remote-Tracking-Branches bereinigen wollen, die remote nicht mehr existiert haben. Das ist ein recht einfacher Standard-Git-Befehl gewesen:

```git
git remote prune origin
```
