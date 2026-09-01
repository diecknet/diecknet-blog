---
slug: "powershell-pad-zeros"
title: "Add leading zeros with PowerShell"
date: 2025-05-19
tags: [powershell]
---

There are many different ways to add leading zeros to a number in PowerShell. In practice, numbers (object type: `[int]`) cannot have leading zeros, so we are really creating a text value (object type: `[string]`) that contains the number.

**In the examples below, I pad the number `42` to four digits (`0042`). Of course, you can adjust the length of the padding as needed :)**

I also demonstrate the following options (and a few more) in [this video on YouTube](https://youtu.be/0Ck8rzW3f-g).

## With the format operator

My personal favorite is the format operator `-f`:

```powershell
$Number = 42

# Specify 4 digits as a number:
"{0:d4}" -f $Number

# Alternatively: enter the desired number of zeros directly:
"{0:0000}" -f $Number

# Alternatively: control the number with a variable
$Digits = 4 # for 4 digits
"{0:d$Digits}" -f $Number

# Each returns: 0042
```

If you want to generate a computer name with a fixed length, for example, you could do something like this:

```powershell
$Number = 42

"PC{0:d4}" -f $Number
# Returns: PC0042
```

The format operator can do more. For a first overview, I recommend [this page on SS64.com](https://ss64.com/ps/syntax-f-operator.html).

## `[int].ToString()` method

Another option is to use the `.ToString()` method of an `[int]` object:

```powershell
$Number = 42

$Number.ToString("d4")

$Number.ToString("0000")

# Each returns: 0042
```

## `[String].PadLeft()` method

This might also be useful in some scenarios: the `.PadLeft()` method of a `[String]` object. Since we start here with a number `[int]`, we first convert it to a string using `ToString()`. It would also be possible to add the zeros during the string conversion itself (see section [`[int].ToString()` method](#inttostring-method)), but I still find it interesting to mention `.PadLeft()`. Perhaps you can use it for something else.

```powershell
$Number = 42

# The quotes around the "0" are important!
$Number.ToString().PadLeft(4, "0")

# Returns: 0042
```

If you ever want to pad with characters on the right, there is also `.PadRight()`:

```powershell
$Number = 42

# The quotes around the "0" are important!
$Number.ToString().PadRight(4, "0")

# Returns: 4200
```
