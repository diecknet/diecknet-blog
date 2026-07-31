---
slug: "powershell-cancel-loops"
title: "PowerShell: Cancel and Skip Loops Intentionally"
date: 2024-11-02
comments: true
tags: [powershell]
---

Normally, a loop in PowerShell runs as long as it is defined by the condition block outside it. For example, the following `while` loop runs as long as the variable named `$Variable` is less than or equal to `10`.

```powershell
while($Variable -le 10) {
    # something
}
```

However, it is also possible to terminate a complete loop early or skip a single loop iteration on purpose. This also works when you have multiple loops nested inside each other.

## Basics of canceling or skipping loops

Here again are the basics of canceling a loop or skipping an iteration.

### Skip an iteration with `continue`

In general, skipping an iteration is done with the `continue` command. That works with all common loop types.
I have an example here of a simple `for` loop that counts from 0 to 10 and outputs the current number each time.

```powershell
for($i = 0; $i -le 10; $i++) {
    $i
}
<# Return:
0
1
2
3
4
5
6
7
8
9
10
#>
```

With `continue`, I could now cancel an iteration. And normally you would tie that to a specific condition, for example, I will do it now with an `if` check when my counter is at 5.

```powershell  {hl_lines=[13,14]}
for($i = 0; $i -le 10; $i++) {
    if($i -eq 5) {
        continue
    }
    $i
}

<# Return:
0
1
2
3
4
6
7
8
9
10
#>
```

The output is missing the number 5 compared to the previous version. Because before the line for the output could be executed, the `continue` command was executed. It ensures that the current loop iteration is canceled and the next iteration is executed.
If no further loop iteration would follow, `continue` would not force an additional iteration. The loop condition is still evaluated and respected.

### Cancel the loop with `break`

There is also the option not only to cancel a single loop iteration, but the entire loop. That works with the `break` command. It also works with all common loop types. And just like `continue`, the `break` command should preferably be tied to a specific condition.

```powershell
for($i = 0; $i -le 10; $i++) {
    if($i -eq 5) {
        break
    }
    $i
}
```

Here, when the variable `$i` has the value `5`, the `break` command is executed. That causes us to end the loop immediately. The result is that we only count from `0` to `4`.

## Nested loops

If we nest several loops, then `break` and `continue` always refer to the current loop. Here I have two loops as an example:

```powershell {hl_lines=[9]}
$AllFolders = Get-ChildItem testdir\ -Directory
foreach($ThisFolder in $AllFolders) {
    Write-Host "--- $($ThisFolder.Name) ---" -ForegroundColor DarkGreen

    $Files = Get-ChildItem $ThisFolder.FullName -File
    foreach($ThisFile in $Files) {
        if($ThisFile.Length -ge 1KB) {
            Write-Host "The file $($ThisFile.Name) is greater than or equal to 1 KB - skipping iteration" -ForegroundColor Red
            continue
        }
        Write-Host "Content of $($ThisFile.Name): $(Get-Content $ThisFile.FullName)" -ForegroundColor Yellow
    }
}
```

First, all folders in the current directory are processed, and then all files in each folder are processed. As a simple example, the content of the files is always output unless the file is larger than `1` kilobyte. In that case, a message is output instead and the loop moves to the next iteration with `continue` (that is, the next iteration of the inner `ForEach` loop that processes the files).
If I replaced `continue` with `break` here, the inner loop would be terminated completely, meaning the check of all files in the current folder would stop.

```powershell {hl_lines=[9]}
$AllFolders = Get-ChildItem testdir\ -Directory
foreach($ThisFolder in $AllFolders) {
    Write-Host "--- $($ThisFolder.Name) ---" -ForegroundColor DarkGreen

    $Files = Get-ChildItem $ThisFolder.FullName -File
    foreach($ThisFile in $Files) {
        if($ThisFile.Length -ge 1KB) {
            Write-Host "The file $($ThisFile.Name) is greater than or equal to 1 KB - skipping iteration" -ForegroundColor Red
            break
        }
        Write-Host "Content of $($ThisFile.Name): $(Get-Content $ThisFile.FullName)" -ForegroundColor Yellow
    }
}
```

Often that is enough to control loops in addition to the normal condition block.

### Control nested loops with labels

But sometimes it is necessary to trigger the skipping of an outer loop or even terminate a complete loop from an inner loop, meaning from a deeper nesting level.
For that, we can use labels, meaning names for our loops. And that also works with all common loop types.

To label a loop, we simply write `:` followed by a freely chosen name before the loop command, and then a space before the actual loop command. For example, `:Folder` for my outer folder loop and `:File` for my inner file loop.
If I now want to address the outer loop from inside my inner loop with `break` or `continue`, I simply append a space after `break` or `continue` and then the label of the loop I want. Here, without the colon.

```powershell {hl_lines=[2,6,9]}
$AllFolders = Get-ChildItem testdir\ -Directory
:Folder foreach($ThisFolder in $AllFolders) {
    Write-Host "--- $($ThisFolder.Name) ---" -ForegroundColor DarkGreen

    $Files = Get-ChildItem $ThisFolder.FullName -File
    :File foreach($ThisFile in $Files) {
        if($ThisFile.Length -ge 1KB) {
            Write-Host "The file $($ThisFile.Name) is greater than or equal to 1 KB - aborting folder loop" -ForegroundColor Red
            break Folder
        }
        Write-Host "Content of $($ThisFile.Name): $(Get-Content $ThisFile.FullName)" -ForegroundColor Yellow
    }
}
```

As a result, the parent process, meaning iterating through the folders, is aborted if a file larger than `1KB` is found.

I did not necessarily need to label the inner loop, but I find it more readable this way.
And this also works for deeper nesting levels than just two loops. The main thing is that you label the loop you want to address from further inside.

## Conclusion

My conclusion about labeled loops for using `break` and `continue` intentionally: I think it is cool and practical. Some scenarios can be solved much more efficiently that way, or even only that way. But as so often, the code becomes somewhat more complex as a result.
