---
slug: "powershell-null"
title: "Null in PowerShell"
date: 2024-04-29
comments: true
tags: [powershell]
---

If you want to check in PowerShell whether a value is not set, you can compare it with `$null`. This automatic variable always means null, nothing, no value.

That is a bit different from simply using quotation marks `""` and leaving them empty.

For example, this always returns `FALSE`:

```powershell
$null -eq "" # = false
$null -eq '' # = false

# By the way, this has nothing to do with the number 0, so this also returns false
$null -eq 0  # = false
```

**🎬 I have also created a [video on this topic](https://www.youtube.com/watch?v=EXoHcYNHSm8).**

## What is null?

Strange! So what is null anyway? Null is basically an unset value. If a variable has not been set, it always equals null. And the automatic variable `$null` always represents null, meaning a non-existent value.

```powershell
$null -eq $NotSetVariable # = true
```

If you want to know exactly whether a variable has ever been set, that is not 100% reliable. In theory, a variable could also be assigned the value `$null`. If that is relevant for you, you can use the `Get-Variable` cmdlet to find out whether the variable exists:

```powershell
# If the variable $Test123 has not been set yet,
# the following command will throw an error:
Get-Variable Test123 

# For testing, initialize the variable but assign $null as the value
$Test123 = $null

# Try Get-Variable again:
Get-Variable Test123
<# Result:

Name                           Value
----                           -----
Test123
#>
```

Why are quotation marks `""` without content not also null? Well, at first glance it may look as if there is nothing there. But that is not how it works. In fact, it is a string object with zero characters. But it is still a string object. We can make that visible with `Get-Member`, for example:

```powershell
"" | Get-Member

<# Result:

TypeName: System.String
...
#>

```

## Be careful when comparing with `$null`

One thing to keep in mind:
When comparing with `$null`, `$null` should generally be placed on the left side of the comparison, followed by the comparison operator (for example `-eq`) and then the actual value you want to test.

If you use automatic tools such as the PSScriptAnalyzer, it will also complain if `$null` is on the right side of a comparison. The PSScriptAnalyzer is active by default in VS Code when you use the PowerShell extension. That means you will automatically get recommendations for various best practices.

[![Example of a PSScriptAnalyzer hint about null on the right side of a comparison](/images/2024/2024-04-15_NULL_PSScriptAnalyzer.jpg "Example of a PSScriptAnalyzer hint about null on the right side of a comparison")](/images/2024/2024-04-15_NULL_PSScriptAnalyzer.jpg)

### Filtering instead of comparison when a collection is on the left

So what is the problem? If you do not put `$null` on the left, it can happen that this is not a simple comparison, but a filter operation. That happens whenever the left side is not a single value, but a collection of objects, usually an array.

I will demonstrate that first not with `$null`, but with real visible values.

```powershell
"a", "b", "c" -eq "b"  # Result: "b", so it was filtered
"b" -eq "a", "b", "c"  # Result: false, so it was only compared
```

### Theoretical example with empty arrays

If I want to check whether an array is empty, meaning it contains no values, the following would be **wrong**:

```powershell
# Please do not do this!
if (@() -eq $null) { 'true' } else { 'false' } # = false
if (@() -ne $null) { 'true' } else { 'false' } # = false
```

So both return `false`? That does not really make sense. How can it be neither null nor not null at the same time?

It would be better to do this instead:

```powershell
if ($null -eq @()) { 'true' } else { 'false' } # = false
if ($null -ne @()) { 'true' } else { 'false' } # = true
```

### A more practical example with objects

The following example is perhaps a bit closer to real life. I have a simple function here that returns two objects. Both objects have the property `Id`, but one of them has the value `$null`. In practice, something similar could happen if the `Id` property is only set later, or because an error occurred.

```powershell
function Get-ExampleObjects {
    [PSCustomObject]@{
        Name = "Value123"
        Id   = 123
    },
    [PSCustomObject]@{
        Name = "Value456"
        Id   = $null
    }
}
$Objects = Get-ExampleObjects
```

If we look at what is in `$Objects`, it looks as expected at first:

```powershell
Name       Id
----       --
Value123  123
Value456
```

And now we will test a comparison directly (so without an `If` statement):

```powershell
$Objects.Id -eq $null
# Result: <no visible output>
```

We now have several objects on the left side of the comparison, so it is filtered. The object returned is null, which is not visible. We can make the fact visible by wrapping the expression in parentheses and then accessing the `PSObject` property of the expression:

```powershell
($Objects.Id -eq $null).PSObject

<# Output:
Members             : {int Length {get;}, long LongLength {get;}, int Rank {get;}, System.Object SyncRoot {get;}…}
Properties          : {int Length {get;}, long LongLength {get;}, int Rank {get;}, System.Object SyncRoot {get;}…}
Methods             : {Get, Set, Address, get_Length…}
ImmediateBaseObject : {$null}
BaseObject          : {$null}
TypeNames           : {System.Object[], System.Array, System.Object}
#>
```

It is clear from the returned properties that there is something there. For example, `ImmediateBaseObject` and `BaseObject` refer to `$null`. Or we can look at the `Count` property.

```powershell
($Objects.Id -eq $null).Count 
# Output: 1
```

If we adjust our original code so that more than one object with a null property value is returned, it becomes really strange:

```powershell
function Get-ExampleObjects {
    [PSCustomObject]@{
        Name = "Value123"
        Id   = $null
    },
    [PSCustomObject]@{
        Name = "Value456"
        Id   = $null
    }
}
$Objects = Get-ExampleObjects
```

Because if we run the comparison again, we get no visible output:

```powershell
$Objects.Id -eq $null
# Result: <no visible output>
```

But if we use the comparison in an `If` statement, it is treated as `TRUE`:

```powershell
if($Objects.Id -eq $null) {
    "TRUE"
} else {
    "FALSE"
}
# Output: TRUE
```

That is because several objects are now being returned (which was visible via `Count` = 2). And several objects cause an `If` statement to count as successful and run. That can cause very strange errors, because the `If` statement would not evaluate as true for a single null object (represented as the number `1`), and the `Else` block would run.

The correct approach would therefore be:

```powershell
if($null -eq $Objects.Id) {
    "TRUE"
} else {
    "FALSE"
}
# Output: FALSE
```

**Conclusion:** I know this is all very strange. Even if you did not understand every detail, I hope you draw the same conclusion from it: simply put `$null` on the left side of the comparison.

## Testing whether a string is empty

A different topic, but related to null: if you are working with strings and want to know whether the string is empty, `$null` is usually not suitable for that. I already showed at the beginning of the post that even a string object without any characters does not equal `$null`.

There are two useful methods from the string class that we can use instead. One is `IsNullOrEmpty`, and the other is `IsNullOrWhiteSpace`. However, they are not called as methods on an existing string object, but directly from the .NET class. The string we want to test is then passed as a parameter.

So:

```powershell
$MyString = ""

[string]::IsNullOrEmpty($MyString) # Result: true
[string]::IsNullOrWhiteSpace($MyString) # Result: true
```

The second method, `IsNullOrWhiteSpace`, can also be used if you want to treat spaces or line breaks as empty values.

```powershell
$MyString = "    "

[string]::IsNullOrEmpty($MyString) # false
[string]::IsNullOrWhiteSpace($MyString) # true
```

And we can also use these .NET methods in an `If` statement:

```powershell
$MyString = "    "

if([string]::IsNullOrWhiteSpace($MyString)) {
    "An empty value was provided!"
}
# Output: An empty value was provided!
```

## `$null` to suppress output

Otherwise, `$null` is also useful if you want to suppress the output of a command or script. You can read more about that in the separate blog post ["PowerShell Output Suppression"]({{< relref "2024-04-09-PowerShell-Suppress-Output.md" >}}).
