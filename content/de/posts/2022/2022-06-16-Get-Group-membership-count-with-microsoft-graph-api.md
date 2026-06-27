---
comments: true
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

Offenbar ist es nicht _so einfach_ gewesen, die Anzahl der Mitglieder einer Gruppe mit der Microsoft Graph API zu erhalten. Wir haben den zusätzlichen Header `ConsistencyLevel: eventual` angeben müssen, um die **Advanced Query Capabilities** zu nutzen. Danach haben wir den Query-Parameter `$count` verwenden können. Alternativ habe ich herausgefunden, dass ich ihn auch als URL-Query-Parameter habe hinzufügen können. Das ist dann `&ConsistencyLevel=eventual` gewesen.

## Beispielabfragen

Du hast die Gruppen-ID (`02bd9fd6-8f93-4758-87c3-1fb73740a315`) durch deine gewünschte Azure-Active-Directory-Gruppen-ID ersetzt. [Du hast die Abfrage hier im Microsoft Graph Explorer ausprobiert.](https://developer.microsoft.com/en-us/graph/graph-explorer?request=groups%2F02bd9fd6-8f93-4758-87c3-1fb73740a315%2Fmembers%3F%24count%3Dtrue%26ConsistencyLevel%3Deventual&method=GET&version=v1.0&GraphUrl=https://graph.microsoft.com)

```url
https://graph.microsoft.com/v1.0/groups/02bd9fd6-8f93-4758-87c3-1fb73740a315/members/?$count=true&ConsistencyLevel=eventual
```

Oder wenn dich wirklich nur die Anzahl interessiert hat, hast du einfach nur die Eigenschaft `id` anfordern können. Dadurch sind alle anderen Eigenschaften ausgelassen worden. Ich habe keine Möglichkeit gefunden, nur die Anzahl ohne Eigenschaften abzurufen. [Du hast die Abfrage hier im Microsoft Graph Explorer ausprobiert.](https://developer.microsoft.com/en-us/graph/graph-explorer?request=groups%2F02bd9fd6-8f93-4758-87c3-1fb73740a315%2Fmembers%3F%24count%3Dtrue%26ConsistencyLevel%3Deventual%26%24select%3Did&method=GET&version=v1.0&GraphUrl=https://graph.microsoft.com)

```url
https://graph.microsoft.com/v1.0/groups/02bd9fd6-8f93-4758-87c3-1fb73740a315/members/?$count=true&ConsistencyLevel=eventual&$select=id
```

## Weitere Informationen

[https://docs.microsoft.com/en-us/graph/aad-advanced-queries?tabs=http](https://docs.microsoft.com/en-us/graph/aad-advanced-queries?tabs=http)
