---
slug: "powershell-send-mails-via-ms-graph"
title: "E-Mails per PowerShell und Microsoft Graph verschicken"
date: 2025-04-10
tags: [powershell, microsoft graph, exchange]
---
E-Mails via Powershell und Microsoft Graph API zu verschicken, ist leider nicht so einfach wie mit dem klassischen `Send-MailMessage` Cmdlet. Zu dem klassischen Weg hatte ich ja auch kürzlich [einen Blog-Post veröffentlicht]( {{< ref "2025-03-23-PowerShell-Send-MailMessage.md" >}}).

Trotzdem gibt es einige Gründe, die für den Versand per Microsoft Graph sprechen. Im Oktober 2025 wird voraussichtlich die Plaintext Authentifizierung ("Basic Authentifizierung") für den SMTP-Versand bei Exchange Online abgeschaltet. Falls also Exchange Online euer einziges E-Mail-System ist, aber ihr automatisiert E-Mails verschicken wollt, dann ist MS Graph die richtige Wahl. Alternativ könntet ihr natürlich auch ein zusätzliches E-Mail-System anschaffen (anmieten oder selbst betreiben).

Ich finde es ganz charmant, wenn wir per PowerShell E-Mails verschicken und dabei die Exchange Online Infrastruktur nutzen können (inklusive eventueller Transportregeln, bestehendem DKIM/DMARC/SPF Setup usw.).

Ich habe auch ein Video zum Versand von E-Mails per MS Graph gemacht: <https://youtu.be/0kgKD3XsEXU>

## Die Herausforderung

Komplexer als beim einfachen `Send-MailMessage` ist beim Versand per Microsoft Graph:

1. Authentifizierung
    - Authentifizierung "als App" möglich
        - per Managed Identity, Zertifikat oder Client Secret
        - in der Regel ohne Einschränkungen durch Conditional Access Policies
    - Eher für Testzwecke: Authentifizierung auch als User möglich
2. Syntax
    - Das Microsoft Graph PowerShell SDK bietet zwar das Cmdlet `Send-MgUserMail`, allerdings müssen selbst einfachste Parameter als komische Hashtable angegeben werden, anstatt dass es einfach PowerShell Cmdlet Parameter sind 😓

## PowerShell Module...

Es wäre auch möglich komplett ohne Zusatzmodule die Microsoft Graph API in PowerShell zu verwenden. Dafür müssten dann die HTTP Requests selbst konstruiert werden und dann per `Invoke-RestMethod` gesendet werden. Die Authentifizierung ist dann aber noch mal ein bisschen kniffliger.

Das PowerShell Graph SDK ist das offizielle Toolkit von Microsoft für die Verwendung der Microsoft Graph API in der PowerShell. Leider ist es nicht besonders gut. Es ist automatisch aus den API Spezifikationen generiert. Dadurch sind die Cmdlet-Namen teilweise lang und komisch, und die Parameter müssen oftmals komplex per Hashtable/JSON übergeben werden (anstatt das es einfach PowerShell Cmdlet Parameter sind). Es gibt auch Drittanbieter-Module für die Graph API, die Vorteile wie z.B. eine erhöhte Geschwindigkeit haben.
**Aber** dafür ist das PowerShell Graph SDK *von Microsoft*. Ist also ein First-Party-Modul, dem ich ein höheres Vertrauen entgegenbringen würde. Man könnte es auch als den Standard-Weg bezeichnen.

Ich persönlich habe nicht grundsätzlich etwas gegen PowerShell Module, die nicht von Microsoft kommen. Aber für manche Organisationen ist das wichtig.

### ... für den E-Mail Versand

Am Automatisierungshost benötigt ihr für den E-Mail-Versand das `Microsoft.Graph.Users.Actions` Modul.

```powershell
# Mit PowerShell 7 bzw. mit PSResourceGet
Install-PSResource Microsoft.Graph.Users.Actions

# Mit Windows PowerShell 5.1 bzw. mit PowerShellGet
Install-Module Microsoft.Graph.Users.Actions
```

### ... für die Einrichtung

Diese Module müssen nicht unbedingt *auf* dem System installiert werden, auf dem dann die Automatisierung (also der E-Mail-Versand) läuft. Sie werden nur für die Einrichtung von Berechtigungen benötigt und könnten z.B. auf einer Admin-Workstation installiert werden.

- `Microsoft.Graph.Applications` - um der App Registrierung bzw. Managed Identity grundsätzlich die Rechte zum E-Mail-Versand zu erteilen
- `ExchangeOnlineManagement` - um den Versand von E-Mails auf einzelne Absender zu beschränken

```powershell
# Mit PowerShell 7 bzw. mit PSResourceGet
Install-PSResource Microsoft.Graph.Applications
Install-PSResource ExchangeOnlineManagement

# Mit Windows PowerShell 5.1 bzw. mit PowerShellGet
Install-Module Microsoft.Graph.Applications
Install-Module ExchangeOnlineManagement
```

## Authentifizierung und Berechtigungen

Bevor wir E-Mails verschicken können, müssen wir uns authentifizieren.

### Für einfache Tests: Als User

Für einfache Testzwecke können wir uns als User authentifizieren und dann im eigenen Namen E-Mails versenden. Falls das PowerShell Skript aber regelmäßig unbeaufsichtigt laufen soll, ist das hier nicht dafür geeignet.

```powershell
Connect-MgGraph -Scopes "Mail.Send"
```

Nachdem ihr euch grundsätzlich authentifiziert habt, kommt vermutlich noch eine Abfrage ob ihr den Berechtigungen zustimmt. Eventuell sind die Rechte dafür in eurem Tenant eingeschränkt, dann dürft ihr das als normaler User gar nicht bestätigen. 

Falls ihr euch gerade als Administrator authentifiziert habt, dann gibt es noch die Checkbox zum "Zustimmen im Namen der Organisation" ("Consent on behalf of your organization"). Den Haken solltet ihr normalerweise nicht setzen - falls ihr die Option aktiviert, dann dürften ab jetzt **alle User** in eurem Tenant das PowerShell Graph SDK verwenden um E-Mails zu verschicken.

[![Permissions Requested for Microsoft Graph Mail Versand](/images/2025/2025-04-10_MSGraphPermissions.jpg "Permissions Requested for Microsoft Graph Mail Versand")](/images/2025/2025-04-10_MSGraphPermissions.jpg)

### Sicher und einfach: Managed Identity

Die **beste Option für produktive Zwecke ist meiner Meinung nach per "Managed Identity"**. Dabei werden die Zugangsdaten automatisch durch Microsoft Entra ID verwaltet. Das funktioniert aber nur für Azure Ressourcen wie z.B. Azure VMs, Azure Automation Accounts oder an Azure angebundene Systeme (per Azure Arc).

Dafür müsst ihr zunächst eurer Azure Ressource eine Managed Identity zuweisen. Das geht oft direkt bei der Erstellung, aber natürlich auch im Nachhinein.

[![Beispiel: Aktivieren einer System Assigned Managed Identity für eine Azure Virtual Machine unter Security - Identity den Status auf On setzen. Anschließend wird eine Objekt ID für die Managed Identity angezeigt.](/images/2025/2025-04-10_ManagedIdentityForVM.jpg "Beispiel: Aktivieren einer System Assigned Managed Identity für eine Azure Virtual Machine unter Security - Identity den Status auf On setzen. Anschließend wird eine Objekt ID für die Managed Identity angezeigt.")](/images/2025/2025-04-10_ManagedIdentityForVM.jpg)

Die Managed Identity hat dann einen Service Principal mit Objekt ID und kann darüber Berechtigungen erhalten. Die Zuweisung der Berechtigung zum E-Mail-Versand könnt ihr mit folgendem PowerShell Code machen. Diese Einrichtung muss nicht am Automatisierungs-Host erfolgen, sondern kann z.B. auf einem Admin-System gemacht werden (siehe auch: [PowerShell Module für die Einrichtung](#-für-die-einrichtung)).

Die Werte für die Variablen `$TenantId` und `$managedIdentityObjectId` solltet ihr natürlich passend für eure Umgebung setzen. Bei Bedarf könntet ihr der App auch noch weitere Graph Berechtigungen zuweisen, dafür das Array `$appRoleNames` mit weiteren Einträgen befüllen.

**⚠️ Wichtig:** Im Standard darf die Managed Identity erstmal von allen Exchange-Absendern aus eurer Umgebung aus versenden. Ihr solltet die Berechtigungen einschränken - wie das geht erkläre ich im Abschnitt [E-Mail-Versand nur auf bestimmte Absender einschränken](#e-mail-versand-nur-auf-bestimmte-absender-einschränken).

```powershell
# The tenant ID
$TenantId = ""

# The name of the app role that the managed identity should be assigned to.
$appRoleNames = @("Mail.Send")

# Set the managed identity's object ID.
$managedIdentityObjectId = ""

Connect-MgGraph -TenantId $TenantId -Scopes 'Application.Read.All', 'AppRoleAssignment.ReadWrite.All'

# Get Microsoft Graph app's service principal and app role.
$serverApplicationName = "Microsoft Graph"
$serverServicePrincipal = (Get-MgServicePrincipal -Filter "DisplayName eq '$serverApplicationName'")
$serverServicePrincipalObjectId = $serverServicePrincipal.Id


# Assign the managed identity access to the app role.
foreach ($appRoleName in $appRoleNames) {
    $currAppRoleId = ($serverServicePrincipal.AppRoles | Where-Object { $_.Value -eq $appRoleName }).Id
    New-MgServicePrincipalAppRoleAssignment `
        -ServicePrincipalId $managedIdentityObjectId `
        -PrincipalId $managedIdentityObjectId `
        -ResourceId $serverServicePrincipalObjectId `
        -AppRoleId $currAppRoleId
}
```

Es kann manchmal einige Zeit dauern bis die Berechtigung aktiv wird. Ich hatte es am nächsten Morgen dann wieder probiert (10-12h später) und dann ging es. Ich würde aber eigentlich eher mit 1h rechnen.

Die eigentliche Authentifizierung in eurem PowerShell Skript (welches E-Mails versenden soll) erfolgt ganz einfach so:

```powershell
Connect-MgGraph -Identity
```

Es müssen also überhaupt keine Zugangsdaten im Code referenziert werden 👍

### App Registration und Zertifikat oder Client Secret

Falls Managed Identities bei euch nicht infrage kommen, dann gibt es auch die Möglichkeit eine App Registration in Entra ID anzulegen und dann wahlweise per Zertifikat (besser) oder per Client-Secret (schlechter) zu authentifizieren. Die Anlage erfolgt z.B. im Entra Admin Center unter "Applications" - "App Registrations" per Button "New registration".

**⚠️ Wichtig:** Im Standard darf die App/der Service Principal (nach der nachfolgenden Konfiguration) erstmal von allen Exchange-Absendern aus eurer Umgebung aus versenden. Ihr solltet die Berechtigungen einschränken - wie das geht erkläre ich im Abschnitt [E-Mail-Versand nur auf bestimmte Absender einschränken](#e-mail-versand-nur-auf-bestimmte-absender-einschränken).

[![Neue App Registration im Entra Portal anlegen unter Applications - App Registrations](/images/2025/2025-04-10_NewAppRegistration.jpg "Neue App Registration im Entra Portal anlegen unter Applications - App Registrations")](/images/2025/2025-04-10_NewAppRegistration.jpg)

Der Name der App ist im Grunde frei wählbar. Bei "Supported Account Types" den Standard "Accounts in this organizational directory only [...]" beibehalten. Eine Redirect URI müsst ihr nicht eintragen.

[![Der Name der App ist im Grunde frei wählbar. Bei "Supported Account Types" den Standard "Accounts in this organizational directory only [...]" beibehalten. Eine Redirect URI müsst ihr nicht eintragen.](/images/2025/2025-04-10_AppRegistrationSettings.jpg "Der Name der App ist im Grunde frei wählbar. Bei Supported Account Types den Standard Accounts in this organizational directory only beibehalten. Eine Redirect URI müsst ihr nicht eintragen.")](/images/2025/2025-04-10_AppRegistrationSettings.jpg)

Nach der Anlage der App muss sie noch Berechtigungen erhalten. Für die Managed Identity im vorherigen Abschnitt hatten wir ja PowerShell verwendet. Hier mal wie es per GUI gehen würde:

Unter "API Permissions" auf "Add a permission" klicken.

[![Nach der Anlage der App: Add a Permission unter API Permissions](/images/2025/2025-04-10_AppRegistrationApiPermissions.jpg "Nach der Anlage der App: Add a Permission unter API Permissions")](/images/2025/2025-04-10_AppRegistrationApiPermissions.jpg)

Bei der Auswahl "Select an API" die Option "Microsoft Graph" auswählen.

[![Bei der Auswahl "Select an API" die Option "Microsoft Graph" auswählen.](/images/2025/2025-04-10_AppRegistrationApiPermissionsSelectAnApi.jpg "Bei der Auswahl Select an API die Option Microsoft Graph auswählen.")](/images/2025/2025-04-10_AppRegistrationApiPermissionsSelectAnApi.jpg)


Bei der Auswahl "What type of permissions does your application require?" die Option "Application permissions" wählen.

[![Bei der Auswahl "What type of permissions does your application require?" die Option "Application permissions" wählen.](/images/2025/2025-04-10_AppRegistrationApiPermissionsRequestApiPermissions.jpg "Bei der Auswahl What type of permissions does your application require? die Option Application permissions wählen.")](/images/2025/2025-04-10_AppRegistrationApiPermissionsRequestApiPermissions.jpg)

Bei der Auswahl "Select permission" die Berechtigung "Mail.Send" raussuchen und auswählen.

[![Bei der Auswahl "Select permission" die Berechtigung "Mail.Send" raussuchen und auswählen..](/images/2025/2025-04-10_AppRegistrationApiPermissionsSelectPermissions.jpg "Bei der Auswahl Select permission die Berechtigung Mail.Send raussuchen und auswählen..")](/images/2025/2025-04-10_AppRegistrationApiPermissionsSelectPermissions.jpg)

Die Standard-Berechtigung "User.Read" vom Type "Delegated" kann übrigens gelöscht werden - sie wird für den E-Mail-Versand nicht benötigt.

[![Die Standard-Berechtigung "User.Read" vom Type "Delegated" kann übrigens gelöscht werden - sie wird für den E-Mail-Versand nicht benötigt.](/images/2025/2025-04-10_AppRegistrationApiPermissionsRemoveUserRead.jpg "Die Standard-Berechtigung User.Read vom Type Delegated kann übrigens gelöscht werden - sie wird für den E-Mail-Versand nicht benötigt.")](/images/2025/2025-04-10_AppRegistrationApiPermissionsRemoveUserRead.jpg)

Anschließend der neuen API Berechtigung im Namen der Organisation zustimmen per "Grant admin consent for TENANTNAME" und per "Yes" bestätigen.

[![Bei der Auswahl "Select permission" die Berechtigung "Mail.Send" raussuchen und auswählen.](/images/2025/2025-04-10_AppRegistrationApiPermissionsGrantConsent.jpg "Bei der Auswahl Select permission die Berechtigung Mail.Send raussuchen und auswählen.")](/images/2025/2025-04-10_AppRegistrationApiPermissionsGrantConsent.jpg)

#### Zertifikat

Wenn ihr euch per Zertifikat authentifizieren möchtet, dann schaut euch die Dokumentation bei Microsoft an: <https://learn.microsoft.com/en-us/entra/identity-platform/howto-create-self-signed-certificate>

#### Client Secret

Wenn ihr euch per Client Secret authentifizieren möchtet, dann müsst ihr zunächst ein Secret erstellen. Das geht unter "Certificates & Secrets" - dort dann unter "Client secrets" auf "New client secret" klicken.

[![Neues Secret hinzufügen: "Certificates & secrets" - "Client secrets" - "New client secret".](/images/2025/2025-04-10_NewAppRegistrationClientSecret1.jpg "Neues Secret hinzufügen: Certificates & secrets - Client secrets - new client secret.")](/images/2025/2025-04-10_NewAppRegistrationClientSecret1.jpg)

Tendenziell ist es aus Sicherheitsgründen empfehlenswert keine allzu lange Gültigkeitsdauer auszuwählen. Ich habe deshalb den Standardwert 180 Tage beibehalten.

[![Description ist frei wählbar, Ablaufdatum sollte nicht zu weit in der Zukunft sein](/images/2025/2025-04-10_NewAppRegistrationClientSecret2.jpg "Description ist frei wählbar, Ablaufdatum sollte nicht zu weit in der Zukunft sein")](/images/2025/2025-04-10_NewAppRegistrationClientSecret2.jpg)

Der Secret Value wird euch nur einmalig angezeigt. Ihr solltet ihn also sofort kopieren. Wenn ihr später zu der Seite zurück kommt, dann wird er nicht mehr vollständig angezeigt. Das Secret ist mit einem Passwort gleich zu setzen - sollte also auch nicht in Klartext in Dokumentationen aufgenommen werden und auch nicht im Klartext im PowerShell Code abgelegt werden.

Das Secret hier im Screenshot ist natürlich nicht mehr gültig 😉

[![Secret sollte sofort kopiert werden und wie ein Passwort behandelt werden](/images/2025/2025-04-10_NewAppRegistrationClientSecret3.jpg "Secret sollte sofort kopiert werden und wie ein Passwort behandelt werden")](/images/2025/2025-04-10_NewAppRegistrationClientSecret3.jpg)

Eine Möglichkeit das Secret einigermaßen sicher abzuspeichern wäre als exportieres PowerShell Credential Objekt. Das kann nur durch den User (am gleichen Computer) entschlüsselt werden, der es auch verschlüsselt hat.
Alternativ ist das [PowerShell Modul SecretManagement](https://learn.microsoft.com/en-us/powershell/module/microsoft.powershell.secretmanagement/?view=ps-modules) auch noch ein interessanter Ansatz.

So könnt ihr die Credentials abfragen abspeichern - als Username die Application ID von der Hauptseite der App Registration angeben.

```powershell
$Credential = Get-Credential
$Credential | Export-CliXml Credential.xml
```

Und dann später in eurem Skript könnt ihr es so importieren und euch damit bei MS Graph authentifizieren. Bitte auch daran denken die TenantID einzutragen:

```powershell
$Credential = Import-Clixml .\Credential.xml
Connect-MgGraph -ClientSecretCredential $Credential -TenantId "hier eure TenantID eintragen"
```

### E-Mail-Versand nur auf bestimmte Absender einschränken

Wie bereits erwähnt darf ein Service Principal/Managed Identity mit der `Mail.Send` Berechtigung erstmal alle Exchange-Objekte aus eurer Umgebung als Absender verwenden. Ich würde empfehlen diese Rechte immer [einzuschränken](https://learn.microsoft.com/en-us/graph/auth-limit-mailbox-access
), sodass nur durch bestimmte Absender verschickt werden darf.

Die Konfiguration so einer Einschränkung erfolgt per Exchange Online PowerShell. Das muss nicht am Automatisierungshost gemacht werden, sondern kann auch von einer Admin-VM o.ä. erfolgen (siehe auch: [PowerShell Module für die Einrichtung](#-für-die-einrichtung)).

Zu den Parameterwerten für [`New-ApplicationAccessPolicy`](https://learn.microsoft.com/en-us/powershell/module/exchange/new-applicationaccesspolicy?view=exchange-ps):

- `-AppId` die Application ID (auch "Client ID" genannt) von eurer App Registration bzw. eurer Managed Identity*
- `-PolicyGroupScopeId` wahlweise ein einzelnes Postfach (auch Shared Mailboxes werden unterstützt) oder eine Mail-Enabled Security Group, die die Exchange Objekte enthält von denen aus gesendet werden soll
- `-Description` die Beschreibung ist frei wählbar
- `-AccessRight` der Wert `RestrictAccess` sorgt dafür, dass die App nur auf die bei `-PolicyGroupScopeId` genannten Mailboxen zugreifen darf

```powershell
Connect-ExchangeOnline

New-ApplicationAccessPolicy -AppId "Hier App ID eintragen" -PolicyScopeGroupId "hier Gruppe oder Postfach eintragen von dem verschickt werden darf" -AccessRight RestrictAccess -Description "Beschreibung ist auch frei wählbar"
```

*Die Application ID eurer Managed Identity ist übrigens nicht die Object ID. Falls ihr die Application ID herausfinden möchtet, dann schaut im Entra Portal unter "Enterprise Applications" und ändert den Filter "Application type" auf "Managed Identities".

[![Änderung des Filters Application Type auf Managed Identities unter Enterprise Applications in Entra ID um die Application ID einer Managed Identity herauszufinden](/images/2025/2025-04-10_ManagedIdentityApplicationID.jpg "Änderung des Filters Application Type auf Managed Identities unter Enterprise Applications in Entra ID um die Application ID einer Managed Identity herauszufinden")](/images/2025/2025-04-10_ManagedIdentityApplicationID.jpg)

## Beispiele für den E-Mail Versand

Puh... Die Authentifizierung und Einschränkung auf bestimmte Absender-Adressen haben wir jetzt also. Hier ein paar Beispiele für den eigentlichen Versand von E-Mails.

Es gibt noch zahlreiche weitere Optionen, für die ihr die `$params` Hashtable anpassen könnt. Diese "complex Parameters" werden in der Dokumentation zum Cmdlet `Send-MgUserMail` [im Abschnitt "Notes" aufgeführt](https://learn.microsoft.com/en-us/powershell/module/microsoft.graph.users.actions/send-mgusermail?view=graph-powershell-1.0#notes).

### Beispiel 1: Plain-Text E-Mail

```powershell
$params = @{
	message = @{
		subject = "Test E-Mail per MS Graph"
		body = @{
			contentType = "Text"
			content = "Grüße aus der PowerShell (per Graph)"
		}
		toRecipients = @(
			@{
				emailAddress = @{
					address = "hans.maulwurf@demotenant.de"
				}
			}
		)
	}
}

Send-MgUserMail -UserId "diecknet-adm@diecknetdemotenant.onmicrosoft.com" -BodyParameter $params
```

### Beispiel 2: HTML E-Mail

```powershell
$params = @{
	message = @{
		subject = "Test HTML E-Mail per MS Graph"
		body = @{
			contentType = "html"
			content = @"
				<h1>Grüße aus der PowerShell (per Graph)</h1>
				<a href="https://youtube.com/@diecknet">Kanal abonnieren :)</a><br>
				<b>Danke!</b>
"@
		}
		toRecipients = @(
			@{
				emailAddress = @{
					address = "hans.maulwurf@demotenant.de"
				}
			}
		)
	}
}
Send-MgUserMail -UserId "abteilungspostfach@demotenant.de" -BodyParameter $params
```

### Beispiel 3: Mehrere Empfänger

Die Syntax für mehrere Empfänger ist ein wenig eigen. Hier mal ein Beispiel für zwei Empfänger:

Die Eigenschaft `toRecipients` ist ein Array, welches wiederum zwei Hashtables enthält (eine pro Empfänger), die jeweils eine Hashtable enthalten. Cool 😐

```powershell
$params = @{
	message = @{
		subject = "Test E-Mail an mehrere Leute"
		body = @{
			contentType = "html"
			content = @"
				<h1>Grüße aus der PowerShell (per Graph)</h1>
				Jetzt mal an mehrere Empfänger :)
"@
		}
		toRecipients = @(
			@{
				emailAddress = @{
					address = "hans.maulwurf@demotenant.de"
				}
			},
			@{
				emailAddress = @{
					address = "alexw@demotenant.de"
				}
			}
		)
	}
}
Send-MgUserMail -UserId "abteilungspostfach@demotenant.de" -BodyParameter $params
```

## Alternativen

Da das Rumhantieren mit den Hashtables etwas umständlich ist, gibt es einige alternative Module aus der Community. 

Zum Beispiel [Mailozaurr von Microsoft MVP Przemysław Kłys](https://github.com/EvotecIT/Mailozaurr) finde ich ganz cool. Das Modul stellt das neue Cmdlet `Send-EmailMessage` bereit (also statt dem Standard `Send-MailMessage`). Es werden auch noch andere Protokolle und Authentifizierungen unterstützt (nicht nur MS Graph). Leider werden zurzeit keine Managed Identities unterstützt, deshalb habe ich es nur einmal kurz zu Testzwecken verwendet.