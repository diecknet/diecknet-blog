---
title: "Microsoft 365 Self Service Purchase Lizenzen"
subtitle: "Selbstkauf von Office 365 Lizenzen durch Endanwender"
date: 2020-12-01
contenttags: [microsoft365, office365, licensing, selfservice]
---

Seit ca. Ende des Jahres 2019 hat Microsoft die Self Service Purchase Lizenzen für Microsoft 365 eingeführt. Durch diese neue Funktion können Endanwender in einem Office 365 Tenant selbstständig Lizenzen für einige Produkte kaufen. Mit dem Stand 2020-12-01 sind dies folgende Produkte:

-   Power Apps per user
-   Power Automate per user
-   Power Automate RPA
-   Power BI Pro
-   Power BI Premium (standalone)
-   Project Plan 1
-   Project Plan 3
-   Visio Plan 1
-   Visio Plan 2

## Erklärungsvideo

Ich habe den Lizenzkauf als Anwender ausprobiert und dokumentiert. Die Funktionsweise eines Selbstkaufs von Lizenzen und eine Entscheidungshilfe, ob die Funktion im eigenen Unternehmen deaktiviert werden sollte zeige ich in folgendem Video:

[![Microsoft 365 Self Service Purchase Lizenzen (YouTube)](/images/2020/2020-12-01_Selfservicepurchase-YT-Thumbnail.jpg "Microsoft 365 Self Service Purchase Lizenzen (YouTube)")](https://www.youtube.com/watch?v=zrsAle3-y7E)

## Pro und Contra Selbstkauf

Für einen Selbstkauf von Lizenzen spricht:

-   Die Anwender können sich bei Bedarf einfach selbst die Lizenzen kaufen. Keine Freigaben durch IT-Abteilungen oder Einkauf notwendig. Weniger administrativer Aufwand für IT-Abteilung.
-   Selbstschulung der Anwender durch Materialien von Microsoft
-   Bei Problemen können die Anwender selbsttätig Supportfälle bei Microsoft eröffnen

Gegen einen Selbstkauf von Lizenzen spricht:

-   Verwendung von Cloudservices, die nicht explizit durch die IT-Strategie freigegeben sind (fast schon: Schatten-IT)
-   Eigenständiges Schulen für die Produkte fraglich
-   Eigenständiger Support für die Produkte fraglich
-   Höhere Preise als durch Enterprise Agreement/CSP-Partner
-   Eventuell Probleme bei Abrechnung, da das Unternehmen nicht auf der Rechnung steht, sondern nur der Name des Mitarbeiters

## Self Purchase Lizenzen deaktivieren

Mit folgendem PowerShell Code können alle Self Service Purchase Lizenzen deaktiviert werden. Falls ihr erstmal prüfen wollt, wie die aktuelle Konfiguration ist, könnt ihr anstelle der `foreach`-Schleife (in den letzten 3 Zeilen) auch einfach nur `$products` ausführen.

```powershell
Install-Module -Name MSCommerce
Import-Module -Name MSCommerce
Connect-MSCommerce #sign-in with your global or billing administrator account when prompted
$products = Get-MSCommerceProductPolicies -PolicyId AllowSelfServicePurchase
foreach($product in $products) {
    Update-MSCommerceProductPolicy -PolicyId AllowSelfServicePurchase -ProductId ($product.ProductID) -Enabled $false
}
```

## Weiterführende Links

[FAQ von Microsoft zu dem Thema (docs.microsoft.com)](https://docs.microsoft.com/en-us/microsoft-365/commerce/subscriptions/self-service-purchase-faq?view=o365-worldwide)
