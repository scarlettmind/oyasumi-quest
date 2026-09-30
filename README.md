# おやすみクエスト

A mobile Japanese pixel-art sleep-habit game. Follow a pink-pajama protagonist through five bedroom scenes, answer questions, and receive an end-of-game recap.

The five questions cover caffeine, bedtime SNS/gaming, lighting, bedroom temperature, and making time for sleep. Choices animate the character sipping a drink, using a phone, dimming the room, adjusting a remote, and walking to the sofa to watch TV. The clock advances gradually for phone and TV choices; its times are illustrative game timing, not clinical estimates.

HP is revealed only after all five answers. Each supportive habit contributes 20 recovery HP. The result lists every applicable suggestion, with a congratulatory message when all five choices earn points. Answers stay in memory for the current playthrough and are not sent to a server.

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
