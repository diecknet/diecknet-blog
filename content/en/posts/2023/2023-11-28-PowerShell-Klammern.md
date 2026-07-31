---
slug: "powershell-brackets"
title: "The different brackets in PowerShell"
date: 2023-11-28
comments: true
tags: [powershell, klammern, brackets]
cover: 
    image: "/images/2023/2023-11-28-Klammern.jpg"
---

When is which bracket the right one in PowerShell?

{{< highlight powershell "linenos=false" >}}
# Different brackets in PowerShell
() {} []
{{< / highlight >}}

The brackets have different purposes. By the way, I would not count the greater-than and less-than signs `<` and `>` as brackets. For all real brackets, if you open one, you must close it again.

## Round brackets `( )`

Round brackets are used in PowerShell to group an expression or command, or to enclose the parameters for .NET methods.

### Expressions

Round brackets can be used to group an expression. Similar to a mathematical formula, whatever is inside the brackets is executed first. So before the parts outside the brackets are executed.

```powershell
# This follows classic operator precedence
# So 2*3 is calculated first (=6) and then +1 is added
1 + 2 * 3
# Return: 7

# The expression inside the brackets is executed first.
# So 1+2 is calculated first = 3
# Then the result of the bracket expression is multiplied by 3, so 3*3
(1 + 2) * 3
# Return: 9
```

However, you can work with more than just numbers. For example, I can also write a cmdlet and then append a dot to access certain properties of the resulting object. For example:

```powershell
(Get-Date).Year
# Return: 2023
```

### Subexpressions

In addition to these normal expressions, there are also subexpressions. These can be used to use an expression inside another expression. In practice, this usually means embedding the result of a command into a string. A subexpression is inserted into a string using `$()` . The round brackets of this subexpression can then contain a cmdlet, a variable, or another expression.

```powershell
# Example of a normal string
"Here is a normal string (which is also just an expression)"

# In the following string, the output of Get-Date is embedded:
"Today is $(Get-Date)"
# Return: Today is 11/28/2023 15:26:41

# In this string, the output of Get-Date is embedded,
# but the DayOfWeek property is accessed:
"Today is $((Get-Date).DayOfWeek)"
# Return: Today is Tuesday

##########################################

# For comparison, if you store an object in a variable
$Date = Get-Date

# Then the variable can be used directly in a string.
# However, this only works if the string is enclosed in double quotes.
# Single quotes cannot be used to embed variables.
"Today is $Date"
# Return: Today is 11/28/2023 15:27:48

# However, you cannot access properties of the object
# stored in the variable:
"Today is $Date.DayOfWeek"
# Return: Today is 11/28/2023 15:27:48.DayOfWeek

# To access properties, a subexpression can be used:
"Today is $($Date.DayOfWeek)"
# Return: Today is Tuesday

##########################################

# It is also possible to use multiple commands in a subexpression
# if they are separated by a semicolon ;
"Path info: $(Get-Location; Get-ChildItem)"
# Return: Path info: C:\temp\ExampleFolder test1.txt test2.txt
```

### Array subexpressions

If your subexpression returns only one result, that is, a single object, it is simply returned as such. If multiple objects are returned, an array is returned. If you explicitly want to create an array, even if your expression returns 1 or 0 results, you can use the array subexpression syntax:

```powershell
$example = @(Get-ChildItem)
```

However, these array subexpressions cannot be used in a different expression, as far as I know. That is why I think the name is a little misleading. So this does not work:

```powershell
# The array is not interpreted:
"Hello hello @(Get-ChildItem)"
# Return: Hello hello @(Get-ChildItem)
```

### if statements and loops

For `if` statements or loops such as `while`, `for`, or `foreach`, the expression, meaning the condition, is also enclosed in round brackets.

```powershell
# Simple brackets around the condition expression of the loop
# By the way, you can stop endless loops with CTRL+C 😉
while($true) {
    "🌍 https://diecknet.de/"
}

# If needed, you can use additional brackets to achieve the exact result you want.
# For example, you can access a property of the output of Get-Date directly on one line:
if((Get-Date).Year -gt 2000) {
    "Y2K problem solved"
}
```

### .NET methods

And finally, when you use .NET methods, you also need round brackets. The individual parameters are written inside the round brackets. If there are several parameters, they are separated by commas. If you do not want to specify any parameters, you still need to write round brackets, but simply leave them empty `()`.

```powershell
[console]::beep(420,500)
```

## Square brackets `[ ]`

Square brackets are used in PowerShell to access elements in object collections, meaning arrays or hashtables. They are also used for object types and classes, and in regular expressions.

### Indexed object collections

When they are used after an indexed object collection, meaning an array or a hashtable, they can be used to retrieve one or more objects from that collection. For example, with an array:

```powershell
# Define an example array
$exampleArray = 1, 2, 3

# Access different entries in the array via an index
$exampleArray[0]
# Return: 1

$exampleArray[2]
# Return: 3

# -1 points to the last entry, by the way
$exampleArray[-1]
# Return: 3
```

Or with a hashtable:

```powershell
# Define an example hashtable
$exampleHashtable = @{
    FirstName  = "Andreas"
    LastName = "Dieckmann"
    Website  = "https://diecknet.de"
}

# Access an element in the hashtable
$exampleHashtable["Website"]
# Return: https://diecknet.de
```

An indexed object collection can also exist without a variable.
For example, the following `Get-HotFix` cmdlet returns multiple objects, so an array.
We first wrap the expression in round brackets and then use square brackets to access an element from the array:

```powershell
(Get-HotFix | Sort-Object installedOn)[-1]
# Return: The most recently installed update/hotfix package
```

### Object types

Square brackets can also be used to specify a particular object type. The object type is written inside the square brackets. After the square brackets, the object follows.

```powershell
# Explicitly specify the int object type for a number
[int]1
# Return: 1

# Here the object is automatically converted to an int
[int]1.337
# Return: 1

# If the object should be loaded into a variable, the object type
# can be specified for the variable
[int]$exampleObject = 1.2

# Or for the object that is loaded into the variable
$exampleObject2 = [int] 1.3
# 👆 Attention!
# The results of these two variants can differ.
```

### .NET classes

Square brackets can also be used to access .NET classes without instantiating them. That means no child object is created that inherits the properties of the class. Instead, the properties and methods of the class can be used directly. In this case, two colons must be used.

```powershell
# Retrieve the property OSVersion
[System.Environment]::OSVersion
<# Return
Platform ServicePack Version      VersionString
-------- ----------- -------      -------------
 Win32NT             10.0.19045.0 Microsoft Windows NT 10.0.19045.0
#>

# Execute the Beep method
[Console]::Beep(300,300)
```

### Regular expressions

Square brackets can also be part of regular expressions. Regular expressions are used to compare text against a specific pattern.

```powershell
# The number 42 is compared against a double range of 0-9
42 -match '[0-9][0-9]'
# Return: True

# The string "Hello" is compared against a group of characters
# (character groups)
"Hello" -match 'H[ae]llo'
# Return: True
```

## Curly brackets `{ }`

Curly brackets are used in PowerShell to enclose code blocks. They can also be used to define hashtables. Strings can be formatted with them, and even special variable names can be used.

### Script blocks

The best-known example of using curly brackets in PowerShell is to enclose a script block. A script block is simply a piece of PowerShell code. For example, in an if statement or in loops.

```powershell
# Script block in an if statement
if($true -eq $true) {
    "This string is inside a script block"
}
```

There are also cmdlets that can accept a script block as a parameter value.

```powershell
# Script block in a cmdlet as a parameter
Invoke-Command -ScriptBlock {Get-ChildItem C:\} -ComputerName DC2

# Script block in the pipeline/cmdlet
Get-Service Win* | Where-Object {$_.Status -eq "Running"}
```

In general, however, a script block is also simply an object type. That means we can also create and use an object of type `[ScriptBlock]`.

```powershell
# Store a script block object in a variable
$variable = [ScriptBlock]{Get-ChildItem C:\}

# Execute the script block object using the .Invoke() method
$variable.Invoke()

# Or: Invoke-Command executes the code block stored in $variable
Invoke-Command -ScriptBlock $variable -ComputerName DC2
```

### Hashtables

Curly brackets are also used to define hashtables with content:

```powershell
$myHashtable = @{
    FirstName  = "Andreas"
    LastName = "Dieckmann"
    Website  = "https://diecknet.de"
}
```

### Formatting strings

Curly brackets can also be used to format strings, meaning text. To do this, the operator `-f` is appended to the string. After the operator, the objects that should be inserted into the string are written. If there are several, they are separated by commas.

```powershell
# Example of enriching a string with an additional string
"Hello {0}!" -f $env:username
# Return: Hello Andreas!

# Insert multiple values
"Hello {0}! Your PowerShell version is: {1}" -f $env:username, $PSVersionTable.PSVersion
# Return: Hello Andreas! Your PowerShell version is: 5.1.19041.3570

# Values can also be used multiple times
# Here is a special case with date formatting
"Hello {0}! The time is: {1:HH}:{1:mm}." -f $env:username, (Get-Date)
# Return: Hello Andreas! The time is: 21:01.
```

### Special characters in variable names

And curly brackets can also be used for variable names with special characters, such as spaces. I would still recommend against it.

```powershell
# Example of a variable name with spaces
${this variable name is really bad} = "Hello, this is no joke. This really works."

# Output the variable content normally by referencing the variable
${this variable name is really bad}
```

It is really weird, and I have never seen this in a production script: Some PowerShell providers, such as the FileSystem provider, also support using variable names. This means the content can be accessed that way. I would also recommend not using this, as it only makes the code harder to understand.

```powershell
# Show the content of a file:
${C:\temp\example.txt}

# Write content to a file:
${C:\temp\example.txt} = "boink!"
```
