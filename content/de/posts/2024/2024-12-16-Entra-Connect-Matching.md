---
slug: "entra-connect-matching"
title: "Entra Connect: Soft Match und Hard Match"
date: 2024-12-16
comments: true
tags: [microsoft entra, active directory, entra connect]
---

In diesem Post geht es darum, wie Entra Connect Identitäten zusammenführt und dann im Betrieb weiter trackt. Bei einigen Punkten könnte man bestimmt noch weiter in die Tiefe einsteigen, aber das hier sind meiner Meinung nach die wichtigsten Grundlagen.

Alles was ich jetzt hier in dem Post beschreibe bezieht sich in der Regel sowohl auf das klassische Entra Connect Sync, als auch auf das modernere Entra Cloud Sync. Falls doch etwas nur für das eine oder andere Sync Tool gilt, dann weise ich explizit darauf hin. Ansonsten werde ich aber der Einfachheit halber im Folgenden einfach Entra Connect schreiben, wenn ich beides meine.

Dieser Post ist vor allem als Begleitpost zum [Video auf meinem YouTube Kanal](https://youtu.be/yxIHnydUytE) gedacht, um z.B. die Code-Beispiele zu teilen - darf aber natürlich auch einzeln gelesen werden 😉

## Überblick Funktionsweise

Wenn Entra Connect ein User Objekt aus dem On-Premises Active Directory verarbeitet, dann wird dabei erstmal geschaut, ob ein Hard Match (deutsch: "harte Übereinstimmung") möglich ist. Zur genauen Funktionsweise vom Hard Match kommen wir weiter unten. Ist erstmal nur wichtig: Es kann in einem Entra Objekt gespeichert werden, dass es zu einem bestimmten Objekt aus dem On-Prem AD gehört. Wenn diese Info gefunden wird, und zwei Objekte zusammenpassen, dann haben wir ein Hard Match.

Falls aber kein Hard Match möglich ist, wird versucht ein Soft Match (deutsch: "weiche Übereinstimmung") durchzuführen - auch die Funktionsweise des Soft Match erkläre ich später noch genauer.

Egal wie gematched wurde: Das vorherige Cloud-Objekt wird nun als "synchronisiert" markiert und erhält die Eigenschaften vom On-Prem AD Objekt. Die Objekt ID vom Cloud User, User-Daten (Postfach, OneDrive, Teams-Nachrichten etc.) und eventuell bereits vorhandene Berechtigungen und Cloud-Gruppenmitgliedschaften bleiben aber erhalten.

Falls weder ein Hard Match noch ein Soft Match möglich ist, dann wird das Objekt neu in Entra angelegt. Und es wird auch abgespeichert, dass das neue Entra Objekt und das On-Prem AD Objekt zusammengehören, sodass dann zukünftig ein Hard Match möglich ist.

## Soft Match

Wenn ein neues On-Premises Active Directory Objekt von Entra Connect entdeckt wird, wird geprüft ob es ein passendes Objekt in Entra gibt, welches die gleiche **E-Mail-Adresse** oder den gleichen **UserPrincipalName** hat. Bei den E-Mail-Adressen wird in der Dokumentation hauptsächlich auf die AD-User-Eigenschaft **ProxyAddresses** verwiesen. Aus den ProxyAddresses wird übrigens nur die Haupt-E-Mail-Adresse ausgewertet, also die bei der das Präfix `SMTP:` großgeschrieben ist.

[![Active Directory ProxyAddresses eines Users](/images/2024/2024-12-16_AD-User-ProxyAddresses.jpg "Active Directory ProxyAddresses eines Users")](/images/2024/2024-12-16_AD-User-ProxyAddresses.jpg)

Das Bearbeiten des ProxyAddresses Attributs ist offiziell nur supported, wenn es über die Exchange Management Tools gemacht wird - also Exchange Management Shell oder das Exchange Admin Center. Aber das Matching funktioniert auch über das Feld mit dem Attributnamen **mail**, welches in der Active Directory Benutzer und Computer Konsole auf der "Allgemein" Seite in den User-Eigenschaften zu finden ist. Diese Eigenschaft darf einfach hier in der Konsole geändert werden.

[![Active Directory Mail Attribut eines Users](/images/2024/2024-12-16_AD-User-Mail-Attribute.jpg "Active Directory Mail Attribut eines Users")](/images/2024/2024-12-16_AD-User-Mail-Attribute.jpg)

⚠️ **Admin Matching Besonderheit:** Wenn ein User in Entra beziehungsweise in Microsoft 365 eine Adminrolle hat, dann funktioniert Soft Matching aus Sicherheitsgründen nicht.

Und wenn ein Soft Match stattgefunden hat, dann wird automatisch eine Info abgespeichert, damit zukünftig ein Hard Match möglich ist.

### 🎬 Soft Match Beispiele

Hier mal 3 Beispiele für Soft Matches:

#### UserPrincipalName

1. Ausgangssituation: Es existiert ein Cloud-Only User mit dem UserPrincipalName `SoftMatch1@demotenant.de`.
2. Entra Connect stößt auf einen neuen Active Directory User mit dem gleichen UPN `SoftMatch1@demotenant.de`.
3. Der Cloud User wird umgewandelt zu einem synchronisierten User und erhält die Attribute vom AD User.

#### ProxyAddresses / PrimarySmtpAddress

1. Ausgangssituation: Es existiert ein Cloud-Only User mit dem UserPrincipalName `SoftMatch2@demotenant.de` und der PrimarySmtpAddress `hallo@demotenant.de`.
2. Entra Connect stößt auf einen neuen Active Directory User mit dem UPN `beispiel@demotenant.de` und der PrimarySmtpAddress `hallo@demotenant.de` (Also ProxyAddressAttribut enthält unter anderem den Eintrag `SMTP:hallo@demotenant.de`).
3. Der Cloud User wird umgewandelt zu einem synchronisierten User und erhält die Attribute vom AD User (inklusive des neuen UPN!).

#### Mail Attribut

1. Ausgangssituation: Es existiert ein Cloud-Only User mit dem UserPrincipalName `SoftMatch3@demotenant.de` und der PrimarySmtpAddress `ZZZ@demotenant.de`.
2. Entra Connect stößt auf einen neuen Active Directory User mit dem UPN `AAA@demotenant.de` und E-Mail-Adresse `ZZZ@demotenant.de` (Also das mail Attribut hat den Wert `SMTP:ZZZ@demotenant.de`).
3. Der Cloud User wird umgewandelt zu einem synchronisierten User und erhält die Attribute vom AD User (inklusive des neuen UPN!).

## Hard Match

Zum Speichern der Hard Match Info am Entra Objekt eine sogenannte "Immutable ID" (deutsch: "unveränderliche ID") verwendet. Das Attribut wird auch als SourceAnchor (deutsch: "Quellanker") bezeichnet.
Wenn ihr das klassische Entra Connect Sync verwendet, dann könnt ihr theoretisch bei der initialen Konfiguration einstellen, welches On-Premises Active Directory Attribut als Source Anchor verwendet werden soll. Der Standardwert ist heutzutage das Attribut "ms-ds-ConsistencyGuid" - und Abweichungen sind in der Regel auch nicht empfehlenswert.

[![Konfiguration des Source Anchors in Entra Connect Sync](/images/2024/2024-12-16-Entra-Connect-Source-Anchor.jpg "Konfiguration des Source Anchors in Entra Connect Sync")](/images/2024/2024-12-16-Entra-Connect-Source-Anchor.jpg)

Jetzt wird's ein bisschen kompliziert: Der eigentliche Wert basiert auf der Objekt GUID des On-Premises AD Objekts. Aber es wird nicht einfach nur die GUID genommen, sondern die GUID wird als Byte Array genommen und dann mit Base64 encoded.
Wenn ihr das klassische Entra Connect Sync verwendet **und es sich um ein User-Objekt handelt**, dann wird die Eigenschaft "ms-ds-ConsistencyGuid" auch tatsächlich durch den Sync Vorgang gesetzt (normalerweise nach 2 Sync Zyklen) und als Byte Array gespeichert. Wenn ihr euch die Eigenschaft ansehen wollt, dann hilft die Active Directory Benutzer und Computer Konsole nicht wirklich weiter. Also da könnt ihr höchstens sehen, dass das Attribut einen Wert hat, aber der eigentliche Wert ist nicht lesbar. Der Wert lässt sich aber per PowerShell auslesen und konvertieren.

```powershell
$User = Get-ADUser alexw -Properties mS-DS-ConsistencyGuid
[System.Convert]::ToBase64String($User.'mS-DS-ConsistencyGuid')
```

Den Wert können wir dann mit dem vergleichen, den wir in Entra sehen.

[![Immutable ID eines Users in Entra und im Active Directory](/images/2024/2024-12-16_ImmutableID.jpg "Immutable ID eines Users in Entra und im Active Directory")](/images/2024/2024-12-16_ImmutableID.jpg)

Beim neueren Entra Cloud Sync könnt ihr den Source Anchor übrigens **nicht** auswählen: Da wird immer "ms-ds-ConsistencyGuid" verwendet. Allerdings wird der Wert nur berechnet und die Immutable ID entsprechend in Entra gespeichert. Der Wert wird **nicht** zurückgeschrieben in die tatsächliche AD Eigenschaft "ms-ds-consistencyguid".
Und wenn ihr andere Objekttypen synchronisiert wie z.B. Gruppen, dann wird "ms-ds-consistencyguid" auch nicht zurück ins jeweilige AD Objekt geschrieben - hier ist es dann egal mit welcher Entra Connect Variante. Aber in diesen ganzen Fällen wo die Eigenschaft nicht durch Entra Connect gesetzt wird, wird sie trotzdem *ausgewertet*. Nur falls sie leer ist, dann wird stattdessen die GUID als Byte-Array verwendet - also der Wert on-the-fly berechnet.

### Source Anchor im AD anpassen

Letztendlich können wir beliebig Objekte zusammenführen, wenn wir die Eigenschaften an den AD oder Entra Objekten richtig bearbeiten. Es gibt dabei aber ein paar Fallstricke:
Wenn ein Objekt in Entra bereits eine Immutable-ID hat und es synchronisiert wird, dann können wir die Immutable ID nicht *einfach* in Entra anpassen. Meine Empfehlung ist deshalb: **Falls möglich ist, sollte der Source Anchor im On-Prem AD angepasst werden.**

Nehmen wir mal als Beispiel hier meinen bereits synchronisierten Testuser namens Hard Match #1. 

[![Beispiel User Hard Match 1](/images/2024/2024-12-16-Hard-Match-User-1a.jpg "Beispiel User Hard Match 1")](/images/2024/2024-12-16-Hard-Match-User-1a.jpg)

Wenn ich möchte, dass hier stattdessen ein anderer/neuer On-Prem AD User namens "Hard Match #1 NEU" als Quelle verwendet werden soll, dann könnte ich wie folgt vorgehen:

**Schritt 1:** Als erstes lege ich mir meinen neuen On-Prem AD User an, falls das noch nicht geschehen ist. Am besten wäre es, den User in einer Organisationseinheit anzulegen, die nicht per Entra Connect synchronisiert wird. Dadurch können wir verhindern, dass der User schon in M365 angelegt wird.

⚠️ **Falls der neue User "Hard Match #1 NEU" jetzt aber schon synchronisiert sein sollte**, wäre das keine Vollkatastrophe, aber dann müssten wir das erst bereinigen: Erst den User im On-Prem AD aus dem Sync Scope rausnehmen, und wenn der nächste Synchronisations Zyklus durch ist, und der User in Entra dadurch automatisch gelöscht wurde, dann müssen wir ihn dort auch noch aus "Gelöschte User" herauslöschen.

**Schritt 2:** müssen wir die Immutable ID vom Cloud Objekt herausfinden. Ich habe die mir einfach [im Entra Portal, aus den Eigenschaften des Users rauskopiert](/images/2024/2024-12-16_ImmutableID.jpg). Der Name der Eigenschaft lautet "On-premises immutable ID".

**Schritt 3:** Die Immutable ID müssen wir zum On-Premises Objekt hinzufügen - also bei mir hier der "Hard Match #1 NEU" User. Der einzig sinnvolle Weg ist hier per PowerShell mit dem Active Directory Modul. Die Immutable ID aus Entra ist jetzt aber noch als Base64 kodiert, das müssen wir wieder zurückwandeln in ein Byte Array.

```powershell
$ImmutableID = [System.Convert]::FromBase64String("6Ao63cWrYUewgqCMI5Fodw==")
Set-ADUser hardmatch1neu -Replace @{"mS-DS-ConsistencyGuid" = $ImmutableID}
```

**Schritt 4:** Jetzt können wir das **neue Objekt** in den Entra Sync Scope aufnehmen, also in der Regel in eine entsprechende Organisationseinheit verschieben. Falls es noch ein anderes ursprüngliches Objekt geben sollte, was dann ja die gleiche Immutable ID hätte, dann sollte dieses andere Objekt gelöscht werden.

Diese Vorgehensweise sollte auch funktionieren, wenn ihr eine andere On-Premises Active Directory Domäne als Quelle einsetzen wollt, und da komplett neu erstellte User-Objekte vorhanden sind - auch wenn die gleich heißen, die haben dann ja neue Object GUIDs. Um die dann sinnvoll zusammenführen zu können, nehmt ihr die Immutable IDs von den Cloud Objekten und schreibt die dann im neuen On-Prem AD in die Objekte rein.

Es wäre natürlich auch möglich, die "MS-DS-ConsistencyGUID" von einem Active Directory Objekt zu kopieren - wahlweise aus dem gleichen AD oder auch aus einem anderen. Trotzdem müsst ihr natürlich aufpassen, dass nicht gleichzeitig versucht wird 2 Objekte mit dem gleichen Quellanker zu synchronisieren.

### Immutable ID in Entra ändern

Falls ihr Cloud User habt, die bereits eine Immutable ID aufweisen und ihr die ändern oder leeren wollt, dann werdet ihr höchstwahrscheinlich in einen Fehler laufen. Der Trick ist dann den User zu löschen und anschließend wieder herzustellen. Und selbst mit der Methode funktioniert das nur für User, und **nicht für andere Objekttypen wie z.B. Gruppen**. Die haben nämlich überhaupt gar keine Immutable ID Eigenschaft in Entra, die wir manipulieren könnten.

Als Beispiel habe ich hier den bereits synchronisierten User "hardmatch2", aber ich möchte stattdessen einen anderen User namens "Hard Match 2 NEU" als Quelle des Objekts verwenden - allerdings wird dieser andere User leider auch schon synchronisiert.

[![Beispiel User Hard Match 2](/images/2024/2024-12-16-Hard-Match-User-2.jpg "Beispiel User Hard Match 2")](/images/2024/2024-12-16-Hard-Match-User-2.jpg)

Die eigentliche Änderung der Immutable ID müssen wir per Graph API machen, im Entra Portal gibt es keine Option dafür.
Ich verwende dafür das Microsoft Graph PowerShell Modul, welches ihr per `Install-Module Microsoft.Graph` (Windows PowerShell) beziehungsweise `Install-PSResource Microsoft.Graph` (PowerShell 7) installieren könnt - falls ihr es noch nicht habt.
Das könnt ihr aber übrigens auf einem beliebigen System machen, also das muss kein Domänencontroller und auch nicht der Entra Connect Server sein.

```powershell
# Wenn die Installation durch ist, könnt ihr zunächst die Verbindung aufbauen mit:
Connect-MgGraph -Scopes User.ReadWrite.All

# Anschließend können wir testweise den User abrufen:
Get-MgUser -UserId hardmatch2@demotenant.de

# Wir speichern uns die Infos zu dem User in einer Variable ab, damit wir gleich einfach darauf zugreifen können:
$User = Get-MgUser -UserId hardmatch2@demotenant.de

# Das eigentliche Zurücksetzen der Immutable ID:
Update-MgUser -UserId $User.Id -OnPremisesImmutableId $null
# => schlägt aber vermutlich fehl
```

Um die Immutable ID doch noch ändern zu können, müssen wir den User einmal temporär löschen - keine Angst er landet erstmal in einer Art Papierkorb ("Gelöschte Benutzer").
Da der User ja noch synchronisiert wird, müssen wir ihn an der Quelle - also im On-Prem AD löschen. Anschließend müssen wir die nächste Synchronisierung abwarten, bis der User automatisch in Entra gelöscht ist.
Anschließend können wir den User wiederherstellen, z.B. über das Entra Portal, oder auch per MS Graph PowerShell:

```powershell
Restore-MgDirectoryDeletedItem -DirectoryObjectId $User.Id
# Der vorherige Update-MgUser Befehl sollte sich jetzt erfolgreich ausführen lassen
Update-MgUser -UserId $User.Id -OnPremisesImmutableId $null
# Falls das immer noch nicht geht, dann probiert mal statt `Update-MgUser` den Request manuell per "Invoke-GraphRequest" abzufeuern:
Invoke-MgGraphRequest -Method PATCH -Uri "https://graph.microsoft.com/v1.0/users/$($User.Id)" -Body @{OnPremisesImmutableId = $null}
```

Ihr könntet hier auch eine andere Immutable ID eintragen - je nachdem was ihr erreichen wollt. Wenn ihr die Immutable ID komplett rausnehmt, dann könntet ihr *eventuell* jetzt wieder ein Soft Match durchführen.
Ich wollte aber mein Hard Match anpassen, sodass zukünftig der User "Hard Match 2 NEU" als Quelle verwendet wird.
In dem Fall brauche ich den bisherigen "Hard Match 2 NEU" User in der Cloud überhaupt nicht mehr. Das einzige was mich noch interessiert ist seine Immutable ID. Die rufe ich mir einmal ab:

```powershell
$UserNEU = Get-MgUser -UserId hardmatch2NEU@demotenant.de -Property Id,OnPremisesImmutableID
$UserNEU | Select-Object OnPremisesImmutableId
```

Und anschließend verschiebe ich das Quell-Objekt im On-Prem AD temporär in eine Organisationseinheit, die nicht mit Entra synchronisiert wird. Nachdem die nächste Synchronisierung durch ist, sollte das Objekt in Entra gelöscht sein. Allerdings ist es noch in Gelöschte User zu finden, und so lange es dort noch vorhanden ist, kann ich die Immutable ID nicht wiederverwenden. Das würde einen Fehler werfen.

```powershell
# Wirft noch einen Fehler:
Update-MgUser -UserId $User.Id -OnPremisesImmutableId $UserNEU.OnPremisesImmutableId

# Löschen des Users aus "Gelöschte Benutzer":
Remove-MgDirectoryDeletedItem -DirectoryObjectId $UserNEU.Id

# Jetzt wirklich den alten User updaten:
Update-MgUser -UserId $User.Id -OnPremisesImmutableId $UserNEU.OnPremisesImmutableId
```

Nachdem das erledigt ist, kann ich den User "Hard Match 2 NEU" im On-Prem AD wieder in den Sync Scope aufnehmen. Ich verschiebe das Objekt dafür wieder in eine meiner normalen OUs.
Dann nochmal die nächste Synchronisierung abwarten und anschließend sollte das alte Entra Objekt vom User "Hard Match 2" mit dem On-Prem AD Objekt "Hard Match 2 NEU" verbunden sein - z.B. ist der Name jetzt anders. Bereits vorhandene Berechtigungen und Gruppenmitgliedschaften in der Cloud sowie die Objekt ID entsprechen aber weiterhin dem alten "Hard Match 2"

[![Beispiel User Hard Match 2 - nach Zusammenführung](/images/2024/2024-12-16-Hard-Match-User-2b.jpg "Beispiel User Hard Match 2  - nach Zusammenführung")](/images/2024/2024-12-16-Hard-Match-User-2b.jpg)

### MS-DS-ConsistencyGUID manuell berechnen und Zuweisen

Das manuelle Berechnen und Zuweisen der "MS-DS-ConsistencyGUID" Eigenschaft kann unter anderem verwendet werden, um ein bestehendes Cloud Objekt per Hard Match zu übernehmen. Besonders nützlich, falls die Eigenschaften vom Cloud Objekt und dem AD Objekt soweit voneinander abweichen, dass kein Soft Match möglich wäre.

Ich habe z.B. einen User namens "Manuel Guido", welcher aktuell auch noch in einer Organisationseinheit liegt, die nicht mit Entra synchronisiert wird. Die MS-DS-ConsistencyGUID wird ja wie bereits erwähnt aus der GUID des AD-Objekts berechnet. Das selbst zu machen geht mit folgendem Code:

```powershell
$User = Get-ADUser -Identity 'Manuel.Guido' -Properties ObjectGUID
$GuidBytes = $User.ObjectGUID.ToByteArray()
Set-ADUser -Identity $User.SamAccountName -Replace @{"mS-DS-ConsistencyGuid" = $GuidBytes}
```

Falls ihr diese berechnete "MS-DS-ConsistencyGuid" bereits vor der Synchronisierung zu einem Entra Objekt hinzufügen wollt, dann müsst ihr das Byte Array erstmal noch mit Base64 kodieren:
`$ImmutableID = [System.Convert]::ToBase64String($GuidBytes)`

Und anschließend könnt ihr den Wert mit dem Microsoft Graph PowerShell Modul für einen Entra User setzen - wie das funktioniert, habe ich ja im [vorherigen Abschnitt](#immutable-id-in-entra-ändern) gezeigt.

**Tipp:** Das manuelle Berechnen der "MS-DS-ConsistencyGuid" funktioniert auch für andere Objekttypen, zum Beispiel für Gruppen. Da gibt es zwar in der Cloud keine sichtbare Immutable ID als Eigenschaft des Gruppenobjekts, aber für den Sync wird trotzdem die "MS-DS-ConsistencyGUID" des On-Prem Objekts beachtet - falls sie vorhanden ist. Das kann vor allem helfen, wenn ihr eine Domänenmigration macht. Dann könnt ihr anhand der GUIDs von Gruppen in der einen Domäne die korrekte "MS-DS-ConsistencyGUID" berechnen, die ihr dann in der anderen Domäne zuweist. Die grobe Funktionsweise zum Berechnen ist quasi genauso wie für User-Objekte, nur verwenden wir hier natürlich PowerShell Cmdlets für AD Gruppen, statt für AD User.

```powershell
$Group = Get-ADGroup Lager -Properties ObjectGUID
$GuidBytes = $Group.ObjectGUID.ToByteArray()
Set-ADGroup -Identity $Group.SamAccountName -Replace @{"mS-DS-ConsistencyGuid" = $GuidBytes}
```

### Immutable ID zu AD GUID konvertieren

Wenn ihr in Entra eine Immutable ID gesehen habt, und herausfinden wollt, welches das richtige Quellobjekt im On-Prem AD ist, dann könnt ihr diese Berechnungen auch umkehren.

```powershell
$ImmutableID = "tmFOcfhU+U6EHLPbM/yKyA=="
Get-ADObject ([guid][system.convert]::FromBase64String($ImmutableID))
```

Das funktioniert aber nur richtig, falls diese Immutable ID aus Entra komplett automatisch gesetzt wurde. Wenn schon an den Zuweisungen etwas geändert wurde, dann wäre das nur die Info, für welches ursprüngliche Objekt diese Immutable ID generiert wurde. Aber es ist auch möglich direkt nach dem Wert des Attributs "MS-DS-ConsistencyGUID" im Active Directory zu suchen. Das wiederum funktioniert nur, wenn das Attribut "MS-DS-ConsistencyGUID" gesetzt ist - also im Standard nur für User-Objekte und nur mit dem klassischen Microsoft Entra Connect Sync.

Für die Suche im AD per Immutable ID habe ich eine kleine Funktion gebaut, [die auf GitHub zu finden ist](https://github.com/diecknet/diecknet-scripts/blob/main/Active%20Directory%20Domain%20Services/Get-ADObjectByImmutableID.ps1). Wenn ihr die importiert habt, dann könnt ihr z.B. folgendes ausführen:

```powershell
Get-ADObjectByImmutableID -ImmutableId "tmFOcfhU+U6EHLPbM/yKyA=="
```

[![Beispiel für Get-ADObjectByImmutableID](/images/2024/2024-12-16_Get-ADObjectByImmutableID.jpg "Beispiel für Get-ADObjectByImmutableID")](/images/2024/2024-12-16_Get-ADObjectByImmutableID.jpg)

## Empfohlene Sync Optionen

Es wird übrigens von Microsoft empfohlen, dass man zwei bestimmte Standardoptionen für Entra Connect abändert, falls sie nicht benötigt werden.
Einmal die Option "BlockCloudObjectTakeoverThroughHardMatchEnabled" - die bei Aktivierung dafür sorgt, dass keine Objekte per Hard Match übernommen werden können. Bereits bestehende Hard Matches funktionieren aber weiter - nur die Übernahme von weiteren Objekten durch den Syncvorgang wird verhindert.
Und die Option "BlockSoftMatchEnabled" - die würde entsprechend dafür sorgen, dass Cloud Only Objekte auch per Soft Match nicht übernommen werden können.
Das kann ein bisschen die Sicherheit erhöhen, und natürlich auch verhindern, dass versehentlich Cloud Objekte übernommen werden, wenn ein passendes Objekt im On-Premises AD angelegt wurde.

Anpassen könnt ihr die Optionen ebenfalls per Microsoft Graph PowerShell Modul:

```powershell
Connect-MgGraph -Scopes "OnPremDirectorySynchronization.ReadWrite.All"

$OnPremSync = Get-MgDirectoryOnPremiseSynchronization
$OnPremSync.Features # erstmal gucken wie es jetzt konfiguriert ist
$OnPremSync.Features.BlockCloudObjectTakeoverThroughHardMatchEnabled = $true
$OnPremSync.Features.BlockSoftMatchEnabled = $true
Update-MgDirectoryOnPremiseSynchronization -OnPremisesDirectorySynchronizationId $OnPremSync.Id -Features $OnPremSync.Features
```

Falls ihr also die verschiedenen Punkte zu Soft Match und Hard Match in diesem Post ausprobiert und sie nicht funktionieren, dann prüft einmal, ob die Block Option eventuell aktiviert ist. Falls ja, müsst ihr die jeweilige Option zumindest temporär deaktivieren, damit Soft Match oder die Übernahme von Objekten per Hard Match funktionieren kann.

## Weiterführende Links

- Mein YouTube Video zu dem Thema: <https://youtu.be/yxIHnydUytE>
- Microsoft Entra Connect: When you have an existing tenant: <https://learn.microsoft.com/en-us/entra/identity/hybrid/connect/how-to-connect-install-existing-tenant>
- Sander Berkouwer: Explained: User Hard Matching and Soft Matching in Azure AD Connect: <https://dirteam.com/sander/2020/03/27/explained-user-hard-matching-and-soft-matching-in-azure-ad-connect/>
- MSXFAQ / Frank Carius: ADSync User Matching: <https://www.msxfaq.de/cloud/identity/adsync_matching.htm>
- Understanding errors during Microsoft Entra synchronization: <https://learn.microsoft.com/en-us/entra/identity/hybrid/connect/tshoot-connect-sync-errors>
- MSXFAQ / Frank Carius: Source Anchor: <https://www.msxfaq.de/cloud/identity/sourceanchor.htm>
- MSXFAQ / Frank Carius: Source Anchor User: <https://www.msxfaq.de/cloud/identity/sourceanchor_user.htm>
- MSXFAQ / Frank Carius: Source Anchor Gruppen: <https://www.msxfaq.de/cloud/identity/sourceanchor_gruppen.htm>
