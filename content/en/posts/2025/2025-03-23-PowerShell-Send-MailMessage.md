---
slug: "powershell-send-mailmessage"
title: "Send emails with PowerShell using Send-MailMessage"
date: 2025-03-23
tags: [powershell]
---
It is fairly easy to send emails with PowerShell. For that purpose, there is the built-in cmdlet `Send-MailMessage`, which Microsoft now describes as deprecated:

> ⚠️ Warning
>
> The `Send-MailMessage` cmdlet is deprecated. This cmdlet does not guarantee secure connections with SMTP servers. Although there is no immediate replacement available in PowerShell, it is recommended not to use `Send-MailMessage`. For more information, see [Platform Compatibility Note DE0005](https://aka.ms/SendMailMessage).

Source: <https://learn.microsoft.com/en-us/powershell/module/microsoft.powershell.utility/send-mailmessage?view=powershell-7.5>

For some scenarios, using `Send-MailMessage` is still okay in my opinion. For example, if you run your own SMTP server, such as a Microsoft Exchange Server, or you have one hosted somewhere else, there is often no support for modern authentication methods. Of course, you could also run such an SMTP server in addition to an Exchange Online environment. In general, I would recommend using a subdomain such as "reports.demotenant.de" rather than just "demotenant.de" for these automated emails, but that is not a requirement.

If you use Exchange Online exclusively for sending mail, then the `Send-MailMessage` cmdlet is not suitable. I will also publish a video and a blog post soon about sending email via Microsoft Graph and PowerShell. If you are interested, check back here soon and or subscribe to [my YouTube channel](https://youtube.com/@diecknet).

## Examples

Here are a few examples that I found quite useful. You can also find more examples in the [Microsoft documentation for the cmdlet](https://learn.microsoft.com/en-us/powershell/module/microsoft.powershell.utility/send-mailmessage?view=powershell-7.5). I also demonstrate the examples in [this video](https://youtu.be/zFDWjaKu2EQ).

## Note about credentials

You should not store credentials in plain text in your PowerShell code. Anyone who gets the code in their hands would also have the credentials and could misuse them.
For simple test purposes, you can prompt for credentials interactively. The examples below assume that the variable `$Credential` contains a PSCredential object with the credentials. You can retrieve it like this:

```powershell
# Prompt for credentials and save them as a PSCredential object
$Credential = Get-Credential
```

Here is another video about storing credentials securely in code: <https://www.youtube.com/watch?v=C9bYPSWjCDY>

### Note about encoding

I explicitly use UTF8 in all examples here to avoid issues with special characters. If the special characters are not displayed correctly for you, check whether your PowerShell script is also saved in UTF8 encoding. If it still does not work, you may need to choose a different encoding.

### Example 1: Sending via TLS/SSL over port 25

A simple example: We send the mail securely over TLS/SSL (`-UseSSL`), but over port 25. Specifying the port is therefore optional (`-Port 25`). The credentials are taken from the variable `$Credential`.

```powershell
# Note: keep the backtick at the end of the line! The parameters continue on the next line.
Send-MailMessage -From "test@demotenant.de" -SmtpServer "MySMTPServer.demotenant.de" `
    -Credential $Credential -UseSSL -Port 25 -To "hans.maulwurf@demotenant.de" `
    -Subject "Hello from PowerShell" -Body "This is the content of the email" `
    -Encoding utf8
```

### Example 2: Multi-line emails

If you only want to send very short emails, you can perhaps pass the text directly to the parameter. If you want to include a line break, you can write `` `r`n `` in the value for `-Body`. In general, I would define the email text in a variable and pass it to the cmdlet.
With the following syntax, you can easily define a multi-line string in PowerShell:

```powershell
$EmailText = @"
Hello,

this is an email.

Best regards
PowerShell
"@

# Note: keep the backtick at the end of the line! The parameters continue on the next line.
Send-MailMessage -From "test@demotenant.de" -SmtpServer "MySMTPServer.demotenant.de" `
    -Credential $Credential -UseSSL -Port 25 -To "hans.maulwurf@demotenant.de" `
    -Subject "Hello from PowerShell" -Body $EmailText `
    -Encoding utf8
```

### Example 3: HTML emails

To make your emails a bit nicer, you can use HTML. For the email client on the recipient side to interpret it correctly, you must specify the switch parameter `-BodyAsHTML`. The actual body (now in HTML format) is still passed via `-Body`.

```powershell
$EmailText = @"
<h1>Hello,</h1>

<b>this</b> <u>is</u> an <i>email</i>.

Best regards
PowerShell
"@

# Note: keep the backtick at the end of the line! The parameters continue on the next line.
Send-MailMessage -From "test@demotenant.de" -SmtpServer "MySMTPServer.demotenant.de" `
    -Credential $Credential -UseSSL -Port 25 -To "hans.maulwurf@demotenant.de" `
    -Subject "Hello from PowerShell" -Body $EmailText -BodyAsHTML ` 
    -Encoding utf8
```

### Example 4: Convert PowerShell arrays/objects to HTML

It becomes really useful when you also collect or generate data with PowerShell and then send it by email. With the cmdlet `ConvertTo-HTML`, you can convert an array or a PowerShell object to HTML. In the following example, I list all local users on the computer in order to send a small report by PowerShell.
I also use the `-Property` parameter with `ConvertTo-HTML` to select the properties (otherwise all are used) and `-Fragment`, so that only an HTML table is generated and not a complete web page (with a full HTML structure).

```powershell
$HTMLTable = Get-LocalUser | ConvertTo-HTML -Property Name,SID -Fragment
$EmailText = @"
<h1>Hello,</h1>

this is a report about local users, generated with PowerShell.

Best regards
PowerShell
<hr>
$HTMLTable
"@

# Note: keep the backtick at the end of the line! The parameters continue on the next line.
Send-MailMessage -From "test@demotenant.de" -SmtpServer "MySMTPServer.demotenant.de" `
    -Credential $Credential -UseSSL -Port 25 -To "hans.maulwurf@demotenant.de" `
    -Subject "Hello from PowerShell" -Body $EmailText -BodyAsHTML ` 
    -Encoding utf8
```

### Example 5: Multiple recipients, CC, and BCC

If you do not want to use only normal recipients via the `-To` parameter, but also CC or BCC, then you can use the `-CC` and `-BCC` parameters.
And for all three parameters, you can enter multiple recipients by providing them as an array. For example: `-To "hans.maulwurf@demotenant.de","alexw@demotenant.de"`.

```powershell
# Note: keep the backtick at the end of the line! The parameters continue on the next line.
Send-MailMessage -From "test@demotenant.de" -SmtpServer "MySMTPServer.demotenant.de" `
    -Credential $Credential -UseSSL -Port 25 -To "hans.maulwurf@demotenant.de","alexw@demotenant.de" `
    -Subject "Hello from PowerShell" -Body "This is the content of the email" `
    -Encoding utf8 -CC "someone@demotenant.de" -BCC "example@demotenant.de"
```

### Example 6: Email attachments

To add email attachments, you can specify the path to the file via the `-Attachment` parameter. Multiple attachments are also possible if they are provided as an array, for example: `-Attachment "Attachment1.docx","Attachment2.txt"`.

```powershell
# Note: keep the backtick at the end of the line! The parameters continue on the next line.
Send-MailMessage -From "test@demotenant.de" -SmtpServer "MySMTPServer.demotenant.de" `
    -Credential $Credential -UseSSL -Port 25 -To "hans.maulwurf@demotenant.de","alexw@demotenant.de" `
    -Subject "Hello from PowerShell" -Body "This is the content of the email" `
    -Encoding utf8 -Attachment "Attachment.docx"
```
