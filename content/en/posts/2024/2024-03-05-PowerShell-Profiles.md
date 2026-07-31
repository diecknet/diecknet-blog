---
slug: "powershell-profiles"
title: "PowerShell Profiles Explained (with Examples)"
date: 2024-03-05
comments: true
tags: [powershell, profiles, customization]
---

PowerShell profiles let you customize your PowerShell. For example, so it looks like this:

[![PowerShell console customized with Oh My Posh and the Blue Owl theme](/images/2024/2024-03-05_PSProfiles_OhMyPosh.jpg "PowerShell console customized with Oh My Posh and the Blue Owl theme")](/images/2024/2024-03-05_PSProfiles_OhMyPosh.jpg)

Or you can configure it to show a splash screen at startup, such as with Winfetch:

[![Example of a Winfetch information screen](/images/2024/2024-03-05_PSProfiles_Winfetch.jpg "Example of a Winfetch information screen")](/images/2024/2024-03-05_PSProfiles_Winfetch.jpg)

Or you can also store your own functions and variables so they are immediately available every time you start PowerShell.

**🎬 I have also created a [video on this topic](https://www.youtube.com/watch?v=vtqrZjofJ40).**

In the end, a PowerShell profile is simply a PowerShell script that is executed automatically when you start PowerShell. When PowerShell starts, it looks in certain paths to see whether a profile file exists. There can also be multiple profiles.

For example, you can have a user-specific profile and also a system-wide one. In addition, different PowerShell console hosts can have separate profiles. For example, VS Code or the PowerShell ISE can be configured differently from the normal PowerShell console, if you want. And Windows PowerShell also has profiles that are independent of PowerShell 7. So there are many places where a profile can live.

## Tip: Start PowerShell without profiles

By the way, PowerShell normally tries to load profiles whenever it starts. But it is also possible to start PowerShell with the additional parameter `-NoProfile`, and then it starts without any profiles, which can sometimes be useful.

```powershell
# For Windows PowerShell
powershell.exe -NoProfile

# For PowerShell 7
pwsh -NoProfile
```

## Profile locations

The exact profile locations are documented by Microsoft. Here are the details for [PowerShell 7.4](https://learn.microsoft.com/en-us/powershell/module/microsoft.powershell.core/about/about_profiles?view=powershell-7.4#profile-types-and-locations) and here for [Windows PowerShell 5.1](https://learn.microsoft.com/en-us/powershell/module/microsoft.powershell.core/about/about_profiles?view=powershell-5.1#profile-types-and-locations).

But the paths can also be retrieved directly from PowerShell. For that, PowerShell has an automatic variable named `$PROFILE`. At first, it shows the profile path for "Current user, current host", which is the most specific profile possible. But the other paths can also be retrieved from it. You can pipe the variable through `Select-Object`. For example, I get the following in Windows PowerShell 5.1:

```powershell
$PROFILE | Select-Object *

<# Example output from Windows PowerShell 5.1:

AllUsersAllHosts       : C:\Windows\System32\WindowsPowerShell\v1.0\profile.ps1
AllUsersCurrentHost    : C:\Windows\System32\WindowsPowerShell\v1.0\Microsoft.PowerShell_profile.ps1
CurrentUserAllHosts    : C:\Users\diecknet\Documents\WindowsPowerShell\profile.ps1
CurrentUserCurrentHost : C:\Users\diecknet\Documents\WindowsPowerShell\\Microsoft.PowerShell_profile.ps1
Length                 : 78

#>
```

And in PowerShell 7.4, I get the following output:

```powershell
$PROFILE | Select-Object *

<# Example output from PowerShell 7.4:

AllUsersAllHosts       : C:\Program Files\PowerShell\7\profile.ps1
AllUsersCurrentHost    : C:\Program Files\PowerShell\7\Microsoft.PowerShell_profile.ps1
CurrentUserAllHosts    : C:\Users\diecknet\Documents\PowerShell\profile.ps1
CurrentUserCurrentHost : C:\Users\diecknet\Documents\PowerShell\Microsoft.PowerShell_profile.ps1
Length                 : 71

#>
```

If you want to edit a profile, you can open it directly from PowerShell by calling `notepad` or VS Code with `$PROFILE` as the parameter value. That opens your editor directly with the profile file. Most modern editors can then create the profile file directly if it does not already exist. Some older editors only return an error if the file does not exist yet.

```powershell
# Edit the "Current User, Current Host" profile with Visual Studio Code:
code $PROFILE

# Edit the "Current User, All Hosts" profile with notepad:
notepad $PROFILE.CurrentUserAllHosts
```

If you want to edit an "All Users" profile, you will need to start the editor with administrator rights. Alternatively, if you want to start your editor from PowerShell and load the profile file, the PowerShell session should already be running with administrator rights.

## Profile examples

Here are a few examples of configurations you could place in a PowerShell profile.

**Important: For the profile changes to take effect, you need to restart PowerShell once.**

### PSReadLine options

I have set my demo VM so that no autocomplete happens in PowerShell. I find that annoying when creating videos and blog posts.

For that, I have the following in my profile:

```powershell
Set-PSReadLineOption -PredictionSource None
```

This setting uses the `PSReadLine` module. The module can be used to customize the PowerShell console in many ways. For example, you can also set keyboard shortcuts. Or here is a cool example from the [PSReadLine GitHub project page](https://github.com/PowerShell/PSReadLine?tab=readme-ov-file#usage):

```powershell
Set-PSReadLineKeyHandler -Chord '"',"'" `
                         -BriefDescription SmartInsertQuote `
                         -LongDescription "Insert paired quotes if not already on a quote" `
                         -ScriptBlock {
    param($key, $arg)

    $line = $null
    $cursor = $null
    [Microsoft.PowerShell.PSConsoleReadLine]::GetBufferState([ref]$line, [ref]$cursor)

    if ($line.Length -gt $cursor -and $line[$cursor] -eq $key.KeyChar) {
        # Just move the cursor
        [Microsoft.PowerShell.PSConsoleReadLine]::SetCursorPosition($cursor + 1)
    }
    else {
        # Insert matching quotes, move cursor to be in between the quotes
        [Microsoft.PowerShell.PSConsoleReadLine]::Insert("$($key.KeyChar)" * 2)
        [Microsoft.PowerShell.PSConsoleReadLine]::GetBufferState([ref]$line, [ref]$cursor)
        [Microsoft.PowerShell.PSConsoleReadLine]::SetCursorPosition($cursor - 1)
    }
}
```

This ensures that when you type a quotation mark in the shell, a closing quotation mark is inserted automatically, and the cursor is placed between them. If you want to learn more about [PSReadLine](https://learn.microsoft.com/en-us/powershell/module/psreadline/about/about_psreadline?view=powershell-7.4), take a look at [the documentation](https://learn.microsoft.com/en-us/powershell/module/psreadline/about/about_psreadline?view=powershell-7.4).

### Custom cmdlets and aliases

If you want, you can also define your own cmdlets or aliases in your PowerShell profile, and they will be available automatically in your PowerShell session. For example:

```powershell
function blog {
    Set-Location C:\dev\diecknet-blog
}
```

That way, I can quickly and easily switch to my local directory with the `blog` command where the source code for my blog is located. Or I can create the alias `reboot`, which points to the `Restart-Computer` cmdlet.

```powershell
New-Alias -Name reboot -Value Restart-Computer
```

### Set default values for cmdlets

You can also set default values for certain cmdlet parameters. This is done with the `$PSDefaultParameterValues` variable, which is a hashtable where entries with cmdlet and parameter names can be added as needed.

```powershell
# The schema looks like this:
$PSDefaultParameterValues["CmdletName:ParameterName"]="Default value"

# For example:
$PSDefaultParameterValues["Select-Object:Property"]="*"
```

But these default values can naturally always be overridden explicitly when cmdlets are executed. So if I set a different `-Property` value when calling `Select-Object`, the command will still run correctly. And you can also define default values outside of profiles with this variable. So this also works, for example, in scripts or in your own functions.

### Run cmdlets automatically

You can also place certain commands in your PowerShell profile so they are executed automatically when PowerShell starts.

```powershell
# Example: Print the current weekday when PowerShell starts
Write-Host "Today is $(Get-Date -Format "dddd")"

<# Example output:

Today is Friday
#>
```

PowerShell 7 also shows the version at startup, but Windows PowerShell does not. If you want, you can add the following line to your Windows PowerShell profile so that version information is shown there as well:

```powershell
"Windows PowerShell $($PSVersionTable.PSVersion.Major).$($PSVersionTable.PSVersion.Minor)"

<# Example output:

Windows PowerShell 5.1
#>
```

But you should probably not run very long commands this way, because that will slow down the startup of every PowerShell session. And if loading all profiles together takes more than 500 ms, a warning message is displayed.

[![Example of a warning message when a PowerShell profile takes longer than 500 ms to load. Loading personal and system profiles took 619 ms.](/images/2024/2024-03-05_PSProfiles_LoadingTime.jpg "Example of a warning message when a PowerShell profile takes longer than 500 ms to load. Loading personal and system profiles took 619 ms.")](/images/2024/2024-03-05_PSProfiles_LoadingTime.jpg)

### Customize the prompt

You can also customize your prompt, which is the input area in the console. PowerShell uses the standard function `prompt` for that. We can override its code with our PowerShell profile. First, let's look at the default code:

```powershell
(Get-Command Prompt).ScriptBlock

<# Output:

"PS $($executionContext.SessionState.Path.CurrentLocation)$('>' * ($nestedPromptLevel +
 1)) ";
# .Link
# https://go.microsoft.com/fwlink/?LinkID=225750
# .ExternalHelp System.Management.Automation.dll-help.xml

#>
```

I would start from this standard implementation instead of building everything from scratch. We can extend it, for example, with information about which user is currently logged in.

```powershell
function prompt {
    "$($env:username)@$($env:computername) PS $($executionContext.SessionState.Path.CurrentLocation)$('>' * ($nestedPromptLevel + 1)) "
}
```

The result:

[![Example of a customized prompt](/images/2024/2024-03-05_PSProfiles_Prompt.jpg "Example of a customized prompt")](/images/2024/2024-03-05_PSProfiles_Prompt.jpg)

Or, with this example from [the Microsoft documentation](https://learn.microsoft.com/en-us/powershell/module/microsoft.powershell.core/about/about_prompts?view=powershell-7.4#how-to-customize-the-prompt), you can display interactively whether PowerShell is running with administrator rights:

```powershell
function prompt {
  $identity = [Security.Principal.WindowsIdentity]::GetCurrent()
  $principal = [Security.Principal.WindowsPrincipal] $identity
  $adminRole = [Security.Principal.WindowsBuiltInRole]::Administrator

  $(if (Test-Path variable:/PSDebugContext) { '[DBG]: ' }
    elseif($principal.IsInRole($adminRole)) { "[ADMIN]: " }
    else { '' }
  ) + 'PS ' + $(Get-Location) +
    $(if ($NestedPromptLevel -ge 1) { '>>' }) + '> '
}
```

The result:

[![Another example of a customized prompt](/images/2024/2024-03-05_PSProfiles_Prompt2.jpg "Another example of a customized prompt")](/images/2024/2024-03-05_PSProfiles_Prompt2.jpg)

### Oh My Posh

If you want to customize your PowerShell console even more, I recommend [Oh My Posh](https://ohmyposh.dev/). There are already many ready-made themes that you can use directly. Or you can create your own themes and perhaps use an existing one as a basis.

I installed Oh My Posh with `winget`, but you can also install it another way. Check the [documentation](https://ohmyposh.dev/docs/installation/windows). Oh My Posh is also available for [macOS](https://ohmyposh.dev/docs/installation/macos) and [Linux](https://ohmyposh.dev/docs/installation/linux)!

```powershell
winget install JanDeDobbeleer.OhMyPosh -s winget
```

For many themes, it makes sense to also install a "Nerd Font" font package. These are fonts that contain icons in addition to normal characters. The [Oh My Posh documentation](https://ohmyposh.dev/docs/installation/fonts) recommends the font "Meslo LGM NF". The download link can also be found [there](https://ohmyposh.dev/docs/installation/fonts).

After that, the font must be enabled in Windows Terminal. And if you use VS Code, it also makes sense to adjust the font for that terminal.

To actually use Oh My Posh, we need to add a line to our PowerShell profile.

```powershell
oh-my-posh init pwsh | Invoke-Expression
```

That gives us a default theme. You can find [an overview of other themes on the Oh My Posh website](https://ohmyposh.dev/docs/themes). Or, if you already have Oh My Posh loaded, you can get an overview in the shell with the `Get-PoshThemes` command. By the way, themes with the word "minimal" in the name do not require Nerd Fonts. I thought "blue-owl" was pretty cool. To use the theme, we need to adjust the command in the PowerShell profile.

```powershell
oh-my-posh init pwsh --config "$($env:POSH_THEMES_PATH)\blue-owl.omp.json" | Invoke-Expression
```

The result:

[![PowerShell console customized with Oh My Posh and the Blue Owl theme](/images/2024/2024-03-05_PSProfiles_OhMyPosh.jpg "PowerShell console customized with Oh My Posh and the Blue Owl theme")](/images/2024/2024-03-05_PSProfiles_OhMyPosh.jpg)

## Winfetch

Something else that fits the topic of customizing is [Winfetch](https://github.com/lptstr/winfetch). With Winfetch, you can display an information screen when you start PowerShell:

[![Example of a Winfetch information screen](/images/2024/2024-03-05_PSProfiles_Winfetch.jpg "Example of a Winfetch information screen")](/images/2024/2024-03-05_PSProfiles_Winfetch.jpg)

However, I did not add Winfetch to my PowerShell profile. I only added it as a startup option in Windows Terminal. That prevents Winfetch from running if I, for example, start PowerShell from `cmd.exe` or something similar.

Winfetch is available via the PowerShell Gallery, so it can be installed, for example, with the following command:

```powershell
Install-Script winfetch
```

During installation, you may be asked whether you want to add the PowerShell script path to your `PATH` environment variable. I would confirm with "Yes", because then you can simply call the script with the `winfetch` command. Otherwise, you may need to work with the absolute path of the script. To make the `PATH` change take effect, you need to restart the PowerShell console once. After that, you can display the default information screen with the `winfetch` command. If you want, you can also create and edit your own configuration:

```powershell
winfetch -genconf
code $env:USERPROFILE/.config/winfetch/config.ps1
```

It is best to look at the generated configuration file. It contains almost every possible option, and you only need to remove the comments or adjust a value. For example, you can change or disable the logo, or add completely custom information lines.

To run the script automatically at PowerShell startup without adding it to the PowerShell profile, you can add it to the "Command Line" settings of your Windows Terminal profiles.

[![Winfetch configuration in Windows Terminal](/images/2024/2024-03-05_PSProfiles_Winfetch_SetupWindowsTerminal.jpg "Winfetch configuration in Windows Terminal")](/images/2024/2024-03-05_PSProfiles_Winfetch_SetupWindowsTerminal.jpg)

```powershell
powershell.exe -NoLogo -NoExit -File "C:\Program Files\WindowsPowerShell\Scripts\winfetch.ps1"

pwsh.exe -NoLogo -NoExit -File "C:\Program Files\WindowsPowerShell\Scripts\winfetch.ps1"
```

It is also a good idea to set this for both the "Windows PowerShell" profile and the "PowerShell" profile (that is, PowerShell 7). If you start PowerShell in Windows Terminal now, Winfetch will run, but if you start PowerShell from another prompt, nothing will happen. 😎

## Suggestions?

If you have ideas for useful PowerShell profile customizations, feel free to let me know in the comments! ⬇
