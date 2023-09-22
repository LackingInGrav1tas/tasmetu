from datetime import datetime
import pyaudio, os, sys, threading, shutil
from audio_scanner import AudioScanner
from transcription import transcribe
from cleanup import cleanup

def get_size(start_path = '.'):
    """https://stackoverflow.com/a/1392549"""
    total_size = 0
    for dirpath, dirnames, filenames in os.walk(start_path):
        for f in filenames:
            fp = os.path.join(dirpath, f)
            # skip if it is symbolic link
            if not os.path.islink(fp):
                total_size += os.path.getsize(fp)

    return total_size / (1024**3)

def save(audio_file):
    os.system(f'sox "{audio_file}" -n noiseprof noise-profile.prof')
    os.system(f'sox "{audio_file}" "{audio_file.replace("day)/", "day)/F-")}" noisered noise-profile.prof')
    os.remove(audio_file)
    os.remove("noise-profile.prof")
    os.rename(audio_file.replace("day)/", "day)/F-"), audio_file)

    transcription = transcribe(audio_file)
    if "unrecognized" not in transcription:
        f = open(audio_file.replace('wav', 'txt'), 'a')
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
        dirs = os.listdir('g:/My Drive/tasmetu-archive')

        # running cleanup in parallel because it takes a while
        # t = threading.Thread(target=cleanup, args=['g:/My Drive/tasmetu-archive/'+dirs[-2]])
        # t.run()

        #s = get_size('g:/My Drive/tasmetu-archive')
        #if s > 13:
        #    print(f'Size ({s}) too large...')
        #    f = 'g:/My Drive/tasmetu-archive/' + dirs[0]
        #    print(f'Deleting "{f}"')
        #    shutil.rmtree(f, ignore_errors=True)

        print(f'Making "{path}"')
        os.mkdir(path)

    return path + '/' + str(dt.time()).replace(':', '.') + '.wav'

if __name__ == "__main__":
    while True:
        try:
            asc = AudioScanner(chunk=1024, format=pyaudio.paInt16, channels=1, rate=44100, threshold=300, silence=150)
            if (len(sys.argv) >= 2 and sys.argv[1] != "nograph") or len(sys.argv) == 1: asc.begin_visualization()
            asc.onReceive(save, name)
            asc.listen()
            del asc
        except:
            pass