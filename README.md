# おやすみクエスト

A mobile Japanese pixel-art sleep-habit game. Follow a pink-pajama protagonist through five bedroom scenes, answer questions, and receive an end-of-game recap.

The five questions follow a left-to-right room route: caffeine at the table, TV at the sofa, bedtime SNS/gaming, lighting, and bedroom temperature. The character uses the foreground aisle and climbs into bed only after the final answer. Choices animate the character sipping a drink, using a phone, dimming the room, adjusting a remote, and walking to the sofa to watch TV. The clock advances gradually for phone and TV choices; its times are illustrative game timing, not clinical estimates.

Each supportive choice adds 20 recovery HP immediately; every other choice adds exactly 0 and displays 回復なし. The total is derived from recorded answers; all ending animations leave that total unchanged. The result lists every applicable suggestion, with a congratulatory message when all five choices earn points. Answers stay in memory for the current playthrough and are not sent to a server.

Question and advice wording is adapted from Masashi Yanagisawa interviews:
- [Japan Hotel Association, HOTEL REVIEW 753](https://www.j-hotel.or.jp/hotel-review/feature/hr753-01/)
- [NEUTRALWORKS., 18 November 2022](https://www.neutralworks.jp/journal/20221118people/)

The equal weights are a game design choice, not scientific estimates of relative impact.

## Play

https://scarlettmind.github.io/oyasumi-quest/

## Run locally

Serve this directory with any static HTTP server, such as `python3 -m http.server 8000`.

## Credits and scope

- Inspired by [Airweave's sleep-habit questionnaire](https://airweave.jp/labo/sleep_diagnosis/light.shtml).
- Masashi Yanagisawa photograph: [University of Tsukuba IIIS profile](https://wpi-iiis.tsukuba.ac.jp/japanese/research/member/detail/masashiyanagisawa/). The photograph remains subject to its original rights; no redistribution license is asserted.
- Pixel art was generated for this prototype.
- This is an unofficial concept. Dialogue is fictional and does not imply endorsement or supervision by the depicted person or institution.
- Scores are game mechanics, not medical measurements or a validated sleep assessment.

## Sound

Sound begins on the first answer gesture and can be muted with the 音あり / 音なし button. Original Web Audio background music slows and softens as the game progresses. Correct choices add 20 HP and play a recovery chime; wrong choices add 0 HP and play only a soft descending cue, without an error text overlay. There is no spoken narration or logo ending. After the short score summary, Yanagisawa’s photograph and the matching advice appear directly.

## Validation

Run `node tests/recovery.cjs` for all 32 answer combinations, movement bounds, full advice matching, reset, and single-trigger score behavior and absence of narration. Run `node tests/sound.cjs` for audio cues, mute, fade and reset.
