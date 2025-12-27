---
slug: "unraid-destroy-zfs-failed"
title: "Unraid: Cannot destroy '<Share Name>': dataset is busy"
date: 2025-12-27
comments: true
tags: [unraid, zfs]
ShowToc: false
---

I recently had an issue on my Unraid server: I wanted to delete a share ("myshare") via the GUI, but it just did not do it. When I checked the logs, I found the following:

```log
Dec 27 21:53:24 tower emhttpd: readlink -e '/mnt/user/myshare'
Dec 27 21:53:24 tower emhttpd: /mnt/user/myshare
Dec 27 21:53:24 tower emhttpd: shcmd (750): rmdir '/mnt/user/myshare'
Dec 27 21:53:24 tower shfs: /usr/sbin/zfs unmount 'cache/myshare' 2>&1
Dec 27 21:53:24 tower shfs: /usr/sbin/zfs destroy 'cache/myshare' 2>&1
Dec 27 21:53:24 tower shfs: cannot destroy 'cache/myshare': dataset is busy
Dec 27 21:53:24 tower shfs: /usr/sbin/zfs mount 'cache/myshare' 2>&1
```

So apparently the `dataset is busy` 😐...  
Weird, because it's completely empty and no Containers or VMs are supposed to use the share. The hints that I found on the Internet did not help me:

- Stopping the Array and then destroying the ZFS dataset manually => Not possible to access the dataset when the Array is stopped
- Rebooting the Server and then retrying => same result as before

## Solution

What ultimatively helped *in my case* was removing the folder in the filesystem and then destroying the ZFS dataset. To do so, I ran the following commands via SSH:

```bash
rm /mnt/cache/myshare -d
zfs destroy cache/myshare
```
