import pyaudio
import wave
import numpy as np
from datetime import datetime
import speech_recognition as sr
import matplotlib.pyplot as plt

CHUNK = 1024
FORMAT = pyaudio.paInt16
CHANNELS = 1
RATE = 44100
THRESHOLD = 200

x = [ i for i in range(50)]
y = [ 0 for i in range(50) ]

plt.figure(num="Audio Stream")
plt.title("Audio Stream", color="white", weight=700)
plt.ylim([0, 3000])
p = pyaudio.PyAudio()

stream = p.open(format=FORMAT, channels=CHANNELS, rate=RATE, input=True, frames_per_buffer=CHUNK)

while True:
    print("waiting")
    data = stream.read(CHUNK)
    audio_data = np.frombuffer(data, dtype=np.int16)
    volume = np.abs(audio_data).mean()

    plt.clf()
    y = y[1:]
    y.append(volume)
    plt.plot(x, y)
    plt.pause(0.01)
    
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

            plt.clf()
            y = y[1:]
            y.append(volume)
            plt.plot(x, y)
            plt.pause(0.01)

            if volume < THRESHOLD: elapsed_silence += 1
            else: elapsed_silence = 0

            wf.writeframes(data)

        wf.close()

        # transcription
        r = sr.Recognizer()
        with sr.AudioFile(audio_file) as source:
            audio = r.record(source)
            f = open('data/' + name + '.txt', 'a')
            try:
                transcription = str(r.recognize_google(audio))
            except:
                print("unrecognized")
                transcription = "unrecognized"
            f.write(transcription)
            f.close()

            if 'stop program' in transcription: break    


stream.stop_stream()
stream.close()
p.terminate()
