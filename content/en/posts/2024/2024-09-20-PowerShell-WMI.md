---
slug: "powershell-wmi"
title: "Use WMI in PowerShell"
date: 2024-09-20
comments: true
tags: [powershell]
---

WMI is a powerful interface for managing Windows systems. It makes it possible to access things for which there may otherwise be no dedicated PowerShell cmdlets. In some cases, we can retrieve more information than the standard cmdlets provide. This works both locally and remotely.

## Deprecated: The old WMI cmdlets

There are a few older cmdlets, but they are not recommended for new development. However, you may still come across them in older scripts, so now you have heard of them at least. They do exist.

```powershell
Get-Command -Noun WMI*

<# Output:

CommandType     Name                                               Version    Source
-----------     ----                                               -------    ------
Cmdlet          Get-WmiObject                                      3.1.0.0    Microsoft.PowerShell.Management
Cmdlet          Invoke-WmiMethod                                   3.1.0.0    Microsoft.PowerShell.Management
Cmdlet          Register-WmiEvent                                  3.1.0.0    Microsoft.PowerShell.Management
Cmdlet          Remove-WmiObject                                   3.1.0.0    Microsoft.PowerShell.Management
Cmdlet          Set-WmiInstance                                    3.1.0.0    Microsoft.PowerShell.Management

#>
```

## CIM cmdlets

Instead, it makes sense to rely on the CIM cmdlets for new development. CIM stands for "Common Information Model" and is essentially the actual technical standard. WMI is Microsoft's implementation of CIM, which also extends the standard somewhat.

```powershell
Get-Command -Module CimCmdlets

<# Output

CommandType     Name                                               Version    Source
-----------     ----                                               -------    ------
Cmdlet          Export-BinaryMiLog                                 1.0.0.0    CimCmdlets
Cmdlet          Get-CimAssociatedInstance                          1.0.0.0    CimCmdlets
Cmdlet          Get-CimClass                                       1.0.0.0    CimCmdlets
Cmdlet          Get-CimInstance                                    1.0.0.0    CimCmdlets
Cmdlet          Get-CimSession                                     1.0.0.0    CimCmdlets
Cmdlet          Import-BinaryMiLog                                 1.0.0.0    CimCmdlets
Cmdlet          Invoke-CimMethod                                   1.0.0.0    CimCmdlets
Cmdlet          New-CimInstance                                    1.0.0.0    CimCmdlets
Cmdlet          New-CimSession                                     1.0.0.0    CimCmdlets
Cmdlet          New-CimSessionOption                               1.0.0.0    CimCmdlets
Cmdlet          Register-CimIndicationEvent                        1.0.0.0    CimCmdlets
Cmdlet          Remove-CimInstance                                 1.0.0.0    CimCmdlets
Cmdlet          Remove-CimSession                                  1.0.0.0    CimCmdlets
Cmdlet          Set-CimInstance                                    1.0.0.0    CimCmdlets

#>
```

Even though the name only says CIM and not WMI, we can use it to access WMI.

## Query WMI data

There are different ways to query information via WMI. For example, with the WMI Query Language, or WQL, which is a kind of SQL. There are simpler ways to query information via WMI, but WMI queries were, for example, commonly used in old VB scripts or in WMI filters for group policies. So if you already have a WMI query, you can simply reuse it in PowerShell.

You can execute a query with a WMI query using the `Get-CimInstance` cmdlet.

```powershell
Get-CimInstance -Query "Select * from Win32_BIOS"
```

In essence, that means: Show me all properties of all instances of the `Win32_BIOS` class.

A slightly more PowerShell-like way to query WMI would be this:

```powershell
Get-CimInstance -ClassName Win32_BIOS
```

Both variants return all properties, even if that is not immediately obvious. With a pipe to `| Select-Object *`, all properties of the returned object can be made visible. However, the general PowerShell principle is: if it is possible and sensible, filter as far left as possible. This applies both to the selection of objects and to the selection of object properties.
For the selection of object properties, we can use the `-Property` parameter. For example:

```powershell
Get-CimInstance -ClassName Win32_Bios -Property ReleaseDate
```

Now I can do all kinds of things with the retrieved properties. For example, store the result in a variable or access individual properties of the result directly.

```powershell
# Output WMI data to a variable and then output the variable
$BIOSInfos = Get-CimInstance -ClassName Win32_Bios -Property ReleaseDate
$BiosInfos

# Process WMI data in the pipeline and only output the "ReleaseDate" property
Get-CimInstance -ClassName Win32_Bios -Property ReleaseDate | Select-Object -ExpandProperty ReleaseDate

# Query WMI data inline in another cmdlet and use it as a parameter value
New-TimeSpan -Start (Get-CimInstance -ClassName Win32_Bios -Property ReleaseDate).ReleaseDate -End (Get-Date)
```

## Filter WMI data

If you want to filter a WMI query more precisely, you can do so either with a complete WMI query or with the `-Filter` parameter. The syntax of WMI filters is different from PowerShell syntax. In my opinion, it is even a bit more intuitive. But if you use PowerShell all the time, it feels a little unfamiliar.

There are the simple comparison operators:

| Operator       | Description              |
|----------------|--------------------------|
| =              | Equal to                 |
| <              | Less than                |
| >              | Greater than             |
| <=             | Less than or equal to    |
| >=             | Greater than or equal to |
| != or <>       | Not equal to             |

See also: <https://learn.microsoft.com/en-us/windows/win32/wmisdk/wql-operators>

And the `LIKE` operator for wildcard searches. See also: <https://learn.microsoft.com/en-us/windows/win32/wmisdk/like-operator>

```powershell
# Filter with comparison operator "Equal to"
Get-CimInstance Win32_service -Filter "Name = 'wuauserv'"

# Filter with LIKE operator
Get-CimInstance Win32_Service -Filter "Caption LIKE 'Windows%'"
```

WQL can do much more, but I have not really needed it so far. If you are interested, take a look at the Microsoft documentation: <https://learn.microsoft.com/en-us/windows/win32/wmisdk/wql-sql-for-wmi>

## Associated instances

This can also be useful: related classes, or rather associated instances.
For example, I first query all physical network adapters on my device:

```powershell
# Only retrieve physical network adapters:
Get-CimInstance Win32_NetworkAdapter -Filter "PhysicalAdapter = 1"
```

Then I pipe that into `Get-CimAssociatedInstance` to see all related instances:

```powershell
Get-CimInstance Win32_NetworkAdapter -Filter "PhysicalAdapter = 1" | Get-CimAssociatedInstance
```

Based on the data now displayed, I may already see that something interesting is going on. Otherwise, we can also pipe this output to `Select-Object` to see, for example, only the class names:

```powershell
Get-CimInstance Win32_NetworkAdapter -Filter "PhysicalAdapter = 1" | Get-CimAssociatedInstance | Select-Object CimClass
```

Or to see all properties, because they were not all visible before:

```powershell
Get-CimInstance Win32_NetworkAdapter -Filter "PhysicalAdapter = 1" | Get-CimAssociatedInstance | Select-Object *
```

If we find out that a particular class is of interest, we can adjust our original query from `Get-CimAssociatedInstance` to retrieve only that one class:

```powershell
Get-CimInstance Win32_NetworkAdapter -Filter "PhysicalAdapter = 1" | Get-CimAssociatedInstance -ResultClassName Win32_NetworkAdapterConfiguration
```

That allowed me to display the network configuration for a specific network adapter on my computer.

## Remote WMI

Remote WMI is easiest if the currently logged in user also has admin rights on the remote system. For example:

```powershell
Get-CimInstance -ClassName Win32_Desktop -ComputerName CL5
```

Alternatively, we can create a separate CimSession and specify other credentials.

```powershell
# Query credentials
$Credential = Get-Credential
# Create CIM session
$CimSession = New-CimSession -ComputerName CL5 -Credential $Credential

# Execute CIM/WMI query
Get-CimInstance -ClassName Win32_Desktop -CimSession $CimSession | Select-Object Name,Wallpaper
```

By the way, if you want to perform several WMI actions against a remote system, it is more efficient to create a session first and then run all commands with the `-CimSession` parameter. If `Get-CimInstance` uses the `-ComputerName` parameter, a new connection is created each time, authenticated, the command is executed, and the connection is closed at the end. A CimSession, however, remains active until it is explicitly terminated.

### WSMAN and DCOM

WMI remoting with the CIM cmdlets uses the WSMAN protocol in the background by default. If remote WMI does not work directly for you, you can enable it with the `Enable-PSRemoting` cmdlet. The [older WMI cmdlets](#deprecated-the-old-wmi-cmdlets) use DCOM instead of WSMAN, which is blocked by the Windows Firewall by default on modern systems. However, it would also be possible to use DCOM with the CIM cmdlets if necessary. You can find the details in [Microsoft Learn](https://learn.microsoft.com/en-us/powershell/scripting/learn/ps101/07-working-with-wmi?view=powershell-7.4).

### Multiple remote systems

It is also possible to work with several remote systems at once. To do that, you first need to create several CimSessions and then pass them to `Get-CimInstance`.

```powershell
$CimSession1 = New-CimSession -ComputerName CL5 -Credential (Get-Credential)
$CimSession2 = New-CimSession -ComputerName DC2 -Credential (Get-Credential)

Get-CimInstance -ClassName Win32_Desktop -CimSession $CimSession1,$CimSession2 | Select-Object Name,Wallpaper
```

### Disconnect

If you have finished your remote work, you should also disconnect the connections again. The easiest way is:

```powershell
Get-CimSession | Remove-CimSession
```

## Execute WMI methods

With WMI, we can not only retrieve information, but also execute methods. Some of them overlap in content with regular PowerShell cmdlets or with methods available via .NET. However, it may also be that exactly what you want to do is only available through WMI.

For example, I first retrieve a CIM instance related to a specific printer. Then I pipe that instance to `Invoke-CimMethod` to define the printer as the default printer.

```powershell
# Set default printer via WMI: With 2 cmdlets
Get-CimInstance -ClassName Win32_Printer -Filter "Name = 'Microsoft XPS Document Writer'" | Invoke-CimMethod -MethodName SetDefaultPrinter
```

I had to use two cmdlets here because `Invoke-CimMethod` does not support the `-Filter` parameter that is available on `Get-CimInstance`. However, I could use the `-Query` parameter and provide a WMI query, which `Invoke-CimMethod` does support.

```powershell
# Set default printer via WMI: With 1 cmdlet
Invoke-CimMethod -Query "SELECT * FROM Win32_Printer WHERE Name = 'Microsoft XPS Document Writer'" -MethodName SetDefaultPrinter
```

But it does not have to be a specific WMI object instance. Some classes also support direct method calls. For example:

```powershell
# Start a process via WMI
Invoke-CimMethod -ClassName Win32_Process -MethodName "Create" -Arguments @{CommandLine = 'notepad.exe'}
```

### Remote WMI method calls

In principle, `Invoke-CimMethod` also supports the remoting shown earlier. So you could use either `-ComputerName` or `-CimSession` here as well.

```powershell
# Example of a remote WMI method call
$MeineSession = New-CimSession -Credential (Get-Credential) -ComputerName dc2
Invoke-CimMethod -ClassName Win32_Process -MethodName "Create" -Arguments @{CommandLine = 'notepad.exe'} -CimSession $MeineSession
```

**Important**: If processes are started remotely, they do not appear visibly on the desktop. In the Task Manager, or for example via `Get-Process`, you may still see that the processes are running. For the example `notepad.exe`, that may not be very useful, but for other processes it can be ✌️

### Find WMI methods

If you already have a WMI object instance, you can look directly in PowerShell to see which methods are available:

```powershell
# Find running notepad.exe processes via WMI:
$MeineCIMInstanz = Get-CimInstance Win32_Process -Filter "Name = 'notepad.exe'"

# We cannot see them with Get-Member,
# because they are not available as direct object methods in PowerShell
$MeineCIMInstanz | Get-Member

# Instead, we can access the property CimClass.CimClassMehotds
$MeineCIMInstanz.CimClass.CimClassMethods
```

## Delete WMI object instances

There is also the `Remove-CimInstance` cmdlet, which can be used to delete WMI object instances. This is usually a ⚠️ **destructive action** ⚠️, because it does not just remove the object's representation in PowerShell, but actually destroys the underlying object. For example, if I delete the object instance of a running process, the process will be terminated.

```powershell {hl_lines=[5]}
# Find running notepad.exe processes via WMI:
Get-CimInstance Win32_Process -Filter "name = 'notepad.exe'"

# Find running notepad.exe processes via WMI AND END THEM:
Get-CimInstance Win32_Process -Filter "name = 'notepad.exe'" | Remove-CimInstance
```

What exactly happens depends on the specific class, of course. But the best practice is to use the `Remove-CimInstance` cmdlet with extreme caution.

## Find WMI classes, properties, and methods

To list all WMI classes on the system, you can use the `Get-CimClass` cmdlet. Depending on the system, there can be quite a lot, but on a modern Windows 11 system there are well over 2000. And some hardware or software adds its own classes.

```powershell
# List classes
Get-CimClass

# Count classes
Get-CimClass | Measure-Object
```

About the class names:

- Starts with `__`: system class
- Starts with `MSFT`: system class
- Starts with `CIM`: base CIM class (usually there is a better `Win32` class as an alternative)
- ⭐ Starts with `Win32`: extended WMI class (based on CIM standard classes)
- Starts with `Win32_Perf`: performance counter class
- Starts with `Win32_PnPDevice`: Plug and Play device class
- ⭐ Starts completely differently: could also be interesting

See also: <https://learn.microsoft.com/en-us/windows/win32/wmisdk/wmi-classes>

There are sometimes `CIM` and `Win32` classes that overlap in content. In general, the `Win32` class is more powerful. For example, the `Win32_Process` class has 45 properties and 7 methods on my system, while the `CIM_Process` class has only 18 properties and no methods at all.

The methods and properties of a class are listed in the `CimClassMethods` and `CimClassProperties` properties.

```powershell
# Count the properties and methods of the CIM_Process class:
Get-CimClass -ClassName Cim_Process | Select-Object -ExpandProperty CimClassProperties | Measure-Object
Get-CimClass -ClassName Cim_Process | Select-Object -ExpandProperty CimClassMethods | Measure-Object

# Count the properties and methods of the Win32_Process class:
Get-CimClass -ClassName Win32_Process | Select-Object -ExpandProperty CimClassProperties | Measure-Object
Get-CimClass -ClassName Win32_Process | Select-Object -ExpandProperty CimClassMethods | Measure-Object
```

However, I prefer to look up the information in the official documentation. If I search for `Win32_Process` in a search engine, I quickly land on the [right documentation](https://learn.microsoft.com/en-us/windows/win32/cimwin32prov/win32-process). The advantage is that it usually also includes descriptions and examples for the properties and methods.

### WMI namespaces

You may have noticed from the output of `Get-CimClass`: above the list of results there is still: "NameSpace: ROOT/cimv2".

The classes are organized into namespaces, similar to folders in a file system. Additional hardware or software can sometimes bring their own namespaces containing additional WMI classes. `root/cimv2` is simply the default namespace of Windows. And if we call `Get-CimClass` without further parameters, we will only see the classes in this default namespace. But there are more namespaces.
The definition of namespaces can be retrieved via the system class `__Namespace`, but we also need to specify that we want to view that definition in the namespace `root` (without `cimv2`, which is already a sub-namespace of `root`):

```powershell
Get-CimInstance __NAMESPACE -Namespace root
```

On a domain controller, I have also seen other namespaces than on a Windows 11 client. For example, my DC has the namespace `MicrosoftActiveDirectory`.

```powershell
# Retrieve information about the MicrosoftActiveDirectory class in the root namespace:
Get-CimClass -Namespace root/MicrosoftActiveDirectory
```

In fact, namespaces can also contain additional namespaces. For example, the standard namespace `root/cimv2` also contains sub-namespaces.
With a small function I wrote myself, we can list all namespaces.

```powershell
function Get-CimNamespace {
    # Function to retrieve CIM namespaces recursively
    param($NameSpace = "root")

    foreach($thisNamespace in (Get-CimInstance __NAMESPACE -Namespace $NameSpace)) {
        ($SubNameSpace = "{0}\{1}" -f $NameSpace,$thisNamespace.Name) # this line sets the var and also outputs it ;)
        Get-CimNamespace -NameSpace $SubNameSpace
    }
    
}
# Load all namespaces into a variable
$AllCimNameSpaces = Get-CimNamespace

"Found $($AllCimNameSpaces.Count) NameSpaces."
$AllCimNameSpaces

# Retrieve all classes from all namespaces:
$AllCimClasses = $AllCimNameSpaces | ForEach-Object { Get-CimClass -Namespace $_ }
"Found $($AllCimClasses.Count) Classes:"
$AllCimClasses

# Filter out duplicate classes and count the result:
$AllCimClasses | Sort-Object -Property CimClassName -Unique | Measure-Object
```

In general, however, a lot of important things also happen in the default namespace `root/cimv2`, in my opinion. But of course that depends on what you want to do with WMI.

### Find WMI classes

If you do not yet know which class you need, you can also search with `Get-CimClass`. If you suspect that the class name contains a specific word, you can use wildcards and search:

```powershell
# Search for WMI/CIM classes whose name contains "process"
Get-CimClass -ClassName *process*

# Search for WMI/CIM classes where there is a method called "reboot"
Get-CimClass -MethodName *reboot*

# Search for WMI/CIM classes where there is a property called "wallpaper"
Get-CimClass -PropertyName *wallpaper*
```

Otherwise, there are also graphical tools that can help, such as the [WMI Explorer by Vinay Pamnani](https://github.com/vinaypamnani/wmie2).
