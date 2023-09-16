# tasmetu

Radio scanner, recorder, and analyzer.

## Overview

### Requirements

[Radio](https://baofengtech.com/wp-content/uploads/2020/09/BaoFeng_UV-5R_Manual.pdf)

[Compatible Audio Connector Cable](https://www.amazon.com/gp/product/B01LMIBAZW/ref=ppx_yo_dt_b_asin_title_o00_s00?ie=UTF8&psc=1)

[Sound eXchange](https://sourceforge.net/projects/sox/) (For noise removal)

[Drive Desktop](https://www.google.com/drive/download/) (For cloud storage)

NodeJs, Python 3.X

### Scanner

![image](https://user-images.githubusercontent.com/42680395/210189923-87c873f4-b5b1-43be-a344-cd64e8aa00c9.png)

We are using a Baofeng UV-5RV2+, on scanner mode programmed to the desired frequencies (in our case, [Boston area police frequencies](https://www.broadcastify.com/listen/feed/25818)), connected via audio cable to a computer. Once the audio stream passes a specified threshold, the scanner begins recording.

After the recording is finished, the scanner removes static noise using SoX and generates a transcription, saving both the transcription and the audio file in a Google Drive folder.

### Viewer

The repository also contains a viewer program for navigating the large number of audio and transcript files the scanner generates. Features include a fuzzy search engine, and a filter by date and hour system. The program also generates visual waveforms of the audio files in the paginated viewer.

The viewer can be run by using the following command in the `viewer/` folder:

```bash
npm start
```

![image](https://github.com/LackingInGrav1tas/tasmetu/assets/69087617/0ebaf4fa-69e1-4457-9b25-8a6be95893a8)
