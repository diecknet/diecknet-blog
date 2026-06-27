---
slug: "unraid-destroy-zfs-failed"
title: "Unraid: '<Share Name>' kann nicht gelöscht werden: dataset is busy"
date: 2025-12-27
comments: true
tags: [unraid, zfs]
ShowToc: false
---

Ich habe vor Kurzem ein Problem auf meinem Unraid-Server gehabt: Ich habe einen Share ("myshare") über die GUI löschen wollen, aber es hat einfach nicht funktioniert. Als ich die Logs geprüft habe, habe ich Folgendes gefunden:

```log
Dec 27 21:53:24 tower emhttpd: readlink -e '/mnt/user/myshare'
Dec 27 21:53:24 tower emhttpd: /mnt/user/myshare
Dec 27 21:53:24 tower emhttpd: shcmd (750): rmdir '/mnt/user/myshare'
Dec 27 21:53:24 tower shfs: /usr/sbin/zfs unmount 'cache/myshare' 2>&1
Dec 27 21:53:24 tower shfs: /usr/sbin/zfs destroy 'cache/myshare' 2>&1
Dec 27 21:53:24 tower shfs: cannot destroy 'cache/myshare': dataset is busy
Dec 27 21:53:24 tower shfs: /usr/sbin/zfs mount 'cache/myshare' 2>&1
```

Das `dataset is busy` war also offenbar das Problem 😐...  
Komisch, weil es komplett leer gewesen ist und keine Container oder VMs den Share eigentlich hätten verwenden sollen. Die Hinweise, die ich im Internet gefunden habe, haben mir nicht geholfen:

- Das Array stoppen und das ZFS-Dataset dann manuell zerstören => Kein Zugriff auf das Dataset möglich, wenn das Array gestoppt ist
- Den Server neu starten und dann erneut versuchen => gleiches Ergebnis wie zuvor

## Lösung

Was *in meinem Fall* letztlich geholfen hat, war: den Ordner im Dateisystem entfernen und danach das ZFS-Dataset zerstören. Dafür habe ich die folgenden Befehle per SSH ausgeführt:

```bash
rm /mnt/cache/myshare -d
zfs destroy cache/myshare
```
