from datetime import datetime
import pyaudio, os
from audio_scanner import AudioScanner
from transcription import transcribe

def save(audio_file):
    os.system(f'sox "{audio_file}" -n noiseprof noise-profile.prof')
    os.system(f'sox "{audio_file}" "{audio_file.replace("day)/", "day)/F-")}" noisered noise-profile.prof')
    os.remove(audio_file)
    os.remove("noise-profile.prof")
    os.rename(audio_file.replace("day)/", "day)/F-"), audio_file)

    f = open(audio_file.replace('wav', 'txt'), 'a')
    transcription = transcribe(audio_file)
    f.write(transcription)
    f.close()

    os.system('compact /c /q /i "file'.replace("file", audio_file))
    if 'stop program' in transcription: return True
    return False

days = {
    0: 'Monday',
    1: 'Tuesday',
    2: 'Wednesday',
    3: 'Thursday',
    4: 'Friday',
    5: 'Saturday',
    6: 'Sunday'
}

def name():
    dt = datetime.now()
    path = f'g:/My Drive/tasmetu-archive/{str(dt.date())} ({days[dt.weekday()]})'
    if not os.path.exists(path):
        os.mkdir(path)

    return path + '/' + str(dt.time()).replace(':', '.') + '.wav'

if __name__ == "__main__":
    asc = AudioScanner(chunk=1024, format=pyaudio.paInt16, channels=1, rate=44100, threshold=300, silence=150)
    asc.begin_visualization()
    asc.onReceive(save, name)
    asc.listen()
    del asc