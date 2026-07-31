---
slug: "powershell-create-and-extract-zip-archives"
title: "Create and Extract .zip Archives with PowerShell"
date: 2024-06-08
comments: true
tags: [powershell]
---
Windows has long been able to work with ZIP archives.
PowerShell can do that too, both creating ZIP files and extracting them.
This can be useful if, for example, you want to combine several files into a ZIP file with a PowerShell script, which makes it easier to copy them elsewhere. Or perhaps to extract a ZIP file downloaded from the internet by a script.

**🎬 I also created a [video on this topic](https://youtu.be/ALoe26e8c5s).**  

## Compress

You can create a ZIP archive with the `Compress-Archive` cmdlet:

```powershell
Compress-Archive -Path "MeineOriginalDatei.txt" -DestinationPath "MeineGezippteDatei.zip"
```

### Adjust the compression level

Optionally, you can specify a compression level. If you do not specify the parameter, the default option is "Optimal", which should already compress as well as possible. This requires a bit more processing power when packing and unpacking, but can save disk space. Alternatively, there are the options "Fastest", which is faster but produces a larger archive, and "NoCompression", which does not compress at all and just packages the files into a ZIP file.

```powershell
Compress-Archive -Path "MeineOriginalDatei.txt" -DestinationPath "MeineGezippteDatei-Fastest.zip" -CompressionLevel Fastest
Compress-Archive -Path "MeineOriginalDatei.txt" -DestinationPath "MeineGezippteDatei-NoCompression.zip" -CompressionLevel NoCompression
```

### Zip multiple files

There are several ways to zip multiple files:

1. You can simply provide several values to the `-Path` parameter and separate them with commas.

    ```powershell
    Compress-Archive -Path "MeineOriginalDatei.txt","beispiel.bmp" -DestinationPath "MeineGezippteDatei2.zip"
    ```

2. Or you can specify an entire folder:

    ```powershell
    Compress-Archive -Path "C:\temp" -DestinationPath "MeineGezippteDatei3.zip"
    ```

3. Or work with wildcards:

    ```powershell
    Compress-Archive -Path "*.jpg" -DestinationPath "MeineGezippteDatei4.zip"
    ```

4. Or you can pass the information about which data to compress through the pipeline:

    ```powershell
    Get-ChildItem C:\temp |
        Where-Object {$_.LastWriteTime -ge "2024-06-01"} |
        Compress-Archive -Path "C:\temp" -DestinationPath "MeineGezippteDatei5.zip"
    ```

### Add files to an existing ZIP file

To add files to an existing ZIP file, you can specify the `-Update` parameter. If the ZIP archive already contains a file with the same name, it will be replaced. Otherwise, the file will simply be added to the ZIP archive.

```powershell
Compress-Archive -Path "Hallo.docx" -DestinationPath "MeineGezippteDatei6.zip" -Update
```

## Extract

You can extract ZIP files with the `Expand-Archive` cmdlet:

```powershell
Expand-Archive -Path "MeineGezippteDatei6.zip"
```

By default, the cmdlet creates a subfolder in the current directory with the same name as the ZIP file. The data from the ZIP archive is then placed in this new folder. If you want to extract the archive content somewhere else, you can specify a destination folder with `-DestinationPath`.

```powershell
Expand-Archive -Path "MeineGezippteDatei6.zip" -DestinationPath "MeinEntpackterOrdner"
```

Or, if you want to extract it into the current folder, you can also specify a dot as the value for `-DestinationPath`:

```powershell
Expand-Archive -Path "MeineGezippteDatei6.zip" -DestinationPath .
```

## Closing words

Both cmdlets have a few more parameters and options. The best place to check them is the [Microsoft documentation for the two commands](https://learn.microsoft.com/en-us/powershell/module/microsoft.powershell.archive/?view=powershell-7.4).

Also, even though newer Windows versions can natively handle additional archive formats such as `.rar` or `.7z` in Explorer, PowerShell still cannot do that. If you want to use other archive formats in a script, you will need to fall back to alternatives such as [the command line version of 7-Zip](https://www.7-zip.org/download.html) or [the PowerShell module "7Zip4PowerShell"](https://github.com/thoemmi/7Zip4Powershell). I do not have any experience with the module, so use it at your own risk 😉.
