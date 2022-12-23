import pyaudio
import wave
import numpy as np
from datetime import datetime

CHUNK = 1024
FORMAT = pyaudio.paInt16
CHANNELS = 1
RATE = 44100
THRESHOLD = 200

p = pyaudio.PyAudio()

stream = p.open(format=FORMAT, channels=CHANNELS, rate=RATE, input=True, frames_per_buffer=CHUNK)

while True:
    print("waiting")
    data = stream.read(CHUNK)
    audio_data = np.frombuffer(data, dtype=np.int16)
    volume = np.abs(audio_data).mean()
    
    if volume >= THRESHOLD:

        # output file
        wf = wave.open(str(datetime.now()).replace(':', '.') + '.wav', 'wb')
        wf.setnchannels(CHANNELS)
        wf.setsampwidth(p.get_sample_size(FORMAT))
        wf.setframerate(RATE)

        elapsed_silence = 0

        while volume >= THRESHOLD or elapsed_silence <= 150: # elapsed silence allows for about 3 seconds of silence before stopping recording
            print("recording")
            data = stream.read(CHUNK)
            audio_data = np.frombuffer(data, dtype=np.int16)
            volume = np.abs(audio_data).mean()

            if volume < THRESHOLD: elapsed_silence += 1
            else: elapsed_silence = 0

            wf.writeframes(data)

        wf.close()
        break
    


stream.stop_stream()
stream.close()
p.terminate()
