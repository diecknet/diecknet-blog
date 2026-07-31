---
comments: true
aliases:
    - m365-self-service-purchase
slug: M365-Self-Service-Purchase
title: "Microsoft 365 Self Service Purchase Licenses"
subtitle: "Self-service purchase of Office 365 licenses by end users"
date: 2020-12-01
tags: [microsoft365, office365, licensing, selfservice]
---

Since about the end of 2019, Microsoft has introduced self service purchase licenses for Microsoft 365. With this new feature, end users in an Office 365 tenant can buy licenses for some products themselves. As of 2020-12-01, the following products are available:

-   Power Apps per user
-   Power Automate per user
-   Power Automate RPA
-   Power BI Pro
-   Power BI Premium (standalone)
-   Project Plan 1
-   Project Plan 3
-   Visio Plan 1
-   Visio Plan 2

## Explanation video

I tried the license purchase as an end user and documented it. I show how self-service purchase of licenses works and provide guidance on whether the feature should be disabled in your organization in the following video:

[![Microsoft 365 Self Service Purchase Licenses (YouTube)](/images/2020/2020-12-01_Selfservicepurchase-YT-Thumbnail.jpg "Microsoft 365 Self Service Purchase Licenses (YouTube)")](https://www.youtube.com/watch?v=zrsAle3-y7E)

## Pros and cons of self-purchase

Arguments in favor of self-purchasing licenses:

-   Users can simply buy licenses when needed. No approvals from IT departments or purchasing are required. Less administrative effort for the IT department.
-   Self-training of users through materials from Microsoft
-   If problems occur, users can open support cases with Microsoft themselves

Arguments against self-purchasing licenses:

-   Use of cloud services that are not explicitly approved by the IT strategy (almost like shadow IT)
-   Independent training for the products is questionable
-   Independent support for the products is questionable
-   Higher prices than through an Enterprise Agreement or CSP partner
-   Potential billing issues, since the company is not shown on the invoice, but only the employee's name

## Disable self-purchase licenses

With the following PowerShell code, all self service purchase licenses can be disabled. If you want to check the current configuration first, you can simply run `$products` instead of the `foreach` loop (in the last 3 lines).

```powershell
Install-Module -Name MSCommerce
Import-Module -Name MSCommerce
Connect-MSCommerce #sign-in with your global or billing administrator account when prompted
$products = Get-MSCommerceProductPolicies -PolicyId AllowSelfServicePurchase
foreach($product in $products) {
    Update-MSCommerceProductPolicy -PolicyId AllowSelfServicePurchase -ProductId ($product.ProductID) -Enabled $false
}
```

## Further Reading

[FAQ from Microsoft on the topic (docs.microsoft.com)](https://docs.microsoft.com/en-us/microsoft-365/commerce/subscriptions/self-service-purchase-faq?view=o365-worldwide)
