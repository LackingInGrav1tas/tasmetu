import os, time, sys, shutil

def cleanup(directory):
    #p = os.path.join(directory, "Transcripts")
    #if not os.path.exists(p): os.mkdir(os.path.join(directory, "Transcripts"))

    #os.system(f'move "{os.path.join(directory, "*.txt")}" "{os.path.join(directory, "Transcripts")}"')

    # deleting all small wav files
    #for filename in os.listdir(directory):
    #    f = os.path.join(directory, filename)
    #    if os.path.getsize(f) < 500000 and ".wav" in f:
    #        os.remove(f)
    

    #dn = directory.split("\\")[-1]
    #c = f'rar a -r "{os.path.join(directory, dn)}.rar" "{directory}\\*.wav"'

    #print(c)
    #time.sleep(2)
    #os.system(c)
    # exit()

    #for name in os.listdir(directory):
    #    f = os.path.join(directory, name)
    #    if ".wav" in f:
    #        os.remove(f)
    pass

if __name__ == "__main__":
    cleanup(sys.argv[-1])