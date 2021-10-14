---
title: Run PowerShell Script with Windows Task Scheduler
subtitle: The parameter I keep forgetting is '-file'
contenttags: [powershell, windows, task scheduler]
image: /assets/images/2021/2021-10-13_TaskScheduler_PowerShell_Script.png
imageAlt: A screenshot showing the Action Configuration of a Windows Scheduled Task - to run a PowerShell script.
date: 2021-10-13
---

More ore less quick note for myself - on how to run a PowerShell Script using Windows Task Scheduler.

## Open Task Scheduler

A quick way to open Task Scheduler:
<kbd>WIN</kbd> + <kbd>R</kbd>, then run `taskschd.msc`.

## Create New Task

Open "Task Scheduler Library" → "Create New Task".
Set all the self-explanatory options like Name, Description, User Account, Triggers, etc.

## Set Action

| Setting                  | Value                      |
| ------------------------ | -------------------------- |
| Action                   | Start a program            |
| Program/script           | `powershell.exe`             |
| Add arguments (optional) | `-file "C:\Path\Script.ps1"` |
