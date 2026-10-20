---
slug: "entra-id-memberof-change"
title: "Entra ID: Dynamic MemberOf Filter will get removed"
date: 2026-10-20
tags: [powershell, entraid, microsoft365]
---

Microsoft is [removing the "MemberOf" Filter feature](https://learn.microsoft.com/en-us/entra/identity/users/groups-dynamic-rule-member-of) in Entra ID. Interestingly the feature was 4 years in preview. Apparently there were some problems with the feature, so Microsoft decided against proceeding with this one.
So "preview" doesn't mean that there is a guarantee that the feature will ever go "General Available".

Here is a copy of the Message Center posts:

- <https://mc.merill.net/message/MC1448379>
- <https://mc.merill.net/message/MC1488834>

It was possible to use this filter for Dynamic Security Groups or for [Administrative Units](https://learn.microsoft.com/en-us/entra/identity/role-based-access-control/admin-units-members-dynamic?tabs=admin-center). I also made a video about this topic, you can find it **[here on YouTube](https://youtu.be/YVuQbl7mJlY)**.

## Check via PowerShell

I mean sure, you can check manually in the Entra ID portal, *if you want to*. But here's how to check via PowerShell.

As a prerequisite, you need the [Microsoft.Graph.Authentication module](https://www.powershellgallery.com/packages/Microsoft.Graph.Authentication).

### Check for Dynamic Groups

Use the following code, to check if you have any Dynamic Groups that use the `MemberOf` filter in a `membershipRule` in your tenant:

```powershell
Connect-MgGraph -Scopes "Group.Read.All"
$Groups = Invoke-MgGraphRequest -Uri "https://graph.microsoft.com/v1.0/groups?`$filter=startsWith(membershipRule,'user.memberOf') or startsWith(membershipRule,'device.memberOf')" -Method GET
$Groups.value | Select-Object displayName,id,membershipRule

```

### Check for Administrative Units

Use the following code, to check if you have any Administrative Units that use the `MemberOf` filter in a `membershipRule` in your tenant:

```powershell
Connect-MgGraph -Scopes "AdministrativeUnit.Read.All"
$AdminUnits = Invoke-MgGraphRequest -Uri "https://graph.microsoft.com/v1.0/directory/administrativeUnits?`$filter=startsWith(membershipRule,'user.memberOf') or startsWith(membershipRule,'device.memberOf')" -Method GET
$AdminUnits.value | Select-Object displayName,id,membershipRule
```
