---
aliases:
    - get-group-membership-count-with-microsoft-graph-api
slug: Get-Group-membership-count-with-microsoft-graph-api
title: "How to get Group Membership count with Microsoft Graph API"
subtitle: "How many users are in that Azure AD Group?"
date: 2022-06-16
tags: [azure ad, microsoft 365, graph api]
cover:
    image: /images/2022/2022-06-16-Graph_Explorer.png
---

Apparently it's not _that easy_ to get the amount of members of a group with the Microsoft Graph API. We need to specify the additional header `ConsistencyLevel: eventual` to use the **Advanced Query Capabilities**. Then we can use the Query parameter `$count`. Alternatively I found that I could also add it as an URL query parameter instead. That would be `&ConsistencyLevel=eventual`.

## Example Queries

Replace the Group ID (`02bd9fd6-8f93-4758-87c3-1fb73740a315`) with your desired Azure Active Directory Group ID. [Try the query in the Microsoft Graph Explorer here.](https://developer.microsoft.com/en-us/graph/graph-explorer?request=groups%2F02bd9fd6-8f93-4758-87c3-1fb73740a315%2Fmembers%3F%24count%3Dtrue%26ConsistencyLevel%3Deventual&method=GET&version=v1.0&GraphUrl=https://graph.microsoft.com)

```url
https://graph.microsoft.com/v1.0/groups/02bd9fd6-8f93-4758-87c3-1fb73740a315/members/?$count=true&ConsistencyLevel=eventual
```

Or if you really only care about the count, you could just request the property `id`. That will cause all other properties to get omitted. I found no way to just retrieve the count and no properties. [Try the query in the Microsoft Graph Explorer here.](https://developer.microsoft.com/en-us/graph/graph-explorer?request=groups%2F02bd9fd6-8f93-4758-87c3-1fb73740a315%2Fmembers%3F%24count%3Dtrue%26ConsistencyLevel%3Deventual%26%24select%3Did&method=GET&version=v1.0&GraphUrl=https://graph.microsoft.com)

```url
https://graph.microsoft.com/v1.0/groups/02bd9fd6-8f93-4758-87c3-1fb73740a315/members/?$count=true&ConsistencyLevel=eventual&$select=id
```

## More information

[https://docs.microsoft.com/en-us/graph/aad-advanced-queries?tabs=http](https://docs.microsoft.com/en-us/graph/aad-advanced-queries?tabs=http)
