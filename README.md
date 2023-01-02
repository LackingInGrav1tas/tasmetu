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

We are using a Baofeng UV-5RV2+, on scanner mode programmed to the desired frequencies (in our case, [Boston area police frequencies](https://www.broadcastify.com/listen/feed/25818
)), connected via audio cable to a computer. Once the audio stream passes a specified threshold, the scanner begins recording.

After the recording is finished, the scanner removes static noise using SoX and generates a trascription, saving both the transcription and the audio file in a Google Drive folder.