import pyaudio, wave, multiprocessing
import numpy as np
from datetime import datetime
import speech_recognition as sr
from matplotlib import pyplot as plt

CHUNK = 1024
FORMAT = pyaudio.paInt16
CHANNELS = 1
RATE = 44100
THRESHOLD = 300

p = pyaudio.PyAudio()

stream = p.open(format=FORMAT, channels=CHANNELS, rate=RATE, input=True, frames_per_buffer=CHUNK)

recording = False
elapsed_silence = 0

def audio_stream_visualization():
    s = p.open(format=FORMAT, channels=CHANNELS, rate=RATE, input=True, frames_per_buffer=CHUNK)

    x = [ i for i in range(50)]
    y = [ 0 for i in range(50) ]

    plt.figure(num="Audio Stream")
    plt.title("Audio Stream", color="white", weight=700)
    plt.ylim([0, 3000])

    while True:
        data = stream.read(CHUNK)
        audio_data = np.frombuffer(data, dtype=np.int16)
        volume = np.abs(audio_data).mean()

        plt.clf()
        y = y[1:]
        y.append(volume)
        plt.plot(x, y, label="stream")
        plt.pause(0.01)


if __name__ == "__main__":
    visualization = multiprocessing.Process(target=audio_stream_visualization)
    visualization.start()


    while True:
        data = stream.read(CHUNK)
        audio_data = np.frombuffer(data, dtype=np.int16)
        volume = np.abs(audio_data).mean()
        
        if volume >= THRESHOLD:
            elapsed_silence = 0

            if not recording:
                # output file
                name = str(datetime.now()).replace(':', '.')
                audio_file = 'data/' + name + '.wav'

                wf = wave.open(audio_file, 'wb')
                wf.setnchannels(CHANNELS)
                wf.setsampwidth(p.get_sample_size(FORMAT))
                wf.setframerate(RATE)

            recording = True

        if recording:
            print(f"recording {elapsed_silence}")
            
            wf.writeframes(data)

            if volume < THRESHOLD:
                if elapsed_silence > 100:
                    print("done")
                    recording = False
                    elapsed_silence = 0
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
                else:
                    elapsed_silence += 1


    stream.stop_stream()
    stream.close()
    p.terminate()
    visualization.terminate()