---
title: "Use ntfy.sh with Home Assistant"
date: 2023-02-12
contenttags: [homeassistant, home assistant, ntfy.sh, notification]
---
Just a quick note if you want to use [ntfy.sh](https://ntfy.sh) with [Home Assistant](https://www.home-assistant.io/).

## Setup

I added the following section to my `/config/configuration.yaml` file:

```yaml{% raw %}
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
        --header 'X-Icon: {{ icon }}'{% endraw %}
```

## Usage

To send send a notification, I use this YAML action in an Automation. It's not necessary to provide all parameters. I ran with these four. As far as I know: Theoretically only `topic` is required by ntfy. But this simple `shell_command` action does not check if you set a topic.

```yaml{% raw %}
service: shell_command.ntfy
alias: Send ntfy.sh
data:
  tags: monocle_face
  topic: test
  title: Waschmaschine
  message: Die Waschmaschine ist fertig!{% endraw %}
```

## Set default values

If you want to, you can also define default values. For example in this codeblock I've set the default topic to "test".
So if I don't specify a topic when calling the command, it will fallback to test.

```yaml{% raw %}
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
        --header 'X-Icon: {{ icon }}'{% endraw %}
```
