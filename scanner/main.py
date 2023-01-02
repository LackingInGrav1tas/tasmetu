import speech_recognition as sr
from audio_scanner import AudioScanner
from datetime import datetime
import pyaudio, os

def transcribe(audio_file):
    os.system(f'sox "{audio_file}" -n noiseprof noise-profile.prof')
    os.system(f'sox "{audio_file}" "{audio_file.replace("archive/", "archive/F-")}" noisered noise-profile.prof')
    os.remove(audio_file)
    os.remove("noise-profile.prof")
    os.rename(audio_file.replace("archive/", "archive/F-"), audio_file)

    r = sr.Recognizer()
    with sr.AudioFile(audio_file) as source:
        audio = r.record(source)
        f = open(audio_file.replace('wav', 'txt'), 'a')
        try:
            transcription = str(r.recognize_google(audio))
        except:
            print("unrecognized")
            transcription = "[unrecognized]"
        f.write(transcription)
        f.close()

    os.system('compact /c /q /i "file > NUL'.replace("file", audio_file))
    if 'stop program' in transcription: return True
    return False 

def name():
    return 'g:/My Drive/tasmetu-archive/' + str(datetime.now()).replace(':', '.') + '.wav'

if __name__ == "__main__":
    asc = AudioScanner(chunk=1024, format=pyaudio.paInt16, channels=1, rate=44100, threshold=300, silence=100)
    asc.begin_visualization()
    asc.onReceive(transcribe, name)
    asc.listen()
    del asc