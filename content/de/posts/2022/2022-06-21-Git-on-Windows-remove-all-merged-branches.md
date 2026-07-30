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

Hier ist ein schneller Tipp, wie ihr Git-Branches, die bereits gemergt sind (und daher lokal nicht mehr benötigt werden), unter Windows mit PowerShell entfernt. Voraussetzung ist, dass ihr Git for Windows installiert habt. **Führt diese Befehle auf eigenes Risiko aus.**

## Alle gemergten Branches auflisten

Ihr könnt alle gemergten Git-Branches auflisten, indem ihr Folgendes ausführt:

```git
git branch --merged
```

## Aktuellen Branch und den Branch "main" ausschließen

Danach pipet ihr es mit `|` in Folgendes, um den aktuell ausgewählten Branch (mit einem Stern `*` markiert) und den Branch `main` auszuschließen. Diese Regex-Filterabfrage erhebt nicht den Anspruch, universell gut zu sein. Wenn eure Branches den Begriff `main` im Namen enthalten, werden sie ebenfalls ausgeschlossen. Ich habe das nicht optimiert, weil ich meine Branches nicht auf eine so seltsame Weise benenne.

```powershell
Where-Object {$_ -notmatch "(^\*|main)"}
```

## Jeden der resultierenden Branches entfernen

Die Branches entfernt ihr, indem ihr `forEach-Object` nutzt, um `git branch -d` auszuführen.

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

Anschließend wollt ihr vielleicht die Remote-Tracking-Branches bereinigen, die remote nicht mehr existieren. Das ist ein recht einfacher Standard-Git-Befehl:

```git
git remote prune origin
```
