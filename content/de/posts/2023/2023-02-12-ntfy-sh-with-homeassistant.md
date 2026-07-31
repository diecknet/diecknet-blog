---
slug: ntfy-sh-with-homeassistant
title: "ntfy.sh mit Home Assistant verwenden"
date: 2023-02-12
tags: [homeassistant, home assistant, ntfy.sh, notification]
comments: true
---
Nur eine kurze Notiz, falls ihr [ntfy.sh](https://ntfy.sh) mit [Home Assistant](https://www.home-assistant.io/) nutzen wollt.

## Setup

Ich habe den folgenden Abschnitt in meine Datei `/config/configuration.yaml` eingefügt:

```yaml
shell_command:
    ntfy: >
        curl
        -X POST
        --url 'https://ntfy.sh/{{ topic }}'
        --data '{{ message }}'
        --header 'X-Title: {{ title }}'
        --header 'X-Tags: {{ tags }}'
        --header 'X-Priority: {{ priority }}'
        --header 'X-Delay: {{ delay }}'
        --header 'X-Actions: {{ actions }}'
        --header 'X-Click: {{ click }}'
        --header 'X-Icon: {{ icon }}'
```

## Verwendung

Um eine Benachrichtigung zu senden, habe ich in einer Automation diese YAML-Action verwendet. Es ist nicht nötig, alle Parameter zu setzen. Ich habe hier mit diesen vier gearbeitet. Soweit ich weiß, ist theoretisch nur `topic` für ntfy erforderlich. Aber diese einfache `shell_command`-Action prüft nicht, ob ihr ein Topic gesetzt habt.

```yaml
service: shell_command.ntfy
alias: Send ntfy.sh
data:
  tags: monocle_face
  topic: test
  title: Waschmaschine
  message: Die Waschmaschine ist fertig!
```

## Standardwerte setzen

Wenn ihr möchtet, könnt ihr auch Standardwerte definieren. In diesem Codeblock habe ich das Standard-Topic zum Beispiel auf „test“ gesetzt.
Wenn ich beim Aufruf des Commands kein Topic angebe, fällt es also auf `test` zurück.

```yaml
shell_command:
    ntfy: >
        curl
        -X POST
        --url 'https://ntfy.sh/{{ topic | default("test") }}'
        --data '{{ message }}'
        --header 'X-Title: {{ title }}'
        --header 'X-Tags: {{ tags }}'
        --header 'X-Priority: {{ priority }}'
        --header 'X-Delay: {{ delay }}'
        --header 'X-Actions: {{ actions }}'
        --header 'X-Click: {{ click }}'
        --header 'X-Icon: {{ icon }}'
```
