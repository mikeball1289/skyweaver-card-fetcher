# Skyweaver Card Fetcher

SkyBot is a discord bot for fetching Skyweaver cards. You can summon it by including a card name wrapped in double curly-braces anywhere in your message, like `Just use {{strike down}} to kill {{broodwitch}}`.

Card fetching is case insensitive, and ignores all spacing and punctuation, so no need to remember whether it's Brood Witch or Broodwitch, or just how exclamatory you need to be about It's a Trap!

If you wrap something that isn't a card name in double curly braces, SkyBot won't respond.

### TODO:
 - Add a help command `{{!help}}` to link to this readme.
 - Add search functionality, something like `{{!search|cost:1-5 power:>=1 lifesteal}}`
 - Large image support, `{{!broodwitch}}` would link a full sized image without the card description in the card
 - Price search `{{$broodwitch}}` returns the current market buy/sell price