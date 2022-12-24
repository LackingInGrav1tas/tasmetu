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
    try:
        print("waiting")
        data = stream.read(CHUNK)
        audio_data = np.frombuffer(data, dtype=np.int16)
        volume = np.abs(audio_data).mean()
        
        if volume >= THRESHOLD:

            # output file
            name = str(datetime.now()).replace(':', '.')
            audio_file = 'data/' + name + '.wav'

            wf = wave.open(audio_file, 'wb')
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
            with sr.AudioFile(audio_file) as source:
                audio = r.record(source)
                f = open('data/' + name + '.txt', 'a')
                transcription = str(r.recognize_google(audio))
                f.write(transcription)
                f.close()

                if 'stop program' in transcription: break

            # break
    except Exception as e:
        f = open('error.txt', 'a')
        f.write(str(e))
    


stream.stop_stream()
stream.close()
p.terminate()
