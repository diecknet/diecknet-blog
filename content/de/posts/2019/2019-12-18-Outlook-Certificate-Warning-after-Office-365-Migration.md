---
title: Outlook Zertifikatswarnung nach Office 365 Migration
contenttags: [office365, exchange, exchangeonline, exchange2010]
image: /assets/images/2019-12-18-Certificate-Warning-outlook.png
date: 2019-12-18
---

> Outlook Zertifikatswarnung nach Office 365 Migration  
> Security Alert: svr1.example.com  
> ...  
> The security certificate has expired or is not valid yet]

Ich habe kürzlich eine Anfrage von einem Kunden erhalten, der nach seiner Office 365 Migration noch Zertifikatswarnungen (Zertifikat abgelaufen) für den alten Exchange Server erhalten hat. Da ich bei der Migration nicht involviert war, musste ich mir erstmal einen Überblick verschaffen:  
Der On-Premise Exchange Server 2010 war noch vorhanden - logisch, sonst wäre wohl kaum eine Zertifikatswarnung erschienen. Es erhalten allerdings auch nicht alle Anwender diese Meldung. Betroffen waren sowohl migrierte Benutzer, als auch Benutzer, deren Postfächer direkt in Office 365 erstellt wurden.

![Outlook Verbindungsstatus: Es werden noch Ressourcen vom Exchange Server svr1.example.com abgerufen](/assets/images/2019-12-18-Outlook-connection-status.png "Outlook Verbindungsstatus: Es werden noch Ressourcen vom Exchange Server svr1.example.com abgerufen")  
Bei einem betroffenen User haben wir per STRG+Rechtsklick auf das Outlook-Symbol im Tray im Menü den "Verbindungsstatus" abgerufen. Hier war schnell ersichtlich, dass der User tatsächlich noch Ressourcen des lokalen On-Premise Exchange Systems abruft: Ein IT-Mitarbeiter hat neue Ressourcenpostfächer am Exchange Server erstellt und den Anwendern Zugriff erteilt.  
Als Workaround könnte nun erstmal das Zertifikat des Servers erneuert werden. Die tatsächliche Lösung, nämlich das Ressourcenpostfach ebenfalls zu Office 365 zu migrieren, konnte aus organisatorischen Gründen des Kunden nicht zeitnah umgesetzt werden.
