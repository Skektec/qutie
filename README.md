# Qutie Bot

A bot I started to replace the quote function of another before we hit the limit, as of now I just add random features to replace other bots as we have quite the clutter.

## Error Code Index

XxXXXXX

### First Digit

- Unknown Type: -1
- DB error: 1
- Perm Error: 2
- Log Error: 3
- Fetching Channel Error: 4
- Autocomplete Error: 5
- File Read Error: 6

x

### Digits 1-2

- Location:

Commands:

01 - birthdays/addbirthday
02 - birthdays/birthdays
03 - misc/formteam
04 - misc/mapBlacklist
05 - music/add
06 - music/play
07 - python_commands/echo
08 - python_commands/greet
09 - quotes/addQuote
10 - quotes/deleteQuote
11 - quotes/displayQuote
12 - quotes/leaderboard
13 - quotes/searchQuote
14 - utility/help
15 - utility/nick
16 - utility/ping
17 - utility/purgeBot
18 - utility/server
19 - utility/user

Data:

20 - clientInstance

Events:

21 - interactionCreate
22 - onButton
23 - onMessage
24 - onReaction
25 - ready

Functions:

26 - addquote
27 - database
28 - error
29 - fetchquote
30 - removeTracker
31 - repostDetection
32 - sendEmoji
33 - support

Jarvis Commands:

34 - gif
35 - ping

Root:

36 - bot (Main Script)
37 - delete-global
38 - deploy-commands
39 - deploy-global
40 - jarvis

### Digits 3-5

These digits denote the line number of the error log.

E.g. 1x01032 = Database error in addBirthday's autocomplete function (Function on line number 32).

1 = Database error
01 = addBirthday function
032 = Line number which is the autocomplete function
