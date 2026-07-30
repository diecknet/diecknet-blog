---
comments: true
aliases:
    - get-group-membership-count-with-microsoft-graph-api
slug: Get-Group-membership-count-with-microsoft-graph-api
title: "Mit der Microsoft Graph API die Anzahl der Gruppenmitglieder abrufen"
subtitle: "Wie viele Benutzer sind in dieser Azure-AD-Gruppe?"
date: 2022-06-16
tags: [azure ad, microsoft 365, graph api]
cover:
    image: /images/2022/2022-06-16-Graph_Explorer.png
---

Offenbar ist es nicht _so einfach_, die Anzahl der Mitglieder einer Gruppe mit der Microsoft Graph API zu erhalten. Wir müssen den zusätzlichen Header `ConsistencyLevel: eventual` angeben, um die **Advanced Query Capabilities** zu nutzen. Danach können wir den Query-Parameter `$count` verwenden. Alternativ habe ich herausgefunden, dass ich ihn auch als URL-Query-Parameter hinzufügen kann. Das wäre dann `&ConsistencyLevel=eventual`.

## Beispielabfragen

Ersetzt die Gruppen-ID (`02bd9fd6-8f93-4758-87c3-1fb73740a315`) durch eure gewünschte Azure-Active-Directory-Gruppen-ID. [Probiert die Abfrage hier im Microsoft Graph Explorer aus.](https://developer.microsoft.com/en-us/graph/graph-explorer?request=groups%2F02bd9fd6-8f93-4758-87c3-1fb73740a315%2Fmembers%3F%24count%3Dtrue%26ConsistencyLevel%3Deventual&method=GET&version=v1.0&GraphUrl=https://graph.microsoft.com)

```url
https://graph.microsoft.com/v1.0/groups/02bd9fd6-8f93-4758-87c3-1fb73740a315/members/?$count=true&ConsistencyLevel=eventual
```

Oder wenn euch wirklich nur die Anzahl interessiert, könnt ihr einfach nur die Eigenschaft `id` anfordern. Dadurch werden alle anderen Eigenschaften ausgelassen. Ich habe keine Möglichkeit gefunden, nur die Anzahl ohne Eigenschaften abzurufen. [Probiert die Abfrage hier im Microsoft Graph Explorer aus.](https://developer.microsoft.com/en-us/graph/graph-explorer?request=groups%2F02bd9fd6-8f93-4758-87c3-1fb73740a315%2Fmembers%3F%24count%3Dtrue%26ConsistencyLevel%3Deventual%26%24select%3Did&method=GET&version=v1.0&GraphUrl=https://graph.microsoft.com)

```url
https://graph.microsoft.com/v1.0/groups/02bd9fd6-8f93-4758-87c3-1fb73740a315/members/?$count=true&ConsistencyLevel=eventual&$select=id
```

## Weitere Informationen

[https://docs.microsoft.com/en-us/graph/aad-advanced-queries?tabs=http](https://docs.microsoft.com/en-us/graph/aad-advanced-queries?tabs=http)
