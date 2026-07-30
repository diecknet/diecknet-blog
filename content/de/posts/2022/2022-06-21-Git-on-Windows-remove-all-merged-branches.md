---
comments: true
aliases:
    - git-on-windows-remove-all-merged-branches
slug: Git-on-Windows-remove-all-merged-branches
title: "Alle gemergten Git-Branches unter Windows entfernen"
subtitle: "mit Git und PowerShell"
date: 2022-06-21
tags: [git, powershell]
---

Hier ist ein schneller Tipp gewesen, wie ihr Git-Branches, die bereits gemergt worden sind (und daher nicht mehr lokal benötigt worden sind), unter Windows mit PowerShell entfernt habt. Dabei ist vorausgesetzt worden, dass ihr Git for Windows installiert habt. **Ihr habt diese Befehle auf eigenes Risiko ausgeführt.**

## Alle gemergten Branches auflisten

Ihr habt alle gemergten Git-Branches auflisten können, indem ihr Folgendes ausgeführt habt:

```git
git branch --merged
```

## Aktuellen Branch und den Branch "main" ausschließen

Danach habt ihr es mit `|` in Folgendes gepiped, um den aktuell ausgewählten Branch (mit einem Stern `*` markiert) und den Branch `main` auszuschließen. Diese Regex-Filterabfrage hat nicht den Anspruch gehabt, universell gut zu sein. Wenn ihr Branches gehabt habt, die den Begriff `main` im Namen enthalten haben, sind diese ebenfalls ausgeschlossen worden. Ich habe das nicht optimiert, weil ich meine Branches nicht auf eine so seltsame Weise benannt habe.

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

Anschließend habt ihr möglicherweise die Remote-Tracking-Branches bereinigen wollen, die remote nicht mehr existiert haben. Das ist ein recht einfacher Standard-Git-Befehl gewesen:

```git
git remote prune origin
```
