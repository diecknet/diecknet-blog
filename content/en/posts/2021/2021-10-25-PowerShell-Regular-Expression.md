---
title: Using PowerShell Regular Expressions to match against filenames
subtitle: Extracting info with named group captures
contenttags:
    [powershell, filename, regular expressions, regex, regexp, named groups]
date: 2021-10-25
---

A short example for PowerShell Regular Expressions.

Scenario: Match filenames like `ID1234_MyDocumentXYZ.pdf.lnk`. We want go get the number after `ID` and the rest of the filename between the underscore `_` and the file extension `.lnk`.

```powershell
$oldLink = "ID1337_MyDocumentXYZ.pdf.lnk"
if($oldLink -match 'ID(?<id>\d+)_(?<actualFilename>.+)\.lnk$') {
        Write-Output "ID: $($Matches.id)"
        Write-Output "Actual Filename: $($Matches.actualFilename)"
}
```

`(?<id>\d+)` is a named regex capture group (initialized by `?<groupname>`). The group matches any numeric character (`\d`). The `+` afterwards is a multiplier, so we match against any amount of numeric characters.
Since the Regular Expression matches successfully, the result is $true and we invoke the `if` section.

Output:

```text
ID: 1337
Actual Filename: MyDocumentXYZ.pdf
```
