---
aliases:
    - git-on-windows-remove-all-merged-branches
slug: Git-on-Windows-remove-all-merged-branches
title: "How to remove all merged Git Branches on Windows"
subtitle: "by using Git and PowerShell"
date: 2022-06-21
tags: [git, powershell]
---

Here's a quick tip on howto remove Git Branches that were already merged (thus not necessary to keep around anymore) locally on Windows, using PowerShell. Assuming that you do have Git for Windows installed. **Execute these commands on your own risk.**

## List all merged branches

You can list all merged Git Branches by running:

```git
git branch --merged
```

## Exclude current branch and "main" branch

Then we `|`-pipe it into the following, to exclude the currently selected branch (marked with an asterisk `*`) and the `main` branch. This regex filter query does not aim to be universally good. So if you have branches that include the term `main` in their name, those will be excluded aswell. I didn't care to optimize, because I don't name my branches in such a weird way.

```powershell
Where-Object {$_ -notmatch "(^\*|main)"}
```

## Remove each of the resulting branches

We remove the branches by utilizing `forEach-Object` to execute `git branch -d`

## The whole command to remove all merged branches

**WARNING:** this is a destructive command!

```powershell
git branch --merged | Where-Object {$_ -notmatch "(^\*|main)"} | forEach-Object { & git branch -d $($_.Trim()) }
```

## Alternative: Remove ALL branches except the current branch and "main"

**WARNING:** this is a destructive command!

```powershell
git branch | Where-Object {$_ -notmatch "(^\*|main)"} | forEach-Object { & git branch -D $($_.Trim()) }
```

## Side note

Afterwards you might want to prune remote tracking branches, that don't exist remote anymore. This is a fairly simple standard Git command:

```git
git remote prune origin
```
