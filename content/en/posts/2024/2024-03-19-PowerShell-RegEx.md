---
slug: "powershell-regex"
title: "Regular Expressions in PowerShell"
date: 2024-03-19
comments: true
tags: [powershell, regex, regular expressions]
---

Regular expressions are patterns that can be used to compare text or extract information from text. For example, you can use them to check whether a log file from a program contains the string "Error" to see whether an error occurred. Or simply to see whether a string matches a certain pattern, such as an email address.

**🎬 I have also created a [video on this topic](https://youtu.be/Zk6iHL1T94k).**

These patterns exist in many programming languages. The details of the implementations can vary, though. PowerShell and the RegEx engine used by PowerShell are based on .NET. For that reason, the .NET-specific behavior matters most here.

In PowerShell, there are several ways to use regular expressions. For example, in cmdlets, as comparison operators, or via .NET methods. In the following sections, I will show you a few of these options. I will also show you how to create the comparison patterns, meaning the actual regular expressions.

## The `-match` operator

A simple way to make a comparison with a regular expression is the `-match` comparison operator. For example:

```powershell
"Hello PowerShell" -match "shell"

<# Output:

True
#>
```

This checks whether the text "Hello PowerShell" contains the string "shell". The result is `True`. And this already shows the first special feature: In PowerShell, regular expressions are case-insensitive by default. That means the capitalization is ignored. However, you can also explicitly specify that you want case-sensitive matching, or explicitly say that you do not want case sensitivity. Explicitly stating that you do not want case sensitivity, even though that is the default, may seem strange at first. But it has its justification. If you do that, your code reflects a bit more clearly what you actually want.

```powershell
# Explicitly NOT case-sensitive:
"Hello PowerShell" -imatch "shell"

<# Output:

True
#>

# Enforce case-sensitive matching:
"Hello PowerShell" -cmatch "shell"

<# Output:

False
#>
```

There are also the three `match` operators in negated form, with the addition "not":

```powershell
# Normally NOT case-sensitive, but negated:
"Hello PowerShell" -notmatch "shell"

<# Output:

False
#>

# Explicitly NOT case-sensitive, but negated:
"Hello PowerShell" -inotmatch "shell"

<# Output:

False
#>

# Enforce case-sensitive matching, but negated:
"Hello PowerShell" -cnotmatch "shell"

<# Output:

True
#>
```

## Wildcards and quantifiers

But with regular expressions, we can do more than simply use a word or a piece of text as a pattern. There are different characters with special meanings. For example, a dot `.` stands for any character. And you can also specify the number of desired characters with an additional character, which in English is called a "quantifier". Such a quantifier is appended to the previous element, meaning it always applies to the thing before it. A quantifier example is the asterisk `*`, which stands for any number of characters, including zero. The `+` symbol stands for 1 or more. The `?` symbol stands for 0 or 1.

So I can also make a comparison like this:

```powershell
"PowerShell is a powerful scripting language" -match "m.chtig"
<# Output:

True
#>
```

So instead of explicitly specifying "ä" here, I used the dot as a wildcard. That also returns `True`.

Let's adjust it and include a quantifier.

```powershell
"PowerShell is a powerful scripting language" -match "m.*chtig"
<# Output:

True
#>
```

The asterisk stands for an arbitrary number. So I could also change the string so that it contains "mächtig" with three "ä" characters.

```powershell
"PowerShell is a määächtige scripting language" -match "m.*chtig"
<# Output:

True
#>
```

Or other characters could also be matched.

```powershell
"PowerShell is a möchtige scripting language" -match "m.*chtig"
<# Output:

True
#>

"PowerShell is a massively correct scripting language" -match "m.*chtig"
<# Output:

True
#>
```

We can leave aside whether the last example is a proper German sentence. But this comparison also returns `True` because there is an `m` somewhere and later `chtig`.

By the way, quantifiers can also be used with ordinary characters, not only with special characters like the dot. For example, to check whether 0, 1, or more `ä` characters are present, we could do this:

```powershell
"PowerShell is a möchtige scripting language" -match "mä*chtig"
<# Output:

False
#>

"PowerShell is a määächtige scripting language" -match "mä*chtig"
<# Output:

True
#>
```

**Note:** If you want to match one of the special characters `[]().\\^$|?*+{}`, for example if you want to check whether the asterisk symbol or a dot appears in a text, it will not work at first. To compare against such a special character, we need to escape it. We do that by writing a backslash `\` before the character we want to escape. For example:

```powershell
"This text contains an * symbol" -match "\*"
<# Output:

True
#>
```

This also applies to the backslash character. So to check whether a backslash symbol is present, we need to escape it with a backslash, which means there will be two backslashes in the pattern.

```powershell
"This text contains a \\-symbol" -match "\\"
<# Output:

True
#>
```

More information about the other special characters and wildcards will follow later in the article.

## The `$Matches` variable

When using the match operators, more happens than just returning `True` or `False`. If the comparison result is `True`, the `$Matches` variable is populated with the first match in the text. That only really makes sense when you are working with wildcards or quantifiers.

Let's do another comparison with the `match` operator and then inspect the variable.

I have written the text I want to test in a rough HTML or XML style. And my pattern looks for tags named `<test> </test>` where any number of arbitrary characters may appear in between. Because the result is `True`, the `$Matches` variable is populated automatically.

```powershell
"<b><test>Hello</test></b>" -match "<test>.*</test>"
<# Output:

True
#>

$Matches

<# Output

Name                           Value
----                           -----
0                              <test>Hello</test>
#>
```

## Capture groups

With capture groups, we can extract specific parts of the text. Multiple capture groups in a regular expression are also possible, but we will start with one.

Let's stay with the example from the previous section. If I now want to extract exactly the text inside the `<test>` tags, the previous code is not yet ideal. But using capture groups is actually quite simple. We just need to place the part we want to treat as a capture group in parentheses `()`. The result of the capture groups also ends up in the `$Matches` variable.

```powershell
"<b><test>Hello</test></b>" -match "<test>(.*)</test>"
<# Output:

True
#>

$Matches

<# Output

Name                           Value
----                           -----
1                              Hello
0                              <test>Hello</test>
#>
```

By the way, the `$Matches` variable is a hashtable. The entry with the name "0" returns the entire matched string. And if we use one capture group, it appears in the entry "1". If we used more capture groups, there could be more entries, and they would simply be numbered further.

For example, I extract three pieces of information with capture groups here:

```powershell
"<b><test>Hello</test></b>" -match "<b><(.+)>(.*)</(.+)></b>"
<# Output:

True
#>

$Matches

<# Output

Name                           Value
----                           -----
3                              test
2                              Hello
1                              test
0                              <b><test>Hello</test></b>
#>
```

Now I have entries from 0 to 3 in my `$Matches` variable. If you want to process them in code, you can access the individual entries just like any other hashtable. For example, like this:

```powershell
$Matches[2]
<# Output:

Hello
#>

$Matches[1]
<# Output:

test
#>
```

Here is an image to show visually what is being captured:

[![Multiple RegEx capture groups](/images/2024/2024-03-19_RegEx_Multiple_Capture_Groups.jpg "Multiple RegEx capture groups")](/images/2024/2024-03-19_RegEx_Multiple_Capture_Groups.jpg)

However, this numbering quickly makes the code hard to read. To make the code easier to understand, we can use named captures. That means assigning names to our capture groups. To do that, we write a `?` at the beginning of the capture group, but inside the parentheses, and then provide the desired name between a less-than sign `<` and a greater-than sign `>`. The entry in the `$Matches` hashtable then receives the chosen name instead of a number.

```powershell
"<b><test>Hello</test></b>" -match "<test>(?<MyText>.*)</test>"
<# Output:

True
#>

$Matches

<# Output

Name                           Value
----                           -----
MyText                         Hello
0                              <test>Hello</test>
#>

$Matches["MyText"]

<# Output:

Hello
#>
```

There is one drawback to using capture groups with the `-match` operator: if you want to match multiple times, it does not work. So if your regular expression matches your string multiple times, only the first result is returned. For example:

```powershell
"<b><test>Hello</test></b> <u><test>Hi</test></u>" -match "<test>(?<MyText>.*?)</test>"
<# Output:

True
#>

$Matches

<# Output

Name                           Value
----                           -----
MyText                         Hello
0                              <test>Hello</test>
#>
```

The string I tested here contains two blocks with this `<test>` tag. But when I look in the `$Matches` variable, there is still only one match. That cannot be adjusted when using the `-match` operator. If you want to match multiple results and maybe also use capture groups, you need to use a different method, such as the [.NET `RegEx` class](#net-regex-matches).

## Greedy captures

You may have noticed that the last example in the previous section contained a question mark `?`. That question mark makes the regex engine non-greedy, rather than the default greedy behavior. In greedy mode, the engine tries to match as many characters as possible with the regular expression. That can lead to undesired results. For comparison, here is the result without the question mark.

```powershell
"<b><test>Hello</test></b> <u><test>Hi</test></u>" -match "<test>(?<MyText>.*)</test>"
<# Output:

True
#>

$Matches

<# Output

Name                           Value
----                           -----
MyText                         Hello</test></b> <u><test>Hi
0                              <test>Hello</test></b> <u><test>Hi</test>
#>
```

## Special features and tips for the match operator

One special feature of the `-match` operator is that if you pass several objects at once as input, for example like this:

```powershell
"Hello", "PowerShell", "test" -match ".*o.*"
<# Output:

Hello
PowerShell
#>
```

Then you do not get `True` or `False`, but all strings for which the regular expression matched successfully. In that case, the automatic variable `$Matches` is also not populated. So if it had a previous value, it remains, and if there was no previous value, it stays empty.

My practical tips for the match operator are as follows:

1. If you only want to check whether a pattern applies, there is not much to worry about. Just use an `If` statement. That works both for a single object and for multiple objects.

    ```powershell
    $MyVariable = "Subscribe to the channel"
    if($MyVariable -match "abo") {
        # This runs if the regular expression returns True
        "...and like the video!"
    }
    ```

2. Otherwise, you should make sure you know how many objects you are passing to `-match`. It is a very common logic error not to realize that a cmdlet may return more than one object. To ensure that only one object is tested, you could, for example, limit the output to one object with `Select-Object -First 1`.

    ```powershell
    $MyVariable = "User1@example.com", "User2@example.com" | Select-Object -First 1
    if($MyVariable -match "user") {
        "User found!"
        # do something with the user
    }
    ```

    You can only trust the contents of the `$Matches` variable if you really matched only one object.

3. If you have a regular expression that matches multiple times in your string, and you want to know all matches, and maybe even extract information with capture groups, then the `-match` operator is not suitable for that. But there are other options, for example the [.NET `RegEx` class](#net-regex-matches).

## The `-replace` operator

With the `-replace` operator, the text that matches the regular expression pattern is replaced with other text.

First, a simple example where the character `W` and everything after it is replaced by the word `PowerShell`.

```powershell
"Hello World" -replace "W.*", "PowerShell"
<# Output:

Hello PowerShell
#>
```

But the `-replace` operator also supports capture groups. And then we can use those capture groups in the result.

```powershell
# With unnamed capture groups
"<b><test>diecknet</test></b>" -replace "<test>(.*)</test>", 'Hello $1'
<#  
    Attention! It is important here that at least the second parameter of
    -replace is enclosed in single quotes. Otherwise, PowerShell would
    interpret $1 as a variable, but it is not. It is a placeholder that
    refers to a regular expression capture group.
#>
# Result = <b>Hello diecknet</b>

# With named capture groups
"<b><test>diecknet</test></b>" -replace "<test>(?<MyText>.*)</test>", 'Hello ${MyText}'
# Result = <b>Hello diecknet</b>
```

By the way, the `$Matches` variable is not populated when we use the `-replace` operator. If it is set on your system, it is probably from a previous comparison using the `-match` operator.

## The `-split` operator

With the `-split` operator, you can split strings. And here too, not only simple strings can be used as separators, but also regular expressions.

A simple example:

```powershell
"Hello World!" -split " "

<# Output:

Hello
World!
#>
```

And a more complex example:

```powershell
"Hello World! In this text, it splits every time a punctuation mark appears. Useful? Not really." -split "[\.,!?]"

<# Output:

Hello World
 In this text, it splits every time a punctuation mark appears
 Useful
 Not really
#>
```

The `-split` operator supports a few more options. I do not find them particularly interesting, and I do not have any cool examples. For that, it is best to check the Microsoft documentation: <https://learn.microsoft.com/en-us/powershell/module/microsoft.powershell.core/about/about_split?view=powershell-7.4>

## Select-String cmdlet

With the `Select-String` cmdlet, a string or file content can be compared using a regular expression. Or several strings or file contents.

For example, I compare several objects here, in this case simple strings, by passing them through the pipeline to `Select-Object`.

```powershell
# The -Pattern parameter defines the regular expression
"Hi and hello!","Boink!","Test" | Select-String -Pattern "oi"
<# Output:

Hi and hello!
Boink
#>
```

Of the three objects, I only get two back, because only two match the pattern. In PowerShell 7, the matching part is even highlighted in the console.

[![Highlighting of matches in Select-String in PowerShell 7](/images/2024/2024-03-19_RegEx_Highlight_in_PS7.jpg "Highlighting of matches in Select-String in PowerShell 7")](/images/2024/2024-03-19_RegEx_Highlight_in_PS7.jpg)

As with `-match`, case is ignored by default. If you want it to be considered during comparison, you can add the additional parameter `-CaseSensitive`. You can also reverse the check by using the `-NotMatch` parameter. Then only the strings that do not match the pattern would be returned.

But we could already do these things with the `-match` operator. What I find more interesting is the ability to check one or more files.

For example, I use this to check all files with the `.log` extension in the `C:\diecknet` directory:

```powershell
Select-String -Path "C:\diecknet\*.log" -Pattern "password"
```

[![Highlighting of matches in a file with Select-String in PowerShell 7](/images/2024/2024-03-19_RegEx_Select-String-Files.jpg "Highlighting of matches in a file with Select-String in PowerShell 7")](/images/2024/2024-03-19_RegEx_Select-String-Files.jpg)

When we check one or more text files with the cmdlet, we also get information about which file the match is in and on which line.

Sometimes you want a little more information, a bit of context. For that, there is the `-Context` parameter. I can specify a number, and that many lines will be returned above and below the match.

```powershell
Select-String -Path "C:\diecknet\*.log" -Pattern "password" -Context 1
```

[![Highlighting of matches in a file with Select-String in PowerShell 7 with context](/images/2024/2024-03-19_RegEx_Select-String-Files-Context.jpg "Highlighting of matches in a file with Select-String in PowerShell 7 with context")](/images/2024/2024-03-19_RegEx_Select-String-Files-Context.jpg)

The actual line containing the match is marked with a greater-than sign `>`.

We can also control separately how many lines we want before and after the match. To do that, provide two numbers as the parameter value and separate them with a comma. In the following example, one line before and five after are returned.

```powershell
Select-String -Path "C:\diecknet\*.log" -Pattern "password" -Context 1,5
```

The object returned by `Select-String` is more than just text. In fact, we get objects of type `MatchInfo` here.

```powershell
Select-String -Path "C:\diecknet\*" -Pattern "test" -Context 1 | Get-Member
```

[![The output of Select-String is a MatchInfo object](/images/2024/2024-03-19_Select-String-Object-Infos.jpg "The output of Select-String is a MatchInfo object")](/images/2024/2024-03-19_Select-String-Object-Infos.jpg)

The `MatchInfo` object has some interesting properties that we can access in code. For example, we could also determine the exact line number of a file match in code.

```powershell
$Results = Select-String -Path "C:\diecknet\*.log" -Pattern "password" -Context 1,5

foreach($Result in $Results) {
    Write-Host "Match in $($Result.FileName) on line $($Result.LineNumber):" -ForegroundColor Red
    Write-Host $Result.Line -ForegroundColor Yellow
}
```

[![Example of processing the output of Select-String](/images/2024/2024-03-19_Select-String-Object-Properties.jpg "Example of processing the output of Select-String")](/images/2024/2024-03-19_Select-String-Object-Properties.jpg)

If you are interested in multiple matches in a single line, you can also enable that with the `-AllMatches` parameter.

```powershell
Select-String -Path "C:\diecknet\*.log" -Pattern "password" -AllMatches
```

[![Example of the output of Select-String when using the AllMatches parameter](/images/2024/2024-03-19_Select-String-Multiple-Matches.jpg "Example of the output of Select-String when using the AllMatches parameter")](/images/2024/2024-03-19_Select-String-Multiple-Matches.jpg)

## Switch statement with the `-Regex` parameter

The `Switch` statement can also use regular expressions. For that, you need to include the `-Regex` parameter. In each conditional block of the switch statement, you can then enter a regular expression.

```powershell
$MyString = "<h1>Hello!</h1>"
switch -Regex ( $MyString ) {
    "<.+>" { "Looks like an HTML page!" }
    "\d{5}" { "Contains a 5-digit number!" }
}

<# Output

Looks like an HTML page!
#>
```

## .NET RegEx matches

In my opinion, the most powerful way to use regular expressions in PowerShell is the .NET class `RegEx`. There are several ways to use the class. The simplest, in my opinion, is the following:

```powershell
$TestString = "Hallo"
[regex]::Matches($TestString, 'Ha')

<# Output:

Groups    : {0}
Success   : True
Name      : 0
Captures  : {0}
Index     : 0
Length    : 2
Value     : Ha
ValueSpan :
#>
```

If the regular expression matched the string successfully, you receive a match object in return. This allows you to see, among other things, that the pattern was recognized. And you can access the properties in code.

I primarily use the .NET variant when I want to extract multiple pieces of information at once using capture groups. Not just several capture groups, but when the pattern matches multiple times. For example, I have a text file with the following content (by the way, it is all on one line):

[![Example of returning multiple matches when using the Matches method of the .NET RegEx class](/images/2024/2024-03-19_FileContent-example.jpg "Example of returning multiple matches when using the Matches method of the .NET RegEx class")](/images/2024/2024-03-19_FileContent-example.jpg)

Using the following PowerShell code, I first read the text file and then check whether a pattern matches using the `[regex]::Matches()` method.

```powershell
$MyString = Get-Content C:\diecknet\net-example.txt
[regex]::Matches($MyString, '\b([a-f0-9]{32})\b')
```

[![Example of returning multiple matches when using the Matches method of the .NET RegEx class](/images/2024/2024-03-19_RegEx-Net-Class-Matches.jpg "Example of returning multiple matches when using the Matches method of the .NET RegEx class")](/images/2024/2024-03-19_RegEx-Net-Class-Matches.jpg)

The code extracts all strings that are exactly 32 characters long and consist exclusively of hexadecimal characters. The regular expression `\b([a-f0-9]{32})\b` contains exactly one capture group. Because I called the `Matches` method from the `RegEx` class, I get not only the first match, but all of them.

**Important: When using the .NET `RegEx` class, you should pay close attention to case sensitivity!** Unlike the other regex options in PowerShell, it is case-sensitive by default. The following code would not find a match in the string:

```powershell
$TestString = "Hallo"
[regex]::Matches($TestString, 'ha')
# No output, because of case sensitivity.
```

But the .NET `[RegEx]::Matches()` method supports several options. Our previous example can be extended with a third parameter to ignore case here as well:

```powershell
$TestString = "Hallo"
[regex]::Matches($TestString, 'ha', 'IgnoreCase')

<# Output

Groups    : {0}
Success   : True
Name      : 0
Captures  : {0}
Index     : 0
Length    : 2
Value     : Ha
ValueSpan :
#>
```

💡 You can find more options in the Microsoft documentation here: <https://learn.microsoft.com/en-us/dotnet/standard/base-types/regular-expression-options?redirectedfrom=MSDN>

There are also other methods in the `RegEx` class that can be very practical depending on the use case. Check the documentation for the `RegEx` class: <https://learn.microsoft.com/en-us/dotnet/api/system.text.regularexpressions.regex?view=net-8.0#methods>

## Designing regular expressions

Okay, let's get to how you can design regular expressions. For example, the expression from earlier: `\b([a-f0-9]{32})\b`

To be honest, I find regular expressions are not easy. I do not have enough experience with regular expressions that I can type them out without any help. But I usually do not even look at the [Microsoft documentation for RegEx in .NET](https://learn.microsoft.com/en-us/dotnet/standard/base-types/regular-expression-language-quick-reference) or [PowerShell](https://learn.microsoft.com/en-us/powershell/module/microsoft.powershell.core/about/about_regular_expressions). Instead, I use a tool to design a regular expression. There are several free websites that let you build regular expressions in the browser and test them live against one or more strings. Recently, I have liked using [RegEx101.com](https://regex101.com) because it also works specifically with .NET behavior. In the past, I also used other, more general sites that were oriented more toward JavaScript. But that usually worked too. I do not know how reputable the [RegEx101.com](https://regex101.com) site is, so I would not put any personal data or anything critical there.

**Important:** On the site, you need to change the flavor to ".NET" on the left.

If you want to design a pattern, look at the "Quick Reference" section in the lower right. That explains all the possible wildcards and special characters. There is also an "Explanation" section that explains the regular expression you created. Very nice!

## Conclusion

These were, in my opinion, the most important ways to use regular expressions in PowerShell. There are probably even more ways. But the basic principle should hopefully be understandable so that you can also use regular expressions in other contexts.

**One more important note:** If you only want to do a simple comparison, it is advisable not to use regular expressions at all. The regular expression engine has some overhead. If in doubt, test and measure the time.
