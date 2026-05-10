---
slug: "powershell-screenshots"
title: "Creating Screenshots with PowerShell"
date: 2026-05-10
tags: [powershell, windows]
---

If you want to create screenshots with PowerShell, then you need to use .NET. I will show you the required code below. But if you want to do it easier, you can also use my [Screenshot PowerShell module](https://github.com/diecknet/PSScreenshot) (more information on that further down).

I also demonstrate the following options [in this video on YouTube](https://youtu.be/wcEcqw89si8).

## Why though?

Of course, screenshots can simply be created manually by pressing the `[Print]` key on your keyboard, and there are also good tools for editing screenshots (for example Greenshot). But if you already automate something with PowerShell then it can be helpful e.g. for documentation purposes, if you can create screenshots **automatically**.

## Note: Works only on Windows

The code shown in this post only works on Windows.

## Screenshot across all screens

With the following code, you can create a screenshot across all screens. Unlike many other example snippets from the internet, this saves directly as JPEG instead of BMP. That saves a noticable amount of disk space.

```powershell
Add-Type -AssemblyName System.Windows.Forms,System.Drawing

$Screen = [System.Windows.Forms.SystemInformation]::VirtualScreen
$Bitmap = [System.Drawing.Bitmap]::new($Screen.Width, $Screen.Height)
$Graphic = [System.Drawing.Graphics]::FromImage($bitmap)
$Graphic.CopyFromScreen(0, 0, 0, 0, $Screen.Size)
$Bitmap.Save("C:\temp\Screenshot.jpg", [System.Drawing.Imaging.ImageFormat]::Jpeg)
```

## Screenshot a region by coordinates

If you do not want to screenshot the entire screen, you can also work with coordinates. I built a small helper function here (`New-DiecknetScreenshot`). It accepts the parameters `-X` and `-Y` for the starting position and `-Width` and `-Height` for width and height. In addition, the file name is generated with the current time information.

```powershell
Add-Type -AssemblyName System.Windows.Forms,System.Drawing

function New-DiecknetScreenshot {
    param($X, $Y, $Width, $Height)
    $Bitmap = [System.Drawing.Bitmap]::new($Width, $Height)
    $Graphic = [System.Drawing.Graphics]::FromImage($bitmap)
    $Graphic.CopyFromScreen($X, $Y, 0, 0, [System.Drawing.Size]::new($Width, $Height))
    $Bitmap.Save("C:\temp\Screenshot_$(Get-Date -Format 'yyyyMMdd_HHmmss').jpg", [System.Drawing.Imaging.ImageFormat]::Jpeg) 
}

New-DiecknetScreenshot -X 100 -Y 100 -Width 500 -Height 500
```

## Screenshot of a specific process

With the following code, you can *theoretically* screenshot a specific process. But it is not really reliable, so I would not recommend it. I am mainly including it here because I also show this code [in the video](https://youtu.be/wcEcqw89si8).

The problem is that a process can have multiple windows, so you may end up screenshotting a wrong window. That is why I would rather recommend the code from the later section [Screenshot of a specific window](#screenshot-of-a-specific-window).

```powershell
Add-Type @"
    using System;
    using System.Runtime.InteropServices;

    // From Boe Prox (Hey, Scripting Guys! Blog): https://devblogs.microsoft.com/scripting/weekend-scripter-manage-window-placement-by-using-pinvoke/

    public class Window {
        [DllImport("user32.dll")]
        [return: MarshalAs(UnmanagedType.Bool)]
        public static extern bool GetWindowRect(IntPtr hWnd, out RECT lpRect);
    }

    public struct RECT {
        public int Left;        // x position of upper-left corner
        public int Top;         // y position of upper-left corner
        public int Right;       // x position of lower-right corner
        public int Bottom;      // y position of lower-right corner
    }
"@

function New-DiecknetScreenshot {
    param($X, $Y, $Width, $Height)
    $Bitmap = [System.Drawing.Bitmap]::new($Width, $Height)
    $Graphic = [System.Drawing.Graphics]::FromImage($bitmap)
    $Graphic.CopyFromScreen($X, $Y, 0, 0, [System.Drawing.Size]::new($Width, $Height))
    $Bitmap.Save("C:\temp\Screenshot_$(Get-Date -Format 'yyyyMMdd_HHmmss').jpg", [System.Drawing.Imaging.ImageFormat]::Jpeg) 
}

$Rectangle = [Rect]::New()
[Window]::GetWindowRect((Get-Process notepad).MainWindowHandle, [ref]$Rectangle)
$Rectangle

New-DiecknetScreenshot -X $Rectangle.Left -Y $Rectangle.Top -Width ($Rectangle.Right - $Rectangle.Left) -Height ($Rectangle.Bottom - $Rectangle.Top)
```

## Screenshot of a specific window

To screenshot a specific window by its window title, you can use the following code:

```powershell
Add-Type @"
    using System;
    using System.Runtime.InteropServices;

    public class Window {
        [DllImport("user32.dll")]
        [return: MarshalAs(UnmanagedType.Bool)]
        public static extern bool GetWindowRect(IntPtr hWnd, out RECT lpRect);

        // From an unknown user on Reddit: https://www.reddit.com/r/PowerShell/comments/2llb4u/comment/cm0e8fi/
        private class unmanaged {
            // FindWindowByCaption
            [DllImport("user32.dll", EntryPoint="FindWindow", SetLastError = true)]
            internal static extern IntPtr FindWindowByCaption(IntPtr ZeroOnly, string lpWindowName);

        }

        // FindWindowByCaption
        public static IntPtr FindWindowByCaption(string Title) {
            return unmanaged.FindWindowByCaption(IntPtr.Zero, Title);
        }    
    }

    public struct RECT {
        public int Left;        // x position of upper-left corner
        public int Top;         // y position of upper-left corner
        public int Right;       // x position of lower-right corner
        public int Bottom;      // y position of lower-right corner
    }
"@

function New-DiecknetScreenshot {
    param($X, $Y, $Width, $Height)
    $Bitmap = [System.Drawing.Bitmap]::new($Width, $Height)
    $Graphic = [System.Drawing.Graphics]::FromImage($bitmap)
    $Graphic.CopyFromScreen($X, $Y, 0, 0, [System.Drawing.Size]::new($Width, $Height))
    $Bitmap.Save("C:\temp\Screenshot_$(Get-Date -Format 'yyyyMMdd_HHmmss').jpg", [System.Drawing.Imaging.ImageFormat]::Jpeg) 
}

$ProcessHandle = [Window]::FindWindowByCaption("file1.txt - Notepad")
$Rectangle = [Rect]::New()
$null = [Window]::GetWindowRect($ProcessHandle, [ref]$Rectangle)

New-DiecknetScreenshot -X $Rectangle.Left -Y $Rectangle.Top -Width ($Rectangle.Right - $Rectangle.Left) -Height ($Rectangle.Bottom - $Rectangle.Top)
```

## PowerShell module for screenshots

I also created [a PowerShell module](https://github.com/diecknet/PSScreenshot) that lets you create screenshots. The code used under the hood is basically the same as what I have already shown in this post. But then you don't have to deal with the .NET boilerplate code yourself 😉.

### Installation

Depending on your system, you can install the module with either `Install-Module` or `Install-PSResource` from the [PowerShell Gallery](https://www.powershellgallery.com/packages/Screenshot):

```powershell
# This should work in PowerShell 7:
Install-PSResource Screenshot -Repository PSGallery
# Or for Windows PowerShell 5.1:
Install-Module Screenshot -Repository PSGallery
```

### Example 1: Create a screenshot

To create a simple screenshot of all screens, you can run the following command. The screenshot will be saved in the current directory.

```powershell
New-Screenshot
```

### Example 2: Create a screenshot and adjust the path

```powershell
New-Screenshot -Path C:\temp\Screenshots\
```

### Example 3: Create a screenshot and adjust the file name

```powershell
New-Screenshot -FileName "MyCoolScreenshot.jpg"
```

### Example 4: Create a screenshot of a specific window

```powershell
New-Screenshot -WindowTitle "file1.txt - Notepad"
```

### Example 5: Create a screenshot with specific coordinates

```powershell
New-Screenshot -X 300 -Y 500
```

### Example 6: Create a screenshot with specific coordinates and adjust height/width

```powershell
New-Screenshot -X 300 -Y 500 -Height 250 -Width 250
```

### Return value

The `New-Screenshot` cmdlet from my Screenshot module returns the screenshot file as an object. That means you can also further process or even open the screenshot.

```powershell
# Creates a screenshot and opens it directly with the default application:
New-Screenshot | Invoke-Item
```
