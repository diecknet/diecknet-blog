---
comments: true
aliases:
    - check-ntfs-permissions-powershell
slug: Check-NTFS-Permissions-Powershell
layout: post
title: "NTFS-Berechtigungen mit PowerShell prüfen"
date: 2020-05-20
tags:
    [powershell, accessrights, acl, ntfs, windowsvirtualdesktop, fslogix]
cover:
    image: /images/2020/2020-05-20_CheckProfileStoragePermissions.png
---

Ich brauchte eine schnelle Möglichkeit, ein paar Ordner auf korrekte Berechtigungen zu prüfen. Es ging um Windows Virtual Desktop/FSLogix-Benutzerprofilcontainer in einer Azure Files-Freigabe. Bei einigen dieser Profilordner waren die Berechtigungen falsch gesetzt.

Die korrekten Storage-Berechtigungen sind:

| Benutzerkonto            | Ordner                             | Berechtigungen |
| ------------------------ | ---------------------------------- | -------------- |
| Users                    | Nur dieser Ordner                  | Ändern         |
| Creator / Owner          | Nur Unterordner und Dateien        | Ändern         |
| Administrator (optional) | Dieser Ordner, Unterordner, Dateien| Vollzugriff    |

Offizielle FSLogix-Dokumentation: [Configure storage permissions for use with Profile Containers and Office Containers](https://docs.microsoft.com/en-us/fslogix/fslogix-storage-config-ht)

## Die Umgebung

In dieser Umgebung hat jeder Benutzer einen eigenen Unterordner in der Freigabe. Der Benutzer erstellt diesen Unterordner selbst (bei der ersten Anmeldung an Windows Virtual Desktop) und ist dadurch der Besitzer. Als Besitzer hat er `Ändern`-Rechte auf (Unter-)Unterordner und Dateien im eigenen Ordner. FSLogix erstellt im Benutzerordner eine Profilcontainer-vhd(x)-Datei.

## Berechtigungen mit PowerShell prüfen

Berechtigungen können in PowerShell mit `Get-Acl` geprüft werden.

Ich habe dafür ein schnelles, pragmatisches PowerShell-Skript erstellt, um die Berechtigungen zu prüfen. Es versucht keine automatische Korrektur, sondern listet nur Ordner mit fehlerhaften Berechtigungen auf. Die Korrektur kann dann entweder manuell per GUI erfolgen, oder indem das ACL-Objekt des Unterordners per `Set-Acl` auf die Dateien angewendet wird.

## Skript herunterladen

[CheckProfileStoragePermissions.ps1 (Github)](https://gist.github.com/diecknet/8a36e9551cf5a08c03779e9f7d13d05e)
