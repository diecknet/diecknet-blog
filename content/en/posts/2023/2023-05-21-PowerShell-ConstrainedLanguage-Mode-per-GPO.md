---
slug: "powershell-constrainedlanguage-mode-per-gpo"
title: "Set PowerShell ConstrainedLanguage Mode per Group Policy"
date: 2023-05-20
comments: true
tags: [powershell, language mode, constrained language]
cover: 
    image: "/images/2023/2023-05-21-ConstrainedLanguageModePerGPO.jpg"
---
PowerShell Language Modes are a way to restrict the functionality of PowerShell to increase the security of a system. Of course, this is only one small piece in a larger security strategy, so this alone is not sufficient protection for a system.

At the same time, it's also a double-edged sword:  
Advantage: we remove a powerful tool from potential attackers.  
Disadvantage: We as administrators can no longer use PowerShell properly on a system either.

I've also created a [German video about the basics of PowerShell Language Modes](https://www.youtube.com/watch?v=WmgwybaNwjg). However, this blog post here is only about how to configure the **ConstrainedLanguage** Mode via Group Policy. Unfortunately, the other modes cannot be enabled system-wide in a meaningful way.

## Note regarding `__PSLockdownPolicy`

Setting the environment variable `__PSLockdownPolicy` to the value `4` [is by the way **NOT** a secure or supported way to enable the ConstrainedLanguage Mode](https://devblogs.microsoft.com/powershell/powershell-constrained-language-mode/).

## Configure ConstrainedLanguage Mode

**Note: I evaluated the process using Windows 11 Enterprise Version 22H2 (Build 22621.1702).**

The ConstrainedLanguage Mode can be configured via Windows Defender Application Control (WDAC) or with the legacy AppLocker.
It is best to use a VM for testing, which can be quickly reset to a functional state. It is possible to very quickly break the system with application control policies so that it is no longer bootable.

To configure the ConstrainedLanguage Mode via WDAC, we use the sub-feature "Code Integrity" with "Script Enforcement". Script Enforcement affects not only PowerShell, but also some other Script Hosts that Microsoft calls "Enlightened". The Windows Based Script Host (`wscript.exe`) and Microsoft Console Based Script Host (`cscript.exe`) block the complete execution of scripts in the formats **VBScript**, **cscript** and **jscript** - no matter where they are located.
The Microsoft HTML Application Host (`mshta.exe`) which is responsible for the execution of **.hta** files acts simarily - the execution of **.hta** files is blocked across the board. By the way, other scripts like **.bat** or **.cmd** in `cmd.exe` are not blocked by WDAC at all. And also non-Microsoft scripts like e.g. **Python** are **not blocked**.

### Step 1: Base Policy

For CodeIntegrity, there are some sample policies that we can use as a base. These can be found under the following path:
`C:\Windows\schemas\CodeIntegrity\ExamplePolicies`.

To still allow normal Microsoft applications and system components to run, we copy the `AllowMicrosoft.xml` to a directory, e.g. `C:\CIPolicy`. Then modify it via PowerShell so that the policy gets a new GUID, a new name and a version number:

```ps1
Set-CIPolicyIdInfo -FilePath MyCIPolicy.xml -PolicyName "diecknet Code Integrity" -ResetPolicyID
Set-CIPolicyVersion -FilePath MyCIPolicy.xml -Version "1.0.0.0"
```

### Step 2: Exclude a specific path from the rule

If a specific folder path should be excluded from the policy, e.g. for administrative scripts, we can create an additional policy rule. This policy rule will be placed in a new policy.

```ps1
$rule = New-CIPolicyRule -FilePathRule "C:\AdminSkripte\*"
New-CIPolicy –FilePath AdminSkripte.xml –Rules $rule -UserPEs
```

The `-UserPEs` ensures that files in user mode are also covered by the policy.

Then merge to a new policy file:

```ps1
Merge-CIPolicy -OutputFilePath "diecknet-Policy.xml" -PolicyPaths ".\AllowMicrosoft.xml",".\AdminSkripte.xml"
```

It is important that only admins are allowed to write to this directory. Otherwise all users could simply create new scripts in the folder and execute them in FullLanguage mode.
So check the permissions and change them if necessary. It only recognizes certain default admin SIDs, so if you are using a custom security group and not the local administrators group, you have to enable [Option 18](https://learn.microsoft.com/en-us/windows/security/threat-protection/windows-defender-application-control/select-types-of-rules-to-create#table-1-windows-defender-application-control-policy---policy-rule-options). This would go like this, for example:

```ps1
# Only required for custom Permissions
Set-RuleOption -FilePath "diecknet-Policy.xml" -Option 18
```

### Step 3: Disable Audit Mode

By default, the audit mode is active. Since I work with a test system anyway, I leave out the audit mode.
For this you can either delete the rule with `Enabled:Audit Mode` manually from the `.xml` file, or with `Set-RuleOption`:

```ps1
Set-RuleOption -FilePath "diecknet-Policy.xml" -Option 3 -Delete
```

### Step 4: Convert the Policy to Binary

Then we convert the `.xml`-Policy to a Binary file:

```ps1
ConvertFrom-CIPolicy -XmlFilePath diecknet-Policy.xml -BinaryFilePath diecknet-Policy.cip
```

### Step 5: Testing - Apply the policy locally

For testing, the policy can be applied locally. It is best to create a VM snapshot beforehand.

```ps1
CiTool.exe --update-policy diecknet-Policy.cip
```

When you start a new PowerShell session now, it should run directly in ConstrainedLanguage Mode. To check this, look at the value of the variable `$ExecutionContext.SessionState.LanguageMode`. Scripts located in `C:\AdminSkripte` (or signed by Microsoft) should run in FullLanguage Mode. Scripts in other locations should run in ConstrainedLanguage Mode.

![PowerShell Language Mode Test](/images/2023/2023-05-20-PSLanguageModeTest.jpg)

I used this code for testing in `test.ps1`:

```ps1
Write-Host "Hello from $PSScriptRoot"
Write-Host "The current LanguageMode:"$ExecutionContext.SessionState.LanguageMode
```

### Step 6: Deploy the Policy using GPO

If everything works, it can also be rolled out in production. This can be done via Group Policy, Microsoft System Center Configuration Manager or MDM tools like Intune. I will explain how to do it via Group Policy, because the feature wasn't greatly documented by Microsoft.

*Actually* there is a setting under `Computer Configuration -> Policies -> Administrative Templates -> System -> Device Guard`. However, it doesn't work with Multi-Policy Format policies like we just created. Microsoft writes about this:

> Group Policy-based deployment of Windows Defender Application Control policies only supports single-policy format WDAC policies. To use WDAC on devices running Windows 10 1903 and greater, or Windows 11, we recommend using an alternative method for policy deployment.

But instead, we can simply deploy the file directly via Group Policy. This can be done under `Computer configuration -> Settings -> Windows settings -> Files`. Create a new entry here and specify the `.cip` source file. To make it available in the network, I simply copied it into the `NETLOGON` directory of my domain. But of course any fileshare will work.  
Then specify the following path as destination file: `C:\Windows\System32\CodeIntegrity\CiPolicies\Active\{Policy-Guid}.cip`.
Where `Policy-Guid` must be replaced by the GUID of the policy. But the curly brackets should remain. The PolicyID is in the `.xml` policy file in the tag `<PolicyId>`. For me it is `{82C1BF56-B3BC-40FE-AD21-5FC37EBB5CF9}`, so the full target path for me is: `C:\WindowsSystem32\CodeIntegrity\CiPolicies\Active\{82C1BF56-B3BC-40FE-AD21-5FC37EBB5CF9}.cip`

![Find out WDAC Policy ID](/images/2023/2023-05-20-WDAC-PolicyID.jpg)

![Deploy WDAC Policy using GPO Files](/images/2023/2023-05-20_GPO_File.jpg)

With this approach the policy is applied only when the computer is restarted. So I ran `gpupdate /force` (possibly unnecessary, but I wanted to save myself a possible second reboot) and rebooted the computer. Then the policy was applied as before in step 5.

## Conclusion

In my opinion, setting up Windows Defender Application Control / CodeIntegrity / PowerShell Language Modes is unnecessarily complicated. I also find it a bit of a headache that the more modern multi-policies are not actually supported via Group Policy.

## Related Links

Here are a few more links and sources that helped me with my research. In particular, I would like to highlight the blog series on airdesk.com about WDAC:

- [airdesk.com: WDAC and Intune Blog series](https://airdesk.com/2019/11/mdac-and-intune-blog-series/)
- [airdesk.com: WDAC and File Path Rules](https://airdesk.com/2019/11/mdac-and-path-rules/)

And some very good infos from HotCakeX:

- [WDAC Wiki on Github by HotCakeX](https://github.com/HotCakeX/Harden-Windows-Security/wiki/Introduction)
- [This really verbose and insightful answer on superuser.com](https://superuser.com/questions/1741554/i-cant-get-windows-defender-application-control-policy-working-in-windows-11/1771065#1771065)

A few useful informations are available at Microsoft:

- [Create a WDAC policy for fully managed devices](https://learn.microsoft.com/en-us/windows/security/threat-protection/windows-defender-application-control/create-wdac-policy-for-fully-managed-devices)
- [Enlightened script hosts that are part of Windows](https://learn.microsoft.com/en-us/windows/security/threat-protection/windows-defender-application-control/design/script-enforcement#enlightened-script-hosts-that-are-part-of-windows)
- [Windows Defender Application Control policy - policy rule options](https://learn.microsoft.com/en-us/windows/security/threat-protection/windows-defender-application-control/select-types-of-rules-to-create#table-1-windows-defender-application-control-policy---policy-rule-options)
- [New-CIPolicy Cmdlet](https://learn.microsoft.com/en-us/powershell/module/configci/new-cipolicy?view=windowsserver2022-ps)
- [Deployment per GPO](https://learn.microsoft.com/en-us/windows/security/threat-protection/windows-defender-application-control/deployment/deploy-windows-defender-application-control-policies-using-group-policy)
- [Remove a WDAC Policy](https://learn.microsoft.com/en-us/windows/security/threat-protection/windows-defender-application-control/disable-windows-defender-application-control-policies)
- [Multi-Policy local Deployment](https://learn.microsoft.com/en-us/windows/security/threat-protection/windows-defender-application-control/deploy-multiple-windows-defender-application-control-policies)
- [WDAC EventLogs](https://learn.microsoft.com/en-us/windows/security/threat-protection/windows-defender-application-control/event-id-explanations)
- [PowerShell Team: PowerShell Constrained Language Mode](https://devblogs.microsoft.com/powershell/powershell-constrained-language-mode/)
