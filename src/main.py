import pyaudio
import wave
import numpy as np
from datetime import datetime
import speech_recognition as sr

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
        name = str(datetime.now()).replace(':', '.')
        wf = wave.open(name + '.wav', 'wb')
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

        # transcription
        r = sr.Recognizer()
        with sr.AudioFile(name + '.wav') as source:
            audio = r.record(source)
            f = open(name + '.txt', 'a')
            f.write(str(r.recognize_google(audio)))
            f.close()

        break
    


stream.stop_stream()
stream.close()
p.terminate()
